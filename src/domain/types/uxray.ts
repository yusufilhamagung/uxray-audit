import { z } from 'zod';
import type { IssueEntry } from '@/config/issuePool';

export const AnalysisStateEnum = z.enum(['full', 'l1', 'l2', 'l3']);
export type AnalysisState = z.infer<typeof AnalysisStateEnum>;

export const PageTypeEnum = z.enum(['landing', 'dashboard', 'app']);
export type PageType = z.infer<typeof PageTypeEnum>;

export const ImpactEnum = z.enum(['Conversion', 'Clarity', 'Trust']);
export type Impact = z.infer<typeof ImpactEnum>;

export const FreeIssueSchema = z.object({
  title: z.string(),
  why_it_hurts: z.string().min(5).max(200),
  impact: ImpactEnum
});

export const FreeAnalysisSchema = z.object({
  ux_score: z.number().min(0).max(100),
  issues: z.array(FreeIssueSchema).min(1).max(3),
  why_this_matters: z.string().min(5).max(240)
});

export type FreeIssue = {
  title: IssueEntry['title'];
  why_it_hurts: string;
  impact: Impact;
};

export type FreeAnalysis = z.infer<typeof FreeAnalysisSchema>;

export type FreeAuditResult = FreeAnalysis & {
  analysis_state: AnalysisState;
};

export const ProIssueSchema = z.object({
  title: z.string(),
  why_users_hesitate: z.string().min(5).max(240),
  impact: ImpactEnum,
  how_to_fix: z.array(z.string().min(5).max(200)).min(1).max(2)
});

export const FixOrderItemSchema = z.object({
  title: z.string(),
  reason: z.string().min(3).max(160).optional()
});

export const ProAnalysisSchema = z.object({
  issues: z.array(ProIssueSchema).min(1).max(3),
  fix_order: z.array(FixOrderItemSchema).min(1).max(3)
});

export type ProAnalysis = z.infer<typeof ProAnalysisSchema>;

export type ProIssue = {
  title: IssueEntry['title'];
  why_users_hesitate: string;
  impact: Impact;
  how_to_fix: string[];
};

export type FixOrderItem = z.infer<typeof FixOrderItemSchema>;

export type ProAuditResult = ProAnalysis & {
  analysis_state: AnalysisState;
};
