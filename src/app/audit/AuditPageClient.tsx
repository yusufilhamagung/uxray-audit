'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image, { type ImageLoader } from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ThemeSwitcher from '@/presentation/components/ThemeSwitcher';
import LockedSection from '@/presentation/components/LockedSection';
import type { ApiResponse } from '@/shared/types/api';
import type { FreeAuditResult, ProAuditResult, PageType } from '@/domain/types/uxray';
import { buildFreeFallback, buildProFallback } from '@/domain/validators/uxray';
import { logClientEvent } from '@/infrastructure/analytics/client';
import {
  getAuditUnlockId,
  hasEarlyAccess as readEarlyAccess,
  hasFullAccess as readFullAccess
} from '@/infrastructure/storage/unlockStorage';

const pageTypes: Array<{ value: PageType; label: string }> = [
  { value: 'landing', label: 'Landing' },
  { value: 'app', label: 'App' },
  { value: 'dashboard', label: 'Dashboard' }
];

const loadingMessages = [
  'Menyiapkan audit halamanmu...',
  'Memeriksa fokus visual...',
  'Mengecek tombol utama...',
  'Merangkum insight utama...',
  'Menyiapkan ringkasan skor...'
];

const previewImageLoader: ImageLoader = ({ src }) => src;

type FreeAuditResponse = {
  audit_id: string;
  result: FreeAuditResult;
  image_url: string;
  model_used: string;
  latency_ms: number;
  created_at: string;
  page_type?: PageType;
};

type ProAuditResponse = {
  audit_id: string;
  result: ProAuditResult;
  model_used: string;
  latency_ms: number;
};

const isValidUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export default function AuditPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [inputMode, setInputMode] = useState<'image' | 'url'>('image');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pageType, setPageType] = useState<PageType | ''>('');
  const [optionalContext, setOptionalContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [error, setError] = useState<string | null>(null);
  const [freeResult, setFreeResult] = useState<FreeAuditResult | null>(null);
  const [proResult, setProResult] = useState<ProAuditResult | null>(null);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [freeInsightCompleted, setFreeInsightCompleted] = useState(false);
  const [loadingPro, setLoadingPro] = useState(false);
  const [upgradeNotice, setUpgradeNotice] = useState<string | null>(null);
  const [hasEarlyAccess, setHasEarlyAccess] = useState(false);
  const [hasFullAccess, setHasFullAccess] = useState(false);
  const freeInsightRef = useRef<HTMLDivElement | null>(null);

  const resetAuditForm = useCallback(() => {
    setInputMode('image');
    setFile(null);
    setUrl('');
    setPreviewUrl(null);
    setPageType('');
    setOptionalContext('');
    setFreeResult(null);
    setProResult(null);
    setAuditId(null);
    setError(null);
    setFreeInsightCompleted(false);
    setLoading(false);
    setLoadingMessage(loadingMessages[0]);
    setUpgradeNotice(null);
  }, []);

  const loadAuditById = useCallback(async (id: string) => {
    setLoading(true);
    setLoadingMessage('Memuat hasil audit...');
    try {
      const response = await fetch(`/api/audit/free?id=${encodeURIComponent(id)}`);
      const payload = (await response.json()) as ApiResponse<FreeAuditResponse>;
      if (!response.ok || !payload.data) {
        throw new Error(payload?.message || 'Audit unavailable');
      }

      setFreeResult(payload.data.result);
      setAuditId(payload.data.audit_id);
      if (payload.data.page_type) {
        setPageType(payload.data.page_type);
      }
      setPreviewUrl(payload.data.image_url || null);
      setFreeInsightCompleted(false);
      setProResult(null);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat hasil audit lama.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFullReport = useCallback(async (id: string, unlockId: string) => {
    setLoadingPro(true);
    try {
      const response = await fetch('/api/audit/pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditId: id, auditUnlockId: unlockId, pageType: pageType || undefined })
      });
      const payload = (await response.json()) as ApiResponse<ProAuditResponse>;
      if (!response.ok || !payload.data) {
        throw new Error(payload?.message || 'Full report unavailable');
      }
      setProResult(payload.data.result);
      logClientEvent('full_report_unlocked', { audit_id: id });
    } catch (err) {
      console.error(err);
      setProResult(buildProFallback('l3', pageType || 'landing'));
    } finally {
      setLoadingPro(false);
    }
  }, [pageType]);

  useEffect(() => {
    setHasEarlyAccess(readEarlyAccess());
    setHasFullAccess(readFullAccess());
  }, []);

  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam) {
      setUrl(urlParam);
      setInputMode('url');
    }

    const idParam = searchParams.get('id');
    if (idParam) {
      loadAuditById(idParam);
    }

    if (searchParams.get('locked') === '1') {
      setUpgradeNotice('Upgrade required to run a new audit.');
    }
  }, [loadAuditById, searchParams]);

  useEffect(() => {
    if (inputMode === 'url') {
      if (!freeResult && !searchParams.get('id')) {
        setPreviewUrl(null);
      }
      return;
    }

    if (!file) {
      if (!searchParams.get('id')) setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, freeResult, inputMode, searchParams]);

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

  useEffect(() => {
    if (!freeResult) return;
    logClientEvent('free_insight_rendered', { audit_id: auditId, analysis_state: freeResult.analysis_state });
  }, [auditId, freeResult]);

  useEffect(() => {
    if (!freeResult || !auditId) return;
    const unlockId = getAuditUnlockId(auditId);
    if (!unlockId || proResult || loadingPro) return;
    fetchFullReport(auditId, unlockId);
  }, [auditId, fetchFullReport, freeResult, loadingPro, proResult]);

  useEffect(() => {
    if (!freeResult || freeInsightCompleted) return;
    const container = freeInsightRef.current;
    if (!container) return;
    const maxScroll = container.scrollHeight - container.clientHeight;
    if (maxScroll <= 0) {
      setFreeInsightCompleted(true);
    }
  }, [freeInsightCompleted, freeResult]);

  useEffect(() => {
    if (freeInsightCompleted) {
      logClientEvent('free_insight_completed', { audit_id: auditId });
    }
  }, [auditId, freeInsightCompleted]);

  const handleInsightScroll = () => {
    const container = freeInsightRef.current;
    if (!container || freeInsightCompleted) return;
    const maxScroll = container.scrollHeight - container.clientHeight;
    const progress = maxScroll <= 0 ? 1 : container.scrollTop / maxScroll;
    if (progress >= 0.92) {
      setFreeInsightCompleted(true);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setUpgradeNotice(null);

    if (hasEarlyAccess && !hasFullAccess) {
      setUpgradeNotice('Upgrade required to run a new audit.');
      return;
    }

    if (!pageType) {
      setError('Mohon pilih tipe halaman.');
      return;
    }

    const trimmedContext = optionalContext.trim();

    if (inputMode === 'image') {
      if (!file) {
        setError('Mohon unggah screenshot untuk memulai audit.');
        return;
      }
    } else {
      const trimmedUrl = url.trim();
      if (!trimmedUrl) {
        setError('Mohon masukkan URL untuk memulai audit.');
        return;
      }
      if (!isValidUrl(trimmedUrl)) {
        setError('URL harus diawali http:// atau https://');
        return;
      }
    }

    logClientEvent('audit_started', { page_type: pageType, input_mode: inputMode });
    setFreeInsightCompleted(false);
    setLoading(true);
    setFreeResult(null);
    setProResult(null);
    setAuditId(null);

    try {
      let response: Response;

      if (inputMode === 'image') {
        const formData = new FormData();
        formData.append('image', file as File);
        formData.append('page_type', pageType);
        if (trimmedContext) {
          formData.append('optional_context', trimmedContext);
        }

        response = await fetch('/api/audit/free', {
          method: 'POST',
          body: formData
        });
      } else {
        const trimmedUrl = url.trim();
        response = await fetch('/api/audit/free', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: trimmedUrl,
            page_type: pageType,
            optional_context: trimmedContext || undefined
          })
        });
      }

      const payload = (await response.json()) as ApiResponse<FreeAuditResponse>;
      if (!response.ok) {
        throw new Error(payload?.message || 'Gagal memproses audit.');
      }
      if (!payload.data) {
        throw new Error('Data audit tidak tersedia.');
      }

      setFreeResult(payload.data.result);
      setAuditId(payload.data.audit_id);
      if (payload.data.page_type) {
        setPageType(payload.data.page_type);
      }
      setPreviewUrl(payload.data.image_url || null);
    } catch (err) {
      console.error(err);
      const fallback = buildFreeFallback('l3', pageType || 'landing');
      setFreeResult(fallback);
      setError('Terjadi kesalahan saat memproses audit.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnotherAudit = () => {
    logClientEvent('run_another_audit_clicked', { audit_id: auditId });
    resetAuditForm();
    router.push('/audit');
  };

  const scoreDisplay = useMemo(() => {
    if (!freeResult) return null;
    return freeResult.ux_score;
  }, [freeResult]);

  return (
    <div className="relative">
      <main className="mx-auto min-h-screen max-w-6xl px-6 pb-20 pt-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-subtle">UXRay</p>
            <h1 className="text-3xl font-semibold text-foreground">Audit Page</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <Link href="/" className="btn-secondary">
              Kembali ke Home
            </Link>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card space-y-6 p-6 min-w-0">
            <div>
              <label className="text-sm font-semibold text-foreground">Mode Audit</label>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={inputMode === 'image' ? 'btn-primary' : 'btn-secondary'}
                  onClick={() => {
                    setInputMode('image');
                    setUrl('');
                  }}
                  disabled={loading}
                >
                  Screenshot
                </button>
                <button
                  type="button"
                  className={inputMode === 'url' ? 'btn-primary' : 'btn-secondary'}
                  onClick={() => {
                    setInputMode('url');
                    setFile(null);
                  }}
                  disabled={loading}
                >
                  Link
                </button>
              </div>
            </div>

            {inputMode === 'image' && (
              <div>
                <label className="text-sm font-semibold text-foreground">Upload Screenshot (PNG/JPG)</label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(event) => {
                      setFile(event.target.files?.[0] ?? null);
                      if (event.target.files?.[0]) {
                        setUrl('');
                        setInputMode('image');
                      }
                    }}
                    className="block w-full cursor-pointer rounded-2xl border border-input-border bg-input px-4 py-3 text-sm text-foreground"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {inputMode === 'url' && (
              <div>
                <label className="text-sm font-semibold text-foreground">Paste a link</label>
                <div className="mt-2">
                  <input
                    type="url"
                    placeholder="https://contoh.com"
                    value={url}
                    onChange={(event) => {
                      setUrl(event.target.value);
                      if (event.target.value) {
                        setFile(null);
                        setInputMode('url');
                      }
                    }}
                    className="block w-full rounded-2xl border border-input-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-subtle focus:border-ring focus:ring-2 focus:ring-ring/20"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

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
                    <option key={type.value} value={type.value}>
                      {type.label}
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

            {upgradeNotice && (
              <div className="rounded-2xl border border-status-warning/30 bg-status-warning/10 px-4 py-3 text-sm text-status-warning">
                {upgradeNotice}
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-status-error/30 bg-status-error/10 px-4 py-3 text-sm text-status-error">
                {error}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Analyzing...' : 'Analyze'}
              </button>
              {freeResult && (
                <button type="button" onClick={handleRunAnotherAudit} className="btn-secondary" disabled={loading}>
                  Run Another Audit
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

          <div className="card flex h-full flex-col items-center justify-center gap-4 p-6 min-w-0">
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
                Tambahkan screenshot atau link untuk melihat preview
              </div>
            )}
          </div>
        </form>

        {loading && !freeResult && (
          <section className="mt-12">
            <div className="card p-6 animate-pulse">
              <div className="h-4 w-24 rounded bg-surface-2" />
              <div className="mt-3 h-8 w-16 rounded bg-surface-2" />
              <div className="mt-6 space-y-3">
                <div className="h-4 w-full rounded bg-surface-2" />
                <div className="h-4 w-[90%] rounded bg-surface-2" />
                <div className="h-4 w-[80%] rounded bg-surface-2" />
              </div>
            </div>
          </section>
        )}

        {freeResult && (
          <section className="mt-12 space-y-8">
            <div className="card grid gap-6 p-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-subtle">Page Score</p>
                <div className="text-5xl font-semibold text-foreground">{scoreDisplay}</div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Top Issues</h3>
                {freeResult.analysis_state === 'l2' && (
                  <div className="rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground">UXRay Quick Insight</p>
                    <p className="mt-1">We&apos;re refining our analysis engine.</p>
                  </div>
                )}
                <div
                  ref={freeInsightRef}
                  onScroll={handleInsightScroll}
                  className="max-h-[280px] space-y-3 overflow-y-auto pr-2"
                >
                  {freeResult.issues.map((issue, index) => (
                    <div key={`${issue.title}-${index}`} className="rounded-2xl border border-border bg-card p-4">
                      <p className="text-sm font-semibold text-foreground">
                        {index + 1}. {issue.title}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">Why it hurts:</span> {issue.why_it_hurts}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">Impact:</span> {issue.impact}
                      </p>
                    </div>
                  ))}
                  <div className="rounded-2xl border border-border bg-surface-2 px-4 py-3 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Why this matters:</span>{' '}
                    {freeResult.why_this_matters}
                  </div>
                </div>
              </div>
            </div>

            {freeInsightCompleted && !proResult && (
              <LockedSection
                onUnlockClick={() => {
                  logClientEvent('unlock_cta_clicked', { audit_id: auditId });
                  const href = auditId ? `/unlock?auditId=${auditId}` : '/unlock';
                  router.push(href);
                }}
              />
            )}

            {loadingPro && (
              <div className="card p-6 animate-pulse">
                <div className="h-4 w-32 rounded bg-surface-2" />
                <div className="mt-4 h-4 w-full rounded bg-surface-2" />
                <div className="mt-2 h-4 w-[85%] rounded bg-surface-2" />
              </div>
            )}

            {proResult && (
              <div className="card p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Full Report</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Prioritized fixes and copy guidance.</p>
                  </div>
                </div>

                {proResult.analysis_state === 'l2' && (
                  <div className="mt-4 rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground">UXRay Quick Insight</p>
                    <p className="mt-1">We&apos;re refining our analysis engine.</p>
                  </div>
                )}

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">Fix order</p>
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                    {proResult.fix_order.map((item) => (
                      <li key={`${item.title}-${item.reason ?? 'none'}`}>
                        {item.title}
                        {item.reason ? ` — because ${item.reason}` : ''}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="mt-6 space-y-5">
                  {proResult.issues.map((issue, index) => (
                    <div key={`${issue.title}-${index}`} className="rounded-2xl border border-border bg-card p-4">
                      <h4 className="text-base font-semibold text-foreground">
                        {index + 1}. {issue.title}
                      </h4>
                      <p className="mt-2 text-sm text-muted-foreground">{issue.why_users_hesitate}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">Impact:</span> {issue.impact}
                      </p>

                      <div className="mt-3 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">How to fix it:</span>
                        <ul className="mt-2 list-disc space-y-1 pl-5">
                          {issue.how_to_fix.map((step) => (
                            <li key={step}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
