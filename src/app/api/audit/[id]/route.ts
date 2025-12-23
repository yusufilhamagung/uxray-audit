import { AuditResultSchema } from '@/shared/validation/schema';
import { supabaseServer } from '@/infrastructure/storage/supabaseServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { data, error } = await supabaseServer
    .from('audits')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !data) {
    return Response.json({ error: { message: 'Audit tidak ditemukan.' } }, { status: 404 });
  }

  const resultJson = typeof data.result_json === 'string' ? JSON.parse(data.result_json) : data.result_json;
  const parsed = AuditResultSchema.safeParse(resultJson);

  if (!parsed.success) {
    return Response.json({ error: { message: 'Data audit tersimpan rusak.' } }, { status: 500 });
  }

  const payload = {
    id: data.id,
    created_at: data.created_at,
    page_type: data.page_type,
    image_url: data.image_url,
    ux_score: data.ux_score,
    model_used: data.model_used,
    latency_ms: data.latency_ms,
    result: parsed.data
  };

  const url = new URL(request.url);
  const download = url.searchParams.get('download') === '1';

  const headers = new Headers({
    'Content-Type': 'application/json'
  });

  if (download) {
    headers.set('Content-Disposition', `attachment; filename="uxaudit-${data.id}.json"`);
  }

  return new Response(JSON.stringify(payload, null, 2), { headers });
}
