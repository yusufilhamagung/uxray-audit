import type { AccessLevel } from '@/domain/value-objects/access-level';
import { clientEnv } from '@/infrastructure/env/client';
import { DEMO_ACCESS_STORAGE_KEY, normalizeAccessLevel } from '@/domain/access/demoAccess';

const STORAGE_KEY = 'uxray-access-level';

export const readAccessLevel = (): AccessLevel => {
  if (typeof window === 'undefined') return 'free';
  const storageKey = clientEnv.demoMode ? DEMO_ACCESS_STORAGE_KEY : STORAGE_KEY;
  const stored = window.localStorage.getItem(storageKey);
  const normalized = normalizeAccessLevel(stored);
  if (normalized) return normalized;
  if (stored) window.localStorage.removeItem(storageKey);
  return 'free';
};

export const writeAccessLevel = (level: AccessLevel) => {
  if (typeof window === 'undefined') return;
  const storageKey = clientEnv.demoMode ? DEMO_ACCESS_STORAGE_KEY : STORAGE_KEY;
  window.localStorage.setItem(storageKey, level);
};

export const clearAccessLevel = () => {
  if (typeof window === 'undefined') return;
  const storageKey = clientEnv.demoMode ? DEMO_ACCESS_STORAGE_KEY : STORAGE_KEY;
  window.localStorage.removeItem(storageKey);
};
