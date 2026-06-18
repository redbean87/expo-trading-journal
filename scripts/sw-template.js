import {
  cleanupOutdatedCaches,
  clientsClaim,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import {
  NavigationRoute,
  registerRoute,
  setCatchHandler,
} from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

const offlineHandler = createHandlerBoundToURL('/offline.html');

registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: 'navigation',
      plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
    }),
    {
      denylist: [
        /^\/_expo/,
        /^\/assets/,
        /^\/icons/,
        /^\/manifest\.json$/,
        /^\/favicon\.ico$/,
        /^\/sw\.js$/,
        /^\/workbox-.*\.js$/,
      ],
    }
  )
);

setCatchHandler(async ({ request, event }) => {
  if (request.mode === 'navigate') {
    return offlineHandler({ request, event });
  }
  return Response.error();
});

registerRoute(
  /^\/_expo\/static\/.*\.(?:js|css)$/,
  new CacheFirst({
    cacheName: 'expo-static-assets',
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 31536000 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

registerRoute(
  /^\/assets\/.*\.(?:png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|ico)$/,
  new CacheFirst({
    cacheName: 'app-assets',
    plugins: [
      new ExpirationPlugin({ maxEntries: 300, maxAgeSeconds: 31536000 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

registerRoute(
  /^\/(?:manifest\.json|favicon\.ico|icons\/.*)$/,
  new CacheFirst({
    cacheName: 'pwa-assets',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 31536000 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);
