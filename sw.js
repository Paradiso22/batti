// sw.js — offline: precache dell'app, poi stale-while-revalidate.
// Le richieste Firestore (dati) non passano di qui: pensa a tutto la cache dell'SDK.
const CACHE = 'batti-v1';
const CORE = [
  './', './index.html', './style.css', './app.js', './logic.js', './db.js',
  './firebase-config.js', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png',
  './fonts/DSEG7Classic-Bold.woff2',
  './fonts/azeret-mono-latin-400-normal.woff2', './fonts/azeret-mono-latin-500-normal.woff2', './fonts/azeret-mono-latin-700-normal.woff2',
  './fonts/barlow-latin-400-normal.woff2', './fonts/barlow-latin-500-normal.woff2', './fonts/barlow-latin-600-normal.woff2', './fonts/barlow-latin-700-normal.woff2',
  './fonts/barlow-semi-condensed-latin-600-normal.woff2', './fonts/barlow-semi-condensed-latin-700-normal.woff2',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const mine = url.origin === location.origin;
  const sdk = url.hostname === 'www.gstatic.com';
  if (!mine && !sdk) return;
  const key = req.mode === 'navigate' ? './' : req;
  e.respondWith(
    caches.open(CACHE).then(async c => {
      const cached = await c.match(key);
      const fresh = fetch(req).then(res => {
        if (res.ok) c.put(key, res.clone());
        return res;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});
