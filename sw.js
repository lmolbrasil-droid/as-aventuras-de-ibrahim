const REVISION = 11;
const CACHE_NAME = 'ibrahim-v159-phase1-r11';
const LEGACY_R6 = 'ibrahim-v154-phase1-r6';
const CORE = [
  './progresso-local.html', './assets/corte-relampago-r9.wav', './manifest-v143.webmanifest', './manifest.webmanifest',
  './scripts/phase1.css?v=11', './scripts/phase1-music.js?v=11', './scripts/phase1-sprites.js?v=11',
  './scripts/phase1-terrain.js?v=11', './scripts/phase1-world.js?v=11',
  './scripts/phase1-combat.js?v=11', './scripts/phase1-loot.js?v=11', './forest_bg.jpg',
  './assets/phase1-official.png', './assets/launch-hero.jpg',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-192-maskable.png',
  './icons/icon-512-maskable.png', './icons/ibrahim-icon-192-v143.png',
  './icons/ibrahim-icon-512-v143.png', './icons/ibrahim-maskable-512-v143.png',
  './assets/item-medicine.svg', './assets/item-cure.svg',
  './assets/forest-treasure.svg', './assets/item-smoke.svg', './assets/item-sleep.svg', './assets/item-backpack.svg',
  './assets/walk-ibrahim-r10.webp?v=11', './assets/walk-dog-r9.webp?v=11',
  './assets/dupla-rostos.webp', './assets/arena-ogro-r8.webp', './assets/arena-arborian-r8.webp', './assets/combat-commands.svg', './assets/ibrahim_ready.png', './assets/companion_dog.png', './assets/ibrahim_idle.png',
  './assets/ibrahim_attack.png', './assets/ibrahim_defend.png', './assets/ibrahim_hurt.png',
  './assets/ibrahim_celebrate.png', './assets/ibrahim_victory.png',
  './assets/ogre-r8/idle.webp', './assets/ogre-r8/hurt.webp',
  './assets/ogre-r8/attack.webp', './assets/ogre-r8/fallen.webp',
  './assets/poses-r8-aprovadas/arborian/attack.webp',
  './assets/poses-r8-aprovadas/arborian/defeated.webp',
  './assets/poses-r8-aprovadas/arborian/defend.webp',
  './assets/poses-r8-aprovadas/arborian/hurt.webp',
  './assets/poses-r8-aprovadas/arborian/idle.webp',
  './assets/poses-r8-aprovadas/dog/attack.webp',
  './assets/poses-r8-aprovadas/dog/defeated.webp',
  './assets/poses-r8-aprovadas/dog/defend.webp',
  './assets/poses-r8-aprovadas/dog/hurt.webp',
  './assets/poses-r8-aprovadas/dog/idle.webp',
  './assets/poses-r8-aprovadas/dog/ready.webp',
  './assets/poses-r8-aprovadas/dog/recover.webp',
  './assets/poses-r8-aprovadas/dog/victory.webp',
  './assets/poses-r13-ibrahim/attack.webp',
  './assets/poses-r10-ibrahim/defeated.webp',
  './assets/poses-r13-ibrahim/defend.webp',
  './assets/poses-r13-ibrahim/double-attack.webp',
  './assets/poses-r13-ibrahim/double-ready.webp',
  './assets/poses-r13-ibrahim/hurt.webp',
  './assets/poses-r13-ibrahim/idle.webp',
  './assets/poses-r13-ibrahim/ready.webp',
  './assets/poses-r13-ibrahim/recover.webp',
  './assets/poses-r13-ibrahim/victory.webp', './assets/ibrahim-vitoria-ogro-r7.png',
  './assets/sfx_sword.wav', './assets/sfx_enemy.wav', './assets/sfx_shield.wav',
  './assets/sfx_skill.wav', './assets/sfx_win.wav'
];
const INTEGRITY = {
  './scripts/phase1.css?v=11': 'sha384-CrhqhNPjMXCMxwBybJdCiPVG4z3IFLfaA/ua9WTsmK97CSo3Lzjxdm1ttVoXdbo1',
  './scripts/phase1-music.js?v=11': 'sha384-w8cmsKNQyYc6UsZtbdLR9p6p3DDoTicdTg8mH4Xm8WYcWMg/TX3Ek3fj7vxC481J',
  './scripts/phase1-sprites.js?v=11': 'sha384-ioSz1nNEP6I112RvNFQz5Mf7HYK4lViDhvwb8kAUG9J6MO8U5UYs+3S3KZMqxyRt',
  './scripts/phase1-terrain.js?v=11': 'sha384-g4gJTOJRO2vdQqTf7W3drU4FfxsStmNYHjKuG4FTxDK4Rgpaa9H5R7h0jT9plW0k',
  './scripts/phase1-world.js?v=11': 'sha384-k1Axq3UcU+TIPi1iXAVrdTNBWSX0QWeaanEWoocX52NgqQ92Pi/G/2jx6UPY0hiE',
  './scripts/phase1-combat.js?v=11': 'sha384-X0IfNocNTE9g9KmaRze26MXLkO46nDr7aIKqSGiYcUhUjnLZ6UeGXgk5UbEXu3AC',
  './scripts/phase1-loot.js?v=11': 'sha384-IMr8MIK6docj9PP5U3cYhCEjXsd0C18OK1bj/WG6afZOMKdZ07eSfgTeNij9M0R0',
  './assets/walk-ibrahim-r10.webp?v=11': 'sha384-tG9f/AMGF2TOZPaSn8XL+ihlPCR8HCnCwP/bQvMtH4kCDuQXPt8z8W8dmJp8fBJG',
  './assets/walk-dog-r9.webp?v=11': 'sha384-CgxuWQIw6wGvG+lZ7R76WwqJyi+N5n7KaochCKudt6VEo76Ib7wAG7kpcV/iEmNp',
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
