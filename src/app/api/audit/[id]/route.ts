import { unlockFlow } from '@/application/usecases/unlockFlow';
import { jsonResponse } from '@/shared/utils/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
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
