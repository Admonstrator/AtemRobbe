/**
 * AtemRobbe - Service Worker
 * Handles offline caching and app updates
 * Version: 1.0.0
 */

const CACHE_NAME = 'atemrobbe-cache-v23';
const APP_SHELL = [
  './index.html',
  './css/styles.css',
  './css/base.css',
  './js/script.js'
];

const ASSETS = [
  './android-chrome-192x192.png',
  './android-chrome-512x512.png',
  './apple-touch-icon.png',
  './favicon-16x16.png',
  './favicon-32x32.png',
  './favicon.ico',
  './safari-pinned-tab.svg',
  './manifest.json'
];

const FONTS = [
  './fonts/Anta-Regular.ttf',
  './fonts/Silkscreen-Regular.ttf',
  './fonts/SourceCodePro-Regular.ttf'
];

const IMAGES = [
  './images/bg_90s.webp',
  './images/bg_c64.webp',
  './images/bg_default.webp',
  './images/bg_ukraine.webp',
  './images/bg_vaporwave.webp',
  './images/bg_feenstaub.webp',
  './images/bg_gothic.webp'
];

const SOUNDS = [
  './sounds/end.mp3',
  './sounds/exhale.mp3',
  './sounds/inhale.mp3',
  './sounds/pause.mp3'
];

const THEMES = [
  './css/90s.css',
  './css/c64.css',
  './css/ukraine.css',
  './css/vaporwave.css',
  './css/feenstaub.css',
  './css/gothic.css',
];

// Combined resources to cache
const urlsToCache = [
  ...APP_SHELL,
  ...ASSETS,
  ...FONTS,
  ...IMAGES,
  ...SOUNDS,
  ...THEMES
];

/**
 * Install event - cache app shell resources
 */
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell and assets');
        
        // Improved caching strategy with error handling and logging
        return Promise.all(
          urlsToCache.map(url => {
            return fetch(url, { credentials: 'same-origin' })
              .then(response => {
                if (!response.ok) {
                  throw new Error(`Failed to fetch ${url}, status: ${response.status}`);
                }
                return cache.put(url, response);
              })
              .catch(error => {
                console.error(`[Service Worker] Failed to cache: ${url}`, error);
              });
          })
        )
        .then(() => console.log('[Service Worker] Initial caching complete'));
      })
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating');
  
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys()
      .then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (!cacheWhitelist.includes(key)) {
              console.log('[Service Worker] Removing old cache:', key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients');
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - serve from cache first, then network
 */
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if available
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response to cache it and return it
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              })
              .catch(err => {
                console.error('[Service Worker] Error caching new resource:', err);
              });
              
            return response;
          })
          .catch(error => {
            console.error('[Service Worker] Fetch failed:', error);
            
            // For HTML documents (navigation), return the cached index page as fallback
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
            
            // Otherwise just propagate the error
            throw error;
          });
      })
  );
});

/**
 * Push event - handle notifications
 */
self.addEventListener('push', event => {
  if (!(self.Notification && self.Notification.permission === 'granted')) {
    return;
  }
  
  const data = event.data?.json() ?? {
    title: 'AtemRobbe',
    message: 'Zeit für eine Atemübung!',
    icon: './android-chrome-192x192.png'
  };
  
  const options = {
    body: data.message,
    icon: data.icon,
    badge: './favicon-32x32.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/**
 * Notification click event - handle notification interaction
 */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({type: 'window'})
      .then(clientList => {
        // If a window client is already open, focus it
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});