import type { AuditReport } from '@/domain/entities/audit-report';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function renderHtmlReport(params: {
  result: AuditReport;
  id: string;
  pageType: string;
  imageUrl: string;
  modelUsed: string;
  createdAt: string;
}) {
  const { result, id, pageType, imageUrl, createdAt } = params;

  const issueSource = result.full_report?.prioritized_issues ?? result.issues;
  const issues = issueSource
    .map((issue, index) => {
      const normalizedIssue = issue as {
        title: string;
        impact: string;
        why_users_hesitate?: string;
        how_to_fix?: string[];
        evidence?: string;
        recommendation_steps?: string[];
        problem?: string;
      };
      const fix =
        normalizedIssue.how_to_fix?.[0] ?? normalizedIssue.recommendation_steps?.[0] ?? '';
      const summary =
        normalizedIssue.why_users_hesitate ?? normalizedIssue.evidence ?? normalizedIssue.problem ?? '';
      const impact = normalizedIssue.impact;
      return `
      <div class="card">
        <div class="issue-head">
          <span class="issue-number">Issue ${index + 1}</span>
        </div>
        <h3>${escapeHtml(issue.title)}</h3>
        <p><strong>Why users hesitate:</strong> ${escapeHtml(summary)}</p>
        ${fix ? `<p><strong>How to fix it:</strong> ${escapeHtml(fix)}</p>` : ''}
        <p class="muted"><strong>Impact:</strong> ${escapeHtml(impact)}</p>
      </div>
    `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>UXRay Report</title>
  <style>
    :root {
      --background: 33.33 100% 96.47%;
      --foreground: 222.22 47.37% 11.18%;
      --surface: 0 0% 100%;
      --border: 214.29 31.82% 91.37%;
      --text-muted: 215.38 16.32% 46.86%;
      --accent: 20.54 90.24% 48.24%;
    }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: hsl(var(--background)); color: hsl(var(--foreground)); margin: 0; padding: 32px; }
    .container { max-width: 900px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .title { font-size: 28px; font-weight: 700; }
    .meta { font-size: 12px; color: hsl(var(--text-muted)); }
    .card { background: hsl(var(--surface)); border: 1px solid hsl(var(--border)); border-radius: 16px; padding: 16px; margin-bottom: 16px; }
    .issue-head { display: flex; gap: 12px; align-items: center; margin-bottom: 8px; }
    .issue-number { font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: hsl(var(--text-muted)); }
    .muted { color: hsl(var(--text-muted)); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div class="title">UXRay Report</div>
        <div class="meta">ID: ${escapeHtml(id)} | ${escapeHtml(createdAt)} | ${escapeHtml(pageType)}</div>
      </div>
    </div>

    <div class="card">
      <strong>Screenshot</strong>
      <div class="meta">${escapeHtml(imageUrl)}</div>
    </div>

    <h2>Issues</h2>
    ${issues}
  </div>
</body>
</html>`;
}
