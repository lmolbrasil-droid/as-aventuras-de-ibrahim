const CACHE_NAME = 'ibrahim-v153-phase1-r5';
const CORE = [
  './index.html', './manifest-v143.webmanifest', './manifest.webmanifest',
  './scripts/phase1.css?v=5', './scripts/phase1-music.js?v=5', './scripts/phase1-sprites.js?v=5',
  './scripts/phase1-terrain.js?v=5', './scripts/phase1-world.js?v=5',
  './scripts/phase1-combat.js?v=5', './scripts/phase1-loot.js?v=5', './forest_bg.jpg',
  './assets/phase1-official.png', './assets/launch-hero.jpg',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-192-maskable.png',
  './icons/icon-512-maskable.png', './icons/ibrahim-icon-192-v143.png',
  './icons/ibrahim-icon-512-v143.png', './icons/ibrahim-maskable-512-v143.png',
  './assets/item-medicine.svg', './assets/item-cure.svg', './assets/item-net.svg',
  './assets/item-smoke.svg', './assets/item-sleep.svg', './assets/item-backpack.svg',
  './assets/walk-ibrahim.webp', './assets/walk-dog.webp', './assets/ibrahim_ready.png', './assets/companion_dog.png', './assets/ibrahim_idle.png',
  './assets/ibrahim_attack.png', './assets/ibrahim_defend.png', './assets/ibrahim_hurt.png',
  './assets/ibrahim_celebrate.png', './assets/ibrahim_victory.png',
  './assets/arborian/idle.webp', './assets/arborian/attack.webp', './assets/arborian/defend.webp',
  './assets/arborian/hurt.webp', './assets/arborian/defeated.webp', './assets/ogre-idle.webp', './assets/ogre-hurt.webp',
  './assets/ogre-attack.webp', './assets/ogre-defeated.webp',
  './assets/sfx_sword.wav', './assets/sfx_enemy.wav', './assets/sfx_shield.wav',
  './assets/sfx_skill.wav', './assets/sfx_win.wav'
];
const entry = new URL('./index.html', self.registration.scope).href;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE.map(path => new Request(path, {cache:'reload'})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('ibrahim-') && k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const {request} = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    if (request.mode === 'navigate') {
      try {
        const response = await fetch(request, {cache:'no-cache'});
        if (response.ok) return response;
      } catch {
        // An installed revision always has its own offline entry point.
      }
      return (await cache.match(request)) || (await cache.match(entry)) || Response.error();
    }
    return (await cache.match(request)) || fetch(request);
  })());
});
