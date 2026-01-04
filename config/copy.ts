export const LOCKED_REPORT_COPY = {
  headline: 'Stop Guessing. Get UX Clarity.',
  subheadline: 'Turn one screenshot into a clear action plan.',
  bullets: [
    'Priority UX issues (what to fix first)',
    'Clear fix suggestions (no jargon)',
    'Copy & CTA improvement ideas'
  ],
  cta: 'Unlock Full Report',
  microcopy: 'No payment required - early access only'
} as const;

export const EARLY_ACCESS_COPY = {
  headline: 'UXRay is in Early Access. Full UX reports are launching soon.',
  cta: 'Get Early Access',
  emailHelper: "We'll use this email to keep access to this report. No spam.",
  clarification:
    'Early access unlocks insights for this audit. Creating new audits will require an upgrade later.',
  confirmation: 'Full Report Unlocked'
} as const;

export const EARLY_ACCESS_PAGE_COPY = {
  title: 'Unlock Full UX Report',
  subtitle: 'Get the complete UX analysis for this page and keep access to it.',
  checklist: [
    'Full list of UX issues detected',
    'Clear explanation for each issue',
    'Actionable recommendations (prioritized)',
    'Access this report anytime via email'
  ],
  softUpgrade: 'Upgrade options will be available later.'
} as const;
