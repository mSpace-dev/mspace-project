export type AnalyticsEvent = {
  category: string;
  action: string;
  label?: string;
  value?: number;
};

export function trackEvent(event: AnalyticsEvent) {
  try {
    // If gtag is available, use it
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
      });
      return;
    }

    // Fallback: send to /api/telemetry if exists (fire-and-forget)
    const payload = {
      category: event.category,
      action: event.action,
      label: event.label,
      value: event.value,
      ts: Date.now(),
    };

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const url = '/api/telemetry';
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
      return;
    }

    // Final fallback: fetch (non-blocking)
    fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {
      // ignore errors
      // In dev, you may want to console.log
      // console.log('Telemetry fallback:', payload);
    });
  } catch (err) {
    // swallow errors to avoid blocking UI
    // console.warn('trackEvent error', err);
  }
}
