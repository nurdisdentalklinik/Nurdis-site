/* ERKEN ÇİZİM (v75)
   ══════════════════════════════════════════════════════════════════
   BEYAZ EKRAN SORUNUNUN KESİN ÇÖZÜMÜ
   ──────────────────────────────────────────────────────────────────
   SORUN: "Geç"e basınca beyaz ekran geliyor, aynı süre bekleniyor.

   KÖK NEDEN:
     • js/ekran.js  → render() fonksiyonunu TANIMLAR
     • js/firebase.js → SCREEN_MAP'i tanımlar ve render()'ı ÇAĞIRIR
     • firebase.js EN SON yüklenen dosyadır (type="module").

   Yani kullanıcı "Geç"e bastığında firebase.js henüz yüklenmemişse
   #screen boş kalıyor → BEYAZ EKRAN. Sonra firebase.js yüklenince
   ekran aniden doluyor ("aynı süre bekleyip açılıyor" hissi).

   ÇÖZÜM:
     Bu dosya tüm script'lerden SONRA yüklenir. Hemen bir kez çizim
     dener. Hazır değilse kısa aralıklarla tekrar dener ve hazır olur
     olmaz ekranı çizer — splash hâlâ açıkken bile.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var deneme = 0;

  function ciz() {
    deneme++;
    try {
      if (typeof render === "function" &&
          typeof SCREEN_MAP !== "undefined" && SCREEN_MAP) {
        render();
        return true;
      }
    } catch (e) {}
    return false;
  }

  function dene() {
    if (ciz()) return;
    if (deneme > 60) return;          /* ~9 sn sonra bırak (firebase.js halleder) */
    setTimeout(dene, 150);
  }

  /* Hemen dene */
  dene();

  /* Firebase hazır olunca da bir kez dene (admin/oturum durumu için) */
  window.addEventListener("fb-ready", function () {
    setTimeout(function () { ciz(); }, 60);
  });

  /* Sekme görünür olunca (iOS arka plandan dönüş) ekran boş kalmasın */
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState !== "visible") return;
    var el = document.getElementById("screen");
    if (el && (!el.innerHTML || el.innerHTML.length < 200)) ciz();
  });
})();
