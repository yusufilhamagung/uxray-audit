import { z } from 'zod';

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

const ScoreBreakdownSchema = z
  .object({
    'Visual Hierarchy': z.number().min(0).max(100),
    'CTA & Conversion': z.number().min(0).max(100),
    'Copy Clarity': z.number().min(0).max(100),
    'Layout & Spacing': z.number().min(0).max(100),
    Accessibility: z.number().min(0).max(100)
  })
  .strict();

const SummarySchema = z
  .object({
    top_3_priorities: z.array(z.string().min(3)).length(3),
    overall_notes: z.string().min(10)
  })
  .strict();

const IssueSchema = z
  .object({
    severity: SeverityEnum,
    category: CategoryEnum,
    title: z.string().min(3),
    problem: z.string().min(10),
    evidence: z.string().min(10),
    recommendation_steps: z.array(z.string().min(3)).min(1),
    expected_impact: z.string().min(5)
  })
  .strict();

const QuickWinSchema = z
  .object({
    title: z.string().min(3),
    action: z.string().min(5),
    expected_impact: z.string().min(5)
  })
  .strict();

export const AuditResultSchema = z
  .object({
    ux_score: z.number().min(0).max(100),
    score_breakdown: ScoreBreakdownSchema,
    summary: SummarySchema,
    issues: z.array(IssueSchema).min(1),
    quick_wins: z.array(QuickWinSchema).min(1),
    next_steps: z.array(z.string().min(3)).min(1)
  })
  .strict();

export type AuditResult = z.infer<typeof AuditResultSchema>;
