import { IAuditAnalyzer } from '@/application/ports/IAuditAnalyzer';
import { AuditResult, PageType } from '@/shared/validation/schema';
import { AuditResultSchema } from '@/shared/validation/schema';
import { extractJsonBlock, safeJsonParse } from '@/shared/utils/json';
import { serverEnv } from '@/lib/env/server';

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const TIMEOUT_MS = 60000;

function buildPrompt(pageType: PageType, optionalContext?: string) {
  return `You are a senior UX auditor and conversion optimization expert.

Analyze the provided website or screenshot using:
- UX heuristics
- visual hierarchy
- conversion psychology
- accessibility principles

Tipe halaman: ${pageType}
${optionalContext ? `Context tambahan: ${optionalContext}` : ''}

Return ONLY valid JSON.
DO NOT include markdown, explanation, or commentary. Use Bahasa Indonesia.

Schema:
{
  "ux_score": number (0-100),
  "score_breakdown": {
    "Visual Hierarchy": number (0-100),
    "CTA & Conversion": number (0-100),
    "Copy Clarity": number (0-100),
    "Layout & Spacing": number (0-100),
    "Accessibility": number (0-100)
  },
  "summary": {
    "top_3_priorities": [string, string, string],
    "overall_notes": string
  },
  "quick_wins": [
    {
      "title": string,
      "action": string,
      "expected_impact": string
    }
  ],
  "next_steps": [string, ...]
}`;
}

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
  async analyze(input: {
    imageBase64: string;
    imageType: string;
    pageType: string;
    optionalContext?: string;
  }): Promise<{ result: AuditResult; modelUsed: string }> {
    const apiKey = serverEnv.aiApiKey;
    const modelName = serverEnv.aiModel || DEFAULT_GEMINI_MODEL;
    const baseUrl = serverEnv.aiApiUrl;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing via environment variables.');
    }

    const apiUrl = `${baseUrl}/${modelName}:generateContent?key=${apiKey}`;

    try {
      const prompt = buildPrompt(input.pageType as PageType, input.optionalContext);
      
      const parts: any[] = [{ text: prompt }];

      if (input.imageBase64) {
          parts.push({
            inlineData: {
              mimeType: input.imageType,
              data: input.imageBase64
            }
          });
      }

      const payload = {
        contents: [
          {
            role: 'user',
            parts: parts
          }
        ],
        generationConfig: {
          temperature: 0.4, // Slight increase for creativity/adherence balance
          topP: 0.9,
          maxOutputTokens: 4096, // Increased token limit for full reports
          responseMimeType: 'application/json'
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
        ]
      };

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
        throw new Error(`Gemini request failed: ${response.status} - ${errText}`);
      }

      const rawJson = await response.json();
      
      if (!rawJson.candidates || rawJson.candidates.length === 0) {
         throw new Error('Gemini returned no candidates. This usually means the safety filter blocked the response.');
      }

      const candidate = rawJson.candidates[0];
      if (candidate.finishReason && candidate.finishReason !== 'STOP') {
         console.warn(`Gemini finished with reason: ${candidate.finishReason}`);
         // If it's SAFETY, we should throw explicit error
         if (candidate.finishReason === 'SAFETY') {
             throw new Error('Gemini blocked the response due to safety content.');
         }
      }

      let contentText = candidate.content?.parts?.[0]?.text;
      
      if (!contentText) {
         throw new Error(`Gemini returned empty text content. FinishReason: ${candidate.finishReason}`);
      }

      // Cleanup Markdown clutter if present (sometimes responseMimeType is ignored by smaller models)
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
        // Log the first 1000 chars to avoid massive logs but enough to debug
        console.error('Failed Gemini Response Text (Truncated):', contentText.substring(0, 1000));
        throw new Error('Failed to parse JSON from Gemini response. contentText was not valid JSON.');
      }

      const parsed = AuditResultSchema.safeParse(resultJson);
      if (!parsed.success) {
        console.error('Schema validation failed:', JSON.stringify(parsed.error, null, 2));
        console.error('Received JSON:', JSON.stringify(resultJson, null, 2));
        
        // Simple heuristic fix: if issues missing, empty array? No, schema forbids empty.
        // We throw error but log detailed info now.
        throw new Error(`Gemini JSON output did not match schema. ${parsed.error.issues[0]?.message || ''}`);
      }

      return { result: parsed.data, modelUsed: modelName };
    } catch (error) {
      console.error('Gemini Analyzer Error:', error);
      throw error; 
    }
  }
}
