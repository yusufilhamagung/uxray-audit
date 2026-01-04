import { IAuditAnalyzer } from '@/application/ports/IAuditAnalyzer';
import { IAuditRepository } from '@/application/ports/IAuditRepository';
import { IFileStorage } from '@/application/ports/IFileStorage';
import { ICaptureService } from '@/application/ports/ICaptureService';
import type { IUrlFetcher } from '@/application/ports/IUrlFetcher';
import type { AuditReport, AnalysisState } from '@/domain/entities/audit-report';
import { AuditResultSchema, PageTypeEnum } from '@/domain/entities/audit-report';
import { normalizeAuditResult } from '@/application/usecases/analyzeFree';
import { randomUUID } from 'node:crypto';
import { getImageMetrics } from '@/application/usecases/analyzeFree/imageMetrics';
import { BadOutputError, AnalyzerRequestError, AnalyzerTimeoutError } from '@/application/usecases/analyzeFree';
import type { AuditInput } from '@/domain/value-objects/audit-input';

export class AuditFromUrl {
  constructor(
    private captureService: ICaptureService,
    private analyzer: IAuditAnalyzer,
    private repository: IAuditRepository,
    private storage: IFileStorage,
    private urlFetcher: IUrlFetcher
  ) {}

  async execute(params: {
    url: string;
    pageType: string;
    optionalContext?: string;
  }) {
    const pageTypeParsed = PageTypeEnum.safeParse(params.pageType);
    if (!pageTypeParsed.success) {
      throw new Error('Page type is invalid.');
    }

    const rawUrl = params.url.trim();
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawUrl);
    } catch {
      throw new Error('URL is invalid.');
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw new Error('URL must start with http or https.');
    }

    const auditId = randomUUID();
    const dateFolder = new Date().toISOString().slice(0, 10);
    const filePath = `audits/${dateFolder}/${auditId}.png`;

    const [buffer, urlContext] = await Promise.all([
      this.captureService.capture(parsedUrl.toString()),
      this.urlFetcher.fetchContext(parsedUrl.toString())
    ]);

    const imageUrl = await this.storage.upload(filePath, buffer, 'image/png');

    const combinedContext = [params.optionalContext?.trim(), urlContext]
      .filter(Boolean)
      .join('\n')
      .slice(0, 500);

    const start = Date.now();
    let analysisResult: AuditReport | null = null;
    let analysisState: AnalysisState = 'full';
    let modelUsed = 'baseline';

    try {
      const analyzerInput: AuditInput = {
        type: 'url',
        url: parsedUrl.toString(),
        pageType: pageTypeParsed.data,
        imageBase64: buffer.toString('base64'),
        imageType: 'image/png',
        context: combinedContext || undefined
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

    const selectionInput = {
      seed: auditId,
      pageType: pageTypeParsed.data,
      image: getImageMetrics(buffer, 'image/png')
    };

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
