import { IAuditAnalyzer } from '@/application/ports/IAuditAnalyzer';
import { generateAudit } from './ai';
import { AuditResult } from '@/shared/validation/schema';

export class AnthropicAuditAnalyzer implements IAuditAnalyzer {
  async analyze(input: {
    imageBase64: string;
    imageType: string;
    pageType: string;
    optionalContext?: string;
  }): Promise<{ result: AuditResult; modelUsed: string }> {
    return generateAudit({
      imageBase64: input.imageBase64,
      imageType: input.imageType,
      pageType: input.pageType as any, // Schema alignment
      optionalContext: input.optionalContext
    });
  }
}
