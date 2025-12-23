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
  });

const SummarySchema = z
  .object({
    top_3_priorities: z.array(z.string().min(1)).min(1), // Relaxed: min length 1 char, min 1 item
    overall_notes: z.string().min(1)
  });

const IssueSchema = z
  .object({
    severity: SeverityEnum.or(z.string()),
    category: CategoryEnum.or(z.string()),
    title: z.string().optional().default('Issue Title'),
    problem: z.string().optional().default('Problem description missing'),
    evidence: z.string().optional().default('Evidence missing'),
    recommendation_steps: z.array(z.string()).optional().default([]),
    expected_impact: z.string().optional().default('Impact unknown')
  });

const QuickWinSchema = z
  .object({
    title: z.string().optional().default('Quick Win'),
    action: z.string().optional().default('Action missing'),
    expected_impact: z.string().optional().default('Impact missing')
  });

export const AuditResultSchema = z
  .object({
    ux_score: z.number().optional().default(0),
    score_breakdown: ScoreBreakdownSchema.optional().default({
        'Visual Hierarchy': 0,
        'CTA & Conversion': 0,
        'Copy Clarity': 0,
        'Layout & Spacing': 0,
        'Accessibility': 0
    }),
    summary: SummarySchema.optional().default({
        top_3_priorities: ['Analysis incomplete'],
        overall_notes: 'No summary generated.'
    }),
    issues: z.array(IssueSchema).optional().default([]),
    quick_wins: z.array(QuickWinSchema).optional().default([]),
    next_steps: z.array(z.string()).optional().default([])
  });

export type AuditResult = z.infer<typeof AuditResultSchema>;
