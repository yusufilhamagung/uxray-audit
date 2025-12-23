'use client';

import { memo, useEffect, useMemo, useState } from 'react';
import Image, { type ImageLoader } from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SeverityBadge } from '@/presentation/components/SeverityBadge';
import ThemeSwitcher from '@/presentation/components/ThemeSwitcher';
import type { AuditResult, Category, PageType } from '@/shared/validation/schema';
import type { ApiResponse } from '@/lib/api/types';

const pageTypes: PageType[] = ['Landing', 'App', 'Dashboard'];
const scoreCategories: Category[] = [
  'Visual Hierarchy',
  'CTA & Conversion',
  'Copy Clarity',
  'Layout & Spacing',
  'Accessibility'
];

const loadingMessages = [
  'Menyiapkan audit UX kamu...',
  'Menganalisis hierarki visual...',
  'Mengukur konversi dan CTA...',
  'Merangkum quick wins...',
  'Finalisasi skor UX...'
];

const previewImageLoader: ImageLoader = ({ src }) => src;

type AuditCreateData = {
  audit_id: string;
  result: AuditResult;
  image_url: string;
  model_used: string;
  latency_ms: number;
  created_at: string;
};

type AuditFetchData = {
  id: string;
  created_at: string;
  page_type: string;
  image_url: string;
  ux_score: number;
  model_used: string;
  latency_ms: number;
  result: AuditResult;
};

type LockedReportSectionProps = {
  result: AuditResult;
  auditId: string | null;
};

const MODEL_LATENCY_LINE = /^Model:\s.*-\sLatency:\s\d+\sms$/i;

const stripModelLatencyLine = (value: string) => {
  const lines = value.split('\n');
  const filtered = lines.filter((line) => !MODEL_LATENCY_LINE.test(line.trim()));
  return filtered.join('\n');
};

const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return stripModelLatencyLine(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, sanitizeValue(entry)])
    );
  }
  return value;
};

const sanitizeAuditResult = (value: AuditResult): AuditResult => sanitizeValue(value) as AuditResult;

const LockedReportSection = memo(function LockedReportSection({ result, auditId }: LockedReportSectionProps) {
  const teaserIssues = useMemo(() => result.issues.slice(0, 2), [result.issues]);
  const teaserQuickWins = useMemo(() => result.quick_wins.slice(0, 1), [result.quick_wins]);
  const lockedIssues = useMemo(() => result.issues.slice(2), [result.issues]);
  const lockedQuickWins = useMemo(() => result.quick_wins.slice(1), [result.quick_wins]);
  const pricingHref = auditId ? `/pricing?from=audit&id=${auditId}` : '/pricing?from=audit';

  return (
    <div className="card p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-subtle">
            Full Report (Early Access)
          </p>
          <h3 className="mt-2 text-lg font-semibold text-foreground">Laporan lengkap + prioritas perbaikan</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Unlock untuk akses laporan lengkap + prioritas perbaikan.
          </p>
        </div>
        <Link href={pricingHref} className="btn-primary w-full sm:w-auto text-center">
          Unlock Full Report
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">Teaser Issues</p>
          <div className="mt-3 space-y-3">
            {teaserIssues.length > 0 ? (
              teaserIssues.map((issue, index) => (
                <div key={`${issue.title}-${index}`} className="rounded-xl border border-border/60 bg-surface-2 p-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-subtle">
                    <SeverityBadge severity={issue.severity} />
                    <span>{issue.category}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-foreground">{issue.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{issue.problem}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Teaser issue akan muncul setelah audit selesai.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">Quick Win Teaser</p>
          <div className="mt-3 space-y-3">
            {teaserQuickWins.length > 0 ? (
              teaserQuickWins.map((win) => (
                <div key={win.title} className="rounded-xl border border-accent/30 bg-accent/10 p-3">
                  <p className="text-sm font-semibold text-foreground">{win.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{win.action}</p>
                  <p className="mt-1 text-xs text-subtle">Impact: {win.expected_impact}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Quick win teaser akan muncul setelah audit selesai.</p>
            )}
          </div>
        </div>
      </div>

      <div className="relative mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="space-y-4 p-5 blur-sm select-none">
          {(lockedIssues.length > 0 ? lockedIssues : teaserIssues).map((issue, index) => (
            <div key={`locked-${issue.title}-${index}`} className="rounded-xl border border-border/60 bg-surface-2 p-3">
              <p className="text-sm font-semibold text-foreground">{issue.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{issue.recommendation_steps?.[0] ?? issue.problem}</p>
            </div>
          ))}
          {(lockedQuickWins.length > 0 ? lockedQuickWins : teaserQuickWins).map((win) => (
            <div key={`locked-${win.title}`} className="rounded-xl border border-accent/30 bg-accent/10 p-3">
              <p className="text-sm font-semibold text-foreground">{win.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{win.action}</p>
            </div>
          ))}
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground/90 text-background">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 11c1.1 0 2 .9 2 2v2a2 2 0 0 1-4 0v-2c0-1.1.9-2 2-2zm5-3h-1V6a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2z"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-foreground">
            Unlock untuk akses laporan lengkap + prioritas perbaikan.
          </p>
          <Link href={pricingHref} className="btn-primary w-full max-w-[220px] text-center">
            Unlock
          </Link>
        </div>
      </div>
    </div>
  );
});

export default function AuditPageClient() {
  const searchParams = useSearchParams();
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pageType, setPageType] = useState<PageType | ''>('');
  const [optionalContext, setOptionalContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    (window as Window & { __uxauditMeta__?: { modelUsed: string | null; latencyMs: number | null } })
      .__uxauditMeta__ = { modelUsed, latencyMs };
  }, [modelUsed, latencyMs]);

  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam) {
      setUrl(urlParam);
    }

    const idParam = searchParams.get('id');
    if (idParam) {
      setLoading(true);
      setLoadingMessage('Memuat hasil audit...');
      fetch(`/api/audit/${idParam}`)
        .then(async (res) => {
          const payload = (await res.json()) as ApiResponse<AuditFetchData>;
          if (!res.ok) {
            throw new Error(payload?.message || 'Audit unavailable');
          }
          return payload;
        })
        .then((payload) => {
          if (!payload.data) throw new Error('Audit data missing.');
          setResult(sanitizeAuditResult(payload.data.result));
          setAuditId(payload.data.id);
          setModelUsed(payload.data.model_used);
          setLatencyMs(payload.data.latency_ms);
          setPreviewUrl(payload.data.image_url);
        })
        .catch((err) => {
          console.error(err);
          setError('Gagal memuat hasil audit lama.');
        })
        .finally(() => setLoading(false));
    }
  }, [searchParams]);

  useEffect(() => {
    if (!file) {
      if (!url && !searchParams.get('id')) setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, url, searchParams]);

  useEffect(() => {
    if (!loading) return;
    let index = 0;
    setLoadingMessage(loadingMessages[index]);
    const interval = setInterval(() => {
      index = (index + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[index]);
    }, 2600);
    return () => clearInterval(interval);
  }, [loading]);

  const scoreEntries = useMemo(() => {
    if (!result) return [];
    return scoreCategories.map((category) => ({
      category,
      score: result.score_breakdown[category]
    }));
  }, [result]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!file && !url) {
      setError('Mohon unggah screenshot atau masukkan URL.');
      return;
    }
    if (!pageType) {
      setError('Mohon pilih tipe halaman.');
      return;
    }

    setLoading(true);
    setResult(null);
    setAuditId(null);

    try {
      let response;
      if (file) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('page_type', pageType);
        if (optionalContext.trim()) {
          formData.append('optional_context', optionalContext.trim());
        }
        response = await fetch('/api/audit', {
          method: 'POST',
          body: formData
        });
      } else {
        response = await fetch('/api/audit/url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url,
            page_type: pageType,
            optional_context: optionalContext.trim()
          })
        });
      }

      const payload = (await response.json()) as ApiResponse<AuditCreateData>;
      if (!response.ok) {
        throw new Error(payload?.message || 'Gagal memproses audit.');
      }
      if (!payload.data) {
        throw new Error('Data audit tidak tersedia.');
      }

      setResult(sanitizeAuditResult(payload.data.result));
      setAuditId(payload.data.audit_id);
      setModelUsed(payload.data.model_used);
      setLatencyMs(payload.data.latency_ms);

      if (payload.data.image_url && !file) {
        setPreviewUrl(payload.data.image_url);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses audit.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setUrl('');
    setPreviewUrl(null);
    setPageType('');
    setOptionalContext('');
    setResult(null);
    setAuditId(null);
    setModelUsed(null);
    setLatencyMs(null);
    setError(null);
  };

  const handleDownloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `uxaudit-${auditId ?? 'report'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <main className="mx-auto min-h-screen max-w-6xl px-6 pb-20 pt-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-subtle">UXAudit AI</p>
            <h1 className="text-3xl font-semibold text-foreground">Audit UX</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <Link href="/" className="btn-secondary">
              Kembali ke Home
            </Link>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card space-y-6 p-6">
            <div>
              <label className="text-sm font-semibold text-foreground">Upload Screenshot (PNG/JPG)</label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(event) => {
                    setFile(event.target.files?.[0] ?? null);
                    if (event.target.files?.[0]) setUrl('');
                  }}
                  className="block w-full cursor-pointer rounded-2xl border border-input-border bg-input px-4 py-3 text-sm text-foreground"
                  disabled={loading || !!url}
                />
              </div>
            </div>

            <div className="text-center text-sm text-subtle font-medium">- ATAU -</div>

            <div>
              <label className="text-sm font-semibold text-foreground">URL Website</label>
              <div className="mt-2">
                <input
                  type="url"
                  placeholder="https://contoh.com"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (e.target.value) setFile(null);
                  }}
                  className="block w-full rounded-2xl border border-input-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-subtle focus:border-ring focus:ring-2 focus:ring-ring/20"
                  disabled={loading || !!file}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground">Tipe Halaman</label>
              <div className="mt-2">
                <select
                  value={pageType}
                  onChange={(event) => setPageType(event.target.value as PageType)}
                  className="block w-full rounded-2xl border border-input-border bg-input px-4 py-3 text-sm text-foreground"
                  disabled={loading}
                  required
                >
                  <option value="" disabled>
                    Pilih tipe halaman
                  </option>
                  {pageTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground">Konteks Tambahan (opsional)</label>
              <div className="mt-2">
                <textarea
                  value={optionalContext}
                  onChange={(event) => setOptionalContext(event.target.value)}
                  placeholder="Contoh: target user adalah pemilik UMKM, tujuan halaman: ajakan demo."
                  className="min-h-[90px] w-full rounded-2xl border border-input-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-subtle"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-status-error/30 bg-status-error/10 px-4 py-3 text-sm text-status-error">
                {error}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Sedang Audit...' : 'Generate Audit'}
              </button>
              {result && (
                <button type="button" onClick={handleReset} className="btn-secondary">
                  Audit lagi
                </button>
              )}
              <p className="text-xs text-muted-foreground">Estimasi 10-30 detik.</p>
            </div>

            {loading && (
              <div className="rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse-soft" />
                  <span>{loadingMessage}</span>
                </div>
              </div>
            )}
          </div>

          <div className="card flex h-full flex-col items-center justify-center gap-4 p-6">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-subtle">Preview</p>
              <h2 className="text-lg font-semibold text-foreground">Screenshot Kamu</h2>
            </div>
            {previewUrl ? (
              <div className="relative h-[320px] w-full overflow-hidden rounded-2xl border border-border">
                <Image
                  loader={previewImageLoader}
                  unoptimized
                  src={previewUrl}
                  alt="Preview screenshot"
                  fill
                  sizes="(max-width: 1024px) 100vw, 520px"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex h-[260px] w-full items-center justify-center rounded-2xl border border-dashed border-border bg-surface-2 text-sm text-subtle">
                Upload screenshot untuk melihat preview
              </div>
            )}
          </div>
        </form>

        {result && (
          <section className="mt-12 space-y-8">
            <div className="card grid gap-6 p-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-subtle">UX Score</p>
                <div className="text-5xl font-semibold text-foreground">{result.ux_score}</div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={handleDownloadJson} className="btn-secondary">
                    Download Report (JSON)
                  </button>
                  {auditId && (
                    <a href={`/api/audit/${auditId}/report`} className="btn-secondary">
                      Download Report (HTML)
                    </a>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Top 3 Prioritas</h3>
                <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                  {result.summary.top_3_priorities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
                <p className="text-sm text-muted-foreground">{result.summary.overall_notes}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {scoreEntries.map((entry, index) => (
                <div
                  key={entry.category}
                  className="card animate-fade-up p-5"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-subtle">
                    {entry.category}
                  </p>
                  <div className="mt-2 text-3xl font-semibold text-foreground">{entry.score}</div>
                </div>
              ))}
            </div>

            <LockedReportSection result={result} auditId={auditId} />

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-foreground">Issues Detail</h3>
              <div className="mt-4 space-y-5">
                {result.issues.map((issue, index) => (
                  <div key={`${issue.title}-${index}`} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <SeverityBadge severity={issue.severity} />
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">
                        {issue.category}
                      </span>
                    </div>
                    <h4 className="mt-2 text-base font-semibold text-foreground">{issue.title}</h4>
                    <p className="mt-2 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Problem:</span> {issue.problem}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Evidence:</span> {issue.evidence}
                    </p>
                    <div className="mt-3 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Recommendation:</span>
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        {issue.recommendation_steps.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ul>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Expected impact:</span>{' '}
                      {issue.expected_impact}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-foreground">Quick Wins</h3>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  {result.quick_wins.map((win) => (
                    <li key={win.title}>
                      <span className="font-semibold text-foreground">{win.title}:</span> {win.action}
                      <div className="text-xs text-subtle">Impact: {win.expected_impact}</div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-foreground">Next Steps</h3>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  {result.next_steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
