import type { AccessLevel } from '@/domain/value-objects/access-level';
import { isAccessLevel } from '@/domain/value-objects/access-level';

export const DEMO_ACCESS_STORAGE_KEY = 'uxray_demo_access';

export const normalizeAccessLevel = (value: string | null): AccessLevel | null => {
  if (!value) return null;
  if (value === 'early') return 'early_access';
  if (isAccessLevel(value)) return value;
  return null;
};
