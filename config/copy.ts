export const LOCKED_REPORT_COPY = {
  headline: 'Unlock the full report.',
  subheadline: 'See the full list of issues and fixes for this page.',
  bullets: [
    'Top issues to fix first',
    'Clear steps for each issue',
    'Quick wins and next steps'
  ],
  cta: 'Unlock',
  microcopy: 'Full access is locked until you unlock.'
} as const;

export const EARLY_ACCESS_COPY = {
  headline: 'Enter your email to keep this report and join the list.',
  cta: 'Continue',
  emailHelper: "We'll only use this email for this report.",
  clarification:
    "You're on the list. We'll notify you when full access is ready.",
  confirmation: "You're on the list"
} as const;

export const EARLY_ACCESS_PAGE_COPY = {
  title: 'Unlock Full Report',
  subtitle: 'Enter your email to keep this report and continue to full access.',
  checklist: [
    'Full list of issues for this page',
    'Clear steps for each issue',
    'Quick wins and next steps',
    'Keep access to this report'
  ],
  softUpgrade: 'Full access options will be available later.'
} as const;
