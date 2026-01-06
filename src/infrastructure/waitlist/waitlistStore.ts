import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { randomUUID } from 'node:crypto';

export type WaitlistEntry = {
  email: string;
  audit_id: string;
  unlock_id: string;
  created_at: string;
};

const STORE_PATH = path.join(os.tmpdir(), 'uxray-waitlist.json');
let memoryCache: WaitlistEntry[] | null = null;

const loadStore = async () => {
  if (memoryCache) return memoryCache;
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as WaitlistEntry[];
    memoryCache = parsed;
    return parsed;
  } catch {
    memoryCache = [];
    return memoryCache;
  }
};

const saveStore = async (entries: WaitlistEntry[]) => {
  memoryCache = entries;
  try {
    await fs.writeFile(STORE_PATH, JSON.stringify(entries, null, 2), 'utf-8');
  } catch {
    // Keep in memory if /tmp is unavailable.
  }
};

export const saveWaitlistEntry = async (params: { email: string; auditId: string }) => {
  const entries = await loadStore();
  const normalizedEmail = params.email.trim().toLowerCase();
  const existing = entries.find(
    (entry) => entry.email === normalizedEmail && entry.audit_id === params.auditId
  );

  if (existing) {
    return { status: 'exists' as const, unlockId: existing.unlock_id };
  }

  const unlockId = randomUUID();
  const record: WaitlistEntry = {
    email: normalizedEmail,
    audit_id: params.auditId,
    unlock_id: unlockId,
    created_at: new Date().toISOString()
  };

  entries.unshift(record);
  await saveStore(entries);
  return { status: 'created' as const, unlockId };
};

export const verifyUnlock = async (params: { auditId: string; unlockId: string }) => {
  const entries = await loadStore();
  return entries.some(
    (entry) => entry.audit_id === params.auditId && entry.unlock_id === params.unlockId
  );
};
