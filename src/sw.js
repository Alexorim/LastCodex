const CACHE_NAME = 'lastresources-v1.3.0';

const PRECACHE_URLS = [
  './',
  './index.html',
  './assets/manifest.webmanifest',
  './assets/icon/last_codex.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET requests
  if (req.method !== 'GET') return;

  // Don't intercept live playorna.com requests
  if (url.origin.includes('playorna.com')) {
    return;
  }

  // Navigation requests (HTML pages) -> Network first, fallback to cached index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkResp) => {
          if (networkResp.status === 200) {
            const copy = networkResp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return networkResp;
        })
        .catch(() => {
          return caches.match('./index.html')
            .then((cached) => cached || caches.match('/index.html') || caches.match('./'));
        })
    );
    return;
  }

  // Static assets (JS, CSS, images, JSON, fonts) -> Cache first, fallback to network
  event.respondWith(
    caches.match(req).then((cachedResp) => {
      if (cachedResp) {
        // Fetch in background to update cache for next time
        fetch(req).then((netResp) => {
          if (netResp && netResp.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(req, netResp));
          }
        }).catch(() => {});
        return cachedResp;
      }

      return fetch(req).then((networkResp) => {
        if (networkResp && networkResp.status === 200) {
          const copy = networkResp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return networkResp;
      }).catch((err) => {
        // If offline and request is an image, or failed
        return cachedResp || Promise.reject(err);
      });
    })
  );
});
