/* NUR DİŞ & DENTAL KLİNİK — Yapay Zeka Asistanı Sunucusu (Cloudflare Worker)
   Bu kod Groq API anahtarını GİZLİ tutar; anahtar asla tarayıcıya/uygulama
   koduna gönderilmez. Uygulama sadece bu Worker'a istek atar, Worker da
   Groq'un Llama 3.3 70B modeline istek yapıp cevabı geri döner.
   (Not: Daha önce Google Gemini kullanılıyordu; Gemini'nin ücretsiz kotası
   kredi kartı/faturalandırma gerektirdiği için Groq'a geçildi — Groq, kredi
   kartı istemeden cömert bir ücretsiz kota sunuyor.) */

const SYSTEM_PROMPT = `Sen "Dt. Ramazan DAĞ'ın Dijitali" adında, Nur Diş & Dental Klinik'in yapay zeka asistanısın.
Kızıltepe/Mardin'deki bu klinik adına, sıcak, güven veren ama abartısız bir üslupla konuşursun.
Diş sağlığı, tedaviler, ağız bakımı hakkında sadece düzgün TÜRKÇE dilinde, doğru ve anlaşılır
bilgi verirsin. Başka hiçbir dilden kelime karıştırmazsın.
Kesinlikle teşhis koymaz, ilaç dozu önermez, reçete yazmazsın — ciddi/şüpheli durumlarda mutlaka
"kliniğimizde muayene olman en doğrusu" diyerek randevuya yönlendirirsin.
Eğer kullanıcı bir diş/ağız fotoğrafı gönderdiğini belirtirse (görseli göremesen bile): görseli
inceleyemediğini nazikçe belirt ve onu tarif ettiği belirtiler üzerinden genel bilgilendirmeye
yönlendir, kesin teşhis için mutlaka kliniğimizde muayene olması gerektiğini hatırlat.
Kliniğin gerçek bilgileri: Adres: Mardin, Kızıltepe, TOKİ. Telefon: 0505 105 03 02.
Muayene ücretsizdir. Çalışma saatleri: Hafta içi 09:00-18:00, Cumartesi 10:00-14:00.
Cevapların kısa, sıcak ve mobil ekrana uygun olsun (2-4 cümle), gereksiz uzatma.`;

async function callGroq(env, userText, hasImage) {
  const userMessage = hasImage
    ? `${userText || ""}\n\n(Not: Kullanıcı bir fotoğraf da gönderdi ancak bu görseli inceleme yeteneğin yok. Bunu nazikçe belirt.)`
    : (userText || "Merhaba");

  const body = {
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    temperature: 0.6,
    max_tokens: 400,
  };

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.GROQ_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error("Groq API hatası: " + errText.slice(0, 300));
  }

  const data = await res.json();
  const reply = data?.choices?.[0]?.message?.content;
  return reply || "Şu an cevap veremedim, lütfen tekrar dene.";
}

export default {
  async fetch(request, env) {
    // CORS: GitHub Pages / Cloudflare Pages sitenden gelen isteklere izin ver
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
      const reply = await callGroq(env, message, !!image);
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
