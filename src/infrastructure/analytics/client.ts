import type { AnalyticsEvent } from './events';

export function logClientEvent(event: AnalyticsEvent, payload?: Record<string, unknown>) {
  if (payload) {
    console.info(`[event] ${event}`, payload);
  } else {
    console.info(`[event] ${event}`);
  }

  if (typeof window === 'undefined') return;

  fetch('/api/analytics/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventName: event, payload })
  }).catch(() => {
    // Ignore analytics errors.
  });
}
