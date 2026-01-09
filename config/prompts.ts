import { ISSUE_POOL } from './issuePool';

type AuditPromptParams = {
  pageType: string;
  optionalContext?: string;
  inputType?: 'image' | 'url';
  url?: string;
};

const formatList = (items: readonly string[]) => items.map((item) => `- ${item}`).join('\n');

export const buildSystemPrompt = () => {
  return `You are the UXRay audit engine.
Follow the rules exactly:
- Use plain language. No jargon or buzzwords.
- Do not teach theory.
- Use only issue titles from the provided pool.
- Issue #1 must be from Priority 1.
- Maximum 3 issues.
- Return JSON only. No markdown.`;
};

export const buildUserPrompt = ({ pageType, optionalContext, inputType = 'image', url }: AuditPromptParams) => {
  const contextLine = optionalContext ? `Extra context: ${optionalContext}` : 'Extra context: none';
  const sourceLine =
    inputType === 'url'
      ? `Source: URL metadata and structure summary${url ? ` for ${url}` : ''}.`
      : 'Source: screenshot upload.';
  const analyzeLine =
    inputType === 'url'
      ? 'Analyze the page using the provided URL context and structure summary.'
      : 'Analyze the screenshot of this page.';

  return `${analyzeLine}
Page type: ${pageType}
${sourceLine}
${contextLine}

Issue pool (use only these titles):
Priority 1:
${formatList(ISSUE_POOL.priority1)}
Priority 2:
${formatList(ISSUE_POOL.priority2)}
Priority 3:
${formatList(ISSUE_POOL.priority3)}

Return JSON with this schema:
{
  "ux_score": number (0-100),
  "issues": [
    {
      "title": string,
      "why_it_hurts": string,
      "impact": "Conversion" | "Clarity" | "Trust"
    }
  ],
  "why_this_matters": string
}`;
};
