import { AuditResult } from '@/shared/validation/schema';

export interface IAuditAnalyzer {
  analyze(input: {
    imageBase64: string;
    imageType: string;
    pageType: string;
    optionalContext?: string;
  }): Promise<{ result: AuditResult; modelUsed: string }>;
}
