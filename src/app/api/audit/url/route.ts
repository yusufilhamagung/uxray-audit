import { z } from 'zod';
import { checkRateLimit } from '@/shared/utils/rate-limit';
import { jsonResponse } from '@/shared/utils/response';
import { getRequestIp } from '@/shared/utils/request';
import { PageTypeEnum } from '@/domain/entities/audit-report';
import { AccessLevelEnum } from '@/domain/value-objects/access-level';
import { runUrlAudit } from '@/infrastructure/audit/engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const auditUrlSchema = z.object({
  url: z.string().url().refine((value) => value.startsWith('http://') || value.startsWith('https://'), {
    message: 'URL must start with http or https.'
  }),
  page_type: PageTypeEnum,
  optional_context: z.string().max(500).optional(),
  access_level: AccessLevelEnum.optional()
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
