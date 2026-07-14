const CACHE_NAME = "nurdis-v2";
const ASSETS = [
  "./index.html", "./app.js", "./manifest.json", "./icon-192.png", "./icon-512.png",
  "./assets/doctor-photo.jpg", "./assets/clinic-hero.jpg", "./assets/whitening-before-after.jpg",
  "./assets/treatment-process.jpg", "./assets/info-toothache.jpg",
  "./screenshot-1-home.png", "./screenshot-2-services.png", "./screenshot-3-booking.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
