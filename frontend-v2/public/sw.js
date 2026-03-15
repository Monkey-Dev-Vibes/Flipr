// IMPORTANT: Bump this version string whenever you change this file
// or cached assets. Failure to bump = users get stale content.
const CACHE_NAME = "flipr-v2-proto2";
const OFFLINE_URL = "/offline";

// Assets to cache on install
const PRECACHE_ASSETS = ["/", "/offline"];

// Paths that should NEVER be cached (live data, API responses)
const NO_CACHE_PATTERNS = ["/api/", "/markets/", "/trade/", "/auth/", "/onboarding/grant", "/ws/"];

// Static asset extensions worth caching
const STATIC_EXTENSIONS = /\.(js|css|woff2?|png|jpg|svg|ico|webp)$/;

function shouldCache(url) {
  const path = new URL(url).pathname;
  if (NO_CACHE_PATTERNS.some((pattern) => path.includes(pattern))) return false;
  return true;
}

function isStaticAsset(url) {
  return STATIC_EXTENSIONS.test(new URL(url).pathname);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  // Static assets: cache-first
  if (isStaticAsset(event.request.url)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Navigation & dynamic: network-first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && shouldCache(event.request.url)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }
          return new Response("Offline", { status: 503 });
        });
      })
  );
});
