'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { AccessLevel } from '@/shared/types/access';
import { getAccessLevel, setAccessLevel } from '@/application/usecases/accessLevel';

type AccessContextValue = {
  level: AccessLevel;
  setLevel: (level: AccessLevel) => void;
  isEarly: boolean;
  isFull: boolean;
};

const AccessContext = createContext<AccessContextValue | undefined>(undefined);

export function AccessProvider({ children }: { children: React.ReactNode }) {
  const [level, setLevelState] = useState<AccessLevel>('free');

  useEffect(() => {
    setLevelState(getAccessLevel());
  }, []);

  const setLevel = (next: AccessLevel) => {
    setLevelState(next);
    setAccessLevel(next);
  };

  const value = useMemo<AccessContextValue>(
    () => ({
      level,
      setLevel,
      isEarly: level === 'early',
      isFull: level === 'full'
    }),
    [level]
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
