import type { AuditReport } from '@/domain/entities/audit-report';
import { normalizeAuditResult } from '@/application/usecases/analyzeFree';

export function getMockAudit(): AuditReport {
  return normalizeAuditResult(
    null,
    {
      seed: 'mock',
      pageType: 'Landing',
      image: { sizeBytes: 180000, type: 'image/png', width: 1200, height: 800 }
    },
    'full'
  );
}
