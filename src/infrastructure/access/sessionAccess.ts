const STORAGE_KEY = 'uxray-full-access-session';
const EVENT_NAME = 'uxray-full-access-session-changed';

const emitChange = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(EVENT_NAME));
};

export const setFullAccess = () => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(STORAGE_KEY, '1');
  emitChange();
};

export const clearFullAccess = () => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(STORAGE_KEY);
  emitChange();
};

export const hasFullAccess = () => {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(STORAGE_KEY) === '1';
};

export const subscribeFullAccess = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(EVENT_NAME, callback);
  return () => window.removeEventListener(EVENT_NAME, callback);
};
