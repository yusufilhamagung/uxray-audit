import type { AnalysisState, AuditReport, Category, Severity, IssueImpact } from '@/domain/entities/audit-report';
import { AuditResultSchema } from '@/domain/entities/audit-report';
import { ISSUE_DETAILS, ISSUE_POOL, STATIC_PRIORITY_ONE } from '@config/issuePool';
import type { IssueTitle } from '@config/issuePool';

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

const CATEGORY_MAP: Record<IssueTitle, Category> = {
  "CTA doesn't stand out": 'CTA & Conversion',
  'Unclear value proposition': 'CTA & Conversion',
  'Too much content above the fold': 'Visual Hierarchy',
  'No clear next step': 'Layout & Spacing',
  'Weak headline-message alignment': 'Copy Clarity',
  'Visual hierarchy is confusing': 'Visual Hierarchy',
  'Primary action competes with secondary actions': 'CTA & Conversion',
  'Copy is generic or vague': 'Copy Clarity',
  "Information order doesn't match user intent": 'Layout & Spacing',
  'Design feels busy or cluttered': 'Visual Hierarchy',
  'Lack of trust signals': 'Accessibility',
  'Visual style feels inconsistent': 'Visual Hierarchy',
  'Too much emphasis on features, not outcomes': 'CTA & Conversion',
  'Form feels intimidating': 'Accessibility',
  'No sense of urgency or motivation': 'CTA & Conversion'
};

const SEVERITY_MAP: Record<IssueTitle, Severity> = {
  "CTA doesn't stand out": 'High',
  'Unclear value proposition': 'High',
  'Too much content above the fold': 'High',
  'No clear next step': 'High',
  'Weak headline-message alignment': 'High',
  'Visual hierarchy is confusing': 'Medium',
  'Primary action competes with secondary actions': 'Medium',
  'Copy is generic or vague': 'Medium',
  "Information order doesn't match user intent": 'Medium',
  'Design feels busy or cluttered': 'Medium',
  'Lack of trust signals': 'Low',
  'Visual style feels inconsistent': 'Low',
  'Too much emphasis on features, not outcomes': 'Low',
  'Form feels intimidating': 'Low',
  'No sense of urgency or motivation': 'Low'
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

const selectPriority1 = (flags: ReturnType<typeof deriveFlags>): IssueTitle => {
  if (flags.isTall || flags.isLarge) return 'Too much content above the fold';
  if (flags.isDense) return "CTA doesn't stand out";
  if (flags.isLight) return 'Unclear value proposition';
  if (flags.isWide) return 'Weak headline-message alignment';
  return 'No clear next step';
};

const selectPriority2 = (flags: ReturnType<typeof deriveFlags>): IssueTitle => {
  if (flags.isDense) return 'Design feels busy or cluttered';
  if (flags.isWide) return 'Primary action competes with secondary actions';
  if (flags.isLight) return 'Copy is generic or vague';
  if (flags.isTall) return "Information order doesn't match user intent";
  return 'Visual hierarchy is confusing';
};

const selectPriority3 = (flags: ReturnType<typeof deriveFlags>): IssueTitle => {
  if (flags.isLight) return 'Lack of trust signals';
  if (flags.isTall) return 'Form feels intimidating';
  if (flags.isDense) return 'Visual style feels inconsistent';
  if (flags.isWide) return 'Too much emphasis on features, not outcomes';
  return 'No sense of urgency or motivation';
};

const buildIssueEntry = (title: IssueTitle) => {
  const detail = ISSUE_DETAILS[title];
  const impact = detail.impact;
  return {
    title,
    severity: SEVERITY_MAP[title],
    category: CATEGORY_MAP[title],
    problem: detail.whyItHurts,
    evidence: detail.whyUsersHesitate,
    recommendation_steps: detail.fixes,
    expected_impact: EXPECTED_IMPACT_TEXT[impact],
    impact
  };
};

export const buildIssueList = (input: IssueSelectionInput): AuditReport['issues'] => {
  const flags = deriveFlags(input.image);
  const order: IssueTitle[] = [
    selectPriority1(flags),
    selectPriority2(flags),
    selectPriority3(flags)
  ];

  return order.map((title) => buildIssueEntry(title));
};

const buildStaticIssues = (): AuditReport['issues'] => [buildIssueEntry(STATIC_PRIORITY_ONE)];

const buildPriorityLines = (issues: AuditReport['issues']) => {
  const lines = issues.slice(0, 3).map((issue) => {
    return `Issue: ${issue.title} | Why it hurts: ${issue.problem} | Impact: ${issue.impact}`;
  });
  while (lines.length < 3) {
    lines.push('UXRay Quick Insight keeps the findings focused on what matters most.');
  }
  return lines as [string, string, string];
};

const buildSummary = (issues: AuditReport['issues'], state: AnalysisState) => ({
  top_3_priorities: buildPriorityLines(issues),
  overall_notes:
    state === 'l2'
      ? "UXRay Quick Insight. We're refining our analysis engine."
      : state === 'l3'
      ? "UXRay Quick Insight. We're refining our analysis engine."
      : 'Small confusions in hero, message, or CTA slow decision-making. Fixing them keeps people moving through the page.'
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
      expected_impact: 'Conversion depends on a clear click target.'
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
    steps.push('Review the hero message to keep the benefit crystal clear.');
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
    return "UXRay Quick Insight. We're refining our analysis engine.";
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
  const issues = state === 'full' ? buildIssueList(input) : buildStaticIssues();
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
