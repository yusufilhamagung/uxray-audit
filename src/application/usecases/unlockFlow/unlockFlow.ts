import { z } from 'zod';
import { getSupabaseServerClient } from '@/infrastructure/storage/supabase/server';
import { AuditResultSchema } from '@/domain/entities/audit-report';
import { normalizeAuditResult } from '@/application/usecases/analyzeFree';
import type { AuditReport } from '@/domain/entities/audit-report';
import { buildFullReportFromIssues } from './reportBuilder';

const buildFallbackResponse = (seed: string) => {
  const fallbackResult = normalizeAuditResult(
    null,
    {
      seed: seed || 'fallback',
      pageType: 'Landing',
      image: { sizeBytes: 180000, type: 'image/png', width: 1200, height: 800 }
    },
    'l3'
  );
  const now = new Date().toISOString();
  return {
    audit: {
      id: seed || 'fallback',
      created_at: now,
      page_type: 'Landing',
      image_url: '',
      ux_score: fallbackResult.ux_score,
      model_used: 'fallback',
      latency_ms: 0
    },
    result: {
      ...fallbackResult,
      full_report: buildFullReportFromIssues(fallbackResult.issues)
    },
    fallback: true
  };
};

export const unlockFlow = async (auditId?: string | null) => {
  const idParsed = z.string().uuid().safeParse(auditId);
  if (!idParsed.success) {
    return buildFallbackResponse(auditId ?? 'fallback');
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('audits')
    .select('*')
    .eq('id', idParsed.data)
    .single();

  if (error || !data) {
    return buildFallbackResponse(idParsed.data);
  }

  const resultJson = typeof data.result_json === 'string' ? JSON.parse(data.result_json) : data.result_json;
  const parsed = AuditResultSchema.safeParse(resultJson as AuditReport);

  if (!parsed.success || parsed.data.issues.length === 0) {
    return buildFallbackResponse(idParsed.data);
  }

  const normalizedResult: AuditReport = {
    ...parsed.data,
    full_report: buildFullReportFromIssues(parsed.data.issues)
  };

  return {
    audit: {
      id: data.id as string,
      created_at: data.created_at as string,
      page_type: data.page_type as string,
      image_url: data.image_url as string,
      ux_score: data.ux_score as number,
      model_used: data.model_used as string,
      latency_ms: data.latency_ms as number
    },
    result: normalizedResult,
    fallback: false
  };
};
