self.addEventListener('install', e => {

  e.waitUntil(self.skipWaiting());
});

self.addEventListener('install', e => {

  e.waitUntil(self.clients.claim());
});