import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { jsonResponse } from '@/shared/utils/response';
import { PageTypeEnum, type PageType } from '@/domain/types/uxray';
import { buildFreeFallback, validateFreeAnalysis } from '@/domain/validators/uxray';
import { generateFreeAuditResult } from '@/domain/issueSelection';
import { systemPromptFree, userPromptFree } from '@/config/prompts';
import {
  GeminiOutputError,
  GeminiRequestError,
  GeminiTimeoutError,
  requestGeminiContent
} from '@/infrastructure/ai/uxrayGemini';
import { SupabaseFileStorage } from '@/infrastructure/storage/SupabaseFileStorage';
import { saveAuditRecord, findAuditById } from '@/infrastructure/audit/uxrayAuditStore';
import { PuppeteerCaptureService } from '@/infrastructure/fetchers/PuppeteerCaptureService';
import { UrlFetcher } from '@/infrastructure/fetchers/urlFetcher';
import { isValidUnlockId } from '@/infrastructure/waitlist/waitlistStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg']);

const jsonPayloadSchema = z.object({
  image_base64: z.string().optional(),
  image_type: z.string().optional(),
  url: z.string().url().optional(),
  page_type: PageTypeEnum.optional(),
  optional_context: z.string().max(500).optional(),
  early_access_unlock_id: z.string().uuid().optional()
});

const getPageType = (pageType: unknown): PageType | null => {
  if (!pageType) return 'landing';
  const parsed = PageTypeEnum.safeParse(pageType);
  return parsed.success ? parsed.data : null;
};

const resolveImagePayload = async (request: Request) => {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const file = formData.get('image');
    const url = formData.get('url');
    const pageType = formData.get('page_type');
    const optionalContext = formData.get('optional_context');
    const earlyAccessUnlockId = formData.get('early_access_unlock_id');

    if (file instanceof File) {
      if (!ALLOWED_TYPES.has(file.type)) {
        return { error: 'Unsupported file format. Use PNG or JPG.' };
      }
      if (file.size > MAX_FILE_SIZE) {
        return { error: 'File is too large. Max 5MB.' };
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      return {
        buffer,
        imageType: file.type,
        pageType,
        optionalContext: typeof optionalContext === 'string' ? optionalContext : undefined,
        sourceUrl: null,
        earlyAccessUnlockId: typeof earlyAccessUnlockId === 'string' ? earlyAccessUnlockId : undefined
      };
    }

    if (typeof url === 'string' && url.trim()) {
      return {
        buffer: null,
        imageType: 'image/png',
        pageType,
        optionalContext: typeof optionalContext === 'string' ? optionalContext : undefined,
        sourceUrl: url.trim(),
        earlyAccessUnlockId: typeof earlyAccessUnlockId === 'string' ? earlyAccessUnlockId : undefined
      };
    }

    return { error: 'Screenshot or URL is required.' };
  }

  const body = await request.json().catch(() => null);
  const parsed = jsonPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return { error: 'Invalid payload.' };
  }

  if (parsed.data.image_base64 && parsed.data.image_type) {
    const buffer = Buffer.from(parsed.data.image_base64, 'base64');
    return {
      buffer,
      imageType: parsed.data.image_type,
      pageType: parsed.data.page_type,
      optionalContext: parsed.data.optional_context,
      sourceUrl: parsed.data.url ?? null,
      earlyAccessUnlockId: parsed.data.early_access_unlock_id
    };
  }

  if (parsed.data.url) {
    return {
      buffer: null,
      imageType: 'image/png',
      pageType: parsed.data.page_type,
      optionalContext: parsed.data.optional_context,
      sourceUrl: parsed.data.url,
      earlyAccessUnlockId: parsed.data.early_access_unlock_id
    };
  }

  return { error: 'Screenshot or URL is required.' };
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return jsonResponse(
      { status: 'error', message: 'Missing audit id.' },
      { status: 400 }
    );
  }

  const record = await findAuditById(id);
  if (!record) {
    return jsonResponse(
      { status: 'error', message: 'Audit not found.' },
      { status: 404 }
    );
  }

  return jsonResponse(
    {
      status: 'success',
      message: 'Audit loaded.',
      data: {
        audit_id: record.id,
        result: record.free_result,
        image_url: record.image_url,
        model_used: record.model_used,
        latency_ms: record.latency_ms,
        created_at: record.created_at,
        page_type: record.page_type
      }
    },
    { status: 200 }
  );
}

export async function POST(request: Request) {
  const payload = await resolveImagePayload(request);

  if ('error' in payload) {
    return jsonResponse(
      { status: 'error', message: payload.error ?? 'Invalid payload.' },
      { status: 400 }
    );
  }

  const resolvedPageType = getPageType(payload.pageType);
  if (!resolvedPageType) {
    return jsonResponse(
      { status: 'error', message: 'Page type is required.' },
      { status: 400 }
    );
  }

  let buffer: Buffer | null = payload.buffer ?? null;
  let urlContext: string | null = null;
  if (!buffer && payload.sourceUrl) {
    const captureService = new PuppeteerCaptureService();
    const urlFetcher = new UrlFetcher();
    try {
      const [captured, context] = await Promise.all([
        captureService.capture(payload.sourceUrl),
        urlFetcher.fetchContext(payload.sourceUrl)
      ]);
      buffer = Buffer.from(captured);
      urlContext = context;
    } catch (error) {
      console.error('URL capture failed', error);
      const fallback = buildFreeFallback('l3', resolvedPageType);
      return jsonResponse(
        {
          status: 'success',
          message: 'Audit created.',
          data: {
            audit_id: randomUUID(),
            result: fallback,
            image_url: '',
            model_used: 'fallback',
            latency_ms: 0,
            created_at: new Date().toISOString(),
            page_type: resolvedPageType
          }
        },
        { status: 200 }
      );
    }
  }

  if (!buffer) {
    return jsonResponse(
      { status: 'error', message: 'Screenshot or URL is required.' },
      { status: 400 }
    );
  }

  const auditId = randomUUID();
  const ext = payload.imageType === 'image/png' ? 'png' : 'jpg';
  const dateFolder = new Date().toISOString().slice(0, 10);
  const filePath = `audits/${dateFolder}/${auditId}.${ext}`;
  const storage = new SupabaseFileStorage();
  const imageUrl = await storage.upload(filePath, buffer, payload.imageType);
  const imagePath = filePath;

  const combinedContext = [payload.optionalContext?.trim(), urlContext?.trim()]
    .filter(Boolean)
    .join('\n');

  // Check if early access unlock is valid
  let hasEarlyAccessProIssues = false;
  if (payload.earlyAccessUnlockId) {
    const isValid = await isValidUnlockId(payload.earlyAccessUnlockId);
    hasEarlyAccessProIssues = isValid;
  }

  const prompt = userPromptFree({
    pageType: resolvedPageType,
    includePaidIssues: hasEarlyAccessProIssues
  });

  console.info('[audit/free] prompt', {
    system: systemPromptFree.slice(0, 160),
    user: prompt.slice(0, 160)
  });

  let result = buildFreeFallback('l1', resolvedPageType);
  let modelUsed = 'fallback';
  let latencyMs = 0;
  // DEMO MODE: Use random issue selection instead of AI
  const demoResult = generateFreeAuditResult(resolvedPageType, hasEarlyAccessProIssues);
  result = convertDemoResultToFreeResult(demoResult);
  modelUsed = 'demo-random-selection';
  latencyMs = Math.floor(Math.random() * 200) + 100; // Simulated latency 100-300ms

  /* COMMENTED OUT: Original Gemini AI call
  try {
    const gemini = await requestGeminiContent({
      systemPrompt: systemPromptFree,
      userPrompt: prompt,
      imageBase64: buffer.toString('base64'),
      imageType: payload.imageType
    });

    modelUsed = gemini.modelUsed;
    latencyMs = gemini.latencyMs;

    const validated = validateFreeAnalysis(gemini.text, resolvedPageType);
    if (!validated.success) {
      console.warn('[audit/free] validation failed', validated.error);
      result = buildFreeFallback('l1', resolvedPageType);
    } else {
      result = { analysis_state: 'full', ...validated.data };
    }
  } catch (error) {
    if (error instanceof GeminiOutputError) {
      result = buildFreeFallback('l1', resolvedPageType);
    } else if (error instanceof GeminiTimeoutError || error instanceof GeminiRequestError) {
      result = buildFreeFallback('l2', resolvedPageType);
    } else {
      result = buildFreeFallback('l3', resolvedPageType);
    }
  }
  */

  const createdAt = new Date().toISOString();
  await saveAuditRecord({
    id: auditId,
    created_at: createdAt,
    page_type: resolvedPageType,
    optional_context: combinedContext || undefined,
    image_url: imageUrl,
    image_type: payload.imageType,
    image_path: imagePath,
    free_result: result,
    model_used: modelUsed,
    latency_ms: latencyMs
  });

  return jsonResponse(
    {
      status: 'success',
      message: 'Audit created.',
      data: {
        audit_id: auditId,
        result,
        image_url: imageUrl,
        model_used: modelUsed,
        latency_ms: latencyMs,
        created_at: createdAt,
        page_type: resolvedPageType
      }
    },
    { status: 200 }
  );
}

// Helper function to convert demo selection result to FreeAuditResult format
const convertDemoResultToFreeResult = (demoResult: ReturnType<typeof generateFreeAuditResult>) => {
  const getImpact = (issue: typeof demoResult.issues[0]): 'Conversion' | 'Clarity' | 'Trust' => {
    switch (issue.category) {
      case 'Conversion & Flow':
        return 'Conversion';
      case 'Clarity & Messaging':
        return 'Clarity';
      case 'Trust & Credibility':
        return 'Trust';
      case 'Retention & Reusability':
        return 'Conversion';
      default:
        return 'Clarity';
    }
  };

  return {
    analysis_state: 'full' as const,
    ux_score: demoResult.uxScore,
    issues: demoResult.issues.map(issue => ({
      title: issue.title,
      why_it_hurts: issue.description,
      impact: getImpact(issue)
    })),
    why_this_matters: demoResult.issues[0]?.why_it_matters ?? 'User perlu memahami value utama sebelum memutuskan untuk lanjut.'
  };
};
