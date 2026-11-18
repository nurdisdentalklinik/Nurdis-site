/* =====================================================================
   TEK SİTE POLİTİKASI — nurdisdentalklinik.github.io
   =====================================================================
   KULLANICI KARARI (18 Kasım 2026):
   Tek site github.io'da kalacak. pages.dev kopyası KALDIRILDI.

   Profil:
     - Sadece nurdis.pages.dev alanında çalışır (eski yedek adres)
     - github.io KANONİK adres — orada hiçbir yönlendirme yapılmaz
     - APK github.io'ya bağlı olduğu için uygulama etkilenmez
     - ?kal=1 / ?app=1 / WebView'da tamamen devre dışı

   ⚠️ Eski sürüm TERSİNİ yapıyordu (github.io → pages.dev).
      Kullanıcı tek site github.io dediği için yön ters çevrildi.
   ===================================================================== */
(function () {
  "use strict";

  var HEDEF = "https://nurdisdentalklinik.github.io/Nurdis-site/";

  /* Sadece ESKİ pages.dev alanında çalış */
  if (location.hostname !== "nurdis.pages.dev") return;

  /* Uygulama içi kullanımda devre dışı */
  if (new URLSearchParams(location.search).has("kal")) return;
  if (new URLSearchParams(location.search).has("app")) return;
  if (navigator.standalone === true) return;
  if (/wv|WebView/i.test(navigator.userAgent)) return;
  if (document.referrer.indexOf("android-app://") === 0) return;

  /* Yol ve hash'i koru */
  var hedef = HEDEF + location.hash;

  /* Kısa bilgi şeridi, sonra geç */
  var d = document.createElement("div");
  d.setAttribute("style",
    "position:fixed;inset:0;z-index:2147483647;background:#0B2E3A;color:#fff;" +
    "display:flex;flex-direction:column;align-items:center;justify-content:center;" +
    "gap:14px;font-family:'Plus Jakarta Sans',system-ui,sans-serif;text-align:center;padding:24px;");
  d.innerHTML =
    '<div style="font-size:34px;">\uD83E\uDDB7</div>' +
    '<div style="font-size:16px;font-weight:800;letter-spacing:.3px;">Nur Diş &amp; Dental Klinik</div>' +
    '<div style="font-size:12.5px;opacity:.8;max-width:280px;line-height:1.6;">' +
    'Yeni adresimize yönlendiriliyorsunuz…</div>' +
    '<a href="' + hedef + '" style="margin-top:6px;background:#0E8FA8;color:#fff;' +
    'text-decoration:none;padding:11px 22px;border-radius:11px;font-size:13px;font-weight:800;">' +
    'Hemen git \u2192</a>';
  document.body.appendChild(d);

  setTimeout(function () { location.replace(hedef); }, 1400);
})();
