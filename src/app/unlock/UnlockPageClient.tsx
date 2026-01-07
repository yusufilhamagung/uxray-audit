"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import EarlyAccessModal from '@/presentation/components/EarlyAccessModal';

type UnlockPageClientProps = {
  auditId?: string;
};

const checklistItems = [
  'Full list of UX issues detected',
  'Clear explanation for each issue',
  'Actionable recommendations (prioritized)',
  'Access this report anytime via email',
];

export default function UnlockPageClient({ auditId }: UnlockPageClientProps) {
  const router = useRouter();
  const [showEarlyAccessModal, setShowEarlyAccessModal] = useState(true);
  
  return (
    <>
      {showEarlyAccessModal && (
        <EarlyAccessModal
          auditId={auditId ?? null}
          onRunAnotherAudit={() => router.push('/audit?locked=1')}
          onClose={() => setShowEarlyAccessModal(false)}
        />
      )}
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-subtle">
              UXRay
            </p>
            <h1 className="text-3xl font-semibold text-foreground">
              🔓 Unlock Full UX Report
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Get the complete UX analysis for this page and keep access to it.
            </p>
          </div>
        </header>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="card p-6">
              <p className="text-sm text-muted-foreground">
                You&apos;ve seen the surface-level insights. Unlock the full UX breakdown to understand
                what&apos;s hurting conversion — and why.
              </p>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-semibold text-foreground">
                What you&apos;ll unlock with Early Access
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {checklistItems.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-[2px] text-accent">✔</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card flex flex-col gap-4 p-6">
            <div>
              <label className="text-sm font-semibold text-foreground">
                Enter your email to unlock this report
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                className="mt-2 w-full rounded-2xl border border-input-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-subtle focus:border-ring focus:ring-2 focus:ring-ring/20"
                disabled
              />
              <p className="mt-2 text-xs text-muted-foreground">
                We&apos;ll use this email to keep access to this report. No spam.
              </p>
            </div>

            <button type="button" className="btn-primary w-full" disabled>
              👉 Unlock Full Report
            </button>

            <p className="text-xs text-muted-foreground">
              This unlocks the full report for this audit only.
            </p>

            <div className="rounded-2xl border border-border bg-surface-2 px-4 py-3 text-xs text-muted-foreground">
              🔒 Early access unlocks insights for this audit. Creating new audits will require an upgrade later.
            </div>

            <p className="text-xs text-muted-foreground">
              Want to audit another page or screen? Pro access will unlock multiple audits and advanced analysis.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
