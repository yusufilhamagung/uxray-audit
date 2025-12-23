import type { AuditResult } from '@/shared/validation/schema';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function renderHtmlReport(params: {
  result: AuditResult;
  id: string;
  pageType: string;
  imageUrl: string;
  modelUsed: string;
  createdAt: string;
}) {
  const { result, id, pageType, imageUrl, createdAt } = params;

  const priorities = result.summary.top_3_priorities
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('');

  const issues = result.issues
    .map(
      (issue) => `
      <div class="card">
        <div class="issue-head">
          <span class="badge ${issue.severity.toLowerCase()}">${escapeHtml(issue.severity)}</span>
          <span class="category">${escapeHtml(issue.category)}</span>
        </div>
        <h3>${escapeHtml(issue.title)}</h3>
        <p><strong>Problem:</strong> ${escapeHtml(issue.problem)}</p>
        <p><strong>Evidence:</strong> ${escapeHtml(issue.evidence)}</p>
        <p><strong>Recommendations:</strong></p>
        <ul>${issue.recommendation_steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ul>
        <p><strong>Expected impact:</strong> ${escapeHtml(issue.expected_impact)}</p>
      </div>
    `
    )
    .join('');

  const quickWins = result.quick_wins
    .map(
      (win) => `
      <li>
        <strong>${escapeHtml(win.title)}:</strong> ${escapeHtml(win.action)}
        <span class="muted">(${escapeHtml(win.expected_impact)})</span>
      </li>
    `
    )
    .join('');

  const scoreRows = Object.entries(result.score_breakdown)
    .map(
      ([label, value]) => `
      <div class="score-row">
        <span>${escapeHtml(label)}</span>
        <span class="score">${value}</span>
      </div>
    `
    )
    .join('');

  const nextSteps = result.next_steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>UXAudit AI Report</title>
  <style>
    :root {
      --background: 33.33 100% 96.47%;
      --foreground: 222.22 47.37% 11.18%;
      --surface: 0 0% 100%;
      --surface-2: 210 40% 98.04%;
      --border: 214.29 31.82% 91.37%;
      --text-muted: 215.38 16.32% 46.86%;
      --accent: 20.54 90.24% 48.24%;
      --status-error: 346.84 77.17% 49.80%;
      --status-warning: 37.69 92.13% 50.20%;
      --status-success: 142.13 76.22% 36.27%;
    }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: hsl(var(--background)); color: hsl(var(--foreground)); margin: 0; padding: 32px; }
    .container { max-width: 900px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .title { font-size: 28px; font-weight: 700; }
    .meta { font-size: 12px; color: hsl(var(--text-muted)); }
    .summary { background: hsl(var(--accent) / 0.12); border: 1px solid hsl(var(--accent) / 0.35); padding: 16px; border-radius: 16px; margin-bottom: 24px; }
    .scores { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .score-box { background: hsl(var(--surface)); padding: 16px; border-radius: 16px; border: 1px solid hsl(var(--border)); }
    .score-row { display: flex; justify-content: space-between; font-size: 14px; margin: 6px 0; }
    .score { font-weight: 600; }
    .card { background: hsl(var(--surface)); border: 1px solid hsl(var(--border)); border-radius: 16px; padding: 16px; margin-bottom: 16px; }
    .issue-head { display: flex; gap: 12px; align-items: center; margin-bottom: 8px; }
    .badge { padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; border: 1px solid; }
    .badge.high { background: hsl(var(--status-error) / 0.15); color: hsl(var(--status-error)); border-color: hsl(var(--status-error) / 0.35); }
    .badge.medium { background: hsl(var(--status-warning) / 0.15); color: hsl(var(--status-warning)); border-color: hsl(var(--status-warning) / 0.35); }
    .badge.low { background: hsl(var(--status-success) / 0.15); color: hsl(var(--status-success)); border-color: hsl(var(--status-success) / 0.35); }
    .category { font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: hsl(var(--text-muted)); }
    ul { padding-left: 20px; }
    .muted { color: hsl(var(--text-muted)); }
    .image { margin-top: 12px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div class="title">UXAudit AI Report</div>
        <div class="meta">ID: ${escapeHtml(id)} - ${escapeHtml(createdAt)} - ${escapeHtml(pageType)}</div>
      </div>
      <div class="score-box">
        <div class="muted">UX Score</div>
        <div style="font-size: 32px; font-weight: 700;">${result.ux_score}</div>
      </div>
    </div>

    <div class="summary">
      <strong>Top 3 Priorities</strong>
      <ul>${priorities}</ul>
      <p>${escapeHtml(result.summary.overall_notes)}</p>
      <div class="image">Screenshot: ${escapeHtml(imageUrl)}</div>
    </div>

    <div class="scores">
      <div class="score-box">
        <strong>Score Breakdown</strong>
        ${scoreRows}
      </div>
      <div class="score-box">
        <strong>Quick Wins</strong>
        <ul>${quickWins}</ul>
      </div>
      <div class="score-box">
        <strong>Next Steps</strong>
        <ul>${nextSteps}</ul>
      </div>
    </div>

    <h2>Issues Detail</h2>
    ${issues}
  </div>
</body>
</html>`;
}
