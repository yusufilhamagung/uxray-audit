import { AuditResult } from '@/shared/validation/schema';

export interface AuditEntity {
  id: string;
  page_type: string;
  image_url: string;
  ux_score: number;
  result_json: AuditResult;
  model_used: string;
  latency_ms: number;
  created_at: string;
}

export interface IAuditRepository {
  save(audit: Omit<AuditEntity, 'created_at'>): Promise<AuditEntity>;
  findById(id: string): Promise<AuditEntity | null>;
}
