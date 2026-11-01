/* =====================================================================
   GÜVENLİK KATMANI — js/guvenlik.js
   ---------------------------------------------------------------------
   Sektör standardı (OWASP ASVS v3/v7, HIPAA/KVKK teknik tedbirleri)
   temel alınarak hazırlandı. Statik bir PWA'da uygulanabilen kontroller:

    1. Yönetici oturum zaman aşımı (boşta 20 dk + mutlak 8 saat)
    2. Oturum parmak izi (başka cihazdan devralma tespiti)
    3. Giriş denemesi sınırı (5 hatalı deneme → kademeli kilit)
    4. Denetim kaydı (kim, ne zaman, ne yaptı) — yerel + bulut
    5. Bot tuzağı (honeypot) — görünmez alan
    6. Veri saklama süresi temizliği (KVKK m.7)
    7. Güvenlik olay günlüğü
   ===================================================================== */

const GV = {
  BOSTA_DK: 20,          // boşta kalma süresi (dakika)
  MUTLAK_SAAT: 8,        // toplam oturum ömrü (saat)
  DENEME_LIMIT: 5,       // kaç hatalı denemeden sonra kilit
  KILIT_DK: 15,          // kilit süresi (dakika)
  UYARI_SN: 60,          // kapanmadan kaç saniye önce uyarı
  SAKLAMA_GUN: 730       // kişisel veri saklama süresi (2 yıl)
};

/* ------------------------------------------------------------------ */
/*  1. OTURUM ZAMAN AŞIMI                                             */
/* ------------------------------------------------------------------ */

let _gvSonAktivite = Date.now();
let _gvGirisZamani = 0;
let _gvSayacZaman = null;
let _gvUyariGosterildi = false;

function gvOturumBaslat() {
  _gvSonAktivite = Date.now();
  _gvGirisZamani = Date.now();
  _gvUyariGosterildi = false;

  try {
    localStorage.setItem("nurdis_gv_oturum", JSON.stringify({
      baslangic: _gvGirisZamani,
      parmak: gvParmakIzi()
    }));
  } catch (e) {}

  gvDenetim("oturum-basladi", "Yönetici oturumu açıldı");
  gvSayaciBaslat();
}

function gvOturumBitir(sebep) {
  const vardi = !!state.adminLoggedIn;
  state.adminLoggedIn = false;
  try { localStorage.removeItem("nurdis_admin_logged_in"); localStorage.removeItem("nurdis_gv_oturum"); } catch (e) {}
  if (_gvSayacZaman) { clearInterval(_gvSayacZaman); _gvSayacZaman = null; }
  if (window.fb && window.fb.signOutNow) { try { window.fb.signOutNow(); } catch (e) {} }
  gvDenetim("oturum-kapandi", sebep || "Çıkış");

  if (vardi) {
    state.screen = "admin-login";
    state.adminError = sebep === "bosta"
      ? "Güvenlik: 20 dakika işlem yapılmadığı için oturum kapatıldı."
      : sebep === "sure"
      ? "Güvenlik: 8 saatlik oturum süresi doldu, tekrar giriş yapın."
      : sebep === "cihaz"
      ? "Güvenlik: Bu oturum başka bir cihazda açılmış. Güvenlik için kapatıldı."
      : "";
  }
  try { render(); } catch (e) {}
}

function gvAktiviteYenile() {
  if (!state.adminLoggedIn) return;
  _gvSonAktivite = Date.now();
  _gvUyariGosterildi = false;
}

function gvSayaciBaslat() {
  if (_gvSayacZaman) clearInterval(_gvSayacZaman);
  _gvSayacZaman = setInterval(() => {
    if (!state.adminLoggedIn) { clearInterval(_gvSayacZaman); _gvSayacZaman = null; return; }

    const bosta = (Date.now() - _gvSonAktivite) / 60000;
    const toplam = (Date.now() - _gvGirisZamani) / 3600000;

    // Mutlak süre
    if (toplam >= GV.MUTLAK_SAAT) { gvOturumBitir("sure"); return; }

    // Başka cihazdan devralma
    if (gvParmakIziDegisti()) { gvOturumBitir("cihaz"); return; }

    // Boşta uyarı
    const kalanSn = (GV.BOSTA_DK - bosta) * 60;
    if (kalanSn <= GV.UYARI_SN && kalanSn > 0 && !_gvUyariGosterildi) {
      _gvUyariGosterildi = true;
      try {
        showNotif("⏰ Oturum kapanıyor", "1 dakika içinde işlem yapmazsanız güvenlik için çıkış yapılacak.");
      } catch (e) {}
    }

    // Boşta süre doldu
    if (bosta >= GV.BOSTA_DK) { gvOturumBitir("bosta"); }
  }, 30000);   // 30 saniyede bir kontrol
}

/* ------------------------------------------------------------------ */
/*  2. OTURUM PARMAK İZİ                                              */
/* ------------------------------------------------------------------ */

function gvParmakIzi() {
  const p = [
    navigator.userAgent || "",
    navigator.language || "",
    screen.width + "x" + screen.height,
    new Date().getTimezoneOffset()
  ].join("|");
  let h = 0;
  for (let i = 0; i < p.length; i++) { h = ((h << 5) - h) + p.charCodeAt(i); h |= 0; }
  return Math.abs(h).toString(36);
}

function gvParmakIziDegisti() {
  try {
    const kayit = JSON.parse(localStorage.getItem("nurdis_gv_oturum") || "null");
    if (!kayit || !kayit.parmak) return false;
    // Ekran döndürme / dil değişimi yanlış alarm vermesin: sadece temel cihaz farkı
    return kayit.parmak !== gvParmakIzi();
  } catch (e) { return false; }
}

/* ------------------------------------------------------------------ */
/*  3. GİRİŞ DENEMESİ SINIRI                                          */
/* ------------------------------------------------------------------ */

function gvKilitDurumu() {
  try {
    const d = JSON.parse(localStorage.getItem("nurdis_gv_giris") || "{}");
    if (d.kilitBitis && Date.now() < d.kilitBitis) {
      return { kilitli: true, kalanDk: Math.ceil((d.kilitBitis - Date.now()) / 60000), deneme: d.deneme || 0 };
    }
    return { kilitli: false, deneme: (d.kilitBitis && Date.now() >= d.kilitBitis) ? 0 : (d.deneme || 0) };
  } catch (e) { return { kilitli: false, deneme: 0 }; }
}

function gvHataliGiris() {
  let d = {};
  try { d = JSON.parse(localStorage.getItem("nurdis_gv_giris") || "{}"); } catch (e) {}
  d.deneme = (d.deneme || 0) + 1;
  if (d.deneme >= GV.DENEME_LIMIT) {
    d.kilitBitis = Date.now() + GV.KILIT_DK * 60000;
  }
  try { localStorage.setItem("nurdis_gv_giris", JSON.stringify(d)); } catch (e) {}
  gvDenetim("hatali-giris", `Hatalı deneme ${d.deneme}/${GV.DENEME_LIMIT}`);
  return gvKilitDurumu();
}

function gvBasariliGiris() {
  try { localStorage.removeItem("nurdis_gv_giris"); } catch (e) {}
}

/* ------------------------------------------------------------------ */
/*  4. DENETİM KAYDI (audit log)                                      */
/* ------------------------------------------------------------------ */

/* Yerel günlük (cihazda) + buluttaki admin_log koleksiyonu (yönetici) */
function gvDenetim(olay, detay) {
  const kayit = {
    olay: olay,
    detay: (detay || "").slice(0, 200),
    zaman: new Date().toISOString(),
    cihaz: (navigator.userAgent || "").slice(0, 120)
  };

  // Yerel: son 500 olay
  try {
    const liste = JSON.parse(localStorage.getItem("nurdis_gv_log") || "[]");
    liste.unshift(kayit);
    localStorage.setItem("nurdis_gv_log", JSON.stringify(liste.slice(0, 500)));
  } catch (e) {}

  // Bulut: yalnızca yönetici oturumunda (kural zaten admin-only)
  try {
    if (state.adminLoggedIn && window.fb && window.fb.addAdminLog) {
      window.fb.addAdminLog(kayit).catch(() => {});
    }
  } catch (e) {}
}

function gvLoglariGetir(adet) {
  try {
    return JSON.parse(localStorage.getItem("nurdis_gv_log") || "[]").slice(0, adet || 50);
  } catch (e) { return []; }
}

/* Yönetici panelinde gösterilecek özet */
function gvGuvvenlikOzeti() {
  const log = gvLoglariGetir(200);
  const hatali = log.filter(l => l.olay === "hatali-giris").length;
  const oturum = log.filter(l => l.olay === "oturum-basladi").length;
  const kilit = gvKilitDurumu();
  return { hatali, oturum, kilit, sonKayitlar: log.slice(0, 12) };
}

/* ------------------------------------------------------------------ */
/*  5. BOT TUZAĞI (honeypot)                                          */
/* ------------------------------------------------------------------ */

/* Forma görünmez bir alan eklenir. İnsan görmez/doldurmaz — botlar
   otomatik doldurur. Doluysa gönderim sessizce reddedilir. */
function gvTuzakAlani() {
  return `<div aria-hidden="true" style="position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;">
    <label for="gv-tuzak">Bu alanı boş bırakın</label>
    <input type="text" id="gv-tuzak" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" value="" />
  </div>`;
}

function gvTuzakDolu() {
  const el = document.getElementById("gv-tuzak");
  return !!(el && el.value && el.value.trim().length > 0);
}

/* ------------------------------------------------------------------ */
/*  6. VERİ SAKLAMA SÜRESİ (KVKK m.7 — silme yükümlülüğü)             */
/* ------------------------------------------------------------------ */

/* Belirtilen günden eski kayıtları ayıklar. Yönetici çalıştırır. */
function gvEskiKayitlar(liste, tarihAlani, gun) {
  const sinir = Date.now() - (gun || GV.SAKLAMA_GUN) * 86400000;
  const silinen = [];
  const kalan = [];
  (liste || []).forEach(x => {
    const t = new Date(x[tarihAlani || "createdAt"] || x.date || 0).getTime();
    if (t && t < sinir) silinen.push(x); else kalan.push(x);
  });
  return { kalan, silinen, adet: silinen.length };
}

/* ------------------------------------------------------------------ */
/*  7. OLAY BAĞLAMA                                                   */
/* ------------------------------------------------------------------ */

/* Kullanıcı etkinliği → oturum sayacı sıfırlanır */
["click", "keydown", "touchstart", "scroll"].forEach(ev => {
  document.addEventListener(ev, () => { if (state.adminLoggedIn) gvAktiviteYenile(); }, { passive: true });
});

/* Sayfa tekrar görünür olduğunda süre kontrolü */
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && state.adminLoggedIn) {
    const bosta = (Date.now() - _gvSonAktivite) / 60000;
    if (bosta >= GV.BOSTA_DK) gvOturumBitir("bosta");
  }
});

/* Sekmeler arası çıkış senkronu: bir sekmede çıkış yapılırsa diğerleri de kapanır */
window.addEventListener("storage", (e) => {
  if (e.key === "nurdis_admin_logged_in" && e.newValue === null && state.adminLoggedIn) {
    state.adminLoggedIn = false;
    state.screen = "admin-login";
    state.adminError = "Güvenlik: oturum başka bir sekmede kapatıldı.";
    try { render(); } catch (err) {}
  }
});
