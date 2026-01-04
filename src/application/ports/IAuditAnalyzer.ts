import type { AuditInput } from '@/domain/value-objects/audit-input';
import type { AuditReport } from '@/domain/entities/audit-report';

export interface IAuditAnalyzer {
  analyze(input: AuditInput): Promise<{ result: AuditReport; modelUsed: string }>;
}
