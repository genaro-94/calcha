const VERSION = "v1";
const CACHE_NAME = `calcha-cache-${VERSION}`;

const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./Icon-192.png",
  "./Icon-512.png"
];

// INSTALL
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// ACTIVATE
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

// FETCH
self.addEventListener("fetch", e => {
  const url = e.request.url;

  // JSON siempre de red
  if (url.endsWith(".json")) {
    e.respondWith(fetch(e.request));
    return;
  }

  // App shell: cache first
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
