import { renderHtmlReport } from '@/lib/report';
import { supabaseServer } from '@/lib/supabaseServer';
import { AuditResultSchema } from '@/lib/schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
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

  const html = renderHtmlReport({
    result: parsed.data,
    id: data.id as string,
    pageType: data.page_type as string,
    imageUrl: data.image_url as string,
    modelUsed: data.model_used as string,
    createdAt: data.created_at as string
  });

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="uxaudit-${data.id}.html"`
    }
  });
}
