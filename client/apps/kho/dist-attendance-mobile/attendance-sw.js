const CACHE = "alumdoor-attendance-v1";
const SHELL = [
  "/mobile/attendance/",
  "/mobile/attendance/manifest.webmanifest",
  "/mobile/attendance/app-icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/method/")) return;

  if (request.mode === "navigate" && url.pathname.startsWith("/mobile/attendance")) {
    event.respondWith(fetch(request).catch(() => caches.match("/mobile/attendance/")));
    return;
  }

  if (url.pathname.startsWith("/mobile/attendance/")) {
    event.respondWith(caches.match(request).then((cached) => cached ?? fetch(request).then((response) => {
      if (response.ok) event.waitUntil(caches.open(CACHE).then((cache) => cache.put(request, response.clone())));
      return response;
    })));
  }
});
