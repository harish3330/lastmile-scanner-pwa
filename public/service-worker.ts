// Service Worker - App Shell Caching & Offline Support
/// <reference lib="webworker" />

const CACHE_VERSION = 'v1';
const CACHE_NAMES = {
  appShell: `app-shell-${CACHE_VERSION}`,
  api: `api-${CACHE_VERSION}`,
  assets: `assets-${CACHE_VERSION}`,
};

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
];

const API_ROUTES = ['/api'];

// Install Event - Cache app shell
self.addEventListener('install', (event: any) => {
  console.log('[Service Worker] Installing');
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAMES.appShell);
        await cache.addAll(STATIC_ASSETS);
        console.log('[Service Worker] App shell cached');
        // Force the waiting service worker to become the active service worker
        (self as any).skipWaiting();
      } catch (error) {
        console.error('[Service Worker] Install failed', error);
      }
    })()
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event: any) => {
  console.log('[Service Worker] Activating');
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => {
            if (!Object.values(CACHE_NAMES).includes(cacheName)) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
        // Claim all clients immediately
        await (self as any).clients.claim();
        console.log('[Service Worker] Activated');
      } catch (error) {
        console.error('[Service Worker] Activation failed', error);
      }
    })()
  );
});

// Fetch Event - Network-first for API, Cache-first for static assets
self.addEventListener('fetch', (event: any) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== (self as any).location.origin) {
    return;
  }

  // API Routes - Network-first with cache fallback
  if (url.pathname.startsWith('/api')) {
    event.respondWith(networkFirstStrategy(request, CACHE_NAMES.api));
  }
  // Static Assets - Cache-first with network fallback
  else {
    event.respondWith(cacheFirstStrategy(request, CACHE_NAMES.assets));
  }
});

// Network-first strategy: Try network, fall back to cache
async function networkFirstStrategy(
  request: Request,
  cacheName: string
): Promise<Response> {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Offline - No cached response available', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

// Cache-first strategy: Check cache first, fall back to network
async function cacheFirstStrategy(
  request: Request,
  cacheName: string
): Promise<Response> {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network failed, no cache available:', request.url);
    // Return offline fallback page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match('/offline.html');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

// Background Sync - Triggered when network returns
self.addEventListener('sync', (event: any) => {
  console.log('[Service Worker] Background Sync triggered:', event.tag);
  if (event.tag === 'sync-pending-events') {
    event.waitUntil(triggerSyncFromServiceWorker());
  }
});

// Message handling - Communicate with clients
self.addEventListener('message', (event: any) => {
  const { type, payload } = event.data;

  if (type === 'TRIGGER_SYNC') {
    event.waitUntil(triggerSyncFromServiceWorker());
  }

  if (type === 'SKIP_WAITING') {
    (self as any).skipWaiting();
  }
});

// Trigger sync from service worker
async function triggerSyncFromServiceWorker(): Promise<void> {
  try {
    console.log('[Service Worker] Triggering sync');
    const clients = await (self as any).clients.matchAll();
    clients.forEach((client: any) => {
      client.postMessage({
        type: 'SYNC_TRIGGERED',
        timestamp: Date.now(),
      });
    });
  } catch (error) {
    console.error('[Service Worker] Sync trigger failed', error);
  }
}
