import type { AuditResult } from '@/shared/validation/schema';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderHtmlReport(params: {
  result: AuditResult;
  id: string;
  pageType: string;
  imageUrl: string;
  modelUsed: string;
  createdAt: string;
}) {
  const { result, id, pageType, imageUrl, modelUsed, createdAt } = params;

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
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 32px; }
    .container { max-width: 900px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .title { font-size: 28px; font-weight: 700; }
    .meta { font-size: 12px; color: #64748b; }
    .summary { background: #fff7ed; border: 1px solid #fed7aa; padding: 16px; border-radius: 16px; margin-bottom: 24px; }
    .scores { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .score-box { background: white; padding: 16px; border-radius: 16px; border: 1px solid #e2e8f0; }
    .score-row { display: flex; justify-content: space-between; font-size: 14px; margin: 6px 0; }
    .score { font-weight: 600; }
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; margin-bottom: 16px; }
    .issue-head { display: flex; gap: 12px; align-items: center; margin-bottom: 8px; }
    .badge { padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; border: 1px solid; }
    .badge.high { background: #ffe4e6; color: #be123c; border-color: #fecdd3; }
    .badge.medium { background: #fef3c7; color: #b45309; border-color: #fde68a; }
    .badge.low { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
    .category { font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; }
    ul { padding-left: 20px; }
    .muted { color: #64748b; }
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
      <div class="image">Model: ${escapeHtml(modelUsed)}</div>
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
