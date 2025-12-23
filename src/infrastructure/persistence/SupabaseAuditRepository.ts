import { IAuditRepository, AuditEntity } from '@/application/ports/IAuditRepository';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export class SupabaseAuditRepository implements IAuditRepository {
  async save(audit: Omit<AuditEntity, 'created_at'>): Promise<AuditEntity> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('audits')
      .insert({
        id: audit.id,
        page_type: audit.page_type,
        image_url: audit.image_url,
        ux_score: audit.ux_score,
        result_json: audit.result_json,
        model_used: audit.model_used,
        latency_ms: audit.latency_ms
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error('Failed to save audit: ' + error?.message);
    }

    return data as AuditEntity;
  }

  async findById(id: string): Promise<AuditEntity | null> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as AuditEntity;
  }
}
