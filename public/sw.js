const CACHE_NAME = 'recettes-magiques-v3-offline'; 
const STATIC_ASSETS = [
    '/',
    '/shopping-list',
    '/favorites',
    '/profile',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ne pas cacher les POST, webhooks, analytics
    if (request.method !== 'GET') return;

    // Cache strategy: Stale-While-Revalidate for images, scripts, CSS and all Next.js assets
    if (
        request.destination === 'image' || 
        request.destination === 'script' || 
        request.destination === 'style' ||
        url.pathname.startsWith('/_next/') ||
        url.hostname.includes('lesrec3ttesm4giques.fr')
    ) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(request).then((response) => {
                    const fetchPromise = fetch(request).then((networkResponse) => {
                        // On stocke en cache en arrière-plan
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    }).catch(() => response); // Fallback silencieux
                    
                    // Retourne le cache tout de suite si disponible, sinon attend le réseau
                    return response || fetchPromise;
                });
            })
        );
        return;
    }

    // Network-first avec Cache-fallback pour les pages HTML (navigation)
    if (request.mode === 'navigate' || request.destination === 'document') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Hors ligne ? On renvoie la version en cache
                    return caches.match(request).then(cachedRes => {
                        return cachedRes || caches.match('/');
                    });
                })
        );
        return;
    }

    // Default Cache-First for other things
    event.respondWith(
        caches.match(request).then((response) => {
            return response || fetch(request).catch(() => new Response("Offline"));
        })
    );
});
