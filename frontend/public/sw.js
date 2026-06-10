const CACHE_NAME = 'eventify-cache-v3'
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/favicon.png', '/icons/pwa-192x192.png', '/icons/pwa-512x512.png']

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const requestUrl = new URL(request.url)

  // Cache Storage only supports HTTP(S). Ignore extension and other browser-owned requests.
  if (request.method !== 'GET' || requestUrl.origin !== self.location.origin) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html')),
    )
    return
  }

  event.respondWith(
    caches.match(request).then(async (cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      const networkResponse = await fetch(request)

      if (networkResponse.ok) {
        try {
          const cache = await caches.open(CACHE_NAME)
          await cache.put(request, networkResponse.clone())
        } catch {
          // A cache failure must not prevent the requested resource from loading.
        }
      }

      return networkResponse
    }),
  )
})
