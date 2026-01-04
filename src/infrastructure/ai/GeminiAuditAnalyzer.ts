import { IAuditAnalyzer } from '@/application/ports/IAuditAnalyzer';
import type { AuditReport } from '@/domain/entities/audit-report';
import { AuditResultSchema } from '@/domain/entities/audit-report';
import { extractJsonBlock, safeJsonParse } from '@/shared/utils/json';
import { serverEnv } from '@/infrastructure/env/server';
import { buildUserPrompt } from '@/application/usecases/analyzeFree';
import { BadOutputError, AnalyzerRequestError, AnalyzerTimeoutError } from '@/application/usecases/analyzeFree';
import type { AuditInput } from '@/domain/value-objects/audit-input';
import { buildGeminiRequest } from '@/infrastructure/ai/geminiRequest';

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const TIMEOUT_MS = 60000;

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export class GeminiAuditAnalyzer implements IAuditAnalyzer {
  async analyze(input: AuditInput): Promise<{ result: AuditReport; modelUsed: string }> {
    const apiKey = serverEnv.aiApiKey;
    const modelName = serverEnv.aiModel || DEFAULT_GEMINI_MODEL;
    const baseUrl = serverEnv.aiApiUrl;

    if (!apiKey) {
      throw new AnalyzerRequestError('GEMINI_API_KEY is missing via environment variables.');
    }

    if (input.type === 'image' && (!input.imageBase64 || !input.imageType)) {
      throw new AnalyzerRequestError('Image payload is missing for image audit.');
    }

    const apiUrl = `${baseUrl}/${modelName}:generateContent?key=${apiKey}`;

    try {
      const userPrompt = buildUserPrompt({
        pageType: input.pageType,
        optionalContext: input.context,
        inputType: input.type,
        url: input.type === 'url' ? input.url : undefined
      });

      const payload = buildGeminiRequest(input, userPrompt);

      const response = await fetchWithTimeout(
        apiUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        },
        TIMEOUT_MS
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new AnalyzerRequestError(`Gemini request failed: ${response.status} - ${errText}`);
      }

      const rawJson = await response.json();

      if (!rawJson.candidates || rawJson.candidates.length === 0) {
        throw new AnalyzerRequestError(
          'Gemini returned no candidates. This usually means the safety filter blocked the response.'
        );
      }

      const candidate = rawJson.candidates[0];
      if (candidate.finishReason && candidate.finishReason !== 'STOP') {
        console.warn(`Gemini finished with reason: ${candidate.finishReason}`);
        if (candidate.finishReason === 'SAFETY') {
          throw new AnalyzerRequestError('Gemini blocked the response due to safety content.');
        }
      }

      let contentText = candidate.content?.parts?.[0]?.text;

      if (!contentText) {
        throw new BadOutputError(`Gemini returned empty text content. FinishReason: ${candidate.finishReason}`);
      }

      contentText = contentText.trim();
      if (contentText.startsWith('```json')) {
        contentText = contentText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (contentText.startsWith('```')) {
        contentText = contentText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const directJson = safeJsonParse(contentText);
      const extracted = extractJsonBlock(contentText);
      const extractedJson = extracted ? safeJsonParse(extracted) : null;

      const resultJson = (directJson ?? extractedJson) as unknown;

      if (!resultJson) {
        console.error('Failed Gemini Response Text (Truncated):', contentText.substring(0, 1000));
        throw new BadOutputError('Failed to parse JSON from Gemini response.');
      }

      const parsed = AuditResultSchema.safeParse(resultJson);
      if (!parsed.success) {
        console.error('Schema validation failed:', JSON.stringify(parsed.error, null, 2));
        console.error('Received JSON:', JSON.stringify(resultJson, null, 2));
        throw new BadOutputError(
          `Gemini JSON output did not match schema. ${parsed.error.issues[0]?.message || ''}`
        );
      }

      return { result: parsed.data, modelUsed: modelName };
    } catch (error) {
      if (error instanceof BadOutputError) {
        throw error;
      }

      if (error instanceof AnalyzerRequestError || error instanceof AnalyzerTimeoutError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new AnalyzerTimeoutError('Gemini request timed out.');
      }

      throw new AnalyzerRequestError(
        error instanceof Error ? error.message : 'Gemini analyzer failed unexpectedly.'
      );
    }
  }
}
