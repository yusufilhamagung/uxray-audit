import { z } from 'zod';
import { checkRateLimit } from '@/shared/utils/rate-limit';
import { auditFromImage } from './composition';
import { jsonResponse } from '@/lib/api/response';
import { getRequestIp } from '@/lib/api/request';
import { PageTypeEnum } from '@/shared/validation/schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const auditFormSchema = z.object({
  pageType: PageTypeEnum,
  optionalContext: z.string().max(500).optional()
});

export async function POST(request: Request) {
  const ip = getRequestIp();
  const rate = checkRateLimit(ip);

  if (!rate.allowed) {
    return jsonResponse(
      {
        status: 'error',
        message: 'Terlalu banyak permintaan. Coba lagi setelah 1 jam.'
      },
      { status: 429 }
    );
  }

  const formData = await request.formData();
  const file = formData.get('image');
  const pageType = formData.get('page_type');
  const optionalContext = formData.get('optional_context');

  if (!file || !(file instanceof File)) {
    return jsonResponse(
      { status: 'error', message: 'Mohon unggah screenshot PNG atau JPG.' },
      { status: 400 }
    );
  }

  const parsed = auditFormSchema.safeParse({
    pageType,
    optionalContext: typeof optionalContext === 'string' ? optionalContext : undefined
  });

  if (!parsed.success) {
    return jsonResponse(
      { status: 'error', message: 'Mohon pilih tipe halaman.' },
      { status: 400 }
    );
  }

  try {
    const result = await auditFromImage.execute({
      file,
      pageType: parsed.data.pageType,
      optionalContext: parsed.data.optionalContext
    });

    return jsonResponse(
      {
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
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses audit.';
    const status = message.includes('tidak valid') || message.includes('Format') || message.includes('Ukuran')
      ? 400
      : 500;

    return jsonResponse(
      { status: 'error', message },
      { status }
    );
  }
}
