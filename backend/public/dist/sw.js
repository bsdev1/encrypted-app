self.addEventListener('install', e => {

  e.waitUntil(self.skipWaiting());
});

self.addEventListener('message', ({ data }) => {
  // console.log(data);
});

self.addEventListener('activate', e => {

  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
  let request = event.request;
  if(event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') return;
  // console.log(request);
});