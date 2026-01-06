import type { AuditInput } from '@/domain/value-objects/audit-input';
import { buildSystemPrompt } from '@/application/usecases/analyzeFree/prompts';

type GeminiPart = {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
};

type GeminiRequestBody = {
  contents: Array<{
    role: 'system' | 'user';
    parts: GeminiPart[];
  }>;
  generationConfig: {
    temperature: number;
    topP: number;
    maxOutputTokens: number;
    responseMimeType: string;
  };
  safetySettings: Array<{
    category: string;
    threshold: string;
  }>;
};

export const buildGeminiRequest = (input: AuditInput, prompt: string): GeminiRequestBody => {
  const parts: GeminiPart[] = [{ text: prompt }];

  if (input.imageBase64 && input.imageType) {
    parts.push({
      inlineData: {
        mimeType: input.imageType,
        data: input.imageBase64
      }
    });
  }

  return {
    contents: [
      {
        role: 'system',
        parts: [{ text: buildSystemPrompt() }]
      },
      {
        role: 'user',
        parts
      }
    ],
    generationConfig: {
      temperature: 0.4,
      topP: 0.9,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json'
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
    ]
  };
};
