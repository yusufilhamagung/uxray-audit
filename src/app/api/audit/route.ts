import { headers } from 'next/headers';
import { checkRateLimit } from '@/shared/utils/rate-limit';
import { auditFromImage } from './composition';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const headerList = headers();
  const ip = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const rate = checkRateLimit(ip);

  if (!rate.allowed) {
    return Response.json(
      {
        error: {
          message: 'Terlalu banyak permintaan. Coba lagi setelah 1 jam.'
        }
      },
      { status: 429 }
    );
  }

  const formData = await request.formData();
  const file = formData.get('image');
  const pageType = formData.get('page_type');
  const optionalContext = formData.get('optional_context');

  if (!file || !(file instanceof File)) {
    return Response.json(
      { error: { message: 'Mohon unggah screenshot PNG atau JPG.' } },
      { status: 400 }
    );
  }

  if (!pageType || typeof pageType !== 'string') {
    return Response.json(
      { error: { message: 'Mohon pilih tipe halaman.' } },
      { status: 400 }
    );
  }

  try {
    const result = await auditFromImage.execute({
      file,
      pageType,
      optionalContext: typeof optionalContext === 'string' ? optionalContext : undefined
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
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses audit.';
    const status = message.includes('tidak valid') || message.includes('Format') || message.includes('Ukuran')
      ? 400
      : 500;

    return Response.json({ error: { message } }, { status });
  }
}
