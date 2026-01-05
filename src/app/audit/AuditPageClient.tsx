'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image, { type ImageLoader } from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { SeverityBadge } from '@/presentation/components/SeverityBadge';
import ThemeSwitcher from '@/presentation/components/ThemeSwitcher';
import type { AuditReport as AuditResult, Category, PageType } from '@/shared/types/audit';
import type { AccessLevel } from '@/shared/types/access';
import type { ApiResponse } from '@/shared/types/api';
import { logClientEvent } from '@/infrastructure/analytics/client';
import { LOCKED_REPORT_COPY } from '@config/copy';
import { useAccess } from '@/presentation/providers/AccessProvider';
import { buildAuditAccessView, type AuditLockState } from '@/domain/rules/access-gating';
import { clientEnv } from '@/infrastructure/env/client';
import { clearDemoScenarioId, readDemoScenarioId, writeDemoScenarioId } from '@/domain/demo/demoStorage';

const pageTypes: PageType[] = ['Landing', 'App', 'Dashboard'];
const scoreCategories: Category[] = [
  'Visual Hierarchy',
  'CTA & Conversion',
  'Copy Clarity',
  'Layout & Spacing',
  'Accessibility'
];

const loadingMessages = [
  'Menyiapkan audit halamanmu...',
  'Memeriksa fokus visual...',
  'Mengecek tombol utama...',
  'Merangkum perbaikan cepat...',
  'Menyiapkan ringkasan skor...'
];

const previewImageLoader: ImageLoader = ({ src }) => src;

type AuditCreateData = {
  audit_id: string;
  result: AuditResult;
  image_url: string;
  model_used: string;
  latency_ms: number;
  created_at: string;
  lock_state?: AuditLockState;
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
  teaserIssues: AuditResult['issues'];
  teaserQuickWins: AuditResult['quick_wins'];
  lockedIssues: AuditResult['issues'];
  lockedQuickWins: AuditResult['quick_wins'];
  auditId: string | null;
  accessLevel: AccessLevel;
  onUnlockClick: () => void;
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

const LockedReportSection = memo(function LockedReportSection({
  teaserIssues,
  teaserQuickWins,
  lockedIssues,
  lockedQuickWins,
  auditId,
  accessLevel,
  onUnlockClick
}: LockedReportSectionProps) {
  const pricingHref = auditId ? `/pricing?from=audit&id=${auditId}` : '/pricing?from=audit';
  const copy = LOCKED_REPORT_COPY;
  const isEarlyAccess = accessLevel === 'early_access';
  const overlayCopy = isEarlyAccess
    ? "You're on the list. Unlock to see the full report."
    : copy.microcopy;

  return (
    <div className="card p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-subtle">Full Report</p>
          <h3 className="mt-2 text-lg font-semibold text-foreground">{copy.headline}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{copy.subheadline}</p>
          {isEarlyAccess && (
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              You&apos;re on the list
            </p>
          )}
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {copy.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2">
                <span className="mt-[2px] h-1.5 w-1.5 rounded-full bg-accent" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
        <Link
          href={pricingHref}
          className="btn-primary w-full sm:w-auto text-center"
          onClick={onUnlockClick}
        >
          {copy.cta}
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
          <p className="text-sm font-semibold text-foreground">{overlayCopy}</p>
          <Link
            href={pricingHref}
            className="btn-primary w-full max-w-[220px] text-center"
            onClick={onUnlockClick}
          >
            {copy.cta}
          </Link>
        </div>
      </div>
    </div>
  );
});

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
  const [result, setResult] = useState<AuditResult | null>(null);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [freeInsightReady, setFreeInsightReady] = useState(false);
  const [insightConsumed, setInsightConsumed] = useState(false);
  const whyThisMattersRef = useRef<HTMLParagraphElement | null>(null);
  const lastLoadedAccessRef = useRef<AccessLevel | null>(null);
  const { level: accessLevel, setLevel: setAccessLevel } = useAccess();
  const demoMode = clientEnv.demoMode;
  const accessView = useMemo(
    () => (result ? buildAuditAccessView(result, accessLevel) : null),
    [result, accessLevel]
  );
  const canViewDetails = accessView?.lockState.canViewDetails ?? false;
  const canViewFull = accessView?.lockState.canViewFull ?? false;
  const teaserIssues = accessView?.teaser.issues ?? [];
  const teaserQuickWins = accessView?.teaser.quickWins ?? [];
  const lockedIssues = accessView?.locked.issues ?? [];
  const lockedQuickWins = accessView?.locked.quickWins ?? [];

  const resetAuditForm = useCallback(() => {
    setInputMode('image');
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
    setFreeInsightReady(false);
    setInsightConsumed(false);
    setLoading(false);
    setLoadingMessage(loadingMessages[0]);
    lastLoadedAccessRef.current = null;
  }, []);

  const loadAuditById = useCallback(
    (id: string) => {
      setLoading(true);
      setLoadingMessage('Memuat hasil audit...');
      fetch(`/api/audit/${encodeURIComponent(id)}?access_level=${accessLevel}`)
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
          setPreviewUrl(payload.data.image_url || null);
          setFreeInsightReady(true);
          setInsightConsumed(false);
          lastLoadedAccessRef.current = accessLevel;
          if (demoMode) {
            writeDemoScenarioId(payload.data.id);
          }
        })
        .catch((err) => {
          console.error(err);
          setError('Gagal memuat hasil audit lama.');
        })
        .finally(() => setLoading(false));
    },
    [accessLevel, demoMode]
  );

  const handleRunAnotherAudit = useCallback(() => {
    if (demoMode) {
      clearDemoScenarioId();
    }
    resetAuditForm();
    router.push('/audit?new=1');
  }, [demoMode, resetAuditForm, router]);

  const handleResetDemo = useCallback(() => {
    clearDemoScenarioId();
    setAccessLevel('free');
    resetAuditForm();
    router.push('/audit?new=1');
  }, [resetAuditForm, router, setAccessLevel]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    (window as Window & { __uxauditMeta__?: { modelUsed: string | null; latencyMs: number | null } })
      .__uxauditMeta__ = { modelUsed, latencyMs };
  }, [modelUsed, latencyMs]);

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
  }, [searchParams, loadAuditById]);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      if (demoMode) {
        clearDemoScenarioId();
      }
      resetAuditForm();
      router.replace('/audit');
    }
  }, [demoMode, searchParams, resetAuditForm, router]);

  useEffect(() => {
    if (!demoMode) return;
    if (searchParams.get('id')) return;
    if (result || loading) return;
    const storedScenario = readDemoScenarioId();
    if (storedScenario) {
      loadAuditById(storedScenario);
    }
  }, [demoMode, loadAuditById, loading, result, searchParams]);

  useEffect(() => {
    if (!demoMode) return;
    if (!auditId) return;
    if (!result) return;
    if (lastLoadedAccessRef.current === accessLevel) return;
    loadAuditById(auditId);
  }, [accessLevel, auditId, demoMode, loadAuditById, result]);

  useEffect(() => {
    if (inputMode === 'url') {
      if (!result && !searchParams.get('id')) {
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
  }, [file, inputMode, result, searchParams]);

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
    if (insightConsumed) {
      logClientEvent('insight_scrolled_to_end', { audit_id: auditId });
    }
  }, [insightConsumed, auditId]);


  useEffect(() => {
    if (!freeInsightReady || insightConsumed || !whyThisMattersRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInsightConsumed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.8 }
    );
    observer.observe(whyThisMattersRef.current);
    return () => observer.disconnect();
  }, [freeInsightReady, insightConsumed, result]);

  const scoreEntries = useMemo(() => {
    if (!result) return [];
    return scoreCategories.map((category) => ({
      category,
      score: result.score_breakdown[category]
    }));
  }, [result]);

  const isValidUrl = (value: string) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);

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
    setFreeInsightReady(false);
    setInsightConsumed(false);
    setLoading(true);
    setResult(null);
    setAuditId(null);
    setModelUsed(null);
    setLatencyMs(null);

    try {
      let response: Response;

      if (inputMode === 'image') {
        const formData = new FormData();
        formData.append('image', file as File);
        formData.append('page_type', pageType);
        formData.append('access_level', accessLevel);
        if (trimmedContext) {
          formData.append('optional_context', trimmedContext);
        }

        response = await fetch('/api/audit', {
          method: 'POST',
          body: formData
        });
      } else {
        const trimmedUrl = url.trim();
        response = await fetch('/api/audit/url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: trimmedUrl,
            page_type: pageType,
            optional_context: trimmedContext || undefined,
            access_level: accessLevel
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
      setFreeInsightReady(true);
      lastLoadedAccessRef.current = accessLevel;
      logClientEvent('audit_completed', {
        audit_id: payload.data.audit_id,
        analysis_state: payload.data.result.analysis_state,
        input_mode: inputMode
      });

      if (payload.data.image_url) {
        setPreviewUrl(payload.data.image_url);
      }
      if (demoMode) {
        writeDemoScenarioId(payload.data.audit_id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses audit.';
      setError(message);
    } finally {
      setLoading(false);
    }
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
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Analyze'}
              </button>
              {result && (
                <>
                  <button
                    type="button"
                    onClick={handleRunAnotherAudit}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    Run Another Audit
                  </button>
                  {demoMode && (
                    <button
                      type="button"
                      onClick={handleResetDemo}
                      className="btn-secondary"
                      disabled={loading}
                    >
                      Reset Demo
                    </button>
                  )}
                </>
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

        {result && (
          <section className="mt-12 space-y-8">
            <div className="card grid gap-6 p-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-subtle">Page Score</p>
                <div className="text-5xl font-semibold text-foreground">{result.ux_score}</div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={handleDownloadJson} className="btn-secondary">
                    Download Report (JSON)
                  </button>
                  {auditId && (
                    <a
                      href={`/api/audit/${auditId}/report?access_level=${accessLevel}`}
                      className="btn-secondary"
                    >
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
                <p
                  ref={whyThisMattersRef}
                  className="text-sm text-muted-foreground"
                >
                  {result.summary.overall_notes}
                </p>
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

            {accessView?.lockState.showLockedCta && (
              <LockedReportSection
                teaserIssues={teaserIssues}
                teaserQuickWins={teaserQuickWins}
                lockedIssues={lockedIssues}
                lockedQuickWins={lockedQuickWins}
                auditId={auditId}
                accessLevel={accessLevel}
                onUnlockClick={() => {
                  logClientEvent('unlock_clicked', { audit_id: auditId });
                }}
              />
            )}

            {canViewDetails && (
              <>
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-foreground">Issues Detail</h3>
                  <div className="mt-4 space-y-5">
                    {accessView?.visibleIssues?.map((issue, index) => (
                      <div key={`${issue.title}-${index}`} className="rounded-2xl border border-border bg-card p-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <SeverityBadge severity={issue.severity} />
                          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">
                            {issue.category}
                          </span>
                        </div>
                        <h4 className="mt-2 text-base font-semibold text-foreground">{issue.title}</h4>
                        <p className="mt-2 text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">Why users hesitate:</span> {issue.evidence}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">Impact:</span> {issue.impact}
                        </p>
                        <div className="mt-3 text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">How to fix it:</span>
                          <ul className="mt-2 list-disc space-y-1 pl-5">
                            {issue.recommendation_steps.map((step) => (
                              <li key={step}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {canViewFull && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="card p-6">
                      <h3 className="text-lg font-semibold text-foreground">Quick Wins</h3>
                      <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                        {accessView?.visibleQuickWins?.map((win) => (
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
                        {accessView?.visibleNextSteps?.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </>
            )}

          </section>
        )}
      </main>
    </div>
  );
}
