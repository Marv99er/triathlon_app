const CACHE_NAME = 'trilog-v8';
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
const PRECACHE_URLS = [
  './',
  'index.html',
  'manifest.json',
  'css/styles.css',
  'js/app.js',
  'js/db.js',
  'js/utils.js',
  'js/icons.js',
  'js/ui.js',
  'js/tcx.js',
  'js/intervals.js',
  'js/dashboard.js',
  'js/log.js',
  'js/strength.js',
  'js/competitions.js',
  'js/plan.js',
  'js/settings.js',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  // Schriften ändern sich nie: einmal laden, dann offline aus dem Cache
  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
        if (response && (response.ok || response.type === 'opaque')) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }))
    );
    return;
  }
  // Fremde Adressen (z. B. intervals.icu-API) nie zwischenspeichern, sonst erscheinen alte Daten.
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
