import type { AccessLevel } from '@/domain/value-objects/access-level';
import { isAccessLevel } from '@/domain/value-objects/access-level';

const STORAGE_KEY = 'uxray-access-level';

export const readAccessLevel = (): AccessLevel => {
  if (typeof window === 'undefined') return 'free';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (isAccessLevel(stored)) return stored;
  if (stored) window.localStorage.removeItem(STORAGE_KEY);
  return 'free';
};

export const writeAccessLevel = (level: AccessLevel) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, level);
};

export const clearAccessLevel = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
};
