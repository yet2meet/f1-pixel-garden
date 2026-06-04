const CACHE_NAME = "f1-pixel-pwa-v22";

const drivers = ["verstappen", "leclerc", "hamilton", "norris", "piastri", "russell", "antonelli", "alonso"];
const expressions = ["neutral", "tap", "anticipate", "eat", "satisfied", "celebrate", "tired", "depleted"];

const driverPortraits = drivers.flatMap((driver) =>
  expressions.map((expression, index) => {
    const serial = String(index + 1).padStart(2, "0");
    return `./portraits/${driver}_${serial}_${expression}.png`;
  })
);

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  ...driverPortraits,
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
