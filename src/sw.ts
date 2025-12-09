/// <reference lib="webworker" />

import { precacheAndRoute } from "workbox-precaching";

// @ts-ignore - injected by workbox during build
precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener("message", (event: any) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Claim clients on activate so the new service worker starts controlling pages immediately
self.addEventListener("activate", (event: any) => {
  event.waitUntil((self as any).clients.claim());
});
