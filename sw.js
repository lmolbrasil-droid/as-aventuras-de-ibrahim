const REVISION = 7;
const CACHE_NAME = 'ibrahim-v155-phase1-r7';
const LEGACY_R6 = 'ibrahim-v154-phase1-r6';
const CORE = [
  './manifest-v143.webmanifest', './manifest.webmanifest',
  './scripts/phase1.css?v=7', './scripts/phase1-music.js?v=7', './scripts/phase1-sprites.js?v=7',
  './scripts/phase1-terrain.js?v=7', './scripts/phase1-world.js?v=7',
  './scripts/phase1-combat.js?v=7', './scripts/phase1-loot.js?v=7', './forest_bg.jpg',
  './assets/phase1-official.png', './assets/launch-hero.jpg',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-192-maskable.png',
  './icons/icon-512-maskable.png', './icons/ibrahim-icon-192-v143.png',
  './icons/ibrahim-icon-512-v143.png', './icons/ibrahim-maskable-512-v143.png',
  './assets/item-medicine.svg', './assets/item-cure.svg', './assets/item-net.svg',
  './assets/forest-treasure.svg', './assets/item-smoke.svg', './assets/item-sleep.svg', './assets/item-backpack.svg',
  './assets/forest-rig.webp?v=7', './assets/combat-commands.svg', './assets/ibrahim_ready.png', './assets/companion_dog.png', './assets/ibrahim_idle.png',
  './assets/ibrahim_attack.png', './assets/ibrahim_defend.png', './assets/ibrahim_hurt.png',
  './assets/ibrahim_celebrate.png', './assets/ibrahim_victory.png',
  './assets/arborian/idle.webp', './assets/arborian/attack.webp', './assets/arborian/defend.webp',
  './assets/arborian/hurt.webp', './assets/arborian/defeated.webp', './assets/ogre-idle.webp', './assets/ogre-hurt.webp',
  './assets/ogre-attack.webp', './assets/ogre-fallen.webp',
  './assets/sfx_sword.wav', './assets/sfx_enemy.wav', './assets/sfx_shield.wav',
  './assets/sfx_skill.wav', './assets/sfx_win.wav'
];
const INTEGRITY = {
  './scripts/phase1.css?v=7': 'sha384-ab+wm6CF9iRa/i50Zv+g6R44nXhyLF0Ze65LbmIi23YVtRtNCIzvuIy2ElZzOyPD',
  './scripts/phase1-music.js?v=7': 'sha384-bT+aTWUnpKRehmHZKqbaz/9rVamMUpxrHu02IwNJsOsHROWQQEwWcYuLd8KJMGtP',
  './scripts/phase1-sprites.js?v=7': 'sha384-NCY+feYqCB9yt3f99JaIZLGSyaRK1m6LQ9326AxCU3bFDuvgasA1gCTfmhibsVBG',
  './scripts/phase1-terrain.js?v=7': 'sha384-exT3csKNiKE+Bbc+gn3i2+VLiG4k860JAvVk1eBfz4S3cEtYRLEiuluiC+hfjVtH',
  './scripts/phase1-world.js?v=7': 'sha384-9u1L7tCeg36K9IqX8+kKbzXV8Bn1EPNRND0R6A3/bgG4mnRSSt6FJXxgtRTdqDxn',
  './scripts/phase1-combat.js?v=7': 'sha384-c2u0F60KwW6G2y2BTRpH7dYNlkc+FCUXiq8Lc2xJ06ZtqW7kRR+3fFbLX4RtSAUZ',
  './scripts/phase1-loot.js?v=7': 'sha384-AxfcSU7a0W6ZQ+Jcxg4SVdAJxICFRAoUmCEot9hv4/555YluoAFDhiIC0t+3TptW',
  './assets/forest-rig.webp?v=7': 'sha384-E1l+rYj0XollDwxG5QWAlrIWKey+FrACcIcf2mO2U7c4nfWwf/WLO2r+yzAss0E1',
};
const entry = new URL('./index.html', self.registration.scope).href;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const existing = await caches.keys();
    const newerSnapshots = existing.filter(key => /^ibrahim-v\d+-phase1-r(?:[7-9]|\d{2,})$/.test(key));
    const cachedEntries = await Promise.all(newerSnapshots.map(async key => (await caches.open(key)).match(entry)));
    const legacyClient = self.registration.active && existing.includes(LEGACY_R6) && !cachedEntries.some(Boolean);
    const response = await fetch(new Request(entry + '?revision=' + REVISION, {cache:'no-store'}));
    const html = response.ok ? await response.clone().text() : '';
    if (!html.includes('name="ibrahim-revision" content="' + REVISION + '"')) {
      throw new Error('O HTML e o service worker pertencem a revisões diferentes.');
    }
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE.map(path => new Request(path, {cache:'reload', integrity:INTEGRITY[path]||''})));
    await cache.put(entry, response);

    // Migration from R6: its page only detects a new controller, not a
    // waiting worker. Promote this update without reloading those clients.
    if (legacyClient) await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await self.clients.claim();
    const clients = await self.clients.matchAll({type:'window'});
    for (const client of clients) client.postMessage({type:'ibrahim-revision',revision:REVISION});
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'ibrahim-revision') {
    event.source?.postMessage({type:'ibrahim-revision',revision:REVISION});
  }
  if (event.data?.type === 'ibrahim-activate') {
    event.waitUntil(self.skipWaiting());
  }
});

self.addEventListener('fetch', event => {
  const {request} = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  const scope = new URL(self.registration.scope).pathname;
  const isEntry = url.pathname === scope || url.pathname === scope + 'index.html';
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    if (request.mode === 'navigate' && isEntry) {
      // HTML and its versioned dependencies come from one installed snapshot.
      return (await cache.match(entry)) || Response.error();
    }
    const hit = await cache.match(request);
    if (hit) return hit;
    if (url.searchParams.has('v')) {
      for (const key of await caches.keys()) {
        if (key === CACHE_NAME || !/^ibrahim-v\d+-phase1-r\d+$/.test(key)) continue;
        const version = key.split('-r').at(-1);
        if (version !== url.searchParams.get('v')) continue;
        const prior = await (await caches.open(key)).match(request);
        if (prior) return prior;
      }
      // Never serve a current file at an old revision URL.
      if (url.searchParams.get('v') !== String(REVISION)) return Response.error();
    }
    return fetch(request);
  })());
});
