import { z } from 'zod';
import { checkRateLimit } from '@/shared/utils/rate-limit';
import { auditFromUrl } from '../composition';
import { jsonResponse } from '@/lib/api/response';
import { getRequestIp } from '@/lib/api/request';
import { PageTypeEnum } from '@/shared/validation/schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const auditUrlSchema = z.object({
  url: z.string().min(1),
  page_type: PageTypeEnum,
  optional_context: z.string().max(500).optional()
});

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
    const message = error instanceof Error ? error.message : 'An error occurred during audit.';
    const status = message.includes('not valid') || message.includes('Format') ? 400 : 500;
    return jsonResponse({ status: 'error', message }, { status });
  }
}
