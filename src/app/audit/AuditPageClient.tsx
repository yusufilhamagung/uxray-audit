'use client';

import { useEffect, useMemo, useState } from 'react';
import Image, { type ImageLoader } from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SeverityBadge } from '@/presentation/components/SeverityBadge';
import type { AuditResult, Category, PageType } from '@/shared/validation/schema';

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
    const urlParam = searchParams.get('url');
    if (urlParam) {
      setUrl(urlParam);
    }
    
    // Check for audit ID logic
    const idParam = searchParams.get('id');
    if (idParam) {
        setLoading(true);
        setLoadingMessage('Memuat hasil audit...');
        fetch(`/api/audit/${idParam}`)
            .then(res => {
                if (!res.ok) throw new Error('Audit unavailable');
                return res.json();
            })
            .then(data => {
                setResult(data.result);
                setAuditId(data.id);
                setModelUsed(data.model_used);
                setLatencyMs(data.latency_ms);
                setPreviewUrl(data.image_url);
            })
            .catch(err => {
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

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || 'Gagal memproses audit.');
      }

      setResult(data.result);
      setAuditId(data.audit_id);
      setModelUsed(data.model_used);
      setLatencyMs(data.latency_ms);
      
      if (data.image_url && !file) {
          setPreviewUrl(data.image_url);
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
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">UXAudit AI</p>
            <h1 className="text-3xl font-semibold text-slate-900">Audit UX</h1>
          </div>
          <Link href="/" className="btn-secondary">
            Kembali ke Home
          </Link>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div className="card space-y-6 p-6">
            <div>
              <label className="text-sm font-semibold text-slate-800">Upload Screenshot (PNG/JPG)</label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(event) => {
                      setFile(event.target.files?.[0] ?? null);
                      if (event.target.files?.[0]) setUrl('');
                  }}
                  className="block w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  disabled={loading || !!url}
                />
              </div>
            </div>

            <div className="text-center text-sm text-slate-500 font-medium">- ATAU -</div>

            <div>
              <label className="text-sm font-semibold text-slate-800">URL Website</label>
              <div className="mt-2">
                <input
                  type="url"
                  placeholder="https://contoh.com"
                  value={url}
                  onChange={(e) => {
                      setUrl(e.target.value);
                      if (e.target.value) setFile(null);
                  }}
                  className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  disabled={loading || !!file}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-800">Tipe Halaman</label>
              <div className="mt-2">
                <select
                  value={pageType}
                  onChange={(event) => setPageType(event.target.value as PageType)}
                  className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
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
              <label className="text-sm font-semibold text-slate-800">Konteks Tambahan (opsional)</label>
              <div className="mt-2">
                <textarea
                  value={optionalContext}
                  onChange={(event) => setOptionalContext(event.target.value)}
                  placeholder="Contoh: target user adalah pemilik UMKM, tujuan halaman: ajakan demo."
                  className="min-h-[90px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
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
              <p className="text-xs text-slate-500">Estimasi 10-30 detik.</p>
            </div>

            {loading && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse-soft" />
                  <span>{loadingMessage}</span>
                </div>
              </div>
            )}
          </div>

          <div className="card flex h-full flex-col items-center justify-center gap-4 p-6">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Preview</p>
              <h2 className="text-lg font-semibold text-slate-900">Screenshot Kamu</h2>
            </div>
            {previewUrl ? (
              <div className="relative h-[320px] w-full overflow-hidden rounded-2xl border border-slate-200">
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
              <div className="flex h-[260px] w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
                Upload screenshot untuk melihat preview
              </div>
            )}
          </div>
        </form>

        {result && (
          <section className="mt-12 space-y-8">
            <div className="card grid gap-6 p-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">UX Score</p>
                <div className="text-5xl font-semibold text-slate-900">{result.ux_score}</div>
                <p className="text-sm text-slate-600">Model: {modelUsed ?? 'unknown'} - Latency: {latencyMs ?? 0} ms</p>
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
                <h3 className="text-lg font-semibold text-slate-900">Top 3 Prioritas</h3>
                <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
                  {result.summary.top_3_priorities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
                <p className="text-sm text-slate-600">{result.summary.overall_notes}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {scoreEntries.map((entry, index) => (
                <div
                  key={entry.category}
                  className="card animate-fade-up p-5"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    {entry.category}
                  </p>
                  <div className="mt-2 text-3xl font-semibold text-slate-900">{entry.score}</div>
                </div>
              ))}
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-slate-900">Issues Detail</h3>
              <div className="mt-4 space-y-5">
                {result.issues.map((issue, index) => (
                  <div key={`${issue.title}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <SeverityBadge severity={issue.severity} />
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {issue.category}
                      </span>
                    </div>
                    <h4 className="mt-2 text-base font-semibold text-slate-900">{issue.title}</h4>
                    <p className="mt-2 text-sm text-slate-600">
                      <span className="font-semibold text-slate-800">Problem:</span> {issue.problem}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      <span className="font-semibold text-slate-800">Evidence:</span> {issue.evidence}
                    </p>
                    <div className="mt-3 text-sm text-slate-600">
                      <span className="font-semibold text-slate-800">Recommendation:</span>
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        {issue.recommendation_steps.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ul>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      <span className="font-semibold text-slate-800">Expected impact:</span> {issue.expected_impact}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-slate-900">Quick Wins</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  {result.quick_wins.map((win) => (
                    <li key={win.title}>
                      <span className="font-semibold text-slate-800">{win.title}:</span> {win.action}
                      <div className="text-xs text-slate-500">Impact: {win.expected_impact}</div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-slate-900">Next Steps</h3>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600">
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
