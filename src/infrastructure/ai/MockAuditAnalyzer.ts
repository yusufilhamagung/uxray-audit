import { IAuditAnalyzer } from '@/application/ports/IAuditAnalyzer';
import { getMockAudit } from './mock';

export class MockAuditAnalyzer implements IAuditAnalyzer {
  async analyze(_input: {
    imageBase64: string;
    imageType: string;
    pageType: string;
    optionalContext?: string;
  }): Promise<{ result: ReturnType<typeof getMockAudit>; modelUsed: string }> {
    return {
      result: getMockAudit(),
      modelUsed: 'mock'
    };
  }
}
