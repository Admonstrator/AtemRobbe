const CACHE_NAME = 'atemrobbe-cache-v1';
const urlsToCache = [
    './index.html',
    './css/styles.css',
    './js/scripts.js',
    './android-chrome-192x192.png',
    './android-chrome-512x512.png',
    './fonts/Anta-Regular.ttf',
    './fonts/Silkscreen-Regular.ttf',
    './fonts/SourceSansPro-Regular.ttf',
    './images/bg_90s.jpg',
    './images/bg_c64.jpg',
    './images/bg_default.jpg',
    './images/bg_ukraine.jpg',
    './images/bg_vaporwave.jpg',
    './sounds/end.mp3',
    './sounds/exhale.mp3',
    './sounds/inhale.mp3',
    './sounds/pause.mp3',
    './css/90s.css',
    './css/c64.css',
    './css/base.css',
    './css/ukraine.css',
    './css/vaporwave.css',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (!cacheWhitelist.includes(key)) {
                    return caches.delete(key);
                }
            }));
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
