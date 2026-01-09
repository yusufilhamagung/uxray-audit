'use client';

import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pb-24 lg:pb-32">
      <div className="section-container flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="space-y-8 text-center max-w-4xl mx-auto w-full">
          <div className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
            <span className="flex h-2 w-2 rounded-full bg-accent mr-2 animate-pulse"></span>
            Audited 24k+ sites
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Your website looks <span className="text-primary">fine</span>.
            <br />
            <span className="bg-gradient-to-r from-primary to-accent-deep bg-clip-text text-transparent">
              {`But why aren't visitors taking action?`}
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {`Analyze your page instantly. Get clear improvement steps in under 2 minutes. No consultants, no progress bars (actually, maybe some).`}
          </p>

          <div className="flex flex-col items-center gap-4 w-full">
            <Link href="/audit" className="btn-primary text-center">
              Audit Now
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-status-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              No signup required
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-status-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              Free sample report
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
