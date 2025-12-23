import type { AnalyticsEvent } from './events';

export function logClientEvent(event: AnalyticsEvent, payload?: Record<string, unknown>) {
  if (payload) {
    console.info(`[event] ${event}`, payload);
    return;
  }
  console.info(`[event] ${event}`);
}
