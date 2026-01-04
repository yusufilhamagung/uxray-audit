import type { IUrlFetcher } from '@/application/ports/IUrlFetcher';

const MAX_HTML_CHARS = 15000;
const TIMEOUT_MS = 8000;

const cleanText = (value: string | null | undefined) =>
  (value ?? '').replace(/\s+/g, ' ').trim();

const extractTag = (html: string, tag: string) => {
  const match = html.match(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, 'i'));
  return cleanText(match?.[1]);
};

const extractMeta = (html: string, name: string) => {
  const match = html.match(
    new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i')
  );
  return cleanText(match?.[1]);
};

const extractHeadings = (html: string, tag: 'h1' | 'h2', limit: number) => {
  const regex = new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, 'gi');
  const results: string[] = [];
  let match: RegExpExecArray | null = null;
  while ((match = regex.exec(html)) !== null && results.length < limit) {
    const text = cleanText(match[1]);
    if (text) results.push(text);
  }
  return results;
};

const fetchWithTimeout = async (url: string, init: RequestInit, timeoutMs: number) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
};

export class UrlFetcher implements IUrlFetcher {
  async fetchContext(url: string): Promise<string | null> {
    try {
      const response = await fetchWithTimeout(
        url,
        {
          method: 'GET',
          headers: { 'User-Agent': 'UXRayAudit/1.0' }
        },
        TIMEOUT_MS
      );

      if (!response.ok) return null;

      const html = (await response.text()).slice(0, MAX_HTML_CHARS);
      const title = extractTag(html, 'title');
      const description = extractMeta(html, 'description');
      const h1s = extractHeadings(html, 'h1', 2);
      const h2s = extractHeadings(html, 'h2', 3);

      const lines = [
        `URL: ${url}`,
        title ? `Title: ${title}` : 'Title: n/a',
        description ? `Meta description: ${description}` : 'Meta description: n/a'
      ];

      if (h1s.length) {
        lines.push(`H1: ${h1s.join(' | ')}`);
      }

      if (h2s.length) {
        lines.push(`H2: ${h2s.join(' | ')}`);
      }

      return lines.join('\n');
    } catch (error) {
      console.warn('Failed to fetch URL context.', error);
      return null;
    }
  }
}
