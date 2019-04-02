const version = "0.6.11";
const cacheName = `airhorner-${version}`;
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll([
        `/`,
        `/assets/js/amp/v0.js`,
        `/assets/js/amp/amp-accordion-0.1.js`,
        `/assets/js/amp/amp-animation-0.1.js`,
        `/assets/js/amp/amp-auto-ads-0.1.js`,
        `/assets/js/amp/amp-carousel-0.1.js`,
        `/assets/js/amp/amp-position-observer-0.1.js`,
        `/assets/js/amp/amp-sidebar-0.1.js`,
        `/assets/js/amp/amp-social-share-0.1.js`,
        `/assets/css/highlight.css`
      ]).then(() => self.skipWaiting());
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(cacheName)
      .then(cache => cache.match(event.request, {ignoreSearch: true}))
      .then(response => {
      return response || fetch(event.request);
    })
  );
});