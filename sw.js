/* Optional helper for Holiday Quest. Only used when the app is served over https.
   Lets the Home Screen app open even with no internet. Data is NOT stored here —
   it stays in the page's localStorage. */
const CACHE = 'holiday-quest-v2'; // bump on every release so iPads fetch the new app
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html'])).catch(() => {}));
  self.skipWaiting();
});
const cleanOld = () => caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))));
self.addEventListener('activate', e => {
  e.waitUntil(cleanOld().then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      if (!res.ok) return caches.match(req, { ignoreSearch: true }).then(r => r || res);
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).then(cleanOld); return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
