import { z } from 'zod';
import { jsonResponse } from '@/shared/utils/response';
import { systemPromptPro, userPromptPro } from '@/config/prompts';
import { buildProFallback, validateProAnalysis } from '@/domain/validators/uxray';
import { PageTypeEnum } from '@/domain/types/uxray';
import {
  GeminiOutputError,
  GeminiRequestError,
  GeminiTimeoutError,
  requestGeminiContent
} from '@/infrastructure/ai/uxrayGemini';
import { findAuditById } from '@/infrastructure/audit/uxrayAuditStore';
import { loadImageBase64 } from '@/infrastructure/audit/loadImage';
import { verifyUnlock } from '@/infrastructure/waitlist/waitlistStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const payloadSchema = z.object({
  auditId: z.string().uuid(),
  auditUnlockId: z.string().uuid(),
  pageType: PageTypeEnum.optional()
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);

  if (!parsed.success) {
    return jsonResponse(
      { status: 'error', message: 'Invalid unlock payload.' },
      { status: 400 }
    );
  }

  const { auditId, auditUnlockId } = parsed.data;
  const isValidUnlock = await verifyUnlock({ auditId, unlockId: auditUnlockId });
  if (!isValidUnlock) {
    return jsonResponse(
      { status: 'error', message: 'Unlock token is invalid.' },
      { status: 403 }
    );
  }

  const record = await findAuditById(auditId);
  if (!record) {
    const fallback = buildProFallback('l3', parsed.data.pageType ?? 'landing');
    return jsonResponse(
      {
        status: 'success',
        message: 'Audit not found. Showing fallback.',
        data: {
          audit_id: auditId,
          result: fallback,
          model_used: 'fallback',
          latency_ms: 0
        }
      },
      { status: 200 }
    );
  }

  const resolvedPageType = parsed.data.pageType ?? record.page_type ?? 'landing';

  const prompt = userPromptPro({
    pageType: resolvedPageType
  });

  console.info('[audit/pro] prompt', {
    system: systemPromptPro.slice(0, 160),
    user: prompt.slice(0, 160)
  });

  let result = buildProFallback('l1', resolvedPageType);
  let modelUsed = 'fallback';
  let latencyMs = 0;

  try {
    const image = await loadImageBase64({
      imageUrl: record.image_url,
      imageType: record.image_type,
      imagePath: record.image_path
    });

    const gemini = await requestGeminiContent({
      systemPrompt: systemPromptPro,
      userPrompt: prompt,
      imageBase64: image.base64,
      imageType: image.mimeType
    });

    modelUsed = gemini.modelUsed;
    latencyMs = gemini.latencyMs;

    const validated = validateProAnalysis(gemini.text, resolvedPageType);
    if (!validated.success) {
      console.warn('[audit/pro] validation failed', validated.error);
      result = buildProFallback('l1', resolvedPageType);
    } else {
      result = { analysis_state: 'full', ...validated.data };
    }
  } catch (error) {
    if (error instanceof GeminiOutputError) {
      result = buildProFallback('l1', resolvedPageType);
    } else if (error instanceof GeminiTimeoutError || error instanceof GeminiRequestError) {
      result = buildProFallback('l2', resolvedPageType);
    } else {
      result = buildProFallback('l3', resolvedPageType);
    }
  }

  return jsonResponse(
    {
      status: 'success',
      message: 'Full report ready.',
      data: {
        audit_id: auditId,
        result,
        model_used: modelUsed,
        latency_ms: latencyMs
      }
    },
    { status: 200 }
  );
}
