import { IAuditAnalyzer } from '@/application/ports/IAuditAnalyzer';
import { IAuditRepository } from '@/application/ports/IAuditRepository';
import { IFileStorage } from '@/application/ports/IFileStorage';
import { ICaptureService } from '@/application/ports/ICaptureService';
import { PageTypeEnum } from '@/shared/validation/schema';
import { randomUUID } from 'node:crypto';

export class AuditFromUrl {
  constructor(
    private captureService: ICaptureService,
    private analyzer: IAuditAnalyzer,
    private repository: IAuditRepository,
    private storage: IFileStorage
  ) {}

  async execute(params: {
    url: string;
    pageType: string;
    optionalContext?: string;
  }) {
    const pageTypeParsed = PageTypeEnum.safeParse(params.pageType);
    if (!pageTypeParsed.success) {
      throw new Error('Tipe halaman tidak valid.');
    }

    let url = params.url.trim();
    if (!url.startsWith('http')) {
        url = `https://${url}`;
    }
    // Basic URL validation
    try {
        new URL(url);
    } catch {
        throw new Error('URL tidak valid.');
    }

    const auditId = randomUUID();
    const dateFolder = new Date().toISOString().slice(0, 10);
    const filePath = `audits/${dateFolder}/${auditId}.png`;

    // 1. Capture
    const buffer = await this.captureService.capture(url);

    // 2. Upload
    const imageUrl = await this.storage.upload(filePath, buffer, 'image/png');

    // 3. Analyze
    const start = Date.now();
    const { result, modelUsed } = await this.analyzer.analyze({
      imageBase64: buffer.toString('base64'),
      imageType: 'image/png',
      pageType: pageTypeParsed.data,
      optionalContext: params.optionalContext?.slice(0, 500)
    });
    const latencyMs = Date.now() - start;

    // 4. Save
    const saved = await this.repository.save({
      id: auditId,
      page_type: pageTypeParsed.data,
      image_url: imageUrl,
      ux_score: result.ux_score,
      result_json: result,
      model_used: modelUsed,
      latency_ms: latencyMs
    });

    return {
      auditId: saved.id,
      result: saved.result_json,
      imageUrl: saved.image_url,
      modelUsed: saved.model_used,
      latencyMs: saved.latency_ms,
      createdAt: saved.created_at
    };
  }
}
