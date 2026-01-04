import type { AccessLevel } from '@/domain/value-objects/access-level';
import { readAccessLevel, writeAccessLevel } from '@/infrastructure/storage/accessStorage';

export const getAccessLevel = () => readAccessLevel();

export const setAccessLevel = (level: AccessLevel) => {
  writeAccessLevel(level);
};
