import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import type { FreeAuditResult, PageType } from '@/domain/types/uxray';

export type StoredAudit = {
  id: string;
  created_at: string;
  page_type: PageType;
  optional_context?: string;
  image_url: string;
  image_type: string;
  image_path?: string;
  free_result: FreeAuditResult;
  model_used: string;
  latency_ms: number;
};

const STORE_PATH = path.join(os.tmpdir(), 'uxray-audits.json');
let memoryCache: StoredAudit[] | null = null;

const loadStore = async () => {
  if (memoryCache) return memoryCache;
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as StoredAudit[];
    memoryCache = parsed;
    return parsed;
  } catch {
    memoryCache = [];
    return memoryCache;
  }
};

const saveStore = async (entries: StoredAudit[]) => {
  memoryCache = entries;
  try {
    await fs.writeFile(STORE_PATH, JSON.stringify(entries, null, 2), 'utf-8');
  } catch {
    // Fallback to memory only if /tmp is unavailable.
  }
};

export const saveAuditRecord = async (record: StoredAudit) => {
  const entries = await loadStore();
  entries.unshift(record);
  await saveStore(entries);
  return record;
};

export const findAuditById = async (id: string) => {
  const entries = await loadStore();
  return entries.find((entry) => entry.id === id) ?? null;
};
