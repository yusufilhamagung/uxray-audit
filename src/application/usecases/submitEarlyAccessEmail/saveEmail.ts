import { createHash } from 'node:crypto';
import fs from 'fs/promises';
import path from 'path';
import { getSupabaseServerClient } from '@/infrastructure/storage/supabase/server';
import { serverEnv } from '@/infrastructure/env/server';
import { logServerEvent } from '@/infrastructure/analytics/server';
import type { EarlyAccessPayload } from '@/domain/value-objects/early-access';

const LOCAL_EMAIL_PATH = path.join(process.cwd(), 'data', 'early-access.json');

const ensureLocalStore = async () => {
  const dir = path.dirname(LOCAL_EMAIL_PATH);
  await fs.mkdir(dir, { recursive: true });
};

const saveEmailLocal = async (payload: EarlyAccessPayload) => {
  await ensureLocalStore();
  const normalizedEmail = payload.email.trim().toLowerCase();
  let existing: Array<{
    email: string;
    source?: string | null;
    audit_id?: string | null;
    created_at: string;
  }> = [];

  try {
    const raw = await fs.readFile(LOCAL_EMAIL_PATH, 'utf-8');
    existing = JSON.parse(raw) as typeof existing;
  } catch {
    existing = [];
  }

  if (existing.some((entry) => entry.email === normalizedEmail)) {
    return { status: 'exists' as const };
  }

  existing.push({
    email: normalizedEmail,
    source: payload.source ?? null,
    audit_id: payload.audit_id ?? null,
    created_at: new Date().toISOString()
  });

  await fs.writeFile(LOCAL_EMAIL_PATH, JSON.stringify(existing, null, 2), 'utf-8');
  return { status: 'created' as const };
};

export const submitEarlyAccessEmail = async (
  payload: EarlyAccessPayload,
  meta?: { ip?: string | null; userAgent?: string | null }
) => {
  const normalizedEmail = payload.email.trim().toLowerCase();
  const userAgent = meta?.userAgent ?? null;
  const ipHash = meta?.ip ? createHash('sha256').update(meta.ip).digest('hex') : null;

  logServerEvent('email_submitted', {
    email: normalizedEmail,
    source: payload.source,
    audit_id: payload.audit_id
  });

  if (!serverEnv.isSupabaseConfigured) {
    return saveEmailLocal(payload);
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from('early_access_signups').insert({
    email: normalizedEmail,
    source: payload.source ?? null,
    audit_id: payload.audit_id ?? null,
    user_agent: userAgent,
    ip_hash: ipHash
  });

  if (error) {
    if (error.code === '23505') {
      return { status: 'exists' as const };
    }
    throw error;
  }

  return { status: 'created' as const };
};
