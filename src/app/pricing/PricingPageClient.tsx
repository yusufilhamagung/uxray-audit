'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { EarlyAccessSchema } from '@/shared/types/early-access';
import { logClientEvent } from '@/infrastructure/analytics/client';
import type { ApiResponse } from '@/shared/types/api';
import { EARLY_ACCESS_COPY } from '@config/copy';
import { useAccess } from '@/presentation/providers/AccessProvider';
import { setFullAccess } from '@/infrastructure/access/sessionAccess';
import { readDemoScenarioId } from '@/domain/demo/demoStorage';

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

const paymentMethods = [
  { id: 'qris', label: 'QRIS' },
  { id: 'virtual-account', label: 'Virtual Account' },
  { id: 'card', label: 'Credit/Debit Card' },
  { id: 'ewallet', label: 'E-Wallet' },
  { id: 'bank-transfer', label: 'Bank Transfer' }
];

const paymentOutcomes = [
  { id: 'success', label: 'Success' },
  { id: 'pending', label: 'Pending' },
  { id: 'failed', label: 'Failed' }
] as const;

type PaymentOutcome = (typeof paymentOutcomes)[number]['id'];

const buildDemoPaymentId = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const suffix = hash.toString(36).toUpperCase().padStart(6, '0').slice(0, 6);
  return `DEMO-${suffix}`;
};

export default function PricingPageClient({ source, auditId, demoEnabled }: PricingPageClientProps) {
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0].id);
  const [paymentOutcome, setPaymentOutcome] = useState<PaymentOutcome>('success');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | PaymentOutcome>('idle');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [scenarioId, setScenarioId] = useState<string | null>(auditId ?? null);
  const { setLevel } = useAccess();
  const router = useRouter();

  useEffect(() => {
    if (!demoEnabled) return;
    if (auditId) {
      setScenarioId(auditId);
      return;
    }
    const storedScenario = readDemoScenarioId();
    if (storedScenario) setScenarioId(storedScenario);
  }, [auditId, demoEnabled]);

  const validAuditId = useMemo(() => {
    if (!auditId) return undefined;
    return z.string().uuid().safeParse(auditId).success ? auditId : undefined;
  }, [auditId]);

  const returnToAuditHref = useMemo(() => {
    const returnId = demoEnabled ? scenarioId : validAuditId ?? auditId ?? null;
    return returnId ? `/audit?id=${returnId}` : '/audit';
  }, [auditId, demoEnabled, scenarioId, validAuditId]);

  const setEarlyAccess = () => {
    setLevel('early_access');
    if (!demoEnabled) {
      setFullAccess();
    }
  };

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
      setShowPayment(false);
      setPaymentStatus('idle');
      setPaymentId(null);
      setSubmittedEmail(emailParsed.data.email);
      setEmail('');
      setErrorMessage(null);
      logClientEvent('email_submitted', { audit_id: validAuditId, source });
      setEarlyAccess();
    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMessage('Terjadi kesalahan saat menyimpan email.');
    }
  };

  const handleSimulatePayment = () => {
    const seed = `${scenarioId ?? 'demo'}-${submittedEmail}-${paymentMethod}-${paymentOutcome}`;
    const demoId = buildDemoPaymentId(seed);
    setPaymentId(demoId);
    setPaymentStatus(paymentOutcome);

    if (paymentOutcome === 'success') {
      setLevel('full');
      if (!demoEnabled) {
        setFullAccess();
      }
      window.setTimeout(() => {
        router.push(returnToAuditHref);
      }, 600);
      return;
    }

    setEarlyAccess();
  };

  const resetPaymentAttempt = () => {
    setPaymentStatus('idle');
    setPaymentId(null);
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
        <div className="space-y-4 rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">{EARLY_ACCESS_COPY.confirmation}</p>
          <p className="text-muted-foreground">{EARLY_ACCESS_COPY.clarification}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary w-full sm:w-auto" onClick={() => router.push(returnToAuditHref)}>
              Back to Audit
            </button>
            {demoEnabled && (
              <button
                type="button"
                className="btn-primary w-full sm:w-auto"
                onClick={() => setShowPayment(true)}
              >
                Unlock Full Access
              </button>
            )}
          </div>
        </div>
      )}

      {demoEnabled && status === 'success' && showPayment && (
        <div className="space-y-4 rounded-2xl border border-border bg-surface-2 p-4 text-sm text-muted-foreground">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">Payment</p>
            <h3 className="mt-2 text-lg font-semibold text-foreground">Choose a method</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                className={paymentMethod === method.id ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setPaymentMethod(method.id)}
              >
                {method.label}
              </button>
            ))}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">Outcome</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {paymentOutcomes.map((outcome) => (
                <button
                  key={outcome.id}
                  type="button"
                  className={paymentOutcome === outcome.id ? 'btn-primary' : 'btn-secondary'}
                  onClick={() => setPaymentOutcome(outcome.id)}
                >
                  {outcome.label}
                </button>
              ))}
            </div>
          </div>

          <button type="button" className="btn-primary w-full" onClick={handleSimulatePayment}>
            Simulate Payment
          </button>

          {paymentStatus !== 'idle' && (
            <div className="space-y-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">
                {paymentStatus === 'success'
                  ? 'Payment confirmed'
                  : paymentStatus === 'pending'
                    ? 'Payment pending'
                    : 'Payment failed'}
              </p>
              <p className="text-muted-foreground">
                {paymentStatus === 'success'
                  ? 'Full access is active for this audit.'
                  : paymentStatus === 'pending'
                    ? 'We will unlock full access after confirmation.'
                    : 'Please try again or choose a different outcome.'}
              </p>
              {paymentId && <p className="text-xs text-subtle">ID: {paymentId}</p>}
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" className="btn-secondary w-full sm:w-auto" onClick={() => router.push(returnToAuditHref)}>
                  Back to Audit
                </button>
                {demoEnabled && paymentStatus !== 'success' && (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground underline underline-offset-4"
                    onClick={resetPaymentAttempt}
                  >
                    Try different outcome
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
