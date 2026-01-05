import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { checkRateLimit } from '@/shared/utils/rate-limit';
import { generateAudit } from './composition';
import { jsonResponse } from '@/shared/utils/response';
import { normalizeAuditResult } from '@/application/usecases/analyzeFree';
import { getRequestIp } from '@/shared/utils/request';
import { PageTypeEnum } from '@/domain/entities/audit-report';
import { AccessLevelEnum } from '@/domain/value-objects/access-level';
import { getAuditLockState } from '@/domain/rules/access-gating';
import { serverEnv } from '@/infrastructure/env/server';
import { selectScenarioByFilename } from '@/domain/demo/demoSelection';
import { buildDemoAuditPayload } from '@/domain/demo/demoAudit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const auditFormSchema = z.object({
  pageType: PageTypeEnum,
  optionalContext: z.string().max(500).optional(),
  accessLevel: AccessLevelEnum.optional()
});

const isClientError = (message: string) =>
  message.includes('Page type is invalid') ||
  message.includes('Unsupported file format') ||
  message.includes('File is too large') ||
  message.includes('Screenshot is required');

export async function POST(request: Request) {
  const ip = getRequestIp();
  const rate = checkRateLimit(ip);

  if (!rate.allowed) {
    return jsonResponse(
      {
        status: 'error',
        message: 'Too many requests. Try again in 1 hour.'
      },
      { status: 429 }
    );
  }

  const formData = await request.formData();
  const file = formData.get('image');
  const pageType = formData.get('page_type');
  const optionalContext = formData.get('optional_context');
  const accessLevel = formData.get('access_level');

  if (!file || !(file instanceof File)) {
    return jsonResponse(
      { status: 'error', message: 'Please upload a PNG or JPG screenshot.' },
      { status: 400 }
    );
  }

  const parsed = auditFormSchema.safeParse({
    pageType,
    optionalContext: typeof optionalContext === 'string' ? optionalContext : undefined,
    accessLevel: typeof accessLevel === 'string' ? accessLevel : undefined
  });

  if (!parsed.success) {
    return jsonResponse(
      { status: 'error', message: 'Page type is required.' },
      { status: 400 }
    );
  }

  const resolvedAccessLevel = parsed.data.accessLevel ?? 'free';

  if (serverEnv.demoMode) {
    const scenario = selectScenarioByFilename(file.name);
    const demoPayload = buildDemoAuditPayload(scenario, resolvedAccessLevel, '');
    return jsonResponse(
      {
        status: 'success',
        message: 'Audit created.',
        data: demoPayload
      },
      { status: 200 }
    );
  }

  try {
    const result = await generateAudit.execute({
      input: {
        type: 'image',
        file,
        pageType: parsed.data.pageType,
        context: parsed.data.optionalContext
      },
      accessLevel: resolvedAccessLevel
    });

    return jsonResponse(
      {
        status: 'success',
        message: 'Audit created.',
        data: {
          audit_id: result.auditId,
          result: result.result,
          image_url: result.imageUrl,
          model_used: result.modelUsed,
          latency_ms: result.latencyMs,
          created_at: result.createdAt,
          lock_state: result.lockState
        }
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Something went wrong while running the audit.';

    if (isClientError(message)) {
      return jsonResponse({ status: 'error', message }, { status: 400 });
    }

    const fallbackId = randomUUID();
    const fallbackResult = normalizeAuditResult(
      null,
      {
        seed: fallbackId,
        pageType: 'Landing',
        image: { sizeBytes: 180000, type: 'image/png', width: 1200, height: 800 }
      },
      'l3'
    );

    return jsonResponse(
      {
        status: 'success',
        message: 'Audit created.',
        data: {
          audit_id: fallbackId,
          result: fallbackResult,
          image_url: '',
          model_used: 'fallback',
          latency_ms: 0,
          created_at: new Date().toISOString(),
          lock_state: getAuditLockState(resolvedAccessLevel)
        }
      },
      { status: 200 }
    );
  }
}
