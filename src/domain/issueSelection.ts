import { ISSUE_POOL, IssuePoolMapping, type IssueEntry, type IssueId } from '@/config/issuePool';
import type { PageType } from '@/domain/types/uxray';

const ISSUE_BY_ID = new Map<IssueId, IssueEntry>(ISSUE_POOL.issues.map((issue) => [issue.id, issue]));

const resolvePageType = (pageType?: PageType | null): PageType => pageType ?? 'landing';

export const getAllowedIssues = (pageType?: PageType | null): IssueEntry[] => {
  const resolved = resolvePageType(pageType);
  const allowedIds = IssuePoolMapping[resolved];
  return allowedIds.map((id) => ISSUE_BY_ID.get(id)).filter((issue): issue is IssueEntry => Boolean(issue));
};

export const isConversionBlocker = (issue: IssueEntry) => issue.category === 'Conversion & Flow';

const severityRank: Record<IssueEntry['severity'], number> = {
  high: 3,
  medium: 2,
  low: 1
};

export const getHighestSeverityIssue = (issues: IssueEntry[]) => {
  return [...issues].sort((a, b) => severityRank[b.severity] - severityRank[a.severity])[0] ?? null;
};

export const getIssueByTitle = (issues: IssueEntry[], title: string) => {
  return issues.find((issue) => issue.title === title) ?? null;
};
