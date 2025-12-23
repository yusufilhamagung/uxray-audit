import { z } from 'zod';
import { checkRateLimit } from '@/shared/utils/rate-limit';
import { jsonResponse } from '@/lib/api/response';
import { getRequestIp } from '@/lib/api/request';
import { PageTypeEnum } from '@/shared/validation/schema';
import { runUrlAudit } from '@/server/audit/engine';

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

  const correlationId = request.headers.get('x-correlation-id');
  const engine = correlationId
    ? await runUrlAudit(parsed.data, correlationId)
    : await runUrlAudit(parsed.data);

  return jsonResponse(engine.response, {
    status: engine.httpStatus,
    headers: {
      'x-correlation-id': engine.meta.correlationId
    }
  });
}
