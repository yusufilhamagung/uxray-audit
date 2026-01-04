import { z } from 'zod';

export const AnalysisStateEnum = z.enum(['full', 'l1', 'l2', 'l3']);
export type AnalysisState = z.infer<typeof AnalysisStateEnum>;

export const PageTypeEnum = z.enum(['Landing', 'App', 'Dashboard']);
export type PageType = z.infer<typeof PageTypeEnum>;

export const CategoryEnum = z.enum([
  'Visual Hierarchy',
  'CTA & Conversion',
  'Copy Clarity',
  'Layout & Spacing',
  'Accessibility'
]);
export type Category = z.infer<typeof CategoryEnum>;

export const SeverityEnum = z.enum(['Low', 'Medium', 'High']);
export type Severity = z.infer<typeof SeverityEnum>;

export const IssueImpactEnum = z.enum(['Conversion', 'Clarity', 'Trust']);
export type IssueImpact = z.infer<typeof IssueImpactEnum>;

const ScoreBreakdownSchema = z.object({
  'Visual Hierarchy': z.number().min(0).max(100),
  'CTA & Conversion': z.number().min(0).max(100),
  'Copy Clarity': z.number().min(0).max(100),
  'Layout & Spacing': z.number().min(0).max(100),
  Accessibility: z.number().min(0).max(100)
});

const SummarySchema = z.object({
  top_3_priorities: z.array(z.string().min(3)).length(3),
  overall_notes: z.string().min(10)
});

const IssueSchema = z.object({
  title: z.string().min(3),
  severity: SeverityEnum,
  category: CategoryEnum,
  problem: z.string().min(10),
  evidence: z.string().min(10),
  recommendation_steps: z.array(z.string().min(3)).min(1).max(2),
  expected_impact: z.string().min(5),
  impact: IssueImpactEnum
});

const QuickWinSchema = z.object({
  title: z.string().min(3),
  action: z.string().min(5),
  expected_impact: z.string().min(5)
});

const FullReportIssueSchema = z.object({
  title: z.string().min(3),
  why_users_hesitate: z.string().min(10),
  impact: IssueImpactEnum,
  how_to_fix: z.array(z.string().min(5)).min(1).max(2)
});

const FullReportSchema = z.object({
  prioritized_issues: z.array(FullReportIssueSchema).max(3),
  fix_order: z.array(z.string().min(3)).max(3)
});

export const AuditReportSchema = z
  .object({
    analysis_state: AnalysisStateEnum.optional().default('full'),
    ux_score: z.number().min(0).max(100),
    score_breakdown: ScoreBreakdownSchema,
    summary: SummarySchema,
    issues: z.array(IssueSchema).min(1).max(3),
    quick_wins: z.array(QuickWinSchema).min(1),
    next_steps: z.array(z.string().min(3)).min(2).max(3),
    why_this_matters: z.string().optional().default(''),
    full_report: FullReportSchema.optional()
  })
  .strict();

export type AuditReport = z.infer<typeof AuditReportSchema>;

export const AuditResultSchema = AuditReportSchema;
export type AuditResult = AuditReport;
