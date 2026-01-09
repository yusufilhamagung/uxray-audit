export const ISSUE_POOL = {
  priority1: [
    "CTA doesn't stand out",
    'Unclear value proposition',
    'Too much content above the fold',
    'No clear next step',
    'Weak headline-message alignment'
  ],
  priority2: [
    'Visual hierarchy is confusing',
    'Primary action competes with secondary actions',
    'Copy is generic or vague',
    "Information order doesn't match user intent",
    'Design feels busy or cluttered'
  ],
  priority3: [
    'Lack of trust signals',
    'Visual style feels inconsistent',
    'Too much emphasis on features, not outcomes',
    'Form feels intimidating',
    'No sense of urgency or motivation'
  ]
} as const;

export type IssueTitle =
  | (typeof ISSUE_POOL.priority1)[number]
  | (typeof ISSUE_POOL.priority2)[number]
  | (typeof ISSUE_POOL.priority3)[number];

export type IssueImpact = 'Conversion' | 'Clarity' | 'Trust';

type IssueDetail = {
  whyItHurts: string;
  whyUsersHesitate: string;
  fixes: [string] | [string, string];
  impact: IssueImpact;
};

export const ISSUE_DETAILS: Record<IssueTitle, IssueDetail> = {
  "CTA doesn't stand out": {
    whyItHurts: 'The main button blends in, so people do not notice what to click.',
    whyUsersHesitate: 'When the main action is easy to miss, people pause or leave.',
    fixes: ['Use a stronger button color.', 'Add more space around the main button.'],
    impact: 'Conversion'
  },
  'Unclear value proposition': {
    whyItHurts: "It's hard to tell what this page is offering at a glance.",
    whyUsersHesitate: "If the offer is unclear, people hesitate before taking action.",
    fixes: ['State the main benefit in one short line near the top.'],
    impact: 'Conversion'
  },
  'Too much content above the fold': {
    whyItHurts: 'The top of the page feels crowded, so the main point gets lost.',
    whyUsersHesitate: 'When too much shows at once, people struggle to find the key action.',
    fixes: ['Remove extra items near the top.', 'Keep only the main message and action first.'],
    impact: 'Conversion'
  },
  'No clear next step': {
    whyItHurts: "After the first section, it's not obvious what to do next.",
    whyUsersHesitate: 'When the next step is unclear, people stop instead of moving forward.',
    fixes: ['Place one clear action near the top.', 'Repeat the same action once lower down.'],
    impact: 'Conversion'
  },
  'Weak headline-message alignment': {
    whyItHurts: "The headline and the next line don't point to the same promise.",
    whyUsersHesitate: 'Mixed messages make the offer feel uncertain or incomplete.',
    fixes: ['Make the headline and next line say the same core idea.'],
    impact: 'Conversion'
  },
  'Visual hierarchy is confusing': {
    whyItHurts: "Important items don't stand out from the rest.",
    whyUsersHesitate: 'When everything looks equal, people miss the main point.',
    fixes: ['Make the key line larger or bolder.', 'Reduce emphasis on supporting text.'],
    impact: 'Clarity'
  },
  'Primary action competes with secondary actions': {
    whyItHurts: 'Multiple buttons pull attention in different directions.',
    whyUsersHesitate: 'Too many choices make people unsure which action matters most.',
    fixes: ['Keep one main button.', 'Style secondary actions more quietly.'],
    impact: 'Clarity'
  },
  'Copy is generic or vague': {
    whyItHurts: 'The text could fit almost any product.',
    whyUsersHesitate: 'If the words feel generic, people doubt the offer is for them.',
    fixes: ['Use specific outcomes or numbers.', 'Replace vague words with clear results.'],
    impact: 'Clarity'
  },
  "Information order doesn't match user intent": {
    whyItHurts: 'Details show up before the main promise.',
    whyUsersHesitate: 'When the promise is buried, people lose interest quickly.',
    fixes: ['Lead with the main promise.', 'Move details below the first message.'],
    impact: 'Clarity'
  },
  'Design feels busy or cluttered': {
    whyItHurts: 'Too many elements fight for attention.',
    whyUsersHesitate: 'Busy layouts make the page feel hard to scan.',
    fixes: ['Remove or combine extra elements.', 'Increase spacing between sections.'],
    impact: 'Clarity'
  },
  'Lack of trust signals': {
    whyItHurts: 'There is little proof that this offer is credible.',
    whyUsersHesitate: 'Without proof, people are not sure the offer is safe to try.',
    fixes: ['Add a short proof line near the top.', 'Include logos or reviews if available.'],
    impact: 'Trust'
  },
  'Visual style feels inconsistent': {
    whyItHurts: 'Styles shift across sections, so the page feels uneven.',
    whyUsersHesitate: 'Inconsistent styling can make the page feel less reliable.',
    fixes: ['Use a tighter set of colors.', 'Keep type styles consistent across sections.'],
    impact: 'Trust'
  },
  'Too much emphasis on features, not outcomes': {
    whyItHurts: 'It lists what it does without showing what people get.',
    whyUsersHesitate: 'People hesitate when they cannot see the outcome for them.',
    fixes: ['Lead with the outcome first.', 'Tie each feature to a simple result.'],
    impact: 'Trust'
  },
  'Form feels intimidating': {
    whyItHurts: 'The form looks long or demanding.',
    whyUsersHesitate: 'Long forms make people worry it will take too much time.',
    fixes: ['Reduce the number of fields.', 'Group fields into shorter steps.'],
    impact: 'Trust'
  },
  'No sense of urgency or motivation': {
    whyItHurts: "There's no clear reason to act now.",
    whyUsersHesitate: 'Without a reason to act, people put it off and forget.',
    fixes: ['Add a simple reason to act now.', 'Mention a time limit or bonus if real.'],
    impact: 'Trust'
  }
};

export const STATIC_PRIORITY_ONE: IssueTitle = 'Unclear value proposition';
