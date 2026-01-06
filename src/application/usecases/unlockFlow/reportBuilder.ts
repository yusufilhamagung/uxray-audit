import { ISSUE_POOL, type IssueEntry } from '@/config/issuePool';
import type { AuditReport } from '@/domain/entities/audit-report';

const ISSUE_BY_TITLE = new Map<string, IssueEntry>(ISSUE_POOL.issues.map((issue) => [issue.title, issue]));

export const buildFullReportFromIssues = (issues: AuditReport['issues']) => {
  const prioritized = issues.map((issue) => {
    const detail = ISSUE_BY_TITLE.get(issue.title);
    return {
      title: issue.title,
      why_users_hesitate: detail?.description ?? issue.evidence,
      impact: issue.impact,
      how_to_fix: detail?.recommendation ? [detail.recommendation] : ['Clarify the next step.']
    };
  });

  return {
    prioritized_issues: prioritized.slice(0, 3),
    fix_order: prioritized.slice(0, 3).map((issue) => issue.title)
  };
};
