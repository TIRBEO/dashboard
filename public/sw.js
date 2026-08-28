// ─── Tirbeo Service Worker with Offline Support ───

const CACHE_NAME = 'tirbeo-v1';
const STATIC_CACHE = 'tirbeo-static-v1';
const API_CACHE = 'tirbeo-api-v1';
const IMAGE_CACHE = 'tirbeo-images-v1';

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/dashboard/forms',
  '/dashboard/notifications',
  '/dashboard/settings/profile',
  '/dashboard/settings/security',
  '/dashboard/settings/privacy',
  '/dashboard/settings/preferences',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// API routes that can be cached
const CACHEABLE_API_ROUTES = [
  '/api/users/me',
  '/api/users/preferences',
  '/api/notifications',
  '/api/notifications/prefs',
  '/api/forms',
  '/api/security/events',
  '/api/security/sessions',
  '/api/online-users',
];

// API routes that should not be cached (mutations)
const NON_CACHEABLE_ROUTES = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/logout',
  '/api/auth/refresh',
  '/api/security/password',
  '/api/security/totp',
  '/api/support/tickets',
];

// Cache duration in milliseconds
const CACHE_DURATIONS = {
  STATIC: 7 * 24 * 60 * 60 * 1000, // 7 days
  API_SHORT: 5 * 60 * 1000,         // 5 minutes
  API_MEDIUM: 30 * 60 * 1000,       // 30 minutes
  API_LONG: 60 * 60 * 1000,         // 1 hour
  IMAGE: 30 * 24 * 60 * 60 * 1000,  // 30 days
};

// ─── Install Event ───
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.error('[SW] Failed to cache some static assets:', err);
        });
      }),
      // Skip waiting to activate immediately
      self.skipWaiting(),
    ])
  );
});

// ─── Activate Event ───
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== API_CACHE && name !== IMAGE_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      }),
      // Claim all clients
      self.clients.claim(),
    ])
  );
});

// ─── Fetch Event ───
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Bypass cross-origin requests (API on https://api.tirbeo.app, Discord CDN, Umami, etc.)
  // Let the browser handle them directly so CORS works; don't let SW intercept and reject.
  if (url.origin !== self.location.origin) {
    return;
  }

  // Skip non-GET requests for caching (but handle POST for sync)
  if (request.method !== 'GET' && request.method !== 'POST') {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Handle images
  if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Default: network first, fallback to cache
  event.respondWith(networkFirst(request));
});

// ─── API Request Handler ───
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Don't cache mutation requests
  if (request.method !== 'GET') {
    return networkFirst(request);
  }

  // Don't cache non-cacheable routes
  if (NON_CACHEABLE_ROUTES.some(route => pathname.startsWith(route))) {
    return networkFirst(request);
  }

  // Check if this is a cacheable route
  const isCacheable = CACHEABLE_API_ROUTES.some(route => pathname.startsWith(route));
  
  if (isCacheable) {
    return cacheFirstWithNetworkFallback(request, API_CACHE, getCacheDuration(pathname));
  }

  // Default: network first
  return networkFirst(request);
}

// ─── Static Asset Handler ───
async function handleStaticRequest(request) {
  return cacheFirstWithNetworkFallback(request, STATIC_CACHE, CACHE_DURATIONS.STATIC);
}

// ─── Image Request Handler ───
async function handleImageRequest(request) {
  return cacheFirstWithNetworkFallback(request, IMAGE_CACHE, CACHE_DURATIONS.IMAGE);
}

// ─── Navigation Request Handler ───
async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return cached page or offline page
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    const offlineResponse = await caches.match('/offline.html');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Fallback to basic offline page
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Offline - Tirbeo</title>
          <style>
            body { font-family: system-ui; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #0a0a0a; color: #fff; }
            .container { text-align: center; padding: 2rem; }
            h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
            p { color: #888; margin-bottom: 1.5rem; }
            button { background: #fff; color: #000; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 500; }
            button:hover { background: #e5e5e5; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>You're offline</h1>
            <p>Please check your internet connection and try again.</p>
            <button onclick="window.location.reload()">Try again</button>
          </div>
        </body>
      </html>`,
      {
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
}

// ─── Caching Strategies ───

// Cache first, network fallback
async function cacheFirstWithNetworkFallback(request, cacheName, ttl) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Check if cache is still valid
    const cachedDate = cachedResponse.headers.get('sw-cache-date');
    if (cachedDate) {
      const age = Date.now() - new Date(cachedDate).getTime();
      if (age < ttl) {
        return cachedResponse;
      }
    }
    // Cache expired, try network
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      const responseToCache = response.clone();
      // Add cache date header
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-date', new Date().toISOString());
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers,
      });
      cache.put(request, modifiedResponse);
    }
    return response;
  } catch (error) {
    // Network failed, return cached if available
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Network first, cache fallback
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// ─── Helper Functions ───

function isStaticAsset(pathname) {
  const extensions = ['.js', '.css', '.json', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
  return extensions.some(ext => pathname.endsWith(ext));
}

function isImageRequest(request) {
  return request.destination === 'image' || 
         request.headers.get('accept')?.includes('image/') ||
         /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(new URL(request.url).pathname);
}

function getCacheDuration(pathname) {
  if (pathname.includes('/users/me') || pathname.includes('/preferences')) {
    return CACHE_DURATIONS.API_MEDIUM;
  }
  if (pathname.includes('/notifications')) {
    return CACHE_DURATIONS.API_SHORT;
  }
  if (pathname.includes('/forms')) {
    return CACHE_DURATIONS.API_MEDIUM;
  }
  return CACHE_DURATIONS.API_SHORT;
}

// ─── Push Notification Events ───

// Push event
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  if (!event.data) return;
  
  let data;
  try {
    data = event.data.json();
  } catch {
    data = {
      title: 'Tirbeo',
      body: event.data.text(),
    };
  }
  
  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/icons/notification.png',
    badge: data.badge || '/icons/badge.png',
    tag: data.tag || 'tirbeo-notification',
    data: {
      url: data.url || '/dashboard/notifications',
      ...data.data,
    },
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    vibrate: [100, 50, 100],
    timestamp: data.timestamp || Date.now(),
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Tirbeo', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'dismiss') return;
  
  const urlToOpen = event.notification.data?.url || '/dashboard/notifications';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there's already a window open
      for (const client of windowClients) {
        if (client.url.includes('tirbeo') && 'focus' in client) {
          client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }
      
      // Open new window if none found
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event);
});

// Push subscription change event
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] Push subscription changed:', event);
  
  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription.options).then((subscription) => {
      return fetch('/api/notifications/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });
    })
  );
});

// ─── Message Handler ───
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urlsToCache = event.data.urls || [];
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(urlsToCache);
    });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => caches.delete(name))
      );
    });
  }
});
