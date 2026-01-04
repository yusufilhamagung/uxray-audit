import { ISSUE_DETAILS } from '@config/issuePool';
import type { IssueTitle } from '@config/issuePool';
import type { AuditReport } from '@/domain/entities/audit-report';

export const buildFullReportFromIssues = (issues: AuditReport['issues']) => {
  const prioritized = issues.map((issue) => {
    const detail = ISSUE_DETAILS[issue.title as IssueTitle];
    return {
      title: issue.title,
      why_users_hesitate: detail?.whyUsersHesitate ?? issue.evidence,
      impact: issue.impact,
      how_to_fix: detail?.fixes ?? ['Clarify the next step.']
    };
  });

  return {
    prioritized_issues: prioritized.slice(0, 3),
    fix_order: prioritized.slice(0, 3).map((issue) => issue.title)
  };
};
