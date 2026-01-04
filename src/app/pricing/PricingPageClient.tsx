'use client';

import { useMemo, useState } from 'react';
import { z } from 'zod';
import { EarlyAccessSchema } from '@/shared/types/early-access';
import { logClientEvent } from '@/infrastructure/analytics/client';
import type { ApiResponse } from '@/shared/types/api';
import { EARLY_ACCESS_COPY } from '@config/copy';
import { useAccess } from '@/presentation/providers/AccessProvider';

type PricingPageClientProps = {
  source?: string;
  auditId?: string;
  demoEnabled?: boolean;
};

type EarlyAccessResponse = {
  status: 'created' | 'exists';
};

const emailOnlySchema = z.object({
  email: z.string().email()
});

export default function PricingPageClient({ source, auditId, demoEnabled }: PricingPageClientProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { level, setLevel } = useAccess();

  const validAuditId = useMemo(() => {
    if (!auditId) return undefined;
    return z.string().uuid().safeParse(auditId).success ? auditId : undefined;
  }, [auditId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const emailParsed = emailOnlySchema.safeParse({ email });
    if (!emailParsed.success) {
      setStatus('error');
      setErrorMessage('Email tidak valid. Pastikan formatnya benar.');
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
      setErrorMessage('Email tidak valid. Pastikan formatnya benar.');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalParsed.data)
      });

      const data = (await response.json()) as ApiResponse<EarlyAccessResponse>;

      if (!response.ok) {
        setStatus('error');
        setErrorMessage(data?.message || 'Terjadi kesalahan saat menyimpan email.');
        return;
      }

      setStatus('success');
      setEmail('');
      setErrorMessage(null);
      logClientEvent('email_submitted', { audit_id: validAuditId, source });
      setLevel('early');
    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMessage('Terjadi kesalahan saat menyimpan email.');
    }
  };

  return (
    <div className="card flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Early Access</h2>
        <p className="mt-2 text-sm text-muted-foreground">{EARLY_ACCESS_COPY.headline}</p>
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
          <p className="mt-2 text-xs text-muted-foreground">{EARLY_ACCESS_COPY.emailHelper}</p>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={status === 'loading'}>
          {status === 'loading' ? 'Mengirim...' : EARLY_ACCESS_COPY.cta}
        </button>

        {status === 'error' && errorMessage && (
          <div className="rounded-2xl border border-status-error/30 bg-status-error/10 px-4 py-3 text-sm text-status-error">
            {errorMessage}
          </div>
        )}
      </form>

      {status === 'success' && (
        <div className="space-y-4 rounded-2xl border border-status-success/30 bg-status-success/10 px-4 py-3 text-sm text-status-success">
          <p className="font-semibold text-foreground">{EARLY_ACCESS_COPY.confirmation}</p>
          <p className="text-muted-foreground">{EARLY_ACCESS_COPY.clarification}</p>
          <button
            type="button"
            className="btn-secondary w-full"
            disabled
            title="Upgrade required to run a new audit"
          >
            Run Another Audit
          </button>
        </div>
      )}

      {demoEnabled && (
        <div className="space-y-2 rounded-2xl border border-border bg-surface-2 p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Demo access controls</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary w-full sm:w-auto" onClick={() => setLevel('early')}>
              Simulate Early Access
            </button>
            <button type="button" className="btn-primary w-full sm:w-auto" onClick={() => setLevel('full')}>
              Simulate Full Access
            </button>
          </div>
          <p className="text-xs text-subtle">Current access: {level}</p>
        </div>
      )}
    </div>
  );
}
