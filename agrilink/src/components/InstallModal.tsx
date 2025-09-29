"use client";

import { useEffect } from "react";

export default function InstallModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Install AgriLink</h3>
        <p className="text-sm text-gray-700 mb-4">On iOS (Safari) you can add AgriLink to your Home Screen so it behaves like an app.</p>
        <ol className="list-decimal list-inside text-sm text-gray-700 mb-4 space-y-2">
          <li>Open this site in Safari.</li>
          <li>Tap the Share button (square with an arrow).</li>
          <li>Choose "Add to Home Screen" and confirm.</li>
        </ol>
        <div className="flex justify-end">
          <button onClick={onClose} className="bg-green-600 text-white px-4 py-2 rounded-md">Done</button>
        </div>
      </div>
    </div>
  );
}
