/* Sürüm numarasını HER değişiklikte artır — eski önbellek otomatik silinir. */
const CACHE_VERSION = "v45";
const CACHE_NAME = "nurdis-" + CACHE_VERSION;
const ASSETS = [
  "./index.html", "./manifest.json",
  "./urunler/c1.jpg", "./urunler/c2.jpg", "./urunler/y1.jpg", "./urunler/y2.jpg", "./urunler/y3.jpg",
  "./urunler/y4.jpg", "./urunler/y5.jpg", "./urunler/y6.jpg", "./urunler/y7.jpg", "./urunler/y8.jpg", "./icon-192.png", "./icon-512.png",
  "./js/core.js", "./js/guvenlik.js", "./js/splash.js", "./js/bilgi.js", "./js/muhasebe.js", "./js/stok.js", "./js/crm.js", "./js/randevu.js",
  "./js/anket.js", "./js/prim.js", "./js/mali.js", "./js/ekran.js", "./js/kargo.js", "./js/hesap.js", "./js/iade.js", "./js/magaza-ek.js", "./js/hesap-sil.js", "./js/medya.js", "./js/doktorlar.js", "./js/magaza.js", "./js/senkron.js", "./js/portal.js", "./js/otomasyon.js", "./js/kvkk.js", "./js/yedek.js", "./js/firebase.js",
  "./doctor-photo.jpg", "./clinic-hero.jpg", "./whitening-before-after.jpg",
  "./treatment-process.jpg", "./info-toothache.jpg",
  "./screenshot-1-home.png", "./screenshot-2-services.png", "./screenshot-3-booking.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .catch((err) => console.error("Önbellekleme hatası:", err))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => {
        // Tüm açık sekmelere "yeni sürüm yüklendi" mesajı gönder.
        return self.clients.matchAll({ type: "window" }).then((clients) => {
          clients.forEach((client) => client.postMessage({ type: "NURDIS_UPDATED", version: CACHE_VERSION }));
        });
      })
  );
});

/* ÖNEMLİ: index.html ve app.js için ÖNCE AĞ, olmazsa önbellek (network-first).
   Önceki sürümde önbellek önce kontrol ediliyordu; bu da güncelleme
   yayınlansa bile kullanıcıların hep eski app.js'i görmesine, bazen de
   yarım/bozuk bir karışıma (index.html yeni, app.js eski gibi) yol açıp
   "uygulama düzgün yüklenemedi" hatasına neden oluyordu. */
const NETWORK_FIRST = ["index.html", "app.js", "firebase-init.js", "manifest.json"];

/* js/ klasöründeki tüm parçalar da network-first olmalı:
   biri güncellenip diğeri önbellekten gelirse sürüm karışır. */
function isJsPart(path) {
  return path.indexOf("/js/") !== -1 || path.endsWith("/js") ;
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isNetworkFirst = NETWORK_FIRST.some((f) => url.pathname.endsWith(f)) || url.pathname === "/" || url.pathname.endsWith("/Nurdis-site/");

  if (isNetworkFirst) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Görseller ve diğer statik dosyalar: önce önbellek, sonra ağ (hızlı açılış).
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
