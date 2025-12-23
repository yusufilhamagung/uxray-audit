import { z } from 'zod';
import { checkRateLimit } from '@/shared/utils/rate-limit';
import { auditFromUrl } from '../composition';
import { jsonResponse } from '@/lib/api/response';
import { getRequestIp } from '@/lib/api/request';
import { PageTypeEnum } from '@/shared/validation/schema';
import { serverEnv } from '@/lib/env/server';
import { isChromiumUnavailableError } from '@/server/chromium/launch';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const auditUrlSchema = z.object({
  url: z.string().min(1),
  page_type: PageTypeEnum,
  optional_context: z.string().max(500).optional()
});

const isApiResponse = (value: unknown): value is { status: string; message: string; data?: unknown } =>
  typeof value === 'object' &&
  value !== null &&
  'status' in value &&
  'message' in value &&
  typeof (value as { status?: unknown }).status === 'string' &&
  typeof (value as { message?: unknown }).message === 'string';

async function callRemoteWorker(payload: z.infer<typeof auditUrlSchema>) {
  if (!serverEnv.auditWorkerUrl) {
    return null;
  }

  const response = await fetch(serverEnv.auditWorkerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => null);
  return { response, data };
}

export async function POST(request: Request) {
  const ip = getRequestIp();
  const rate = checkRateLimit(ip);

  if (!rate.allowed) {
    return jsonResponse(
      { status: 'error', message: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = auditUrlSchema.safeParse(body);

  if (!parsed.success) {
    return jsonResponse(
      { status: 'error', message: 'Please provide a valid URL and page type.' },
      { status: 400 }
    );
  }

  try {
    const result = await auditFromUrl.execute({
      url: parsed.data.url,
      pageType: parsed.data.page_type,
      optionalContext: parsed.data.optional_context
    });

    return jsonResponse({
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
    });
  } catch (error) {
    if (isChromiumUnavailableError(error)) {
      const workerResult = await callRemoteWorker(parsed.data);
      if (workerResult?.response) {
        const status = workerResult.response.status;
        if (isApiResponse(workerResult.data)) {
          return jsonResponse(workerResult.data, { status });
        }
        if (workerResult.data && typeof workerResult.data === 'object') {
          return jsonResponse(
            {
              status: 'success',
              message: 'Audit berhasil dibuat.',
              data: workerResult.data
            },
            { status }
          );
        }
        return jsonResponse(
          { status: 'error', message: 'Remote worker tidak mengembalikan data.' },
          { status: 502 }
        );
      }

      return jsonResponse(
        {
          status: 'error',
          message:
            error.message ||
            'Audit headless browser tidak tersedia di runtime ini. Set AUDIT_WORKER_URL atau gunakan Node.js runtime.'
        },
        { status: 503 }
      );
    }

    const message = error instanceof Error ? error.message : 'An error occurred during audit.';
    const status = message.includes('not valid') || message.includes('Format') ? 400 : 500;
    return jsonResponse({ status: 'error', message }, { status });
  }
}
