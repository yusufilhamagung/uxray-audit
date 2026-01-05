import { unlockFlow } from '@/application/usecases/unlockFlow';
import { renderHtmlReport } from '@/presentation/reporting/renderHtmlReport';
import { serverEnv } from '@/infrastructure/env/server';
import { AccessLevelEnum } from '@/domain/value-objects/access-level';
import { getDemoScenarioById } from '@/domain/demo/demoScenarios';
import { buildDemoAuditPayload } from '@/domain/demo/demoAudit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  if (serverEnv.demoMode) {
    const url = new URL(request.url);
    const accessParam = url.searchParams.get('access_level') ?? url.searchParams.get('access');
    const accessParsed = AccessLevelEnum.safeParse(accessParam);
    const accessLevel = accessParsed.success ? accessParsed.data : 'free';
    const scenario = getDemoScenarioById(params.id);
    const demoPayload = buildDemoAuditPayload(scenario, accessLevel, '');

    const html = renderHtmlReport({
      result: demoPayload.result,
      id: demoPayload.audit_id,
      pageType: scenario.title,
      imageUrl: demoPayload.image_url,
      modelUsed: demoPayload.model_used,
      createdAt: demoPayload.created_at
    });

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="uxray-${demoPayload.audit_id}.html"`
      }
    });
  }

  const { audit, result } = await unlockFlow(params.id);

  const html = renderHtmlReport({
    result,
    id: audit.id,
    pageType: audit.page_type,
    imageUrl: audit.image_url,
    modelUsed: audit.model_used,
    createdAt: audit.created_at
  });

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="uxray-${audit.id}.html"`
    }
  });
}
