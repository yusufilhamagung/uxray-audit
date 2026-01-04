import { randomUUID } from 'node:crypto';
import type { ApiResponse } from '@/shared/types/api';
import { generateAudit } from '@/app/api/audit/composition';
import { serverEnv } from '@/infrastructure/env/server';
import { isChromiumUnavailableError, ChromiumUnavailableError } from '@/infrastructure/audit/chromium';
import { runWorkerAudit } from '@/infrastructure/audit/workerClient';
import type { AccessLevel } from '@/domain/value-objects/access-level';
import type { PageType } from '@/domain/entities/audit-report';
import { getAuditLockState, type AuditLockState } from '@/domain/rules/access-gating';

type AuditUrlPayload = {
  url: string;
  page_type: PageType;
  optional_context?: string;
  access_level?: AccessLevel;
};

type AuditResultData = {
  audit_id: string;
  result: unknown;
  image_url: string;
  model_used: string;
  latency_ms: number;
  created_at: string;
  lock_state?: AuditLockState;
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

const resolveAccessLevel = (payload: AuditUrlPayload): AccessLevel => payload.access_level ?? 'free';

const attachLockState = (data: AuditResultData, lockState: AuditLockState): AuditResultData => ({
  ...data,
  lock_state: lockState
});

export async function runUrlAudit(
  payload: AuditUrlPayload,
  correlationId: string = randomUUID()
): Promise<EngineResponse> {
  const runtime = getRuntimeLabel();
  const platform = getPlatformLabel();
  const hasWorker = Boolean(serverEnv.auditWorkerUrl);
  const accessLevel = resolveAccessLevel(payload);
  const lockState = getAuditLockState(accessLevel);

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
      const response = worker.data as ApiResponse<AuditResultData>;
      if (response.data && typeof response.data === 'object') {
        response.data = attachLockState(response.data, lockState);
      }
      return {
        response,
        httpStatus: worker.status,
        meta: { correlationId, strategy: 'worker', runtime, platform }
      };
    }

    return {
      response: {
        status: 'success',
        message: 'Audit berhasil dibuat.',
        data: attachLockState(worker.data as AuditResultData, lockState)
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
      const result = await generateAudit.execute({
        input: {
          type: 'url',
          url: payload.url,
          pageType: payload.page_type,
          context: payload.optional_context
        },
        accessLevel
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
            created_at: result.createdAt,
            lock_state: result.lockState
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
    const result = await generateAudit.execute({
      input: {
        type: 'url',
        url: payload.url,
        pageType: payload.page_type,
        context: payload.optional_context
      },
      accessLevel
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
          created_at: result.createdAt,
          lock_state: result.lockState
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
