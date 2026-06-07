const CACHE_NAME = 'eventify-cache-v2'
const ASSETS = ['/', '/index.html', '/manifest.webmanifest', '/favicon1.svg', '/icons/pwa-192x192.svg', '/icons/pwa-512x512.svg']

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key)
      }))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const requestUrl = new URL(event.request.url)
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request))
    return
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached
      return fetch(event.request)
        .then((res) => {
          return caches.open(CACHE_NAME).then((cache) => {
            try {
              cache.put(event.request, res.clone())
            } catch (e) {
              // ignore put errors for opaque responses
            }
            return res
          })
        })
        .catch(() => caches.match('/'))
    })
  )
})
