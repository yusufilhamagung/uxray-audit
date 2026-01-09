import { ISSUE_POOL, IssuePoolMapping, type IssueEntry, type IssueId } from '@/config/issuePool';
import type { PageType } from '@/domain/types/uxray';

const ISSUE_BY_ID = new Map<IssueId, IssueEntry>(ISSUE_POOL.issues.map((issue) => [issue.id, issue]));

const resolvePageType = (pageType?: PageType | null): PageType => pageType ?? 'landing';

export const getAllowedIssues = (pageType?: PageType | null, includePaidIssues: boolean = false): IssueEntry[] => {
  const resolved = resolvePageType(pageType);
  const allowedIds = IssuePoolMapping[resolved];
  const issues = allowedIds.map((id) => ISSUE_BY_ID.get(id)).filter((issue): issue is IssueEntry => Boolean(issue));

  if (includePaidIssues) {
    return issues;
  }

  return issues.filter((issue) => !issue.paid_only);
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

// Calculate UX Score based on number of issues (deterministic)
export const calculateUXScore = (numberOfIssues: number): number => {
  const baseScore = 75;
  const deduction = numberOfIssues * 8; // 8 points per issue
  return Math.max(45, Math.min(85, baseScore - deduction));
};

// Select exactly 3 issues in pool order, with earliest Priority-1 first
export const selectIssuesFromPool = (pool: IssueEntry[], count: number = 3): IssueEntry[] => {
  if (pool.length === 0) return [];

  // Find the earliest Priority-1 (high severity) issue in pool order
  const firstPriority1Index = pool.findIndex((issue) => issue.severity === 'high');

  if (firstPriority1Index >= 0) {
    // Priority-1 exists: put it first, then take remaining in pool order
    const firstIssue = pool[firstPriority1Index];
    const remaining = pool.filter((_, index) => index !== firstPriority1Index);
    return [firstIssue, ...remaining.slice(0, count - 1)];
  }

  // No Priority-1: take first N issues in pool order
  return pool.slice(0, count);
};

// Generate free audit result with exactly 3 issues in pool order
export const generateFreeAuditResult = (pageType?: PageType | null, includePaidIssues: boolean = false) => {
  const allowedIssues = getAllowedIssues(pageType, includePaidIssues);
  const selectedIssues = selectIssuesFromPool(allowedIssues, 3);

  return {
    issues: selectedIssues,
    uxScore: calculateUXScore(selectedIssues.length),
    pageType: resolvePageType(pageType),
    timestamp: new Date().toISOString()
  };
};
