import { unlockFlow } from '@/application/usecases/unlockFlow';
import { renderHtmlReport } from '@/presentation/reporting/renderHtmlReport';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
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
