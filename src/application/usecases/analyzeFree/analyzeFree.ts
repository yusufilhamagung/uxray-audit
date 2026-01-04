import { randomUUID } from 'node:crypto';
import { IAuditAnalyzer } from '@/application/ports/IAuditAnalyzer';
import { IAuditRepository } from '@/application/ports/IAuditRepository';
import { IFileStorage } from '@/application/ports/IFileStorage';
import type { AuditReport, AnalysisState } from '@/domain/entities/audit-report';
import { AuditResultSchema, PageTypeEnum } from '@/domain/entities/audit-report';
import type { AuditInput } from '@/domain/value-objects/audit-input';
import { normalizeAuditResult } from './resultBuilder';
import { BadOutputError, AnalyzerRequestError, AnalyzerTimeoutError } from './errors';
import { getImageMetrics } from './imageMetrics';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg']);

export class AnalyzeFree {
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
      throw new Error('Page type is invalid.');
    }

    const file = params.file;
    if (!ALLOWED_TYPES.has(file.type)) {
      throw new Error('Unsupported file format. Use PNG or JPG.');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File is too large. Max 5MB.');
    }

    const ext = file.type === 'image/png' ? 'png' : 'jpg';
    const dateFolder = new Date().toISOString().slice(0, 10);
    const auditId = randomUUID();
    const filePath = `audits/${dateFolder}/${auditId}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const imageUrl = await this.storage.upload(filePath, buffer, file.type);
    const imageMetrics = getImageMetrics(buffer, file.type);
    const selectionInput = {
      seed: auditId,
      pageType: pageTypeParsed.data,
      image: imageMetrics
    };

    const start = Date.now();
    let analysisResult: AuditReport | null = null;
    let analysisState: AnalysisState = 'full';
    let modelUsed = 'baseline';

    try {
      const analyzerInput: AuditInput = {
        type: 'image',
        pageType: pageTypeParsed.data,
        imageBase64: buffer.toString('base64'),
        imageType: file.type,
        context: params.optionalContext?.slice(0, 500)
      };

      const analysis = await this.analyzer.analyze(analyzerInput);
      analysisResult = analysis.result;
      modelUsed = analysis.modelUsed;

      if (!analysisResult.issues || analysisResult.issues.length === 0) {
        analysisResult = null;
        analysisState = 'l1';
      }
    } catch (error) {
      if (error instanceof BadOutputError) {
        analysisState = 'l1';
      } else if (error instanceof AnalyzerTimeoutError || error instanceof AnalyzerRequestError) {
        analysisState = 'l2';
      } else {
        analysisState = 'l3';
      }
    }

    const latencyMs = Date.now() - start;

    const normalizedResult = normalizeAuditResult(analysisResult, selectionInput, analysisState);
    const parsedResult = AuditResultSchema.safeParse(normalizedResult);
    if (!parsedResult.success) {
      throw new Error('Audit result is invalid.');
    }

    const saved = await this.repository.save({
      id: auditId,
      page_type: pageTypeParsed.data,
      image_url: imageUrl,
      ux_score: parsedResult.data.ux_score,
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
