import mockAudit from '@/fixtures/mock-audit.json';
import type { AuditResult } from './schema';

export function getMockAudit(): AuditResult {
  return JSON.parse(JSON.stringify(mockAudit)) as AuditResult;
}
