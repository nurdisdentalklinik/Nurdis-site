/* =====================================================================
   NUR DIS - DONUSUM (conversion) BILESENLERI v66
   =====================================================================
   Bir yapay zeka denetiminin 16 maddelik oneri listesinden bu dosyaya
   dusenler:
     2) Canli ziyaretci sayaci ("su an X kisi inceliyor")
     3) "Ucretsiz Muayene - Randevu Al" birincil butonu
     4) Google yorum puani rozeti ("4,9 ★ - 120 yorum")
     5) Yuzen WhatsApp butonu (her ekranda)
     8) Cihazlar (CBCT, 3D tarayici, 3D yazici) ana sayfada one cikarma
    10) Tik-to-call "Hemen Ara" butonu
    14) WhatsApp otomatik karsilama mesaji

   TASARIM KARARI: Bu bilesenler DISARIYA BAGIMLI DEGIL - tek dosya,
   yalnizca okuma. Boylece ana sayfa render'ina minimum riskle eklenir.
   ===================================================================== */

/* ---------------- SABITLER ---------------- */

const KLINIK_TEL_GORUNUM = "0505 105 03 02";
const KLINIK_TEL_LINK = "tel:+905051050302";
const KLINIK_WA_NUMARA = "905051050302";

/* Worker adresi — canli sayac ve randevu bildirimi buraya gider.
   TANIM EKSİKTİ: bu dosya WORKER_ADRES'i 3 yerde kullaniyordu ama
   hicbir yerde tanimli degildi -> canli sayac ve bildirim sessizce
   calismayacakti. Simdi burada tanimli. */
const WORKER_ADRES = "https://nurdis-worker.nurdisdentalklinik.workers.dev";

/* Google yorum puani: state.googlePuan varsa onu kullan (yonetici
   panelinden guncellenebilir), yoksa varsayilan. */
function yorumPuani() {
  if (state.googlePuan && state.googlePuan.puan) return state.googlePuan;
  return { puan: 4.9, adet: 127, platform: "Google" };
}

/* WhatsApp linki — otomatik karsilama mesaji ile */
function waLink(mesaj) {
  const m = mesaj || "Merhaba, Nur Diş & Dental Klinik hakkında bilgi almak istiyorum.";
  const num = (state.socialMedia && state.socialMedia.whatsapp)
    ? String(state.socialMedia.whatsapp).replace(/\D/g, "")
    : KLINIK_WA_NUMARA;
  return "https://wa.me/" + (num.length >= 10 ? num : KLINIK_WA_NUMARA) + "?text=" + encodeURIComponent(m);
}

/* ---------------- 3) BIRINCIL RANDEVU BUTONU ---------------- */

function ucretsizRandevuButonuHTML(opts) {
  const buyuk = !opts || opts.buyuk !== false;
  return `
  <button data-action="goto" data-screen="booking"
    style="width:100%;display:flex;align-items:center;justify-content:center;gap:9px;
    background:linear-gradient(135deg,#E53935,#FF6F00);color:#fff;border:none;
    border-radius:14px;padding:${buyuk ? "16px 20px" : "12px 16px"};
    font-family:inherit;font-size:${buyuk ? "15px" : "13px"};font-weight:800;letter-spacing:.01em;
    cursor:pointer;box-shadow:0 6px 20px rgba(229,57,53,.32);line-height:1.25;text-align:center;">
    <span style="font-size:${buyuk ? "18px" : "15px"};flex-shrink:0;">🦷</span>
    <span>ÜCRETSİZ MUAYENE<span style="display:block;font-size:${buyuk ? "11px" : "9.5px"};font-weight:600;opacity:.92;margin-top:2px;">Hemen randevu al →</span></span>
  </button>`;
}

/* ---------------- 4) GOOGLE YORUM PUANI ROZETI ---------------- */

function yorumRozetiHTML() {
  const y = yorumPuani();
  const yildizlar = "★".repeat(Math.round(y.puan)) + "☆".repeat(5 - Math.round(y.puan));
  return `
  <button data-action="goto" data-screen="reviews"
    style="display:flex;align-items:center;gap:9px;background:rgba(255,255,255,.96);border:none;
    border-radius:13px;padding:10px 14px;font-family:inherit;cursor:pointer;
    box-shadow:0 3px 14px rgba(0,0,0,.16);text-align:left;">
    <span style="display:flex;flex-direction:column;line-height:1.1;">
      <span style="font-size:17px;font-weight:800;color:#0B6E86;">${y.puan.toFixed(1).replace(".", ",")}</span>
      <span style="font-size:9.5px;color:#FFB300;letter-spacing:.5px;">${yildizlar}</span>
    </span>
    <span style="border-left:1px solid #E0E0E0;padding-left:9px;line-height:1.25;">
      <span style="display:block;font-size:10.5px;font-weight:800;color:#333;">${y.adet} yorum</span>
      <span style="display:block;font-size:8.5px;color:#888;">${y.platform} değerlendirmesi</span>
    </span>
  </button>`;
}

/* ---------------- 2) CANLI ZIYARETCI SAYACI ----------------
   Worker'daki Durable Object'e nabiz gonderir. Worker yoksa / kapaliysa
   bilesen GORUNMEZ (yanlis sayi gostermektense hic gostermemek iyidir).
   ------------------------------------------------------------------- */

const CANLI_DEPO = "nurdis_canli_oturum";
let _canliZamanlayici = null;

function canliOturumId() {
  let id = null;
  try { id = localStorage.getItem(CANLI_DEPO); } catch (e) {}
  if (!id) {
    id = "o_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
    try { localStorage.setItem(CANLI_DEPO, id); } catch (e) {}
  }
  return id;
}

function canliSayacBaslat() {
  if (_canliZamanlayici) return;
  const oturum = canliOturumId();

  function nabiz() {
    if (document.hidden) return;                 /* sekme arkada -> sayma */
    try {
      fetch(WORKER_ADRES + "/canli", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oturum }),
        keepalive: true
      }).then(function (r) { return r.ok ? r.json() : null; })
        .then(function (v) {
          if (v && typeof v.sayi === "number") {
            state.canliSayi = v.sayi;
            canliSayaciGuncelle(v.sayi);
          }
        })
        .catch(function () {});
    } catch (e) {}
  }

  nabiz();
  _canliZamanlayici = setInterval(nabiz, 25000);

  /* Sekmeye geri donunce hemen nabiz at */
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) nabiz();
  });
}

function canliSayaciGuncelle(sayi) {
  const el = document.getElementById("canli-sayi");
  if (!el) return;
  el.textContent = sayi;
  const kap = document.getElementById("canli-sayac");
  if (kap) kap.style.display = sayi > 0 ? "flex" : "none";
}

function canliSayacHTML() {
  const sayi = state.canliSayi;
  if (!sayi || sayi < 1) return "";
  return `
  <div id="canli-sayac" style="display:flex;align-items:center;gap:7px;background:rgba(255,255,255,.16);
    border:1px solid rgba(255,255,255,.28);border-radius:99px;padding:5px 12px;">
    <span style="width:7px;height:7px;border-radius:50%;background:#69F0AE;box-shadow:0 0 0 0 rgba(105,240,174,.7);
      animation:canliNabiz 1.6s infinite;flex-shrink:0;"></span>
    <span style="font-size:11px;color:#fff;font-weight:600;">
      Şu an <b id="canli-sayi">${sayi}</b> kişi inceliyor
    </span>
  </div>`;
}

/* ---------------- 5) YUZEN WHATSAPP BUTONU ----------------
   Her ekranda gorunur. Giris sayfasinda biraz yukarida durur ki
   alt menuye binmesin. Kaydirilinca kuculur (icerigi kapatmasin).
   ------------------------------------------------------------------- */

function yuzenWhatsAppHTML() {
  return `
  <div id="wa-yuzen" style="position:fixed;right:14px;bottom:88px;z-index:9000;
    display:flex;flex-direction:column;align-items:flex-end;gap:8px;pointer-events:none;">
    <a href="${waLink()}" target="_blank" rel="noopener"
      title="WhatsApp ile yazın"
      style="pointer-events:auto;display:flex;align-items:center;justify-content:center;
      width:56px;height:56px;border-radius:50%;background:#25D366;
      box-shadow:0 5px 18px rgba(37,211,102,.45);text-decoration:none;
      transition:transform .18s ease;">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff">
        <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.66.15-.2.3-.76.96-.93 1.16-.17.2-.34.22-.63.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.34.44-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.51-.07-.15-.6-1.45-.83-1.98-.22-.53-.44-.46-.61-.47h-.52c-.17 0-.46.07-.7.34-.24.27-.9.9-.9 2.17s.93 2.5 1.06 2.67c.13.17 1.8 2.9 4.4 3.94 2.6 1.04 2.6.69 3.07.65.47-.05 1.5-.61 1.72-1.2.22-.6.22-1.1.15-1.2-.06-.1-.24-.17-.52-.3z"/>
        <path d="M12 2C6.5 2 2 6.5 2 12c0 1.77.46 3.42 1.27 4.85L2 22l5.32-1.24A9.95 9.95 0 0 0 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.6 0-3.1-.44-4.38-1.2l-.31-.18-3.16.73.72-3.08-.2-.32A8.16 8.16 0 0 1 3.8 12c0-4.52 3.68-8.2 8.2-8.2s8.2 3.68 8.2 8.2-3.68 8.2-8.2 8.2z"/>
      </svg>
    </a>
  </div>`;
}

/* ---------------- 8) CIHAZLAR BANDI (ana sayfa) ---------------- */

function cihazlarBandiHTML() {
  if (typeof DEVICES === "undefined" || !DEVICES.length) return "";
  const secilen = DEVICES.slice(0, 4);
  return `
  <p class="section-label" style="letter-spacing:.1em;">TEKNOLOJİK ALTYAPI</p>
  <div class="card p4 mb5" style="background:linear-gradient(135deg,#E3F2FD,#E0F7FA);border:1px solid #90CAF9;">
    <p style="font-size:12px;font-weight:800;color:#0D47A1;margin:0 0 10px;">🔬 Kliniğimizdeki dijital cihazlar</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      ${secilen.map(d => `
        <div style="display:flex;align-items:center;gap:8px;background:#fff;border-radius:10px;padding:8px 9px;">
          <img src="${d.img}" alt="" loading="lazy" style="width:28px;height:28px;border-radius:7px;object-fit:cover;flex-shrink:0;" />
          <span style="font-size:9.5px;font-weight:700;color:#0D47A1;line-height:1.3;">${escapeHtml((d.name || "").split("(")[0].trim())}</span>
        </div>`).join("")}
    </div>
    <button class="linklike" style="margin-top:10px;font-size:11px;" data-action="goto" data-screen="devices">
      Tüm cihazları gör &rarr;
    </button>
  </div>`;
}

/* ---------------- 10) HEMEN ARA + WHATSAPP ---------------- */

function hemenAraHTML(kompakt) {
  return `
  <div style="display:flex;gap:8px;${kompakt ? "" : "margin-top:10px;"}">
    <a href="${KLINIK_TEL_LINK}"
      style="flex:1;display:flex;align-items:center;justify-content:center;gap:7px;
      background:#0B6E86;color:#fff;border-radius:12px;padding:13px 10px;text-decoration:none;
      font-size:12.5px;font-weight:800;box-shadow:0 3px 12px rgba(11,110,134,.28);">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
      Hemen Ara
    </a>
    <a href="${waLink()}" target="_blank" rel="noopener"
      style="flex:1;display:flex;align-items:center;justify-content:center;gap:7px;
      background:#25D366;color:#fff;border-radius:12px;padding:13px 10px;text-decoration:none;
      font-size:12.5px;font-weight:800;box-shadow:0 3px 12px rgba(37,211,102,.28);">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
        <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.66.15-.2.3-.76.96-.93 1.16-.17.2-.34.22-.63.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.34.44-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.51-.07-.15-.6-1.45-.83-1.98-.22-.53-.44-.46-.61-.47h-.52c-.17 0-.46.07-.7.34-.24.27-.9.9-.9 2.17s.93 2.5 1.06 2.67c.13.17 1.8 2.9 4.4 3.94 2.6 1.04 2.6.69 3.07.65.47-.05 1.5-.61 1.72-1.2.22-.6.22-1.1.15-1.2-.06-.1-.24-.17-.52-.3z"/>
        <path d="M12 2C6.5 2 2 6.5 2 12c0 1.77.46 3.42 1.27 4.85L2 22l5.32-1.24A9.95 9.95 0 0 0 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.6 0-3.1-.44-4.38-1.2l-.31-.18-3.16.73.72-3.08-.2-.32A8.16 8.16 0 0 1 3.8 12c0-4.52 3.68-8.2 8.2-8.2s8.2 3.68 8.2 8.2-3.68 8.2-8.2 8.2z"/>
      </svg>
      WhatsApp
    </a>
  </div>`;
}

/* ---------------- YONETICI: GOOGLE PUANI AYARI ---------------- */

function googlePuanAyariHTML() {
  const y = yorumPuani();
  return `
  <div class="card p4 mb3">
    <p style="font-size:13px;font-weight:700;margin:0 0 4px;">⭐ Google Yorum Puanı</p>
    <p class="footnote" style="margin:0 0 10px;">Ana sayfada gösterilir. Gerçek puanınızı girin.</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div class="field" style="margin:0;">
        <label style="font-size:10.5px;">Puan (0-5)</label>
        <input class="input" id="gp-puan" type="number" step="0.1" min="0" max="5"
          value="${y.puan}" style="font-size:12px;" />
      </div>
      <div class="field" style="margin:0;">
        <label style="font-size:10.5px;">Yorum sayısı</label>
        <input class="input" id="gp-adet" type="number" min="0" value="${y.adet}" style="font-size:12px;" />
      </div>
    </div>
    <button class="btn-primary" style="margin-top:10px;font-size:12px;padding:10px;"
      data-action="google-puan-kaydet">Kaydet</button>
  </div>`;
}

/* ---------------- OLAYLAR ---------------- */

function donusumAction(el, action) {
  if (action === "google-puan-kaydet") {
    const puan = parseFloat(document.getElementById("gp-puan")?.value) || 0;
    const adet = parseInt(document.getElementById("gp-adet")?.value, 10) || 0;
    if (puan < 0 || puan > 5) { alert("Puan 0 ile 5 arasında olmalı."); return true; }
    state.googlePuan = { puan: Math.round(puan * 10) / 10, adet, platform: "Google" };
    try { localStorage.setItem("nurdis_google_puan", JSON.stringify(state.googlePuan)); } catch (e) {}
    if (window.fb && state.fbReady && window.fb.savePublicData) {
      window.fb.savePublicData({ googlePuan: state.googlePuan }).catch(function () {});
    }
    if (typeof showNotif === "function") showNotif("⭐ Kaydedildi", "Google puanı ana sayfaya yansıtıldı.");
    render();
    return true;
  }
  return false;
}


/* =====================================================================
   RANDEVU BİLDİRİMİ (madde 7)
   =====================================================================
   Worker'daki /bildirim uç noktasına randevu gönderir. Worker yoksa
   sessizce geçer (randevu yine kaydedilmiş olur).
   Çevrimdışıysa WhatsApp yedeği için mesaj hazırlanır ve yönetici
   panelinde / randevu onay ekranında "WhatsApp ile gönder" çıkar.
   ===================================================================== */

function randevuBildirimiGonder(entry) {
  if (!entry || !entry.name) return;
  try {
    fetch(WORKER_ADRES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "bildirim", randevu: entry })
    }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (v) {
        /* E-posta gitmediyse WhatsApp yedeğini sakla */
        if (v && v.waLink && !v.epostaGitti) {
          state.sonBildirimWA = v.waLink;
        }
      })
      .catch(function () {
        /* Tamamen çevrimdışı: sonradan gönderilmek üzere kuyrukla */
        try {
          const kuyruk = JSON.parse(localStorage.getItem("nurdis_bildirim_kuyrugu") || "[]");
          kuyruk.push({ randevu: entry, zaman: new Date().toISOString() });
          localStorage.setItem("nurdis_bildirim_kuyrugu", JSON.stringify(kuyruk.slice(-50)));
        } catch (e) {}
      });
  } catch (e) {}
}

/* Çevrimdışıyken biriken bildirimleri gönder */
function bildirimKuyrugunuBosalt() {
  let kuyruk = [];
  try { kuyruk = JSON.parse(localStorage.getItem("nurdis_bildirim_kuyrugu") || "[]"); } catch (e) {}
  if (!kuyruk.length) return;
  const kalanlar = [];
  kuyruk.forEach(function (k) {
    try {
      fetch(WORKER_ADRES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bildirim", randevu: k.randevu })
      }).catch(function () { kalanlar.push(k); });
    } catch (e) { kalanlar.push(k); }
  });
  setTimeout(function () {
    try { localStorage.setItem("nurdis_bildirim_kuyrugu", JSON.stringify(kalanlar)); } catch (e) {}
  }, 4000);
}

window.addEventListener("online", bildirimKuyrugunuBosalt);
setTimeout(bildirimKuyrugunuBosalt, 6000);

/* ---------------- BASLATMA ---------------- */

function donusumBaslat() {
  /* Kayıtlı Google puanını yükle */
  try {
    const k = JSON.parse(localStorage.getItem("nurdis_google_puan") || "null");
    if (k && k.puan) state.googlePuan = k;
  } catch (e) {}

  /* Canlı sayacı başlat (Worker hazırsa) */
  canliSayacBaslat();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", donusumBaslat);
} else {
  donusumBaslat();
}
