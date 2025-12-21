import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="relative">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-20 pt-16 sm:pt-24">
        <header className="flex items-center justify-between">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            UXAudit AI
          </div>
          <Link href="/audit" className="btn-secondary">
            Audit Sekarang
          </Link>
        </header>

        <section className="mt-16 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
              Audit UI/UX Instan
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
              UXAudit AI
            </h1>
            <p className="text-lg text-slate-600 sm:text-xl">
              Audit UX website kamu dalam 2 menit - tanpa konsultan, tanpa ribet.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/audit" className="btn-primary">
                Audit Sekarang
              </Link>
              <div className="text-sm text-slate-500">
                Analisis berbasis AI, fokus pada perbaikan nyata.
              </div>
            </div>
          </div>

          <div className="card animate-fade-up space-y-6 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Sample Report
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">Landing Page Audit</h2>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-lg font-semibold text-white">
                82
              </div>
            </div>
            <div className="space-y-3 text-sm text-slate-600">
              <p>Highlight di hero kurang tajam, CTA belum tampil dominan.</p>
              <p>Spacing antar section padat, membuat alur scroll terasa berat.</p>
              <p>Perkuat kontras button utama dan tambahkan social proof.</p>
            </div>
            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm font-semibold text-orange-700">
              3 prioritas utama siap dieksekusi hari ini.
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-6 sm:grid-cols-3">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900">Skor UX Terukur</h3>
            <p className="mt-2 text-sm text-slate-600">
              Dapatkan skor 0-100 dan breakdown 5 kategori inti yang mudah dipahami.
            </p>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900">Prioritas Jelas</h3>
            <p className="mt-2 text-sm text-slate-600">
              AI memilih 3 fokus utama agar tim desain bisa bertindak cepat.
            </p>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900">Quick Wins</h3>
            <p className="mt-2 text-sm text-slate-600">
              Temukan perbaikan cepat dengan impact besar tanpa overhaul total.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
