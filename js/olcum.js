/* =====================================================================
   ÖLÇÜM — Google Analytics 4 + dönüşüm takibi (madde 16)
   =====================================================================
   NEDEN GEREKLİ?
   Reklam verirken "kaç kişi randevu formunu gönderdi" bilinmiyorsa
   para yakılır. Tek hedef belirlendi: RANDEVU FORMU GÖNDERİMİ.

   TASARIM KARARI — KVKK UYUMLU:
   Google Analytics varsayılan olarak çerez kullanır. KVKK kapsamında
   zorunlu olmayan çerezler için AÇIK RIZA gerekir. Bu yüzden:
     • GA yalnızca kullanıcı "Kabul et" derse yüklenir
     • Reddederse hiçbir ölçüm betiği indirilmez (site normal çalışır)
     • Tercih localStorage'da tutulur, 12 ay sonra yeniden sorulur
     • IP anonimleştirme açık (GA4'te varsayılan)

   KURULUM: GA4 ölçüm kimliğini aşağıya yazın (G-XXXXXXXXXX).
   Boşsa hiçbir şey yüklenmez — site etkilenmez.
   ===================================================================== */
(function () {
  "use strict";

  var GA_ID = "";                     /* ← GA4 ölçüm kimliği (G-...) */
  var RIZA_ANAHTAR = "nurdis_cerez_rizasi";
  var RIZA_SURESI = 365 * 24 * 60 * 60 * 1000;   /* 12 ay */

  function rizaOku() {
    try {
      var v = JSON.parse(localStorage.getItem(RIZA_ANAHTAR) || "null");
      if (!v || !v.zaman) return null;
      if (Date.now() - v.zaman > RIZA_SURESI) return null;   /* süresi doldu */
      return v;
    } catch (e) { return null; }
  }

  function rizaYaz(kabul) {
    try {
      localStorage.setItem(RIZA_ANAHTAR, JSON.stringify({ kabul: !!kabul, zaman: Date.now() }));
    } catch (e) {}
  }

  /* ---- GA4 yükle ---- */
  function gaYukle() {
    if (!GA_ID) return;                 /* kimlik yoksa hiç yükleme */
    if (window.__gaYuklendi) return;
    window.__gaYuklendi = true;

    var sc = document.createElement("script");
    sc.async = true;
    sc.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(sc);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, {
      anonymize_ip: true,
      send_page_view: true
    });
  }

  /* ---- Dönüşüm olayları ---- */
  function olay(ad, parametreler) {
    try {
      if (typeof window.gtag === "function") {
        window.gtag("event", ad, parametreler || {});
      }
    } catch (e) {}
  }

  /* Randevu formu gönderildiğinde çağrılır (ekran.js) */
  window.randevuDonusum = function (bilgi) {
    olay("randevu_talebi", {
      islem: (bilgi && bilgi.service) || "Muayene",
      misafir: !!(bilgi && bilgi.misafir),
      value: 1
    });
  };
  /* Ara / WhatsApp tıklamaları */
  window.iletisimDonusum = function (tur) { olay("iletisim_tiklama", { tur: tur }); };

  /* Telefon ve WhatsApp tıklamalarını otomatik yakala */
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (href.indexOf("tel:") === 0) olay("telefon_tiklama", { konum: location.pathname });
    else if (href.indexOf("wa.me") !== -1) olay("whatsapp_tiklama", { konum: location.pathname });
  }, true);

  /* ---- Rıza şeridi ---- */
  function seritGoster() {
    if (document.getElementById("cerez-serit")) return;
    var d = document.createElement("div");
    d.id = "cerez-serit";
    d.setAttribute("style",
      "position:fixed;left:0;right:0;bottom:0;z-index:100002;background:#0B2E3A;color:#fff;" +
      "padding:14px 16px;font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:12.5px;" +
      "line-height:1.55;box-shadow:0 -3px 18px rgba(0,0,0,.3);display:flex;flex-direction:column;gap:9px;");
    d.innerHTML =
      '<span>Ziyaret istatistikleri için çerez kullanmak istiyoruz. ' +
      'Rızanız olmadan hiçbir ölçüm betiği yüklenmez. ' +
      '<a href="/#kvkk" style="color:#7FD4EA;">KVKK</a></span>' +
      '<div style="display:flex;gap:8px;">' +
      '<button id="cerez-kabul" style="flex:1;background:#0E8FA8;color:#fff;border:none;' +
      'border-radius:9px;padding:11px;font-family:inherit;font-size:12.5px;font-weight:800;cursor:pointer;">Kabul Et</button>' +
      '<button id="cerez-red" style="flex:1;background:rgba(255,255,255,.14);color:#fff;border:none;' +
      'border-radius:9px;padding:11px;font-family:inherit;font-size:12.5px;font-weight:700;cursor:pointer;">Sadece Gerekli</button>' +
      '</div>';
    document.body.appendChild(d);

    document.getElementById("cerez-kabul").addEventListener("click", function () {
      rizaYaz(true); d.remove(); gaYukle();
    });
    document.getElementById("cerez-red").addEventListener("click", function () {
      rizaYaz(false); d.remove();
    });
  }

  function baslat() {
    var riza = rizaOku();
    if (riza === null) {
      /* Henüz karar vermemiş: 2 sn sonra sor (açılışı bloklamasın) */
      setTimeout(seritGoster, 2000);
    } else if (riza.kabul) {
      gaYukle();
    }
    /* riza.kabul === false ise hiçbir şey yapma */
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", baslat);
  } else {
    baslat();
  }

  /* Test/yönetici için: window.__gaDurum() */
  window.__gaDurum = function () {
    return { gaId: GA_ID, yuklendi: !!window.__gaYuklendi, riza: rizaOku() };
  };
})();
