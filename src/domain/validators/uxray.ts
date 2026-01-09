import { z } from 'zod';
import type { IssueEntry } from '@/config/issuePool';
import { getAllowedIssues, getHighestSeverityIssue, getIssueByTitle, isConversionBlocker, selectIssuesFromPool } from '@/domain/issueSelection';
import {
  FreeAnalysisSchema,
  ProAnalysisSchema,
  ImpactEnum,
  type AnalysisState,
  type FixOrderItem,
  type FreeAuditResult,
  type FreeIssue,
  type Impact,
  type ProAuditResult,
  type ProIssue
} from '@/domain/types/uxray';
import type { PageType } from '@/domain/types/uxray';

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type ParsedFreeIssue = {
  title: string;
  why_it_hurts: string;
  impact: Impact;
};

type ParsedProIssue = {
  title: string;
  why_users_hesitate: string;
  impact: Impact;
  how_to_fix: string[];
};

const containsAiMention = (value: string) => /\bAI\b|\bartificial intelligence\b/i.test(value);

const collectStrings = (value: unknown, out: string[] = []) => {
  if (typeof value === 'string') {
    out.push(value);
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((entry) => collectStrings(entry, out));
    return out;
  }
  if (value && typeof value === 'object') {
    Object.values(value).forEach((entry) => collectStrings(entry, out));
  }
  return out;
};

const severityRank: Record<IssueEntry['severity'], number> = {
  high: 3,
  medium: 2,
  low: 1
};

const getImpactForIssue = (issue: IssueEntry): Impact => {
  switch (issue.category) {
    case 'Conversion & Flow':
      return 'Conversion';
    case 'Clarity & Messaging':
      return 'Clarity';
    case 'Trust & Credibility':
      return 'Trust';
    case 'Retention & Reusability':
      return 'Conversion';
    case 'Usability & Interaction':
    default:
      return 'Clarity';
  }
};

const normalizeText = (value: string) => value.replace(/\r/g, '').trim();

const tryParseJson = <T>(raw: string, schema: z.ZodSchema<T>): T | null => {
  try {
    const parsed = JSON.parse(raw) as unknown;
    const validated = schema.safeParse(parsed);
    return validated.success ? validated.data : null;
  } catch {
    return null;
  }
};

const getLineValue = (block: string, label: string) => {
  const match = block.match(new RegExp(`${label}:\\s*([^\\n]+)`, 'i'));
  return match?.[1]?.trim() ?? null;
};

const parseFreeText = (raw: string) => {
  const text = normalizeText(raw);
  const blocks = text
    .split(/\n(?=Issue:\s*)/g)
    .map((block) => block.trim())
    .filter((block) => block.toLowerCase().startsWith('issue:'));

  const issues: ParsedFreeIssue[] = [];
  for (const block of blocks) {
    const title = getLineValue(block, 'Issue');
    const whyItHurts = getLineValue(block, 'Why it hurts');
    const impactRaw = getLineValue(block, 'Impact');
    const impactParsed = ImpactEnum.safeParse(impactRaw);
    if (!title || !whyItHurts || !impactParsed.success) continue;
    issues.push({
      title,
      why_it_hurts: whyItHurts,
      impact: impactParsed.data
    });
  }

  const scoreMatch = text.match(/UX Score:\s*(\d{1,3})/i);
  const scoreValue = scoreMatch ? Number.parseInt(scoreMatch[1], 10) : null;
  const whyMatch = text.match(/Why this matters:\s*([\s\S]+)$/i);
  const whyThisMatters = whyMatch ? whyMatch[1].trim() : null;

  if (!issues.length || scoreValue === null || Number.isNaN(scoreValue) || !whyThisMatters) {
    return null;
  }

  return {
    ux_score: scoreValue,
    issues,
    why_this_matters: whyThisMatters
  };
};

const cleanListLines = (value: string) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*•\d.)]+\s*/, '').trim())
    .filter(Boolean);

const parseProText = (raw: string) => {
  const text = normalizeText(raw);
  const blocks = text
    .split(/\n(?=Issue:\s*)/g)
    .map((block) => block.trim())
    .filter((block) => block.toLowerCase().startsWith('issue:'));

  const issues: ParsedProIssue[] = [];
  for (const block of blocks) {
    const title = getLineValue(block, 'Issue');
    const whyUsers = getLineValue(block, 'Why users hesitate');
    const impactRaw = getLineValue(block, 'Impact');
    const impactParsed = ImpactEnum.safeParse(impactRaw);
    const fixSplit = block.split(/How to fix it \(practical\):/i);
    const fixes = fixSplit[1] ? cleanListLines(fixSplit[1]).slice(0, 2) : [];
    if (!title || !whyUsers || !impactParsed.success || fixes.length === 0) continue;
    issues.push({
      title,
      why_users_hesitate: whyUsers,
      impact: impactParsed.data,
      how_to_fix: fixes
    });
  }

  const fixOrderSection = text.split(/Fix Order:/i)[1];
  const fixOrder: FixOrderItem[] = [];
  if (fixOrderSection) {
    for (const line of fixOrderSection.split('\n')) {
      const match = line.match(/^\s*\d+\.\s*(.+)$/);
      if (!match) continue;
      const content = match[1].trim();
      let title = content;
      let reason: string | undefined;
      if (content.includes('— because')) {
        const [left, right] = content.split('— because');
        title = left.trim();
        reason = right?.trim();
      } else if (content.includes('- because')) {
        const [left, right] = content.split('- because');
        title = left.trim();
        reason = right?.trim();
      } else if (content.includes('—')) {
        const [left, right] = content.split('—');
        title = left.trim();
        reason = right?.replace(/^because\s*/i, '').trim();
      }
      fixOrder.push({ title, reason });
    }
  }

  if (!issues.length || !fixOrder.length) {
    return null;
  }

  return {
    issues,
    fix_order: fixOrder
  };
};

const hasConversionInAllowed = (issues: IssueEntry[]) => issues.some(isConversionBlocker);

const isTopSeverity = (issue: IssueEntry, allowed: IssueEntry[]) => {
  const maxRank = Math.max(...allowed.map((entry) => severityRank[entry.severity]));
  return severityRank[issue.severity] === maxRank;
};

export const validateFreeAnalysis = (
  raw: unknown,
  pageType: PageType
): ValidationResult<Omit<FreeAuditResult, 'analysis_state'>> => {
  const allowed = getAllowedIssues(pageType);
  if (typeof raw === 'string' && containsAiMention(raw)) {
    return { success: false, error: 'AI mention detected.' };
  }

  const parsedRaw =
    typeof raw === 'string'
      ? parseFreeText(raw) ?? tryParseJson(raw, FreeAnalysisSchema)
      : FreeAnalysisSchema.safeParse(raw).success
        ? (raw as z.infer<typeof FreeAnalysisSchema>)
        : null;

  if (!parsedRaw) {
    return { success: false, error: 'Unable to parse free output.' };
  }

  if (!Number.isInteger(parsedRaw.ux_score)) {
    return { success: false, error: 'UX score must be an integer.' };
  }

  if (parsedRaw.issues.length === 0 || parsedRaw.issues.length > 3) {
    return { success: false, error: 'Invalid issue count.' };
  }

  const issues: FreeIssue[] = [];
  for (const issue of parsedRaw.issues) {
    const allowedIssue = getIssueByTitle(allowed, issue.title);
    if (!allowedIssue) {
      return { success: false, error: 'Issue title not allowed.' };
    }
    issues.push({
      title: allowedIssue.title,
      why_it_hurts: issue.why_it_hurts.trim(),
      impact: issue.impact
    });
  }

  const firstIssue = getIssueByTitle(allowed, issues[0].title);
  if (!firstIssue) {
    return { success: false, error: 'First issue missing.' };
  }

  if (hasConversionInAllowed(allowed)) {
    if (!isConversionBlocker(firstIssue)) {
      return { success: false, error: 'Issue #1 must be a conversion blocker.' };
    }
  } else if (!isTopSeverity(firstIssue, allowed)) {
    return { success: false, error: 'Issue #1 must be highest severity.' };
  }

  const strings = collectStrings(parsedRaw);
  if (strings.some((text) => containsAiMention(text))) {
    return { success: false, error: 'AI mention detected.' };
  }

  return {
    success: true,
    data: {
      ux_score: parsedRaw.ux_score,
      issues,
      why_this_matters: parsedRaw.why_this_matters.trim()
    }
  };
};

export const validateProAnalysis = (
  raw: unknown,
  pageType: PageType
): ValidationResult<Omit<ProAuditResult, 'analysis_state'>> => {
  const allowed = getAllowedIssues(pageType);
  if (typeof raw === 'string' && containsAiMention(raw)) {
    return { success: false, error: 'AI mention detected.' };
  }

  const parsedRaw =
    typeof raw === 'string'
      ? parseProText(raw) ?? tryParseJson(raw, ProAnalysisSchema)
      : ProAnalysisSchema.safeParse(raw).success
        ? (raw as z.infer<typeof ProAnalysisSchema>)
        : null;

  if (!parsedRaw) {
    return { success: false, error: 'Unable to parse pro output.' };
  }

  if (parsedRaw.issues.length === 0 || parsedRaw.issues.length > 3) {
    return { success: false, error: 'Invalid issue count.' };
  }
  if (parsedRaw.fix_order.length === 0 || parsedRaw.fix_order.length > 3) {
    return { success: false, error: 'Invalid fix order count.' };
  }

  const issues: ProIssue[] = [];
  for (const issue of parsedRaw.issues) {
    const allowedIssue = getIssueByTitle(allowed, issue.title);
    if (!allowedIssue) {
      return { success: false, error: 'Issue title not allowed.' };
    }
    issues.push({
      title: allowedIssue.title,
      why_users_hesitate: issue.why_users_hesitate.trim(),
      impact: issue.impact,
      how_to_fix: issue.how_to_fix.map((entry) => entry.trim())
    });
  }

  const firstIssue = getIssueByTitle(allowed, issues[0].title);
  if (!firstIssue) {
    return { success: false, error: 'First issue missing.' };
  }

  if (hasConversionInAllowed(allowed)) {
    if (!isConversionBlocker(firstIssue)) {
      return { success: false, error: 'Issue #1 must be a conversion blocker.' };
    }
  } else if (!isTopSeverity(firstIssue, allowed)) {
    return { success: false, error: 'Issue #1 must be highest severity.' };
  }

  const fixOrder: FixOrderItem[] = [];
  for (const item of parsedRaw.fix_order) {
    const allowedIssue = getIssueByTitle(allowed, item.title);
    if (!allowedIssue) {
      return { success: false, error: 'Fix order title not allowed.' };
    }
    fixOrder.push({
      title: allowedIssue.title,
      reason: item.reason?.trim()
    });
  }

  const strings = collectStrings(parsedRaw);
  if (strings.some((text) => containsAiMention(text))) {
    return { success: false, error: 'AI mention detected.' };
  }

  return {
    success: true,
    data: {
      issues,
      fix_order: fixOrder
    }
  };
};

const pickFallbackIssue = (allowed: IssueEntry[]) => {
  const conversionHigh = allowed.find(
    (issue) => isConversionBlocker(issue) && issue.severity === 'high'
  );
  if (conversionHigh) return conversionHigh;
  const conversionAny = allowed.find((issue) => isConversionBlocker(issue));
  if (conversionAny) return conversionAny;
  return getHighestSeverityIssue(allowed) ?? allowed[0];
};

export const buildFreeFallback = (state: AnalysisState, pageType: PageType): FreeAuditResult => {
  const allowed = getAllowedIssues(pageType);
  const fallbackIssue = pickFallbackIssue(allowed);
  const issueImpact = fallbackIssue ? getImpactForIssue(fallbackIssue) : 'Clarity';

  return {
    analysis_state: state,
    ux_score: 62,
    issues: [
      {
        title: fallbackIssue?.title ?? 'Value Proposition Tidak Jelas',
        why_it_hurts: fallbackIssue?.description ?? 'Pesan utama belum terlihat jelas di bagian pertama.',
        impact: issueImpact
      }
    ],
    why_this_matters:
      fallbackIssue?.why_it_matters ?? 'User perlu memahami value utama sebelum memutuskan untuk lanjut.'
  };
};

export const buildProFallback = (state: AnalysisState, pageType: PageType): ProAuditResult => {
  const allowed = getAllowedIssues(pageType);
  const fallbackIssue = pickFallbackIssue(allowed);
  const issueImpact = fallbackIssue ? getImpactForIssue(fallbackIssue) : 'Clarity';

  return {
    analysis_state: state,
    issues: [
      {
        title: fallbackIssue?.title ?? 'Value Proposition Tidak Jelas',
        why_users_hesitate:
          fallbackIssue?.description ?? 'User belum melihat manfaat utama dari halaman ini.',
        impact: issueImpact,
        how_to_fix: [fallbackIssue?.recommendation ?? 'Perjelas satu pesan utama di bagian atas.']
      }
    ],
    fix_order: [
      {
        title: fallbackIssue?.title ?? 'Value Proposition Tidak Jelas',
        reason: fallbackIssue?.why_it_matters ?? 'Ini mencegah user bergerak ke langkah berikutnya.'
      }
    ]
  };
};

// Select exactly N issues in pool order, with earliest Priority-1 first
const pickFallbackIssues = (allowed: IssueEntry[], count: number): IssueEntry[] => {
  return selectIssuesFromPool(allowed, count);
};

// Build free fallback with exactly 3 issues in pool order
export const buildFreeFallbackV2 = (state: AnalysisState, pageType: PageType): FreeAuditResult => {
  const allowed = getAllowedIssues(pageType);
  const fallbackIssues = pickFallbackIssues(allowed, 3);

  const issues: FreeIssue[] = fallbackIssues.map((issue) => ({
    title: issue.title,
    why_it_hurts: issue.description,
    impact: getImpactForIssue(issue)
  }));

  // Deterministic score: 75 - (3 * 8) = 51
  const uxScore = 75 - (3 * 8);

  return {
    analysis_state: state,
    ux_score: Math.max(45, Math.min(85, uxScore)),
    issues: issues.length > 0 ? issues : [
      {
        title: 'Value Proposition Tidak Jelas',
        why_it_hurts: 'Pesan utama belum terlihat jelas di bagian pertama.',
        impact: 'Clarity'
      }
    ],
    why_this_matters: fallbackIssues[0]?.why_it_matters ?? 'User perlu memahami value utama sebelum memutuskan untuk lanjut.'
  };
};
