// self.addEventListener('install', event => {
//   console.log('Service worker install event!');
//   event.waitUntil(
//     // caches.open(cacheName)
//     //   .then(cache => {
//     //     return cache.addAll(resourcesToPrecache);
//     //   })
//     (async () => {
//       const cache = await caches.open(cacheName);
//       console.log("[Service Worker] Caching all: app shell and content");
//       await cache.addAll(resourcesToPrecache);
//     })()
//   );
// })

// self.addEventListener('activate', event => {
//   console.log('Activate event!');
// })

// self.addEventListener('fetch', e => {
//   if(/packet\?plain/.test(`${e.request.url}`)) {
//     // console.log('Fetch intercepted for:', e.request.url);
//     // console.log('This fetch is for app only use');
//   } else {
//     console.log('Fetch intercepted for:', e.request.url);
//     e.respondWith(
//       (async () => {
//         const r = await caches.match(e.request);
//         console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
//         if (r) {
//           return r;
//         }
//         const response = await fetch(e.request);
//         const cache = await caches.open(cacheName);
//         console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
//         cache.put(e.request, response.clone());
//         return response;
//       })()
//     );
//   }
// });

// const cacheName = 'cache-v1';
// const resourcesToPrecache = [
//   './',
//   './index.html',
//   './boundle.js',
//   './icon-akpa.png',
// ];
