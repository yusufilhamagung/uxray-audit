import { IAuditAnalyzer } from '@/application/ports/IAuditAnalyzer';
import { getMockAudit } from './mock';
import type { AuditInput } from '@/domain/value-objects/audit-input';

export class MockAuditAnalyzer implements IAuditAnalyzer {
  async analyze(_input: AuditInput): Promise<{ result: ReturnType<typeof getMockAudit>; modelUsed: string }> {
    return {
      result: getMockAudit(),
      modelUsed: 'mock'
    };
  }
}
