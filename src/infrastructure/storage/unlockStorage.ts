const EARLY_ACCESS_KEY = 'uxray_early_access_joined';
const FULL_ACCESS_KEY = 'uxray_full_access';
const AUDIT_UNLOCK_PREFIX = 'uxray_audit_unlock_';

const readFlag = (key: string) => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(key) === 'true';
};

const writeFlag = (key: string, value: boolean) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, value ? 'true' : 'false');
};

export const hasEarlyAccess = () => readFlag(EARLY_ACCESS_KEY);
export const setEarlyAccess = (value: boolean) => writeFlag(EARLY_ACCESS_KEY, value);

export const hasFullAccess = () => readFlag(FULL_ACCESS_KEY);
export const setFullAccess = (value: boolean) => writeFlag(FULL_ACCESS_KEY, value);

export const getAuditUnlockId = (auditId: string) => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(`${AUDIT_UNLOCK_PREFIX}${auditId}`);
};

export const setAuditUnlockId = (auditId: string, unlockId: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(`${AUDIT_UNLOCK_PREFIX}${auditId}`, unlockId);
};
