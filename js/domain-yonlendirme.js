/* =====================================================================
   ANA DOMAINE YÖNLENDİRME (madde 1) · v66
   =====================================================================
   AMAÇ: nurdisdentalklinik.github.io (yedek/APK adresi) üzerinden gelen
   ziyaretçiyi ana adrese (nurdis.pages.dev) 301 mantığıyla taşımak —
   SEO'da iki ayrı site olarak görünmesin, tek adres güçlensin.

   NEDEN AYRI DOSYA?
   CSP 'script-src self' olduğu için index.html içine satır içi script
   yazılamıyor (tarayıcı engeller). Bu yüzden harici dosya.

   NEDEN github.io'da kalıcı yönlendirme YAPILABİLİR?
   Github Pages sunucu taraflı yönlendirme desteklemez; ancak arama
   motorları için canonical etiketi index.html'de zaten var. Buradaki
   yönlendirme kullanıcı deneyimi içindir (adres değişikliği hissi).

   ⚠️ APK UYUMLULUĞU: APK github.io'ya bağlı olduğu için yönlendirme
   KAPATILABİLİR olmalı. Adres çubuğunda ?kal=1 varsa yönlendirme
   yapılmaz (APK bunu kullanabilir). Ayrıca WebView içinde (APK)
   yönlendirme atlanır — uygulama içinde dışarı atmasın.
   ===================================================================== */
(function () {
  "use strict";

  var ANA_ADRES = "https://nurdis.pages.dev/";
  var YEDEK = "nurdisdentalklinik.github.io";

  /* Yalnızca yedek alan adında çalış */
  if (location.hostname.indexOf(YEDEK) === -1) return;

  /* APK / WebView içindeyse yönlendirme yapma */
  var webview = /wv\)/.test(navigator.userAgent) ||
                (window.Android && typeof window.Android !== "undefined") ||
                location.search.indexOf("kal=1") !== -1 ||
                location.search.indexOf("app=1") !== -1;
  if (webview) return;

  /* Yönlendirmeden önce bilgilendirme şeridi göster (ani zıplama olmasın) */
  var serit = document.createElement("div");
  serit.setAttribute("style",
    "position:fixed;left:0;right:0;bottom:0;z-index:100001;background:#0B6E86;color:#fff;" +
    "padding:12px 16px;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:13px;" +
    "display:flex;align-items:center;justify-content:space-between;gap:12px;" +
    "box-shadow:0 -4px 18px rgba(0,0,0,.22);");
  serit.innerHTML =
    '<span style="line-height:1.4;">Ana sitemize yönlendiriliyorsunuz…</span>' +
    '<a href="' + ANA_ADRES + '" style="flex-shrink:0;background:#fff;color:#0B6E86;' +
    'text-decoration:none;font-weight:800;padding:7px 14px;border-radius:9px;font-size:12px;">Git</a>';

  function baslat() {
    if (!document.body) return;
    document.body.appendChild(serit);
    setTimeout(function () {
      location.replace(ANA_ADRES);
    }, 1400);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", baslat);
  } else {
    baslat();
  }
})();
