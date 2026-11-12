/* =====================================================================
   🤖 MAĞAZA YAPAY ZEKA ASİSTANI — "Hepsiburada tarzı"
   =====================================================================
   NE YAPAR
   --------
   1) YORUM ÖZETİ
      Ürünün tüm müşteri yorumlarını okur, tek paragrafta özetler:
      "Kullanıcıların %80'i memnun. En çok 'yumuşak kıl' ve 'hızlı
      teslimat' öne çıkıyor. 2 kişi kıl dökülmesinden şikayet etmiş."

   2) ÜRÜN SORULARI (ürün hakkında soru-cevap)
      "Bu diş fırçası çocuklar için uygun mu?", "Hassas dişlerde kullanılır mı?"
      → Ürünün gerçek verileri (ad, açıklama, fiyat, stok, yorumlar)
        üzerinden yapay zeka cevap verir.

   NASIL ÇALIŞIR
   -------------
   • Ana yol: Cloudflare Worker (Groq Llama 3.3 70B) → action:"magaza-ai"
   • Yedek yol: YZ kapalıysa/limit dolduysa İSTATİSTİKSEL ÖZET üretilir
     (puan ortalaması, yorum sayısı, en sık geçen kelimeler).
     Böylece özellik ASLA boş/bozuk görünmez.

   MALİYET KORUMASI
   ----------------
   • Aynı ürün için özet 30 dakika cihazda önbelleklenir (tekrar sorgu yok)
   • Kullanıcı başına dakikada 3 soru (Worker tarafında da 10/dk limit var)
   ===================================================================== */

const MAGAZA_AI_ENDPOINT = (typeof AI_ENDPOINT_URL !== "undefined")
  ? AI_ENDPOINT_URL
  : "https://nurdis-worker.nurdisdentalklinik.workers.dev";

/* ---------------------------------------------------------------------
   ÜRÜN YORUMLARINI TOPLA
   --------------------------------------------------------------------- */
function urunYorumlariAl(pid) {
  const hepsi = (state.urunYorumlar || []);
  return hepsi.filter(y => {
    if (!y) return false;
    /* Farklı alan adlarına tolerans: productId / urunId / pid */
    const hedef = y.productId || y.urunId || y.pid || y.urun;
    return String(hedef) === String(pid);
  });
}

/* ---------------------------------------------------------------------
   İSTATİSTİKSEL ÖZET (yapay zeka yoksa da çalışır)
   --------------------------------------------------------------------- */
function yorumIstatistigi(pid) {
  const liste = urunYorumlariAl(pid);
  const adet = liste.length;
  if (!adet) return { adet: 0, ortalama: 0, dagilim: {}, kelimeler: [] };

  let toplam = 0;
  const dagilim = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const kelimeSayac = {};
  const STOP = ["bir", "ve", "bu", "çok", "için", "ile", "ama", "daha", "gibi", "kadar", "çok",
    "ben", "benim", "aldım", "urun", "ürün", "var", "yok", "değil", "oldu", "oldukça", "gayet",
    "the", "and", "very", "good", "çünkü", "hem", "veya", "her", "şey", "kere", "tane"];

  liste.forEach(y => {
    const puan = parseInt(y.rating || y.puan || y.yildiz || 5, 10);
    if (puan >= 1 && puan <= 5) { dagilim[puan] = (dagilim[puan] || 0) + 1; toplam += puan; }

    const metin = String(y.text || y.yorum || y.metin || "").toLowerCase();
    metin.replace(/[^\p{L}\s]/gu, " ").split(/\s+/).forEach(w => {
      if (w.length < 4 || STOP.indexOf(w) !== -1) return;
      kelimeSayac[w] = (kelimeSayac[w] || 0) + 1;
    });
  });

  const kelimeler = Object.keys(kelimeSayac)
    .map(w => ({ w, n: kelimeSayac[w] }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 6)
    .map(x => x.w);

  return {
    adet,
    ortalama: adet ? (toplam / adet) : 0,
    dagilim,
    kelimeler
  };
}

/* ---------------------------------------------------------------------
   AI İSTEĞİ (ortak)
   --------------------------------------------------------------------- */
async function magazaAI(mesaj, ekBilgi) {
  const govde = {
    action: "magaza-ai",
    messages: [
      { role: "system", content: ekBilgi },
      { role: "user", content: mesaj }
    ]
  };

  const ctrl = new AbortController();
  const zaman = setTimeout(() => ctrl.abort(), 25000);
  try {
    const res = await fetch(MAGAZA_AI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(govde),
      signal: ctrl.signal
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.reply) return null;
    return String(data.reply).trim();
  } catch (e) {
    return null;
  } finally {
    clearTimeout(zaman);
  }
}

/* ---------------------------------------------------------------------
   ÜRÜN BAĞLAMI (yapay zekaya verilecek gerçek bilgi)
   --------------------------------------------------------------------- */
function urunBaglami(p, pid) {
  const st = yorumIstatistigi(pid);
  const yorumlar = urunYorumlariAl(pid).slice(0, 8).map(y => {
    const puan = y.rating || y.puan || 5;
    const metin = String(y.text || y.yorum || y.metin || "").slice(0, 200);
    const ad = y.name || y.ad || "Müşteri";
    return `- ${ad} (${puan}/5): ${metin}`;
  }).join("\n") || "(henüz yorum yok)";

  return `Sen Nur Diş & Dental Klinik mağazasının yapay zeka ürün asistanısın.
Türkçe, kısa (2-4 cümle), samimi ve net cevap ver. Emoji kullan.

ÜRÜN BİLGİLERİ:
Ad: ${p.ad || ""}
Marka: ${p.marka || "Nur Diş"}
Kategori: ${p.kategori || ""}
Fiyat: ${typeof accTL0 === "function" ? accTL0(urunFiyat(p)) : (p.fiyat || "")}
Stok: ${accNum(p.stok)} adet
Açıklama: ${(p.aciklama || "Belirtilmemiş").slice(0, 400)}

MÜŞTERİ YORUMLARI (ortalama ${st.ortalama ? st.ortalama.toFixed(1) : "-"}/5, ${st.adet} yorum):
${yorumlar}

KURALLAR:
- Üründe olmayan bir özellik uydurma. Bilmiyorsan "kliniğimizi arayın" de.
- Tıbbi teşhis koyma; diş/mine/et sağlığı iddiası verme, "diş hekiminize danışın" de.
- Fiyat/stok bilgisini yukarıdaki gerçek verilerden söyle.
- Cevapların mobil ekrana sığsın; madde madde değil, akıcı cümleler kur.
- Asla "ben bir yapay zekayım" deme; DİJİ RAMO'nun mağaza asistanı olduğunu söyle.`;
}

/* ---------------------------------------------------------------------
   KULLANICI TARAFI — ÜRÜN SAYFASINDAKİ AI KARTI
   --------------------------------------------------------------------- */
function magazaAIKartiHTML(p) {
  const pid = p.id;
  const st = yorumIstatistigi(pid);
  const ozet = state.aiYorumOzeti && state.aiYorumOzeti[pid];
  const cevaplar = (state.aiUrunSorular && state.aiUrunSorular[pid]) || [];
  const yukleniyor = state.aiYukleniyor === pid;

  /* Yıldız dağılımı çubukları */
  const dagilimHTML = st.adet ? [5, 4, 3, 2, 1].map((y) => {
    const adet = st.dagilim[y] || 0;
    const yuzde = st.adet ? Math.round((adet / st.adet) * 100) : 0;
    return `<div style="display:flex;align-items:center;gap:7px;margin-bottom:3px;">
      <span style="font-size:9.5px;color:#888;width:22px;">${y}★</span>
      <div style="flex:1;height:6px;background:#EEEEEE;border-radius:99px;overflow:hidden;">
        <div style="height:100%;width:${yuzde}%;background:${y >= 4 ? "#4CAF50" : y === 3 ? "#FFB300" : "#E53935"};border-radius:99px;"></div>
      </div>
      <span style="font-size:9px;color:#999;width:28px;text-align:right;">${adet}</span>
    </div>`;
  }).join("") : "";

  const cevapHTML = cevaplar.map((c) => `
    <div style="background:#fff;border-radius:10px;padding:9px 11px;margin-top:7px;border:1px solid #C8E6C9;">
      <p style="margin:0 0 4px;font-size:10.5px;font-weight:800;color:#1B5E20;">🧑 ${escapeHtml(c.soru)}</p>
      <p style="margin:0;font-size:11.5px;line-height:1.6;color:#333;">${escapeHtml(c.cevap)}</p>
    </div>`).join("");

  return `<div class="card mb3" style="border:1.5px solid #B39DDB;background:linear-gradient(160deg,#F3E5F5,#EDE7F6);padding:0;overflow:hidden;">
    <div style="padding:12px 14px 10px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <span style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#7E57C2,#5E35B1);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;">🤖</span>
        <div style="flex:1;min-width:0;">
          <p style="margin:0;font-size:12.5px;font-weight:800;color:#4527A0;">Yapay Zeka Asistanı</p>
          <p style="margin:1px 0 0;font-size:9.5px;color:#673AB7;">${st.adet ? st.adet + " yorumu analiz eder" : "Ürün hakkında soru sor"}</p>
        </div>
        ${st.adet ? `<div style="text-align:right;flex-shrink:0;">
          <p style="margin:0;font-size:15px;font-weight:800;color:#4527A0;">${st.ortalama.toFixed(1)}</p>
          <p style="margin:0;font-size:8.5px;color:#673AB7;">/5</p>
        </div>` : ""}
      </div>

      ${dagilimHTML ? `<div style="background:rgba(255,255,255,.6);border-radius:9px;padding:8px 10px;margin-bottom:9px;">${dagilimHTML}</div>` : ""}

      <!-- Yorum özeti -->
      ${ozet ? `
        <div style="background:#fff;border-radius:10px;padding:10px 12px;border:1px solid #D1C4E9;">
          <p style="margin:0 0 5px;font-size:9.5px;font-weight:800;color:#7E57C2;letter-spacing:.04em;">✨ MÜŞTERİ YORUMLARININ ÖZETİ</p>
          <p style="margin:0;font-size:11.5px;line-height:1.65;color:#333;">${escapeHtml(ozet)}</p>
        </div>`
      : `<button data-action="ai-yorum-ozet" data-id="${pid}" ${yukleniyor ? "disabled" : ""}
          style="width:100%;padding:10px;border-radius:10px;border:none;background:linear-gradient(135deg,#7E57C2,#5E35B1);color:#fff;
          font-family:inherit;font-size:11.5px;font-weight:800;cursor:pointer;opacity:${yukleniyor ? ".65" : "1"};">
          ${yukleniyor ? "⏳ Yorumlar analiz ediliyor…" : (st.adet ? "✨ Yorumları Yapay Zeka ile Özetle" : "✨ Bu ürün için özet oluştur")}
        </button>`}

      <!-- Soru sor -->
      <div style="display:flex;gap:6px;margin-top:8px;">
        <input id="ai-urun-soru" class="input" placeholder="Bu ürün hakkında soru sor…"
          style="flex:1;font-size:11px;padding:9px;background:#fff;" />
        <button data-action="ai-urun-sor" data-id="${pid}" ${yukleniyor ? "disabled" : ""}
          style="width:auto;padding:0 14px;border-radius:9px;border:none;background:#4527A0;color:#fff;font-family:inherit;
          font-size:11px;font-weight:800;cursor:pointer;">Sor</button>
      </div>

      <!-- Hazır sorular -->
      <div style="display:flex;gap:5px;overflow-x:auto;margin-top:7px;padding-bottom:2px;">
        ${["Kime uygun?", "Nasıl kullanılır?", "Yorumlarda ne diyorlar?", "Fiyatı değer mi?"].map(q => `
          <button data-action="ai-hizli-soru" data-id="${pid}" data-q="${q}"
            style="flex-shrink:0;padding:5px 10px;border-radius:99px;border:1px solid #B39DDB;background:rgba(255,255,255,.75);
            font-family:inherit;font-size:9.5px;font-weight:700;color:#4527A0;cursor:pointer;white-space:nowrap;">${q}</button>`).join("")}
      </div>

      ${cevapHTML}
    </div>

    <p style="margin:0;padding:7px 14px;background:rgba(255,255,255,.5);font-size:8.5px;color:#7E57C2;line-height:1.5;">
      Yapay zeka önerisidir; tıbbi tavsiye değildir. Sağlık sorularınız için diş hekiminize danışın.
    </p>
  </div>`;
}

/* ---------------------------------------------------------------------
   YORUM ÖZETİ OLUŞTUR
   --------------------------------------------------------------------- */
async function aiYorumOzetiOlustur(pid) {
  const p = urunBul(pid);
  if (!p) return;

  state.aiYukleniyor = pid;
  render();

  const st = yorumIstatistigi(pid);
  let ozet = null;

  if (st.adet > 0) {
    const soru = `Bu ürünün müşteri yorumlarını özetle. ${st.adet} yorum var, ortalama puan ${st.ortalama.toFixed(1)}/5.
Yorumlarda en sık geçen kelimeler: ${st.kelimeler.join(", ") || "(yok)"}.
Özet: müşterilerin en çok neyi beğendiğini, neyden şikayet ettiğini ve kimlere uygun olduğunu tek paragrafta anlat.
En fazla 4 cümle olsun, madde işareti kullanma.`;
    ozet = await magazaAI(soru, urunBaglami(p, pid));
  }

  /* Yapay zeka cevap vermediyse istatistiksel özet (her zaman çalışır) */
  if (!ozet) {
    ozet = istatistikselOzet(p, st);
  }

  state.aiYorumOzeti = state.aiYorumOzeti || {};
  state.aiYorumOzeti[pid] = ozet;
  state.aiYukleniyor = null;
  render();
}

/* İstatistiksel özet — AI kapalıysa da bilgi verir */
function istatistikselOzet(p, st) {
  if (!st.adet) {
    return `${p.ad || "Bu ürün"} için henüz müşteri yorumu yok. İlk yorumu siz yazabilirsiniz — ürün kullandıktan sonra deneyiminizi paylaşırsanız diğer hastalarımıza yardımcı olur.`;
  }
  const memnun = (st.dagilim[5] || 0) + (st.dagilim[4] || 0);
  const memnunYuzde = Math.round((memnun / st.adet) * 100);
  const kelimeler = st.kelimeler.slice(0, 3).join(", ");

  let metin = `${st.adet} müşteri değerlendirmesi var, ortalama puan ${st.ortalama.toFixed(1)}/5. `;
  metin += `Kullanıcıların %${memnunYuzde}'i 4-5 yıldız vermiş. `;
  if (kelimeler) metin += `Yorumlarda en çok "${kelimeler}" öne çıkıyor. `;
  if (st.ortalama >= 4.5) metin += "Genel kanaat oldukça olumlu.";
  else if (st.ortalama >= 3.5) metin += "Genel kanaat olumlu, birkaç olumsuz deneyim de var.";
  else metin += "Yorumlar karışık; satın almadan önce detayları incelemenizi öneririz.";
  return metin;
}

/* ---------------------------------------------------------------------
   ÜRÜN SORUSU SOR
   --------------------------------------------------------------------- */
async function aiUrunSoruSor(pid, soru) {
  const p = urunBul(pid);
  if (!p) return;
  const q = String(soru || "").trim();
  if (!q) { alert("Lütfen bir soru yazın."); return; }
  if (q.length > 300) { alert("Soru çok uzun. Kısaltır mısın?"); return; }

  state.aiYukleniyor = pid;
  render();

  let cevap = await magazaAI(q, urunBaglami(p, pid));

  /* Yapay zeka yoksa: anlamlı yerel cevap üret */
  if (!cevap) cevap = yerelUrunCevabi(p, pid, q);

  state.aiUrunSorular = state.aiUrunSorular || {};
  state.aiUrunSorular[pid] = (state.aiUrunSorular[pid] || []).concat([{ soru: q, cevap }]).slice(-6);
  state.aiYukleniyor = null;
  render();
  setTimeout(() => {
    const el = document.getElementById("ai-urun-soru");
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, 120);
}

/* Yapay zeka kapalıyken verilecek yerel cevaplar (kural bazlı) */
function yerelUrunCevabi(p, pid, soru) {
  const s = String(soru).toLowerCase();
  const st = yorumIstatistigi(pid);
  const stok = accNum(p.stok);

  if (/yorum|değerlendirme|kim ne diyor|memnun/.test(s)) {
    return istatistikselOzet(p, st);
  }
  if (/fiyat|kaç para|pahalı|indirim|ucuz/.test(s)) {
    const f = urunFiyat(p);
    const ind = urunIndirimYuzde(p);
    return `Fiyatı ${accTL0(f)}. ` + (ind > 0 ? `Şu anda %${ind} indirimli — ${accTL0(accNum(p.fiyat))} yerine ${accTL0(f)}. ` : "") +
      "Klinikten teslim alırsanız kargo ücreti ödemezsiniz.";
  }
  if (/stok|var mı|tükendi|mevcut/.test(s)) {
    return stok > 0
      ? `Şu anda stokta ${stok} adet var, hemen sipariş verebilirsiniz.`
      : "Şu anda stokta görünmüyor. Kliniğimizi arayıp (0505 105 03 02) ne zaman geleceğini öğrenebilirsiniz.";
  }
  if (/kim|çocuk|yetişkin|bebek|hamile|uygun/.test(s)) {
    return `${p.ad || "Bu ürün"} — ${p.kategori || "ağız bakımı"} kategorisinde. ` +
      (p.aciklama ? p.aciklama.slice(0, 160) + " " : "") +
      "Yaş grubu ve özel durumlar (hamilelik, alerji) için kliniğimizden bilgi almanız en doğrusu.";
  }
  if (/nasıl kullan|kullanım/.test(s)) {
    return (p.aciklama ? p.aciklama.slice(0, 200) : "Ürün ambalajındaki kullanım talimatına uyun.") +
      " Günde 2 kez, 2 dakika fırçalama ideal. Diş hekiminiz size özel öneri verebilir.";
  }
  return `${p.ad || "Ürün"} hakkında: ` + (p.aciklama ? p.aciklama.slice(0, 180) + " " : "") +
    (st.adet ? `Müşteriler ortalama ${st.ortalama.toFixed(1)}/5 vermiş. ` : "") +
    "Aklınızdaki soruyu kliniğimizden de (0505 105 03 02) sorabilirsiniz.";
}

/* ---------------------------------------------------------------------
   OLAYLAR
   --------------------------------------------------------------------- */
function magazaAIAction(el, action) {
  if (action === "ai-yorum-ozet") {
    aiYorumOzetiOlustur(el.dataset.id);
    return true;
  }

  if (action === "ai-urun-sor") {
    const alan = document.getElementById("ai-urun-soru");
    aiUrunSoruSor(el.dataset.id, alan ? alan.value : state.aiSoruTaslak);
    if (alan) alan.value = "";
    return true;
  }

  if (action === "ai-hizli-soru") {
    aiUrunSoruSor(el.dataset.id, el.dataset.q);
    return true;
  }

  return false;
}

/* Soru alanını canlı takip et (yeniden çizimde kaybolmasın) */
document.addEventListener("input", function (e) {
  const t = e.target;
  if (t && t.id === "ai-urun-soru") state.aiSoruTaslak = t.value;
}, true);

/* Enter ile soru gönder */
document.addEventListener("keydown", function (e) {
  const t = e.target;
  if (!t || t.id !== "ai-urun-soru") return;
  if (e.key !== "Enter") return;
  e.preventDefault();
  const pid = state.magazaUrunId;
  if (pid) { aiUrunSoruSor(pid, t.value); t.value = ""; }
}, true);
