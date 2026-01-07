export type AnalyticsEvent =
  | 'audit_started'
  | 'free_insight_rendered'
  | 'free_insight_completed'
  | 'unlock_cta_clicked'
  | 'early_access_modal_viewed'
  | 'email_submitted_success'
  | 'email_submitted_error'
  | 'run_another_audit_clicked'
  | 'full_report_unlocked'
  | 'early_access_modal_closed';
