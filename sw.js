// Pullmark: service worker. Bewaart de app in de browser, zodat hij ook zonder internet werkt (bijvoorbeeld op de set).
// Bij een nieuwe versie haalt hij alles opnieuw op en neemt hij het direct over; de open app herlaadt dan één keer.
const VERSION = '932f2fefb2';
const CACHE = 'frl-' + VERSION;
const ASSETS = ["./", "index.html", "manifest.webmanifest", "meetlabel-wcu4-ring.pdf", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/apple-touch-icon.png", "icons/favicon.svg"];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS.map((a) => new Request(a, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('frl-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // de app zelf: altijd uit de bewaarde versie, ook zonder internet
  const scope = new URL(self.registration.scope).pathname;
  if (req.mode === 'navigate' && (url.pathname === scope || url.pathname === scope + 'index.html')) {
    e.respondWith(caches.match('index.html').then((r) => r || fetch(req)));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((r) => r || fetch(req)));
});
