const CACHE_NAME = 'sadekh-btp-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo-sadekh.png',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first strategy for API, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests: network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static assets: cache first, fallback to network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && (request.url.includes('unsplash') || request.url.includes('sadekh'))) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});

// Background sync for offline actions (favorites, messages)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncPendingActions('favorites'));
  }
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncPendingActions('messages'));
  }
});

async function syncPendingActions(type: string) {
  // Read pending actions from IndexedDB and replay
  // Simplified: just trigger a refetch
  const clients = await self.clients.matchAll();
  clients.forEach((client) => client.postMessage({ type: 'SYNC_COMPLETE', actionType: type }));
}