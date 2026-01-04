'use client';

import Link from 'next/link';
import PricingPageClient from './PricingPageClient';
import { EARLY_ACCESS_PAGE_COPY } from '@config/copy';
import { ACCESS_SIMULATION_NOTE } from '@/presentation/copy';

type PricingPageProps = {
  searchParams?: {
    from?: string;
    id?: string;
    demo?: string;
  };
};

export default function PricingPage({ searchParams }: PricingPageProps) {
  const source = typeof searchParams?.from === 'string' ? searchParams.from : undefined;
  const auditId = typeof searchParams?.id === 'string' ? searchParams.id : undefined;
  const demoEnabled = searchParams?.demo === '1' || process.env.NEXT_PUBLIC_DEMO_MODE === '1';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 pb-6 pt-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-subtle">UXRay</p>
          <h1 className="text-3xl font-semibold text-foreground">Unlock Full Report</h1>
        </div>
        <Link href="/" className="btn-secondary">
          Kembali ke Home
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 pb-20">
        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground">{EARLY_ACCESS_PAGE_COPY.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{EARLY_ACCESS_PAGE_COPY.subtitle}</p>

              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                {EARLY_ACCESS_PAGE_COPY.checklist.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
              <p className="text-sm font-semibold text-foreground">No payment required - early access only.</p>
              <p className="mt-3 text-sm text-muted-foreground">{EARLY_ACCESS_PAGE_COPY.softUpgrade}</p>
            </div>
          </div>

          <div className="space-y-4">
            <PricingPageClient source={source} auditId={auditId} demoEnabled={demoEnabled} />
            {demoEnabled && (
              <div className="rounded-3xl border border-dashed border-accent/40 bg-accent/5 p-4 text-sm text-muted-foreground">
                {ACCESS_SIMULATION_NOTE}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
