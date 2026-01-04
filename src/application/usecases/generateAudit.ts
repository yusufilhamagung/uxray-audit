import type { AccessLevel } from '@/domain/value-objects/access-level';
import type { AuditInput } from '@/domain/value-objects/audit-input';
import { getAuditLockState } from '@/domain/rules/access-gating';
import { AnalyzeFree } from '@/application/usecases/analyzeFree';
import { AuditFromUrl } from '@/application/usecases/AuditFromUrl';

export class GenerateAudit {
  constructor(
    private imageAudit: AnalyzeFree,
    private urlAudit: AuditFromUrl
  ) {}

  async execute(params: { input: AuditInput; accessLevel: AccessLevel }) {
    const { input, accessLevel } = params;
    const lockState = getAuditLockState(accessLevel);

    if (input.type === 'image') {
      if (!input.file) {
        throw new Error('Screenshot is required.');
      }

      const result = await this.imageAudit.execute({
        file: input.file,
        pageType: input.pageType,
        optionalContext: input.context
      });

      return { ...result, lockState };
    }

    const result = await this.urlAudit.execute({
      url: input.url,
      pageType: input.pageType,
      optionalContext: input.context
    });

    return { ...result, lockState };
  }
}
