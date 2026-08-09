// sw.js - offline: precache dell'app, poi stale-while-revalidate.
// Le richieste Firestore (dati) non passano di qui: pensa a tutto la cache dell'SDK.
const CACHE = 'batti-v1';
const STATO = 'batti-stato'; // stato dei promemoria, scritto dalla pagina e letto qui
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
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== STATO).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
/* ---------- promemoria a telefono fermo (dove il browser lo permette) ---------- */
const MESSAGGI = [
  'Tre giorni senza spese. O avete vissuto d\'amore, o qualcuno ha perso lo scontrino.',
  'Il salvadanaio chiede notizie: sono giorni che non battete niente.',
  'Neanche un caffè in tre giorni? Il POS non ci crede.',
  'Allerta "poi me lo ricordo": non te lo ricorderai. Batti la spesa.',
  'Lo scontrino si annoia. Dategli qualcosa da stampare.',
  'Chi ha pagato l\'ultima volta? Se dovete pensarci, è ora di registrare.',
  'I conti in sospeso sono come i piatti nel lavandino: prima li fate, meglio è.',
  'Le coppie che dividono le spese litigano meno. Fonte: questa app.',
  'Tre giorni di silenzio contabile. Tutto bene lì fuori?',
  'Il terminale è acceso e vi aspetta. Non lasciatelo lì da solo.',
];

async function controllaPromemoria() {
  const c = await caches.open(STATO);
  const r = await c.match('./stato-promemoria');
  if (!r) return;
  const { ultimaSpesa, attivi, soglia = 3 } = await r.json();
  if (!attivi || !ultimaSpesa) return;
  if (Math.floor((Date.now() - ultimaSpesa) / 86400000) < soglia) return;

  const oggi = new Date().toISOString().slice(0, 10); // al massimo un avviso al giorno
  const ultimo = await c.match('./ultimo-avviso');
  if (ultimo && (await ultimo.text()) === oggi) return;
  await c.put('./ultimo-avviso', new Response(oggi));

  await self.registration.showNotification('Batti', {
    body: MESSAGGI[Math.floor(Math.random() * MESSAGGI.length)],
    icon: './icons/icon-192.png', badge: './icons/icon-192.png',
    tag: 'promemoria-spese', lang: 'it',
  });
}

self.addEventListener('periodicsync', e => {
  if (e.tag === 'promemoria-spese') e.waitUntil(controllaPromemoria());
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil((async () => {
    const aperte = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const gia = aperte.find(w => w.url.includes(self.registration.scope));
    if (gia) return gia.focus();
    return self.clients.openWindow('./');
  })());
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
      // no-store: la revalidation salta la cache HTTP del browser, così un deploy arriva al 2° avvio
      const fresh = fetch(req, { cache: 'no-store' }).then(res => {
        if (res.ok) c.put(key, res.clone());
        return res;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});
