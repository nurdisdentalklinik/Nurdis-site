/* ÖNBELLEK KIRICI (v74)
   ══════════════════════════════════════════════════════════════════
   KULLANICI ŞİKAYETİ: "Splash giriş çok ağır ve tutarsız, tekrar ediyor"

   KÖK NEDEN (bu dosya!):
     Eski sürüm, i18n.js yüklendikten sonra `window.dilDegistir` fonksiyonunu
     arıyordu. Bu fonksiyon `function dilDegistir()` olarak tanımlı; window'a
     ayrıca atanmıyor. Yani kontrol HER ZAMAN başarısız oluyordu.
     Sonuç: 2.5 saniye sonra sayfa `location.replace()` ile YENİDEN
     YÜKLENİYORDU → SPLASH BAŞTAN BAŞLIYORDU.
     Yavaş bağlantıda bu her açılışta oluyordu; kullanıcı aynı splash'i
     iki kez görüyordu ("tekrar ediyor").

   YENİ DAVRANIŞ:
     • Sayfa ASLA yeniden yüklenmez (location.replace kaldırıldı)
     • Sadece service worker güncellemesi istenir (sessiz, ucuz)
     • Splash tek sefer görünür
   ══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  try {
    if (!("serviceWorker" in navigator)) return;

    /* Service worker'ı güncelle — splash'e dokunmaz, sayfayı yüklemez */
    navigator.serviceWorker.getRegistrations().then(function (kayitlar) {
      kayitlar.forEach(function (k) {
        try {
          k.update().then(function () {
            /* Yeni worker hazır ve bekliyorsa: bir SONRAKİ açılışta devreye
               girer. Şimdi reload YAPMIYORUZ — splash tekrar etmesin. */
            if (k.waiting) { try { k.waiting.postMessage({ tip: "atla" }); } catch (e) {} }
          });
        } catch (e) {}
      });
    }).catch(function () {});

    /* Eski sürümden kalan takılmayı temizle (bir daha reload yapılmasın) */
    try { sessionStorage.removeItem("nurdis_kirici"); } catch (e) {}
  } catch (e) {}
})();
