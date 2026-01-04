'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { AccessLevel } from '@/shared/types/access';
import { getAccessLevel, setAccessLevel } from '@/application/usecases/accessLevel';
import {
  hasFullAccess,
  subscribeFullAccess
} from '@/infrastructure/access/sessionAccess';

type AccessContextValue = {
  level: AccessLevel;
  setLevel: (level: AccessLevel) => void;
  isEarly: boolean;
  isFull: boolean;
};

const AccessContext = createContext<AccessContextValue | undefined>(undefined);

export function AccessProvider({ children }: { children: React.ReactNode }) {
  const [level, setLevelState] = useState<AccessLevel>('free');
  const [sessionFull, setSessionFull] = useState(false);

  useEffect(() => {
    setLevelState(getAccessLevel());
  }, []);

  useEffect(() => {
    const syncSession = () => setSessionFull(hasFullAccess());
    syncSession();
    return subscribeFullAccess(syncSession);
  }, []);

  const setLevel = (next: AccessLevel) => {
    setLevelState(next);
    setAccessLevel(next);
  };

  const effectiveLevel: AccessLevel = sessionFull ? 'full' : level;

  const value = useMemo<AccessContextValue>(
    () => ({
      level: effectiveLevel,
      setLevel,
      isEarly: effectiveLevel === 'early',
      isFull: effectiveLevel === 'full'
    }),
    [effectiveLevel]
  );

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccess() {
  const ctx = useContext(AccessContext);
  if (!ctx) {
    throw new Error('useAccess must be used within AccessProvider');
  }
  return ctx;
}
