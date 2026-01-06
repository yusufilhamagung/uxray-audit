import { serverEnv } from '@/infrastructure/env/server';

type GeminiPart = {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
};

type GeminiResponse = {
  candidates?: Array<{
    finishReason?: string;
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

type GeminiRequest = {
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

export class GeminiRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiRequestError';
  }
}

export class GeminiTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiTimeoutError';
  }
}

export class GeminiOutputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiOutputError';
  }
}

const TIMEOUT_MS = 60000;

const fetchWithTimeout = async (url: string, init: RequestInit, timeoutMs: number) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
};

const buildGeminiRequest = (params: {
  systemPrompt: string;
  userPrompt: string;
  imageBase64: string;
  imageType: string;
}): GeminiRequest => ({
  contents: [
    {
      role: 'system',
      parts: [{ text: params.systemPrompt }]
    },
    {
      role: 'user',
      parts: [
        { text: params.userPrompt },
        {
          inlineData: {
            mimeType: params.imageType,
            data: params.imageBase64
          }
        }
      ]
    }
  ],
  generationConfig: {
    temperature: 0.4,
    topP: 0.9,
    maxOutputTokens: 4096,
    responseMimeType: 'text/plain'
  },
  safetySettings: [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
  ]
});

const extractText = (payload: GeminiResponse) => {
  const candidate = payload.candidates?.[0];
  if (!candidate?.content?.parts?.length) return null;
  return candidate.content.parts
    .map((part) => (typeof part.text === 'string' ? part.text : ''))
    .filter(Boolean)
    .join('\n');
};

export const requestGeminiContent = async (params: {
  systemPrompt: string;
  userPrompt: string;
  imageBase64: string;
  imageType: string;
}) => {
  const apiKey = serverEnv.aiApiKey;
  const modelName = serverEnv.aiModel;
  const baseUrl = serverEnv.aiApiUrl;

  if (!apiKey) {
    throw new GeminiRequestError('AI_API_KEY is missing.');
  }

  const apiUrl = `${baseUrl}/${modelName}:generateContent?key=${apiKey}`;
  const requestBody = buildGeminiRequest(params);
  const start = Date.now();

  let response: Response;
  try {
    response = await fetchWithTimeout(
      apiUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      },
      TIMEOUT_MS
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new GeminiTimeoutError('Gemini request timed out.');
    }
    throw new GeminiRequestError('Gemini request failed.');
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new GeminiRequestError(`Gemini request failed: ${response.status} - ${errText}`);
  }

  const rawJson = (await response.json()) as GeminiResponse;
  if (!rawJson.candidates || rawJson.candidates.length === 0) {
    throw new GeminiRequestError('Gemini returned no candidates.');
  }

  const text = extractText(rawJson);
  if (!text) {
    throw new GeminiOutputError('Gemini returned empty content.');
  }

  return {
    text: text.trim(),
    modelUsed: modelName,
    latencyMs: Date.now() - start
  };
};
