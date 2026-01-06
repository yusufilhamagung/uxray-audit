import type { AnalysisState, AuditReport, Category, Severity, IssueImpact } from '@/domain/entities/audit-report';
import { AuditResultSchema } from '@/domain/entities/audit-report';
import { getAllowedIssues, getHighestSeverityIssue, isConversionBlocker } from '@/domain/issueSelection';
import type { IssueEntry } from '@/config/issuePool';

type ImageMetrics = {
  width?: number;
  height?: number;
  sizeBytes: number;
  type: string;
};

export type IssueSelectionInput = {
  seed: string;
  pageType: string;
  image: ImageMetrics;
};

const SCORE_CATEGORIES: Category[] = [
  'Visual Hierarchy',
  'CTA & Conversion',
  'Copy Clarity',
  'Layout & Spacing',
  'Accessibility'
];

const CATEGORY_MAP: Record<IssueEntry['category'], Category> = {
  'Clarity & Messaging': 'Copy Clarity',
  'Conversion & Flow': 'CTA & Conversion',
  'Trust & Credibility': 'Accessibility',
  'Usability & Interaction': 'Layout & Spacing',
  'Retention & Reusability': 'CTA & Conversion'
};

const SEVERITY_MAP: Record<IssueEntry['severity'], Severity> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low'
};

const impactFromCategory = (category: IssueEntry['category']): IssueImpact => {
  switch (category) {
    case 'Conversion & Flow':
      return 'Conversion';
    case 'Trust & Credibility':
      return 'Trust';
    case 'Retention & Reusability':
      return 'Conversion';
    case 'Clarity & Messaging':
    case 'Usability & Interaction':
    default:
      return 'Clarity';
  }
};

const EXPECTED_IMPACT_TEXT: Record<IssueImpact, string> = {
  Conversion: 'More people take action without hesitation.',
  Clarity: 'Visitors understand the offer quickly.',
  Trust: 'People feel confident trusting this page.'
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getPixels = (image: ImageMetrics) => {
  if (!image.width || !image.height) return 0;
  return image.width * image.height;
};

const getAspect = (image: ImageMetrics) => {
  if (!image.width || !image.height) return 1;
  return image.width / image.height;
};

const getDensity = (image: ImageMetrics) => {
  const pixels = getPixels(image);
  const megaPixels = pixels > 0 ? pixels / 1_000_000 : 0;
  const sizeKb = Math.max(1, Math.round(image.sizeBytes / 1024));
  return megaPixels > 0 ? sizeKb / megaPixels : sizeKb;
};

const deriveFlags = (image: ImageMetrics) => {
  const pixels = getPixels(image);
  const aspect = getAspect(image);
  const density = getDensity(image);
  const sizeKb = Math.max(1, Math.round(image.sizeBytes / 1024));
  return {
    pixels,
    aspect,
    density,
    sizeKb,
    isTall: aspect <= 0.75,
    isWide: aspect >= 1.45,
    isLarge: pixels >= 2_500_000,
    isDense: density >= 360,
    isLight: sizeKb <= 180
  };
};

const normalizePageType = (value: string) => {
  const normalized = value.toLowerCase();
  if (normalized.includes('dashboard')) return 'dashboard';
  if (normalized.includes('app')) return 'app';
  return 'landing';
};

const selectIssues = (pageType: string) => {
  const allowed = getAllowedIssues(normalizePageType(pageType));
  const selected: IssueEntry[] = [];

  const conversionIssue = allowed.find((issue) => isConversionBlocker(issue));
  if (conversionIssue) {
    selected.push(conversionIssue);
  } else {
    const highest = getHighestSeverityIssue(allowed);
    if (highest) selected.push(highest);
  }

  for (const issue of allowed) {
    if (selected.length >= 3) break;
    if (selected.some((entry) => entry.id === issue.id)) continue;
    selected.push(issue);
  }

  return selected.slice(0, 3);
};

const buildIssueEntry = (issue: IssueEntry) => {
  const impact = impactFromCategory(issue.category);
  return {
    title: issue.title,
    severity: SEVERITY_MAP[issue.severity],
    category: CATEGORY_MAP[issue.category],
    problem: issue.description,
    evidence: issue.why_it_matters,
    recommendation_steps: [issue.recommendation],
    expected_impact: EXPECTED_IMPACT_TEXT[impact],
    impact
  };
};

export const buildIssueList = (input: IssueSelectionInput): AuditReport['issues'] => {
  const selected = selectIssues(input.pageType);
  return selected.map((issue) => buildIssueEntry(issue));
};

const buildStaticIssues = (input: IssueSelectionInput): AuditReport['issues'] => {
  const selected = selectIssues(input.pageType);
  return selected.length ? [buildIssueEntry(selected[0])] : [];
};

const buildPriorityLines = (issues: AuditReport['issues']) => {
  const lines = issues.slice(0, 3).map((issue) => {
    return `Issue: ${issue.title} | Why it hurts: ${issue.problem} | Impact: ${issue.impact}`;
  });
  while (lines.length < 3) {
    lines.push('Quick Insight keeps the findings focused on what matters most.');
  }
  return lines as [string, string, string];
};

const buildSummary = (issues: AuditReport['issues'], state: AnalysisState) => ({
  top_3_priorities: buildPriorityLines(issues),
  overall_notes:
    state === 'l2' || state === 'l3'
      ? "Quick Insight. We're refining this report."
      : 'Small confusions in the top section, message, or main button slow decisions. Fixing them keeps people moving.'
});

const buildQuickWins = (issues: AuditReport['issues']) => {
  const wins = issues.slice(0, 2).map((issue, index) => ({
    title: `Quick win ${index + 1}: ${issue.title}`,
    action: issue.recommendation_steps[0],
    expected_impact: EXPECTED_IMPACT_TEXT[issue.impact]
  }));

  if (wins.length === 0) {
    wins.push({
      title: 'Quick win: Highlight main action',
      action: 'Make the primary button more visible and reduce clutter nearby.',
      expected_impact: 'People act faster with a clear click target.'
    });
  }

  return wins;
};

const buildNextSteps = (issues: AuditReport['issues']) => {
  const steps = issues.slice(0, 3).map(
    (issue) =>
      `Address "${issue.title}" to improve ${issue.impact.toLowerCase()} and keep visitors moving.`
  );

  while (steps.length < 2) {
    steps.push('Review the top message to keep the benefit clear.');
  }

  if (steps.length > 3) {
    steps.length = 3;
  }

  return steps;
};

const buildScoreBreakdown = (uxScore: number, issues: AuditReport['issues']) => {
  const baseScores: Record<Category, number> = {
    'Visual Hierarchy': uxScore,
    'CTA & Conversion': uxScore,
    'Copy Clarity': uxScore,
    'Layout & Spacing': uxScore,
    Accessibility: uxScore
  };

  return SCORE_CATEGORIES.reduce((acc, category) => {
    const relevantIssues = issues.filter((issue) => issue.category === category);
    const penalty = relevantIssues.reduce((sum, issue) => {
      if (issue.severity === 'High') return sum + 6;
      if (issue.severity === 'Medium') return sum + 4;
      return sum + 2;
    }, 0);
    acc[category] = clamp(baseScores[category] - penalty, 35, 96);
    return acc;
  }, {} as Record<Category, number>);
};

const buildWhyThisMatters = (issues: AuditReport['issues'], state: AnalysisState) => {
  if (state === 'l2' || state === 'l3') {
    return "Quick Insight. We're refining this report.";
  }
  const messages = Array.from(
    new Set(
      issues.map((issue) => {
        return `When ${issue.impact.toLowerCase()} is weak, people leave before the page commits them to act.`;
      })
    )
  );
  const result = messages.slice(0, 2);
  if (result.length === 0) {
    result.push('Clear signals keep people moving; confusion makes them pause.');
  }
  return result.join(' ');
};

const computeUxScore = (input: IssueSelectionInput) => {
  const flags = deriveFlags(input.image);
  let score = 84;

  if (flags.isLarge) score -= 6;
  if (flags.isDense) score -= 8;
  if (flags.isTall) score -= 4;
  if (flags.isWide) score -= 3;
  if (flags.isLight) score -= 5;

  return clamp(score, 40, 96);
};

export const normalizeAuditResult = (
  _raw: AuditReport | null | undefined,
  input: IssueSelectionInput,
  state: AnalysisState = 'full'
): AuditReport => {
  const issues = state === 'full' ? buildIssueList(input) : buildStaticIssues(input);
  const uxScore = computeUxScore(input);
  const normalized = {
    analysis_state: state,
    ux_score: uxScore,
    score_breakdown: buildScoreBreakdown(uxScore, issues),
    summary: buildSummary(issues, state),
    issues,
    quick_wins: buildQuickWins(issues),
    next_steps: buildNextSteps(issues),
    why_this_matters: buildWhyThisMatters(issues, state)
  };

  return AuditResultSchema.parse(normalized);
};
