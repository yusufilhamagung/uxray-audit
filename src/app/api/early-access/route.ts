import { createHash } from 'node:crypto';
import { checkRateLimit } from '@/shared/utils/rate-limit';
import { EarlyAccessSchema } from '@/shared/validation/early-access';
import { jsonResponse } from '@/lib/api/response';
import { getRequestIp, getRequestUserAgent } from '@/lib/api/request';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { serverEnv } from '@/lib/env/server';
import { logServerEvent } from '@/lib/analytics/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const ip = getRequestIp();
  const rate = checkRateLimit(ip);

  if (!rate.allowed) {
    return jsonResponse(
      {
        status: 'error',
        message: 'Terlalu banyak permintaan. Coba lagi setelah 1 jam.'
      },
      { status: 429 }
    );
  }

  if (!serverEnv.isSupabaseConfigured) {
    return jsonResponse(
      { status: 'error', message: 'Supabase belum dikonfigurasi.' },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = EarlyAccessSchema.safeParse(body);

  if (!parsed.success) {
    return jsonResponse(
      { status: 'error', message: 'Email tidak valid.' },
      { status: 400 }
    );
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();
  const userAgent = getRequestUserAgent() ?? null;
  const ipHash = ip ? createHash('sha256').update(ip).digest('hex') : null;

  logServerEvent('early_access_submitted', {
    email: normalizedEmail,
    source: parsed.data.source,
    audit_id: parsed.data.audit_id
  });

  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from('early_access_signups').insert({
      email: normalizedEmail,
      source: parsed.data.source ?? null,
      audit_id: parsed.data.audit_id ?? null,
      user_agent: userAgent,
      ip_hash: ipHash
    });

    if (error) {
      if (error.code === '23505') {
        logServerEvent('early_access_exists', {
          email: normalizedEmail,
          source: parsed.data.source,
          audit_id: parsed.data.audit_id
        });
        return jsonResponse(
          {
            status: 'exists',
            message: 'Email ini sudah terdaftar di early access.',
            data: { status: 'exists' }
          },
          { status: 200 }
        );
      }
      throw error;
    }

    return jsonResponse(
      {
        status: 'created',
        message: 'Makasih! Kami akan infokan kalau early access sudah terbuka.',
        data: { status: 'created' }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Early access signup failed:', error);
    return jsonResponse(
      { status: 'error', message: 'Terjadi kesalahan saat menyimpan email.' },
      { status: 500 }
    );
  }
}
