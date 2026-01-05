'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { AccessLevel } from '@/shared/types/access';
import { getAccessLevel, setAccessLevel } from '@/application/usecases/accessLevel';
import {
  hasFullAccess,
  subscribeFullAccess
} from '@/infrastructure/access/sessionAccess';
import { clientEnv } from '@/infrastructure/env/client';

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
  const demoMode = clientEnv.demoMode;

  useEffect(() => {
    setLevelState(getAccessLevel());
  }, []);

  useEffect(() => {
    if (demoMode) return;
    const syncSession = () => setSessionFull(hasFullAccess());
    syncSession();
    return subscribeFullAccess(syncSession);
  }, [demoMode]);

  const setLevel = (next: AccessLevel) => {
    setLevelState(next);
    setAccessLevel(next);
  };

  const effectiveLevel: AccessLevel = demoMode ? level : sessionFull ? 'full' : level;

  const value = useMemo<AccessContextValue>(
    () => ({
      level: effectiveLevel,
      setLevel,
      isEarly: effectiveLevel === 'early_access',
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
