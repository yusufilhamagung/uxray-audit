'use client';

import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { EarlyAccessSchema } from '@/shared/validation/early-access';
import { logClientEvent } from '@/lib/analytics/client';
import type { ApiResponse } from '@/lib/api/types';

type PricingPageClientProps = {
  source?: string;
  auditId?: string;
};

type EarlyAccessResponse = {
  status: 'created' | 'exists';
};

const emailOnlySchema = z.object({
  email: z.string().email()
});

export default function PricingPageClient({ source, auditId }: PricingPageClientProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'exists' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const validAuditId = useMemo(() => {
    if (!auditId) return undefined;
    return z.string().uuid().safeParse(auditId).success ? auditId : undefined;
  }, [auditId]);

  useEffect(() => {
    logClientEvent('early_access_viewed', { source, audit_id: validAuditId });
  }, [source, validAuditId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const emailParsed = emailOnlySchema.safeParse({ email });
    if (!emailParsed.success) {
      setStatus('error');
      setMessage('Email tidak valid. Pastikan formatnya benar.');
      return;
    }

    const payload = {
      email: emailParsed.data.email,
      source: source?.slice(0, 80),
      audit_id: validAuditId
    };

    const finalParsed = EarlyAccessSchema.safeParse(payload);
    if (!finalParsed.success) {
      setStatus('error');
      setMessage('Email tidak valid. Pastikan formatnya benar.');
      return;
    }

    setStatus('loading');
    logClientEvent('early_access_submitted', { source, audit_id: validAuditId });

    try {
      const response = await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalParsed.data)
      });

      const data = (await response.json()) as ApiResponse<EarlyAccessResponse>;

      if (!response.ok) {
        setStatus('error');
        setMessage(data?.message || 'Terjadi kesalahan saat menyimpan email.');
        return;
      }

      if (data.status === 'exists') {
        setStatus('exists');
        setMessage('Email kamu sudah terdaftar. Kami akan kabari segera.');
        logClientEvent('early_access_exists', { email: emailParsed.data.email });
        return;
      }

      setStatus('success');
      setMessage(data.message || 'Makasih! Kami akan infokan kalau early access sudah terbuka.');
      setEmail('');
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('Terjadi kesalahan saat menyimpan email.');
    }
  };

  return (
    <div className="card flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Early Access</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Kami akan kirim info saat early access dibuka.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-foreground">Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@email.com"
            className="mt-2 w-full rounded-2xl border border-input-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-subtle focus:border-ring focus:ring-2 focus:ring-ring/20"
            disabled={status === 'loading'}
            required
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Kami akan kirim info saat early access dibuka.
          </p>
        </div>

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Mengirim...' : 'Join Early Access'}
        </button>

        {message && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              status === 'error'
                ? 'border-status-error/30 bg-status-error/10 text-status-error'
                : 'border-status-success/30 bg-status-success/10 text-status-success'
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
