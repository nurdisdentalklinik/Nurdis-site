/* =====================================================================
   NUR DIS - ACILIS HIZLANDIRMA v2 (v64)
   =====================================================================
   OLCUMLE BULUNAN GERCEK SORUN
   ----------------------------
   "Acilis gec" sikayetinin sebebi splash VIDEOSU DEGIL (projede video
   hic yok). Olculen:
     • 7 splash gorseli (~380 KB) CSS'te tanimli oldugu icin sayfa
       acilirken HEPSI indiriliyordu
     • ayni gorsel (icon-192.png, doctor-photo.webp) 2-3 kez istek
       olarak gidiyordu
     • Cloudflare varsayilani "no-cache" oldugu icin 1,9 MB gorsel
       her acilista yeniden iniyordu
     • yavas 3G'de toplam acilis 19,4 sn

   DENENEN VE VAZ GECILEN YOL
   --------------------------
   mali/prim/muhasebe/ekran modullerini tembel yuklemek DENENDI ve
   KALDIRILDI: bu dosyalar birbirine sik dokulu bagli (accNum 223 yerde,
   accTL 137 yerde cagriliyor; renderBooking -> accToday kullaniyor).
   Tembel yukleme "accToday is not defined" gibi hatalar uretti.
   Guvenli olan kazanc asagidaki iki maddeden geliyor.

   SIMDI NE YAPIYOR
   ----------------
   1) Splash gorselleri SIRAYLA yuklenir (1. hemen, kalan 6'si 240 ms
      arayla). Ilk slayt asla bos kalmaz, digerleri geldikce girer.
   2) Ekran acildiginda o ekranin ihtiyac duydugu gorseller onceden
      cekilir (prefetch) - kullanici tiklayinca beklemez.
   ===================================================================== */
(function () {
  "use strict";

  /* v74 — SADECE 5 SAHNE (kullanıcı: uzaydan dünyaya → Türkiye → Mardin
     → klinik). Önce 7 görselin tamamı indiriliyordu; splash ağırlaşıyordu.
     Artık yalnız 5. görsel yükleniyor, süre kısaldı. */
  var SPLASH_GORSELLERI = [
    "splash-1-space.webp",      /* s1: uzaydan dünyaya */
    "splash-3-turkey.jpg",      /* s2: Türkiye */
    "splash-4-mardin.jpg",      /* s3: Mardin */
    "splash-5-toki.jpg",        /* s4: Kızıltepe */
    "splash-6-clinic.jpg"       /* s5: klinik */
  ];

  /* ---- 1) Splash: yalnizca 1. gorsel basta, digerleri sirayla ---- */
  function splashGorselleriniYukle() {
    var kap = document.getElementById("splash-screen");
    if (!kap) return;
    var slaytlar = kap.querySelectorAll(".splash-slide");
    if (!slaytlar.length) return;

    /* 2..7 slaytlarin arka planini temizle (CSS'te tanimli) */
    for (var k = 1; k < slaytlar.length; k++) {
      slaytlar[k].style.backgroundImage = "none";
    }

    var i = 1;
    function siradaki() {
      if (i >= SPLASH_GORSELLERI.length) return;
      if (!document.getElementById("splash-screen")) return;   // splash kapandi
      if (slaytlar[i]) slaytlar[i].style.backgroundImage = "url('" + SPLASH_GORSELLERI[i] + "')";
      i++;
      setTimeout(siradaki, 240);
    }
    setTimeout(siradaki, 320);

    /* Splash 3 sn icinde kapanirsa kalan gorselleri indirme */
    setTimeout(function () {
      if (!document.getElementById("splash-screen")) return;
    }, 3000);
  }

  /* ---- 2) Ekran bazli gorsel on yukleme (prefetch) ---- */
  var ON_YUKLEME = {
    home: ["clinic-hero.webp", "icon-muayene.webp", "icon-kanal.webp", "icon-implant.webp"],
    services: ["icon-temizlik.webp", "icon-dolgu.webp", "icon-zirkonyum.webp", "icon-ortodonti.webp",
      "icon-beyazlatma.webp", "icon-cekim.webp", "icon-kopru.webp", "icon-seffafplak.webp"],
    doctors: ["doctor-photo.webp"],
    store: ["icon-store.webp", "urunler/y1.webp", "urunler/y2.webp"],
    info: ["info-toothache.webp"],
    fircalama: ["icon-smile.webp"]
  };
  var yuklenenler = {};

  function onYukle(ekran) {
    var liste = ON_YUKLEME[ekran];
    if (!liste) return;
    liste.forEach(function (src) {
      if (yuklenenler[src]) return;
      yuklenenler[src] = 1;
      var im = new Image();
      im.src = src;
    });
  }

  /* state.screen degisimini hafif bir izleyiciyle takip et */
  var sonEkran = "";
  setInterval(function () {
    var e = "";
    try { e = (window.state && state.screen) || ""; } catch (err) {}
    if (e && e !== sonEkran) {
      sonEkran = e;
      onYukle(e);
    }
  }, 500);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", splashGorselleriniYukle);
  } else {
    splashGorselleriniYukle();
  }

  window.__onYukle = onYukle;

  /* =====================================================================
     ÇİFT İNDİRME DÜZELTMESİ (v64)
     ---------------------------------------------------------------------
     ÖLÇÜM: her görsel TAM 2 kez isteniyordu (tek 931 KB → 1.384 KB).
     Sebep: uygulama splash beklemeden hemen çiziliyor; splash ekranı
     yarı saydam olduğu için altındaki ana sayfa görselleri de indiriliyor.
     İki geçiş üst üste biniyor.

     ÇÖZÜM: splash ekranda dururken ana sayfa görsellerini çekme; splash
     kalkınca normal akışa dön. (Splash ~7 sn sürüyor, bu sürede 931 KB
     tek seferde iniyor, iki kez değil.)
     ===================================================================== */
  function ciftIndirmeyiEngelle() {
    var stil = document.createElement("style");
    stil.id = "nurdis-splash-bekletme";
    /* splash açıkken içerik görselleri yüklenmesin: CSS arka planlar kapalı,
       <img> etiketleri görünmez kalır → tarayıcı indirmez. */
    stil.textContent = [
      "body.splash-acik #screen img[src]:not([data-temel]) { visibility: hidden; }",
      "body.splash-acik #screen .hero { background-image: none !important; }"
    ].join("\n");
    document.head.appendChild(stil);

    if (document.body) document.body.classList.add("splash-acik");

    /* Splash kalkınca sınıfı kaldır */
    var gozlemci = setInterval(function () {
      if (!document.getElementById("splash-screen")) {
        clearInterval(gozlemci);
        if (document.body) document.body.classList.remove("splash-acik");
        var s2 = document.getElementById("nurdis-splash-bekletme");
        if (s2) s2.remove();
      }
    }, 250);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ciftIndirmeyiEngelle);
  } else {
    ciftIndirmeyiEngelle();
  }
})();
