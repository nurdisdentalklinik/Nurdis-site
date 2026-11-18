/* ÖNBELLEK KIRICI (v73)
   ESKİ YER: index.html içinde satır içi <script> bloğu olarak duruyordu.
   SORUN   : CSP 'script-src' direktifinde 'unsafe-inline' YOK. Tarayıcılar
             satır içi script'i ENGELLİYOR ("Refused to execute a script...").
             Yani bu kırıcı HİÇ ÇALIŞMIYORDU.
   ÇÖZÜM   : Ayrı dosyaya taşındı ('self' izinli). Artık gerçekten çalışıyor. */
/* ===== ÖNBELLEK KIRICI (v61) =====
   Eski service worker yüzünden kullanıcı eski index.html/js görüyorsa
   bu blok devreye girer: SW'yi günceller, gerekirse önbelleği atlayarak
   sayfayı bir kez tazeler. Çeviri/dil butonunun "ölü" kalmasını engeller. */
(function () {
  try {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.getRegistrations().then(function (kayitlar) {
      kayitlar.forEach(function (k) { try { k.update(); } catch (e) {} });
    });
    /* i18n.js gerçekten yüklendi mi? 2.5 sn içinde yüklenmediyse
       (eski önbellekteki HTML) önbelleği atlayan adresle tazele. */
    setTimeout(function () {
      if (typeof window.dilDegistir === "function") return;
      var zaten = sessionStorage.getItem("nurdis_kirici");
      if (zaten) return;                       /* sonsuz döngü koruması */
      sessionStorage.setItem("nurdis_kirici", "1");
      var u = location.origin + location.pathname + "?v=" + Date.now() + (location.hash || "#home");
      location.replace(u);
    }, 2500);
  } catch (e) {}
})();
