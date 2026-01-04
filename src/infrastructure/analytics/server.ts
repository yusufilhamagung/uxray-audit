import type { AnalyticsEvent } from './events';

export function logServerEvent(event: AnalyticsEvent, payload?: Record<string, unknown>) {
  if (payload) {
    console.info(`[event] ${event}`, payload);
    return;
  }
  console.info(`[event] ${event}`);
}
