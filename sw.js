/* Service worker: PuzzleBee funziona anche senza rete (es. in aereo).
   Prima la copia salvata sul dispositivo, poi aggiornamento in background quando c'è rete. */
const CACHE = 'puzzlebee-v3';
const FILES = [
  './', 'index.html', 'css/style.css', 'manifest.webmanifest',
  'js/core.js', 'js/app.js',
  'js/puzzles/sequenze.js', 'js/puzzles/memory.js', 'js/puzzles/sudoku.js', 'js/puzzles/labirinto.js',
  'js/puzzles/tessere.js', 'js/puzzles/numeri-amici.js', 'js/puzzles/intruso.js', 'js/puzzles/parole.js',
  'js/puzzles/calcoli.js', 'js/puzzles/tabelline.js', 'js/puzzles/negozio.js', 'js/puzzles/orologio.js', 'js/puzzles/in-fila.js', 'js/puzzles/sillabe.js', 'js/puzzles/ortografia.js', 'js/puzzles/articoli.js',
  'js/puzzles/forme.js', 'js/puzzles/simmetria.js', 'js/puzzles/coordinate.js', 'js/puzzles/programma.js', 'js/puzzles/frutti.js', 'js/puzzles/torre.js', 'js/puzzles/ombre.js',
  'icons/icon.svg', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const key = req.mode === 'navigate' ? './' : req;
      const cached = await cache.match(key, { ignoreSearch: true });
      const network = fetch(req)
        .then((res) => {
          // Salva anche il font di Google (risposta "opaca") per averlo offline.
          if (res && (res.ok || res.type === 'opaque')) cache.put(key, res.clone());
          return res;
        })
        .catch(() => null);
      if (cached) {
        e.waitUntil(network);
        return cached;
      }
      const res = await network;
      return res || new Response('Offline', { status: 503, statusText: 'Offline' });
    })
  );
});
