import { headers } from 'next/headers';
import { checkRateLimit } from '@/shared/utils/rate-limit';
import { auditFromUrl } from '../composition';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const headerList = headers();
  const ip = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const rate = checkRateLimit(ip);

  if (!rate.allowed) {
    return Response.json(
      { error: { message: 'Too many requests. Please try again later.' } },
      { status: 429 }
    );
  }

  const { url, page_type, optional_context } = await request.json();

  if (!url || typeof url !== 'string') {
    return Response.json(
      { error: { message: 'Please provide a valid URL.' } },
      { status: 400 }
    );
  }

  if (!page_type || typeof page_type !== 'string') {
     return Response.json(
      { error: { message: 'Please provide a page type.' } },
      { status: 400 }
    );
  }

  try {
    const result = await auditFromUrl.execute({
      url,
      pageType: page_type,
      optionalContext: optional_context
    });

    return Response.json({
      audit_id: result.auditId,
      result: result.result,
      image_url: result.imageUrl,
      model_used: result.modelUsed,
      latency_ms: result.latencyMs,
      created_at: result.createdAt
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred during audit.';
    const status = message.includes('not valid') || message.includes('Format') ? 400 : 500;
    return Response.json({ error: { message } }, { status });
  }
}
