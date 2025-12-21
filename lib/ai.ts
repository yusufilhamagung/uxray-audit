import type { PageType, AuditResult } from './schema';
import { AuditResultSchema } from './schema';
import { extractJsonBlock, extractTextFromResponse, safeJsonParse } from './json';
import { getMockAudit } from './mock';
import { isMockMode } from './env';

const DEFAULT_MODEL = 'claude-3-5-sonnet-20240620';
const TIMEOUT_MS = 30000;

function buildPrompt(pageType: PageType, optionalContext?: string) {
  const contextText = optionalContext?.trim()
    ? `Context tambahan dari user: ${optionalContext.trim()}`
    : 'Tidak ada konteks tambahan.';

  return `Kamu adalah auditor UX senior. Analisis screenshot UI/UX yang diberikan. Fokus pada bukti visual spesifik dari screenshot (mis. hero, CTA, layout, kontras, label, spacing).

Wajib hasilkan HANYA JSON valid tanpa markdown, tanpa komentar, tanpa teks tambahan.
Gunakan bahasa Indonesia. Hindari saran generik. Setiap issue harus menyebut bukti spesifik dari elemen UI yang terlihat.

Tipe halaman: ${pageType}
${contextText}

Schema JSON wajib (semua field wajib):
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
  "issues": [
    {
      "severity": "Low" | "Medium" | "High",
      "category": "Visual Hierarchy" | "CTA & Conversion" | "Copy Clarity" | "Layout & Spacing" | "Accessibility",
      "title": string,
      "problem": string,
      "evidence": string,
      "recommendation_steps": [string, ...],
      "expected_impact": string
    }
  ],
  "quick_wins": [
    {
      "title": string,
      "action": string,
      "expected_impact": string
    }
  ],
  "next_steps": [string, ...]
}

Output hanya JSON.`;
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

export async function generateAudit(input: {
  imageBase64: string;
  imageType: string;
  pageType: PageType;
  optionalContext?: string;
}): Promise<{ result: AuditResult; modelUsed: string }> {
  const apiUrl = process.env.AI_API_URL;
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || DEFAULT_MODEL;

  if (isMockMode() || !apiUrl || !apiKey) {
    return { result: getMockAudit(), modelUsed: 'mock' };
  }

  try {
    const prompt = buildPrompt(input.pageType, input.optionalContext);
    const payload = {
      model,
      max_tokens: 1200,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: input.imageType,
                data: input.imageBase64
              }
            }
          ]
        }
      ]
    };

    const response = await fetchWithTimeout(
      apiUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(payload)
      },
      TIMEOUT_MS
    );

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status}`);
    }

    const rawText = await response.text();
    const parsedResponse = safeJsonParse(rawText);
    const candidateText = extractTextFromResponse(parsedResponse) ?? rawText;

    const directJson = safeJsonParse(candidateText);
    const extracted = extractJsonBlock(candidateText);
    const extractedJson = extracted ? safeJsonParse(extracted) : null;

    const resultJson = (directJson ?? extractedJson) as unknown;
    if (!resultJson) {
      throw new Error('AI response is not JSON');
    }

    const parsed = AuditResultSchema.safeParse(resultJson);
    if (!parsed.success) {
      throw new Error('AI JSON did not match schema');
    }

    return { result: parsed.data, modelUsed: model };
  } catch (error) {
    return { result: getMockAudit(), modelUsed: 'mock_fallback' };
  }
}
