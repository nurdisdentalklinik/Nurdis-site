/* NUR DİŞ & DENTAL KLİNİK — Yapay Zeka Asistanı Sunucusu (Cloudflare Worker)
   Bu kod Gemini API anahtarını GİZLİ tutar; anahtar asla tarayıcıya/uygulama
   koduna gönderilmez. Uygulama sadece bu Worker'a istek atar, Worker da
   Google Gemini API'sine anahtarla birlikte istek yapıp cevabı geri döner. */

const SYSTEM_PROMPT = `Sen "Dt. Ramazan DAĞ'ın Dijitali" adında, Nur Diş & Dental Klinik'in yapay zeka asistanısın.
Kızıltepe/Mardin'deki bu klinik adına, sıcak, güven veren ama abartısız bir üslupla konuşursun.
Diş sağlığı, tedaviler, ağız bakımı hakkında Türkçe, doğru ve anlaşılır bilgi verirsin.
Kesinlikle teşhis koymaz, ilaç dozu önermez, reçete yazmazsın — ciddi/şüpheli durumlarda mutlaka
"kliniğimizde muayene olman en doğrusu" diyerek randevuya yönlendirirsin.
Eğer sana bir diş/ağız fotoğrafı gönderilirse: sadece GENEL bir gözlem paylaş (örn. "hafif sararma
görünüyor", "bu bölgede iltihap belirtisi olabilir"), ASLA kesin teşhis koyma, her seferinde
"bu sadece ön izlenimdir, kesin teşhis için mutlaka kliniğimizde muayene olman gerekiyor" uyarısını ekle.
Kliniğin gerçek bilgileri: Adres: Mardin, Kızıltepe, TOKİ. Telefon: 0505 105 03 02.
Muayene ücretsizdir. Çalışma saatleri: Hafta içi 09:00-18:00, Cumartesi 10:00-14:00.
Cevapların kısa, sıcak ve mobil ekrana uygun olsun (2-4 cümle), gereksiz uzatma.`;

async function callGemini(env, userText, imageBase64) {
  const parts = [{ text: userText || "Merhaba" }];
  if (imageBase64) {
    parts.push({ inline_data: { mime_type: "image/jpeg", data: imageBase64 } });
  }
  const body = {
    contents: [{ role: "user", parts }],
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    generationConfig: { temperature: 0.6, maxOutputTokens: 400 },
  };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error("Gemini API hatası: " + errText.slice(0, 300));
  }
  const data = await res.json();
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return reply || "Şu an cevap veremedim, lütfen tekrar dene.";
}

export default {
  async fetch(request, env) {
    // CORS: GitHub Pages sitenden gelen isteklere izin ver
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Sadece POST kabul edilir." }), { status: 405, headers: corsHeaders });
    }
    try {
      const { message, image } = await request.json();
      const reply = await callGemini(env, message, image);
      return new Response(JSON.stringify({ reply }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err.message || err) }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  },
};
