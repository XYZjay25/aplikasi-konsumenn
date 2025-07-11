const CACHE_NAME = 'consumer-data-app-v2'; // Ubah nama cache untuk memicu pembaruan
const urlsToCache = [
  '/',
  'index.html',
  'manifest.json',
  'https://cdn.tailwindcss.com',
  // Tambahkan URL ikon placeholder agar di-cache untuk penggunaan offline
  'https://placehold.co/48x48/3b82f6/ffffff?text=DC',
  'https://placehold.co/72x72/3b82f6/ffffff?text=DC',
  'https://placehold.co/96x96/3b82f6/ffffff?text=DC',
  'https://placehold.co/144x144/3b82f6/ffffff?text=DC',
  'https://placehold.co/192x192/3b82f6/ffffff?text=DC',
  'https://placehold.co/512x512/3b82f6/ffffff?text=DC'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return networkResponse;
          })
          .catch(() => {
            console.log('Fetch failed, and no cache entry for:', event.request.url);
            return new Response('<h1>Offline</h1><p>Anda sedang offline.</p>', {
                headers: { 'Content-Type': 'text/html' }
            });
          });
      })
  );
});
