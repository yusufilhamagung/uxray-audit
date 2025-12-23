import { randomUUID } from 'node:crypto';
import type { ApiResponse } from '@/lib/api/types';
import { auditFromUrl } from '@/app/api/audit/composition';
import { serverEnv } from '@/lib/env/server';
import { isChromiumUnavailableError, ChromiumUnavailableError } from '@/server/audit/chromium';
import { runWorkerAudit } from '@/server/audit/workerClient';

type AuditUrlPayload = {
  url: string;
  page_type: string;
  optional_context?: string;
};

type AuditResultData = {
  audit_id: string;
  result: unknown;
  image_url: string;
  model_used: string;
  latency_ms: number;
  created_at: string;
};

type EngineResponse = {
  response: ApiResponse<AuditResultData | { code: string; hint: string; correlation_id: string }>;
  httpStatus: number;
  meta: {
    correlationId: string;
    strategy: 'chromium' | 'worker';
    runtime: 'nodejs' | 'edge';
    platform: 'vercel' | 'local';
  };
};

const isEdgeRuntime = () =>
  process.env.NEXT_RUNTIME === 'edge' ||
  typeof (globalThis as { EdgeRuntime?: unknown }).EdgeRuntime !== 'undefined';

const getRuntimeLabel = () => (isEdgeRuntime() ? 'edge' : 'nodejs');

const getPlatformLabel = () => (process.env.VERCEL ? 'vercel' : 'local');
const isVercel = () => Boolean(process.env.VERCEL);

const getStrategyOverride = () => serverEnv.auditStrategy ?? 'auto';

const withAuditMeta = (
  correlationId: string,
  code: string,
  hint: string
): ApiResponse<{ code: string; hint: string; correlation_id: string }> => ({
  status: 'error',
  message: hint,
  data: {
    code,
    hint,
    correlation_id: correlationId
  }
});

export async function runUrlAudit(
  payload: AuditUrlPayload,
  correlationId: string = randomUUID()
): Promise<EngineResponse> {
  const runtime = getRuntimeLabel();
  const platform = getPlatformLabel();
  const hasWorker = Boolean(serverEnv.auditWorkerUrl);

  const logBase = `[AuditEngine] [${correlationId}] runtime=${runtime} platform=${platform}`;

  const tryWorker = async (): Promise<EngineResponse> => {
    const workerPayload = {
      ...payload,
      correlation_id: correlationId
    };
    const worker = await runWorkerAudit(workerPayload);

    if (!worker.ok) {
      const message =
        worker.error ||
        'Audit headless browser tidak tersedia di runtime ini. Set AUDIT_WORKER_URL atau gunakan Node.js runtime.';
      console.warn(`${logBase} worker_failed status=${worker.status} error=${worker.error ?? 'unknown'}`);
      return {
        response: withAuditMeta(correlationId, 'AUDIT_WORKER_FAILED', message),
        httpStatus: worker.status || 502,
        meta: { correlationId, strategy: 'worker', runtime, platform }
      };
    }

    if (
      worker.data &&
      typeof worker.data === 'object' &&
      'status' in worker.data &&
      'message' in worker.data
    ) {
      return {
        response: worker.data as ApiResponse<AuditResultData>,
        httpStatus: worker.status,
        meta: { correlationId, strategy: 'worker', runtime, platform }
      };
    }

    return {
      response: {
        status: 'success',
        message: 'Audit berhasil dibuat.',
        data: worker.data as AuditResultData
      },
      httpStatus: worker.status,
      meta: { correlationId, strategy: 'worker', runtime, platform }
    };
  };

  if (isVercel()) {
    if (hasWorker) {
      console.info(`${logBase} strategy=worker (vercel)`);
      return tryWorker();
    }
    console.warn(`${logBase} worker_unset on vercel`);
    return {
      response: withAuditMeta(
        correlationId,
        'AUDIT_WORKER_UNSET',
        'AUDIT_WORKER_URL belum diset. Audit harus memakai remote worker di Vercel.'
      ),
      httpStatus: 503,
      meta: { correlationId, strategy: 'worker', runtime, platform }
    };
  }

  const strategyOverride = getStrategyOverride();
  console.info(`${logBase} strategy=${strategyOverride}`);

  if (strategyOverride === 'worker') {
    if (!hasWorker) {
      return {
        response: withAuditMeta(
          correlationId,
          'AUDIT_WORKER_UNSET',
          'AUDIT_WORKER_URL belum diset. Set URL worker atau gunakan strategy auto.'
        ),
        httpStatus: 503,
        meta: { correlationId, strategy: 'worker', runtime, platform }
      };
    }
    return tryWorker();
  }

  if (strategyOverride === 'chromium') {
    try {
      const result = await auditFromUrl.execute({
        url: payload.url,
        pageType: payload.page_type,
        optionalContext: payload.optional_context
      });

      return {
        response: {
          status: 'success',
          message: 'Audit berhasil dibuat.',
          data: {
            audit_id: result.auditId,
            result: result.result,
            image_url: result.imageUrl,
            model_used: result.modelUsed,
            latency_ms: result.latencyMs,
            created_at: result.createdAt
          }
        },
        httpStatus: 200,
        meta: { correlationId, strategy: 'chromium', runtime, platform }
      };
    } catch (error) {
      if (isChromiumUnavailableError(error)) {
        console.warn(`${logBase} chromium_unavailable code=${error.code}`);
        return {
          response: withAuditMeta(correlationId, 'CHROMIUM_UNAVAILABLE', error.message),
          httpStatus: 503,
          meta: { correlationId, strategy: 'chromium', runtime, platform }
        };
      }
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat audit.';
      return {
        response: withAuditMeta(correlationId, 'AUDIT_CHROMIUM_FAILED', message),
        httpStatus: 500,
        meta: { correlationId, strategy: 'chromium', runtime, platform }
      };
    }
  }

  try {
    const result = await auditFromUrl.execute({
      url: payload.url,
      pageType: payload.page_type,
      optionalContext: payload.optional_context
    });

    return {
      response: {
        status: 'success',
        message: 'Audit berhasil dibuat.',
        data: {
          audit_id: result.auditId,
          result: result.result,
          image_url: result.imageUrl,
          model_used: result.modelUsed,
          latency_ms: result.latencyMs,
          created_at: result.createdAt
        }
      },
      httpStatus: 200,
      meta: { correlationId, strategy: 'chromium', runtime, platform }
    };
  } catch (error) {
    if (isChromiumUnavailableError(error) || error instanceof ChromiumUnavailableError) {
      if (hasWorker) {
        console.warn(`${logBase} chromium_unavailable -> fallback to worker`);
        return tryWorker();
      }
      console.warn(`${logBase} chromium_unavailable code=${(error as ChromiumUnavailableError).code}`);
      return {
        response: withAuditMeta(
          correlationId,
          'CHROMIUM_UNAVAILABLE',
          (error as Error).message ??
            'Audit headless browser tidak tersedia di runtime ini. Set AUDIT_WORKER_URL.'
        ),
        httpStatus: 503,
        meta: { correlationId, strategy: 'chromium', runtime, platform }
      };
    }

    const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat audit.';
    return {
      response: withAuditMeta(correlationId, 'AUDIT_CHROMIUM_FAILED', message),
      httpStatus: 500,
      meta: { correlationId, strategy: 'chromium', runtime, platform }
    };
  }
}
