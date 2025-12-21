const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 20;

type RateEntry = {
  count: number;
  resetAt: number;
};

const storeKey = '__uxaudit_rate_limit_store__';

function getStore(): Map<string, RateEntry> {
  const globalAny = globalThis as typeof globalThis & {
    [storeKey]?: Map<string, RateEntry>;
  };

  if (!globalAny[storeKey]) {
    globalAny[storeKey] = new Map();
  }

  return globalAny[storeKey] as Map<string, RateEntry>;
}

export function checkRateLimit(ip: string) {
  const store = getStore();
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || entry.resetAt <= now) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: now + WINDOW_MS };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  store.set(ip, entry);
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetAt: entry.resetAt };
}
