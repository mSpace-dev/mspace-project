"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker from public root
      navigator.serviceWorker.register('/service-worker.js')
        .then((reg) => {
          console.log('Service worker registered:', reg);
        })
        .catch((err) => {
          console.warn('Service worker registration failed:', err);
        });
    }
  }, []);

  return null;
}
