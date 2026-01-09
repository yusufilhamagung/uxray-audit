const EARLY_ACCESS_KEY = 'uxray_early_access_joined';
const FULL_ACCESS_KEY = 'uxray_full_access';
const AUDIT_UNLOCK_PREFIX = 'uxray_audit_unlock_';
const ACCESS_STATE_KEY = 'uxray_access_state';

// AccessState model
export type AccessMode = 'free' | 'early_access';

export type AccessState = {
  mode: AccessMode;
  audit_unlock_id?: string;
  email?: string;
  early_access_remaining_attempts: number;
  early_access_used_attempts: number;
  updated_at: string;
};

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

// AccessState management functions
export const getAccessState = (): AccessState => {
  if (typeof window === 'undefined') {
    return {
      mode: 'free',
      early_access_remaining_attempts: 0,
      early_access_used_attempts: 0,
      updated_at: new Date().toISOString(),
    };
  }

  const stored = window.localStorage.getItem(ACCESS_STATE_KEY);
  if (!stored) {
    return {
      mode: 'free',
      early_access_remaining_attempts: 0,
      early_access_used_attempts: 0,
      updated_at: new Date().toISOString(),
    };
  }

  try {
    return JSON.parse(stored) as AccessState;
  } catch {
    return {
      mode: 'free',
      early_access_remaining_attempts: 0,
      early_access_used_attempts: 0,
      updated_at: new Date().toISOString(),
    };
  }
};

const saveAccessState = (state: AccessState) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ACCESS_STATE_KEY, JSON.stringify(state));
};

export const setEarlyAccessAccess = (email: string, auditUnlockId: string) => {
  const state: AccessState = {
    mode: 'early_access',
    audit_unlock_id: auditUnlockId,
    email,
    early_access_remaining_attempts: 2,
    early_access_used_attempts: 0,
    updated_at: new Date().toISOString(),
  };
  saveAccessState(state);
  setEarlyAccess(true);
};

export const decrementAttemptOnSuccess = (): AccessState => {
  const state = getAccessState();

  if (state.mode !== 'early_access' || state.early_access_remaining_attempts <= 0) {
    return state;
  }

  const updatedState: AccessState = {
    ...state,
    early_access_remaining_attempts: Math.max(0, state.early_access_remaining_attempts - 1),
    early_access_used_attempts: state.early_access_used_attempts + 1,
    updated_at: new Date().toISOString(),
  };

  // If attempts exhausted, reset to free mode
  if (updatedState.early_access_remaining_attempts === 0) {
    updatedState.mode = 'free';
    setEarlyAccess(false);
  }

  saveAccessState(updatedState);
  return updatedState;
};

export const resetToFreeIfExhausted = () => {
  const state = getAccessState();
  if (state.mode === 'early_access' && state.early_access_remaining_attempts === 0) {
    const freeState: AccessState = {
      ...state,
      mode: 'free',
      updated_at: new Date().toISOString(),
    };
    saveAccessState(freeState);
    setEarlyAccess(false);
  }
};
