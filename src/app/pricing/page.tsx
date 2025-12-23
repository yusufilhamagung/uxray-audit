import Link from 'next/link';
import PricingPageClient from './PricingPageClient';

type PricingPageProps = {
  searchParams?: {
    from?: string;
    id?: string;
  };
};

export default function PricingPage({ searchParams }: PricingPageProps) {
  const source = typeof searchParams?.from === 'string' ? searchParams.from : undefined;
  const auditId = typeof searchParams?.id === 'string' ? searchParams.id : undefined;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 pb-6 pt-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-subtle">UXAudit AI</p>
          <h1 className="text-3xl font-semibold text-foreground">Unlock Full Report</h1>
        </div>
        <Link href="/" className="btn-secondary">
          Kembali ke Home
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20">
        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground">Paket Early Access</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Pilih paket yang cocok untuk membuka laporan lengkap dan prioritas perbaikan.
              </p>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="flex flex-col rounded-2xl border border-border bg-surface-2 p-6">
                  <p className="text-sm font-semibold text-foreground">Pay as you go</p>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-3xl font-semibold text-foreground">$5</span>
                    <span className="text-sm text-muted-foreground">/ audit</span>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <li>Full report per audit</li>
                    <li>Prioritas perbaikan</li>
                    <li>Download report</li>
                  </ul>
                </div>

                <div className="flex flex-col rounded-2xl border border-accent/30 bg-accent/10 p-6">
                  <p className="text-sm font-semibold text-accent">Pro monthly</p>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-3xl font-semibold text-foreground">$19</span>
                    <span className="text-sm text-muted-foreground">/ bulan</span>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <li>10 audits per bulan</li>
                    <li>Prioritas proses</li>
                    <li>Riwayat audit</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <PricingPageClient source={source} auditId={auditId} />
        </section>
      </main>
    </div>
  );
}
