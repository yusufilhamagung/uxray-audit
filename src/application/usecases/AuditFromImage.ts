import { IAuditAnalyzer } from '@/application/ports/IAuditAnalyzer';
import { IAuditRepository } from '@/application/ports/IAuditRepository';
import { IFileStorage } from '@/application/ports/IFileStorage';
import { AuditResultSchema, PageTypeEnum } from '@/shared/validation/schema';
import { randomUUID } from 'node:crypto';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg']);

export class AuditFromImage {
  constructor(
    private analyzer: IAuditAnalyzer,
    private repository: IAuditRepository,
    private storage: IFileStorage
  ) {}

  async execute(params: {
    file: File;
    pageType: string;
    optionalContext?: string;
  }) {
    const pageTypeParsed = PageTypeEnum.safeParse(params.pageType);
    if (!pageTypeParsed.success) {
      throw new Error('Tipe halaman tidak valid.');
    }

    const file = params.file;
    if (!ALLOWED_TYPES.has(file.type)) {
      throw new Error('Format file tidak didukung. Gunakan PNG atau JPG.');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Ukuran file terlalu besar. Maksimal 5MB.');
    }

    const ext = file.type === 'image/png' ? 'png' : 'jpg';
    const dateFolder = new Date().toISOString().slice(0, 10);
    const auditId = randomUUID();
    const filePath = `audits/${dateFolder}/${auditId}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 1. Upload
    const imageUrl = await this.storage.upload(filePath, buffer, file.type);

    // 2. Analyze
    const start = Date.now();
    const { result, modelUsed } = await this.analyzer.analyze({
      imageBase64: buffer.toString('base64'),
      imageType: file.type,
      pageType: pageTypeParsed.data,
      optionalContext: params.optionalContext?.slice(0, 500)
    });
    const latencyMs = Date.now() - start;

    const parsedResult = AuditResultSchema.safeParse(result);
    if (!parsedResult.success) {
      throw new Error('Hasil audit tidak valid.');
    }

    // 3. Save
    const saved = await this.repository.save({
      id: auditId,
      page_type: pageTypeParsed.data,
      image_url: imageUrl,
      ux_score: result.ux_score,
      result_json: parsedResult.data,
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
