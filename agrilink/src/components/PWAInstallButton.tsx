"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import InstallModal from "./InstallModal";

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsSupported(true);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);

    // Detect iOS (no beforeinstallprompt support) and show instruction instead
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    if (isIOS) setIsSupported(true);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener);
    };
  }, []);

  const handleInstallClick = async () => {
    trackEvent({ category: 'pwa', action: 'install_click' });
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        trackEvent({ category: 'pwa', action: 'install_accepted' });
        console.log('User accepted the PWA install');
      } else {
        trackEvent({ category: 'pwa', action: 'install_dismissed' });
        console.log('User dismissed the PWA install');
      }
      setDeferredPrompt(null);
      return;
    }

    // iOS or no prompt: show simple instructions
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    if (isIOS) {
      trackEvent({ category: 'pwa', action: 'install_ios_instruction' });
      setShowModal(true);
      return;
    }

    // fallback: open homepage (or show instructions)
    window.open('/', '_self');
  };

  if (!isSupported) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="ml-4 inline-flex items-center bg-white text-green-600 px-3 py-2 rounded-md font-medium hover:opacity-90"
        aria-label="Install AgriLink"
      >
        ⤓ Install App
      </button>
      <InstallModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
