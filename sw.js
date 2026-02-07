

const CACHE_NAME = "calcha-mkt-v1-clean";

const FILES_TO_CACHE = [
  "/calcha-mkt/",
  "/calcha-mkt/index.html",
  "/calcha-mkt/style.css",
  "/calcha-mkt/app.js",
  "/calcha-mkt/manifest.json",
  "/calcha-mkt/Icon-192.png",
  "/calcha-mkt/Icon-512.png"
];


self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {

  // 🔥 JSON SIEMPRE DESDE LA RED
  if (e.request.url.endsWith(".json")) {
    e.respondWith(fetch(e.request));
    return;
  }

  // resto de los archivos: cache first
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
