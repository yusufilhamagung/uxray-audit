export function safeJsonParse(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function extractJsonBlock(text: string): string | null {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }
  return text.slice(firstBrace, lastBrace + 1);
}

export function extractTextFromResponse(data: unknown): string | null {
  if (!data) return null;
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    const record = data as Record<string, any>;
    if (typeof record.output_text === 'string') return record.output_text;
    if (typeof record.completion === 'string') return record.completion;
    if (Array.isArray(record.content)) {
      const joined = record.content
        .map((item: any) => (typeof item?.text === 'string' ? item.text : ''))
        .filter(Boolean)
        .join('\n');
      if (joined) return joined;
    }
    if (record.content?.[0]?.text) return record.content[0].text as string;
    if (record.choices?.[0]?.message?.content) return record.choices[0].message.content as string;
  }
  return null;
}
