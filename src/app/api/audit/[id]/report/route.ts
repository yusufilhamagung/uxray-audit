import { z } from 'zod';
import { renderHtmlReport } from '@/domain/services/report';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { AuditResultSchema } from '@/shared/validation/schema';
import { jsonResponse } from '@/lib/api/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const idParsed = z.string().uuid().safeParse(params.id);
  if (!idParsed.success) {
    return jsonResponse(
      { status: 'error', message: 'Audit ID tidak valid.' },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('audits')
    .select('*')
    .eq('id', idParsed.data)
    .single();

  if (error || !data) {
    return jsonResponse(
      { status: 'error', message: 'Audit tidak ditemukan.' },
      { status: 404 }
    );
  }

  const resultJson = typeof data.result_json === 'string' ? JSON.parse(data.result_json) : data.result_json;
  const parsed = AuditResultSchema.safeParse(resultJson);

  if (!parsed.success) {
    return jsonResponse(
      { status: 'error', message: 'Data audit tersimpan rusak.' },
      { status: 500 }
    );
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
