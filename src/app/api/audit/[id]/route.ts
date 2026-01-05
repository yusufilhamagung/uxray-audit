import { unlockFlow } from '@/application/usecases/unlockFlow';
import { jsonResponse } from '@/shared/utils/response';
import { serverEnv } from '@/infrastructure/env/server';
import { AccessLevelEnum } from '@/domain/value-objects/access-level';
import { getDemoScenarioById } from '@/domain/demo/demoScenarios';
import { buildDemoAuditPayload } from '@/domain/demo/demoAudit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const resolveDemoPageType = (scenarioId: string) => {
  if (scenarioId.includes('dashboard')) return 'Dashboard';
  if (scenarioId.includes('checkout')) return 'App';
  return 'Landing';
};

export async function GET(request: Request, { params }: { params: { id: string } }) {
  if (serverEnv.demoMode) {
    const url = new URL(request.url);
    const accessParam = url.searchParams.get('access_level') ?? url.searchParams.get('access');
    const accessParsed = AccessLevelEnum.safeParse(accessParam);
    const accessLevel = accessParsed.success ? accessParsed.data : 'free';
    const scenario = getDemoScenarioById(params.id);
    const demoPayload = buildDemoAuditPayload(scenario, accessLevel, '');

    const payload = {
      id: demoPayload.audit_id,
      created_at: demoPayload.created_at,
      page_type: resolveDemoPageType(scenario.id),
      image_url: demoPayload.image_url,
      ux_score: demoPayload.result.ux_score,
      model_used: demoPayload.model_used,
      latency_ms: demoPayload.latency_ms,
      result: demoPayload.result
    };

    const downloadUrl = new URL(request.url);
    const download = downloadUrl.searchParams.get('download') === '1';

    const headers = new Headers({
      'Content-Type': 'application/json'
    });

    if (download) {
      headers.set('Content-Disposition', `attachment; filename="uxray-${payload.id}.json"`);
      return new Response(JSON.stringify(payload, null, 2), { headers });
    }

    return jsonResponse(
      { status: 'success', message: 'Audit loaded.', data: payload },
      { headers }
    );
  }

  const { audit, result } = await unlockFlow(params.id);

  const payload = {
    id: audit.id,
    created_at: audit.created_at,
    page_type: audit.page_type,
    image_url: audit.image_url,
    ux_score: audit.ux_score,
    model_used: audit.model_used,
    latency_ms: audit.latency_ms,
    result
  };

  const url = new URL(request.url);
  const download = url.searchParams.get('download') === '1';

  const headers = new Headers({
    'Content-Type': 'application/json'
  });

  if (download) {
    headers.set('Content-Disposition', `attachment; filename="uxray-${payload.id}.json"`);
    return new Response(JSON.stringify(payload, null, 2), { headers });
  }

  return jsonResponse(
    { status: 'success', message: 'Audit loaded.', data: payload },
    { headers }
  );
}
