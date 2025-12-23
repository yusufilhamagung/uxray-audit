import { serverEnv } from '@/lib/env/server';

type WorkerPayload = {
  url: string;
  page_type: string;
  optional_context?: string;
  correlation_id?: string;
};

type WorkerResponse = {
  ok: boolean;
  status: number;
  data?: unknown;
  error?: string;
};

const WORKER_TIMEOUT_MS = 60_000;

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function runWorkerAudit(payload: WorkerPayload, retry = 1): Promise<WorkerResponse> {
  const workerUrl = serverEnv.auditWorkerUrl;
  if (!workerUrl) {
    return {
      ok: false,
      status: 503,
      error: 'AUDIT_WORKER_UNSET'
    };
  }

  const attempt = async (): Promise<WorkerResponse> => {
    const response = await fetchWithTimeout(
      workerUrl,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      },
      WORKER_TIMEOUT_MS
    );

    const data = await response.json().catch(() => null);
    return {
      ok: response.ok,
      status: response.status,
      data
    };
  };

  try {
    return await attempt();
  } catch (error) {
    if (retry > 0) {
      return runWorkerAudit(payload, retry - 1);
    }
    return {
      ok: false,
      status: 502,
      error: error instanceof Error ? error.message : 'AUDIT_WORKER_FAILED'
    };
  }
}
