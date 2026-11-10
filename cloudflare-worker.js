/* =====================================================================
   NUR DİŞ & DENTAL KLİNİK — DİJİ RAMO Sunucusu (Cloudflare Worker)
   =====================================================================
   SÜRÜM: v2 (2026-11-10) — GÜVENLİK / DDoS SERTLEŞTİRME

   NE DEĞİŞTİ (v1 → v2)
   --------------------
   1) 🔑 API ANAHTARLARI ARTIK KODDA DEĞİL
      v1'de Groq ve Magic Hour anahtarları koda gömülüydü. Kod sızarsa
      (veya panele erişen biri görürse) iki ödeye de doğrudan erişilir.
      Artık `env.GROQ_API_KEY` / `env.MAGIC_HOUR_KEY` (Cloudflare Secret).

   2) 🚪 KAYNAK (ORIGIN) KİLİDİ
      v1: Access-Control-Allow-Origin: *  → dünyadaki her site bu uç
      noktayı kendi sayfasından çağırabiliyordu.
      v2: sadece klinik domainleri. (Not: Origin başlığı taklit edilebilir;
      asıl koruma aşağıdaki hız limitleri.)

   3) ⏱️ HIZ LİMİTİ (IP + GÜN + GLOBAL)
      v1: sınırsız. 1000 kişi aynı saniye basarsa hem Groq kotası hem
      Magic Hour kredisi biter, fatura kabarır.
      v2: IP başına dakika/gün limiti + TÜM sistem için günlük tavan.
      Sayaçlar Cache API'de tutulur → KV kotası harcamaz, ücretsiz.

   4) 📦 GÖVDE (PAYLOAD) LİMİTİ
      Dev base64 görsel / 10 MB'lık JSON gövde reddedilir (bellek + CPU).

   5) 🧾 GÜVENLİK BAŞLIKLARI + NO-STORE
      Cevap önbelleğe alınmaz, MIME sniff kapalı, Referer sızdırılmaz.

   6) 🧯 HATA MESAJLARI SIZINTI YAPMAZ
      v1 ham Groq/Magic Hour hata metnini istemciye döndürüyordu
      (sağlayıcı, model adı, bazen anahtar parçası görünebiliyordu).

   DAVRANIŞ AYNI: / (chat), action:"smile" (gülüş tasarımı), görsel
   analizi — istemci tarafı (js/ekran.js, js/firebase.js) hiç değişmedi.
   ===================================================================== */

/* ─── İZİN VERİLEN KAYNAKLAR ─── */
const IZINLI_ORIGINLER = [
  "https://nurdis.pages.dev",
  "https://nurdisdentalklinik.github.io",
];

/* ─── HIZ LİMİTLERİ ─── */
const LIMITLER = {
  chat:  { dakika: 8,  gun: 100 },   // normal kullanıcı bunu asla aşmaz
  smile: { dakika: 1,  gun: 5   },   // gülüş tasarımı ÜCRETLİ servis → çok sıkı
};
/* Tüm sistem için günlük tavan — dağıtık (binlerce IP) saldırıya karşı */
const GLOBAL_TAVAN = { chat: 4000, smile: 100 };

/* ─── GÖVDE LİMİTLERİ ─── */
const MAX_GOVDE_BAYT   = 8 * 1024 * 1024;   // 8 MB
const MAX_MESAJ_UZUN   = 2000;              // tek mesaj karakter
const MAX_GECMIS       = 12;                // sohbet geçmişi öğe
const MAX_GORSEL_B64   = 6_500_000;         // ~4.8 MB görsel (base64)

const GROQ_MODEL = "qwen/qwen3.8-27b";

/* ─── METİN ASİSTANI SİSTEM PROMPTU (değişmedi) ─── */
const SYSTEM_PROMPT = `Sen "DİJİ RAMO" adında, Nur Diş & Dental Klinik'in uzman yapay zeka asistanısın.
Kızıltepe/Mardin'deki bu klinik adına çalışıyorsun. Sıcak, samimi, bilgili ve yardımcı bir asistansın.
Diş sağlığı hakkında detaylı bilgi ver, tedaviler hakkında açıkla, diş ağrısı nedenlerini açıkla.
MUAYENE ÜCRETSİZDİR. Asla muayene ücreti söyleme. Kesin teşhis koyma, ilaç önerme.
Randevu almak isteyenlere mesajının sonuna [RANDEVU_BUTONU] ekle.
KLİNİK: Mardin, Kızıltepe, TOKİ | Tel: 0505 105 03 02 | Hekim: Dr. Ramazan DAĞ
Hafta içi 09:00-18:00, Cumartesi 10:00-14:00, Pazar kapalı.
Cevapların 2-5 cümle, samimi, emoji kullan. Türkçe konuş.`;

/* =====================================================================
   YARDIMCILAR
   ===================================================================== */

function corsHeaders(origin) {
  const ok = origin && IZINLI_ORIGINLER.includes(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin : IZINLI_ORIGINLER[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Cache-Control": "no-store",
  };
}

function json(govde, kod, origin, ekBaslik) {
  return new Response(JSON.stringify(govde), {
    status: kod || 200,
    headers: Object.assign({ "Content-Type": "application/json; charset=utf-8" },
      corsHeaders(origin), ekBaslik || {}),
  });
}

/* ---- Sayaçlar (Cache API — ücretsiz, KV kotası harcamaz) ----
   Not: Cache API veri merkezi (colo) bazlıdır; dağıtık saldırıda her
   bölge kendi sayacını tutar. Bu yüzden ayrıca GLOBAL_TAVAN var. */
const SAYAC_ONEK = "https://nurdis-guard.internal/";

async function sayacArttir(anahtar, ttlSaniye) {
  const istek = new Request(SAYAC_ONEK + encodeURIComponent(anahtar));
  let mevcut = 0;
  try {
    const r = await caches.default.match(istek);
    if (r) mevcut = parseInt(await r.text(), 10) || 0;
  } catch (e) { /* cache okunamadı → 0'dan başla */ }

  const yeni = mevcut + 1;
  try {
    await caches.default.put(istek, new Response(String(yeni), {
      headers: { "Content-Type": "text/plain", "Cache-Control": "max-age=" + ttlSaniye },
    }));
  } catch (e) { /* yazamadıysa da isteği engellemeyiz (fail-open) */ }

  return yeni;
}

/* ---- KATMAN A: Worker belleğindeki (izole) sayaç ----
   Cache API yazımları birkaç saniye gecikmeli görünür; bu yüzden ANİ
   patlama (burst) sırasında cache sayacı hep 0 okuyabiliyor. Bu bellek
   sayacı aynı Worker örneğine gelen istekleri ANINDA sayar. */
const BELLEK_SAYAC = new Map();

function bellekSayac(anahtar, ttlMs) {
  const simdi = Date.now();
  const kayit = BELLEK_SAYAC.get(anahtar);
  if (!kayit || kayit.bitti <= simdi) {
    BELLEK_SAYAC.set(anahtar, { sayi: 1, bitti: simdi + ttlMs });
    if (BELLEK_SAYAC.size > 800) {
      for (const [k, v] of BELLEK_SAYAC) if (v.bitti <= simdi) BELLEK_SAYAC.delete(k);
    }
    return 1;
  }
  kayit.sayi += 1;
  return kayit.sayi;
}

/* Hız limiti kontrolü → { izin:boolean, kod, mesaj } */
async function hizLimiti(request, action) {
  const L = LIMITLER[action] || LIMITLER.chat;
  const ip = request.headers.get("CF-Connecting-IP") || "bilinmeyen";
  const dakika = Math.floor(Date.now() / 60000);
  const gun = new Date().toISOString().slice(0, 10);

  const [cacheDakika, cacheGun] = await Promise.all([
    sayacArttir(`d|${action}|${ip}|${dakika}`, 120),
    sayacArttir(`g|${action}|${ip}|${gun}`, 90000),
  ]);

  /* İki katmanın BÜYÜK olanı geçerlidir */
  const dakikaSayi = Math.max(cacheDakika, bellekSayac(`d|${action}|${ip}|${dakika}`, 61000));
  const gunSayi    = Math.max(cacheGun,    bellekSayac(`g|${action}|${ip}|${gun}`, 300000));

  if (dakikaSayi > L.dakika) {
    return { izin: false, kod: 429, mesaj: "Çok hızlı istek gönderildi. Lütfen bir dakika sonra tekrar deneyin." };
  }
  if (gunSayi > L.gun) {
    return { izin: false, kod: 429, mesaj: "Günlük kullanım sınırına ulaşıldı. Yarın tekrar deneyebilirsiniz." };
  }

  const globalSayi = Math.max(
    await sayacArttir(`T|${action}|${gun}`, 90000),
    bellekSayac(`T|${action}|${gun}`, 300000)
  );
  const tavan = action === "smile" ? GLOBAL_TAVAN.smile : GLOBAL_TAVAN.chat;
  if (globalSayi > tavan) {
    return { izin: false, kod: 503, mesaj: "Sistem şu anda çok yoğun. Lütfen biraz sonra tekrar deneyin." };
  }

  return { izin: true, kalanDakika: Math.max(0, L.dakika - dakikaSayi) };
}

function zamanAsimi(ms) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  return { signal: c.signal, temizle: () => clearTimeout(t) };
}

/* =====================================================================
   ANA GİRİŞ
   ===================================================================== */

export default {
  async fetch(request, env) {
    return handleRequest(request, env);
  },
};

async function handleRequest(request, env) {
  const origin = request.headers.get("Origin") || "";

  /* Preflight */
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  /* Yöntem kontrolü */
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Sadece POST kabul edilir." }), {
      status: 405, headers: Object.assign({ "Content-Type": "application/json" }, corsHeaders(origin)),
    });
  }

  /* Kaynak (Origin) kilidi */
  if (origin && !IZINLI_ORIGINLER.includes(origin)) {
    return json({ error: "Bu kaynaktan erişim izni yok." }, 403, origin);
  }

  /* Gövde boyutu */
  const cl = parseInt(request.headers.get("Content-Length") || "0", 10);
  if (cl && cl > MAX_GOVDE_BAYT) {
    return json({ error: "Gönderilen veri çok büyük." }, 413, origin);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: "Geçersiz istek gövdesi." }, 400, origin);
  }

  const action = body.action === "smile" ? "smile" : "chat";

  /* Hız limiti */
  const limit = await hizLimiti(request, action);
  if (!limit.izin) {
    return json({ error: limit.mesaj }, limit.kod, origin, { "Retry-After": "60" });
  }

  try {
    if (action === "smile") return await handleSmileDesign(body, origin, env);
    return await handleChat(body, origin, env);
  } catch (err) {
    /* Ham hata metni istemciye DÖNMEZ — sunucu logunda kalır. */
    console.error("[DİJİ RAMO] işlem hatası:", err && err.message ? err.message : err);
    return json({ error: "Şu anda yanıt verilemiyor. Lütfen kısa süre sonra tekrar deneyin." }, 502, origin);
  }
}

/* =====================================================================
   SOHBET / GÖRSEL ANALİZ
   ===================================================================== */

async function handleChat(body, origin, env) {
  const anahtar = (env && env.GROQ_API_KEY) || "";
  if (!anahtar) {
    console.error("[DİJİ RAMO] GROQ_API_KEY tanımlı değil (secret eksik).");
    return json({ error: "Asistan şu anda bakımda." }, 503, origin);
  }

  const { messages, image } = body;

  /* ---- Görsel analizi ---- */
  if (image) {
    if (typeof image !== "string" || image.length > MAX_GORSEL_B64) {
      return json({ error: "Gönderilen görsel çok büyük veya geçersiz." }, 413, origin);
    }

    let clean = image, mime = "image/jpeg";
    if (image.startsWith("data:")) {
      const m = image.match(/^data:([^;]+);base64,(.+)$/);
      if (m) { mime = m[1]; clean = m[2]; }
    }
    if (!/^image\/(jpeg|jpg|png|webp)$/i.test(mime)) {
      return json({ error: "Sadece JPEG, PNG veya WEBP görseller desteklenir." }, 415, origin);
    }

    const z = zamanAsimi(45000);
    let res;
    try {
      res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${anahtar}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [{
            role: "user",
            content: [
              { type: "text", text: "Sen DİJİ RAMO, Nur Diş görsel analiz asistanısın. Türkçe ön değerlendirme sun." },
              { type: "image_url", image_url: { url: `data:${mime};base64,${clean}` } },
            ],
          }],
          max_tokens: 800,
          temperature: 0.7,
        }),
        signal: z.signal,
      });
    } finally { z.temizle(); }

    const data = await res.json().catch(() => null);
    if (!data || data.error || !data.choices || !data.choices[0]) {
      console.error("[DİJİ RAMO] görsel analiz hatası:", JSON.stringify(data && data.error || {}));
      return json({ error: "Görsel analiz yapılamadı. Lütfen tekrar deneyin." }, 502, origin);
    }
    return json({ reply: data.choices[0].message.content }, 200, origin);
  }

  /* ---- Metin sohbeti ---- */
  let temiz = [];
  if (Array.isArray(messages)) {
    temiz = messages
      .filter((m) => m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"))
      .slice(-MAX_GECMIS)
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESAJ_UZUN) }));
  }
  if (!temiz.length) {
    return json({ error: "Mesaj boş olamaz." }, 400, origin);
  }

  const z2 = zamanAsimi(45000);
  let res2;
  try {
    res2 = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${anahtar}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...temiz],
        max_tokens: 500,
        temperature: 0.7,
      }),
      signal: z2.signal,
    });
  } finally { z2.temizle(); }

  const data2 = await res2.json().catch(() => null);
  if (!data2 || data2.error || !data2.choices || !data2.choices[0]) {
    console.error("[DİJİ RAMO] sohbet hatası:", JSON.stringify(data2 && data2.error || {}));
    /* Sağlayıcı (Groq) hız limiti → kullanıcıya "yoğunluk" mesajı, 502 değil 429 */
    if (res2.status === 429) {
      return json({ error: "Asistan şu anda çok yoğun. Lütfen birkaç saniye sonra tekrar deneyin." }, 429, origin, { "Retry-After": "20" });
    }
    return json({ error: "Şu anda yanıt verilemiyor. Lütfen tekrar deneyin." }, 502, origin);
  }

  return json({ reply: data2.choices[0].message.content }, 200, origin);
}

/* =====================================================================
   GÜLÜŞ TASARIMI (Magic Hour — ÜCRETLİ servis, en sıkı korumalı uç)
   ===================================================================== */

async function handleSmileDesign(body, origin, env) {
  const anahtar = (env && env.MAGIC_HOUR_KEY) || "";
  if (!anahtar) {
    console.error("[DİJİ RAMO] MAGIC_HOUR_KEY tanımlı değil (secret eksik).");
    return json({ error: "Gülüş tasarımı şu anda bakımda." }, 503, origin);
  }

  const { imageBase64, smileIntensity } = body;
  if (!imageBase64 || typeof imageBase64 !== "string") {
    return json({ error: "Fotoğraf gerekli." }, 400, origin);
  }
  if (imageBase64.length < 1000) {
    return json({ error: "Fotoğraf çok küçük veya bozuk." }, 400, origin);
  }
  if (imageBase64.length > MAX_GORSEL_B64) {
    return json({ error: "Fotoğraf çok büyük. Lütfen daha küçük bir fotoğraf seçin." }, 413, origin);
  }

  const oran = typeof smileIntensity === "number" && isFinite(smileIntensity) ? smileIntensity : 0.7;
  const intensity = Math.round(Math.min(1, Math.max(0, oran)) * 100);
  const smileValue = Math.min(100, Math.max(0, Math.round(intensity / 5) * 5));

  /* 1) Yükleme adresi */
  const z1 = zamanAsimi(30000);
  let uploadData;
  try {
    const uploadUrlRes = await fetch("https://api.magichour.ai/v1/files/upload-urls", {
      method: "POST",
      headers: { "Authorization": `Bearer ${anahtar}`, "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ extension: "jpg", type: "image" }] }),
      signal: z1.signal,
    });
    uploadData = await uploadUrlRes.json();
  } finally { z1.temizle(); }

  if (!uploadData || !uploadData.items || !uploadData.items[0]) {
    console.error("[DİJİ RAMO] MagicHour upload-url alınamadı");
    return json({ error: "Gülüş tasarımı servisi şu anda yanıt vermiyor." }, 502, origin);
  }

  const { upload_url, file_path } = uploadData.items[0];

  /* 2) Fotoğrafı yükle */
  let binaryData;
  try {
    binaryData = Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0));
  } catch (e) {
    return json({ error: "Fotoğraf okunamadı." }, 400, origin);
  }

  const z2 = zamanAsimi(60000);
  try {
    const uploadRes = await fetch(upload_url, {
      method: "PUT", body: binaryData,
      headers: { "Content-Type": "image/jpeg" }, signal: z2.signal,
    });
    if (!uploadRes.ok) throw new Error("upload failed " + uploadRes.status);
  } catch (e) {
    console.error("[DİJİ RAMO] fotoğraf yüklenemedi:", e.message);
    return json({ error: "Fotoğraf yüklenemedi. Lütfen tekrar deneyin." }, 502, origin);
  } finally { z2.temizle(); }

  /* 3) İş (job) oluştur */
  const z3 = zamanAsimi(30000);
  let jobData;
  try {
    const jobRes = await fetch("https://api.magichour.ai/v1/ai-face-editor", {
      method: "POST",
      headers: { "Authorization": `Bearer ${anahtar}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        assets: { image_file_path: file_path },
        style: {
          mouth_smile: smileValue,
          eye_open_ratio: 0, eyebrow_direction: 0, head_pitch: 0, head_roll: 0, head_yaw: 0,
          lip_open_ratio: 0, mouth_grim: 0, mouth_position_horizontal: 0,
          mouth_position_vertical: 0, mouth_pout: 0, mouth_purse: 0,
          eye_gaze_horizontal: 0, eye_gaze_vertical: 0, enhance_face: true,
          prompt: "Professional Hollywood smile with perfect porcelain veneers, bright white teeth",
        },
        name: "Hollywood Gülüş",
        wait_for_completion: false,
        download_outputs: false,
      }),
      signal: z3.signal,
    });
    jobData = await jobRes.json();
  } finally { z3.temizle(); }

  if (!jobData || jobData.error || jobData.message || !jobData.id) {
    console.error("[DİJİ RAMO] MagicHour job oluşturulamadı:", JSON.stringify(jobData && (jobData.error || jobData.message) || {}));
    return json({ error: "İşlem başlatılamadı. Lütfen tekrar deneyin." }, 502, origin);
  }

  /* 4) Sonucu bekle (en fazla 30 × 4 sn = 120 sn) */
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 4000));
    const z = zamanAsimi(20000);
    let statusData;
    try {
      const statusRes = await fetch(`https://api.magichour.ai/v1/image-projects/${jobData.id}`, {
        headers: { "Authorization": `Bearer ${anahtar}` }, signal: z.signal,
      });
      statusData = await statusRes.json();
    } catch (e) {
      continue;                       // geçici ağ hatası → tekrar dene
    } finally { z.temizle(); }

    if (statusData.status === "completed" || statusData.status === "succeeded") {
      const url =
        (statusData.downloads && statusData.downloads[0]) ||
        (statusData.output && statusData.output.download_url) || null;
      if (url) return json({ imageUrl: url }, 200, origin);
    }
    if (statusData.status === "failed" || statusData.status === "error") {
      return json({ error: "Gülüş tasarımı tamamlanamadı. Fotoğraf net ve yüz görünür olmalı." }, 422, origin);
    }
  }

  return json({ error: "İşlem zaman aşımına uğradı. Lütfen tekrar deneyin." }, 504, origin);
}
