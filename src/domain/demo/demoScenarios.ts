import type { AuditReport } from '@/domain/entities/audit-report';
import type { IssueTitle } from '@config/issuePool';
import { ISSUE_DETAILS } from '@config/issuePool';

export type DemoScenario = {
  id: string;
  title: string;
  description: string;
  sampleInput: {
    type: 'url' | 'image';
    value: string;
  };
  resultFree: AuditReport;
  resultFull: AuditReport;
};

const fallbackIssue: AuditReport['issues'][number] = {
  title: 'Unclear value proposition',
  severity: 'High',
  category: 'Copy Clarity',
  problem: 'The main benefit is not clear in the first lines.',
  evidence: 'The headline describes the page but not the user outcome.',
  recommendation_steps: ['State one clear benefit in the top section.'],
  expected_impact: 'Visitors understand the offer faster.',
  impact: 'Conversion'
};

const fallbackQuickWin: AuditReport['quick_wins'][number] = {
  title: 'Clarify the top message',
  action: 'Add one short benefit line near the top.',
  expected_impact: 'Faster understanding of the offer.'
};

const fallbackNextSteps = [
  'Update the top message with a single benefit.',
  'Test a stronger main button style.'
];

const fallbackSummary = {
  top_3_priorities: [
    'Make the main benefit clear in the first two lines.',
    'Give the main button more contrast.',
    'Add a short proof line near the top.'
  ],
  overall_notes: 'The page needs a clearer first message and a stronger main action.'
};

const buildFullReport = (issues: AuditReport['issues']) => {
  const prioritized = issues.slice(0, 3).map((issue) => {
    const detail = ISSUE_DETAILS[issue.title as IssueTitle];
    return {
      title: issue.title,
      why_users_hesitate: detail?.whyUsersHesitate ?? issue.evidence,
      impact: issue.impact,
      how_to_fix: detail?.fixes ?? issue.recommendation_steps
    };
  });

  return {
    prioritized_issues: prioritized,
    fix_order: prioritized.map((issue) => issue.title)
  };
};

const ensureResult = (result: AuditReport): AuditReport => {
  const issues = result.issues.length > 0 ? result.issues : [fallbackIssue];
  const quickWins = result.quick_wins.length > 0 ? result.quick_wins : [fallbackQuickWin];
  const nextSteps = result.next_steps.length > 0 ? result.next_steps : fallbackNextSteps;
  const topPriorities = result.summary?.top_3_priorities?.length
    ? [...result.summary.top_3_priorities, ...fallbackSummary.top_3_priorities].slice(0, 3)
    : fallbackSummary.top_3_priorities;
  const overallNotes = result.summary?.overall_notes?.trim() || fallbackSummary.overall_notes;

  return {
    ...result,
    analysis_state: result.analysis_state ?? 'full',
    issues,
    quick_wins: quickWins,
    next_steps: nextSteps.length >= 2 ? nextSteps.slice(0, 3) : fallbackNextSteps,
    summary: {
      top_3_priorities: topPriorities,
      overall_notes: overallNotes
    }
  };
};

const createScenario = (scenario: {
  id: string;
  title: string;
  description: string;
  sampleInput: DemoScenario['sampleInput'];
  uxScore: number;
  scoreBreakdown: AuditReport['score_breakdown'];
  summary: AuditReport['summary'];
  issues: AuditReport['issues'];
  quickWins: AuditReport['quick_wins'];
  nextSteps: AuditReport['next_steps'];
  whyThisMatters: string;
}): DemoScenario => {
  const base: AuditReport = {
    analysis_state: 'full',
    ux_score: scenario.uxScore,
    score_breakdown: scenario.scoreBreakdown,
    summary: scenario.summary,
    issues: scenario.issues,
    quick_wins: scenario.quickWins,
    next_steps: scenario.nextSteps,
    why_this_matters: scenario.whyThisMatters
  };

  const fullResult = ensureResult({
    ...base,
    full_report: buildFullReport(base.issues)
  });

  const freeResult = ensureResult({
    ...base,
    quick_wins: base.quick_wins.slice(0, 2),
    next_steps: base.next_steps.slice(0, 2)
  });

  return {
    id: scenario.id,
    title: scenario.title,
    description: scenario.description,
    sampleInput: scenario.sampleInput,
    resultFree: freeResult,
    resultFull: fullResult
  };
};

export const demoScenarios: DemoScenario[] = [
  createScenario({
    id: 'ecommerce-pdp',
    title: 'Ecommerce PDP',
    description: 'Product detail page for a single item.',
    sampleInput: { type: 'url', value: 'https://shop.example.com/product/sneakers' },
    uxScore: 62,
    scoreBreakdown: {
      'Visual Hierarchy': 58,
      'CTA & Conversion': 55,
      'Copy Clarity': 60,
      'Layout & Spacing': 64,
      Accessibility: 57
    },
    summary: {
      top_3_priorities: [
        'Make the main benefit clear in the first two lines.',
        'Give the Buy Now button a stronger visual lead.',
        'Add trust signals near price and delivery.'
      ],
      overall_notes:
        'Shoppers can see the product, but the reason to buy is not clear at first glance.'
    },
    issues: [
      {
        title: 'Unclear value proposition',
        severity: 'High',
        category: 'Copy Clarity',
        problem: 'The headline names the item but does not say why it is worth buying.',
        evidence: 'The benefit is buried under specs and shipping details.',
        recommendation_steps: [
          'State one main benefit in the top section.',
          'Move the benefit above the specs list.'
        ],
        expected_impact: 'Shoppers understand the offer faster.',
        impact: 'Conversion'
      },
      {
        title: 'Primary action competes with secondary actions',
        severity: 'Medium',
        category: 'CTA & Conversion',
        problem: 'Buy Now and Add to Wishlist look the same weight.',
        evidence: 'Both buttons share the same color and size near the price.',
        recommendation_steps: [
          'Make Buy Now the solid button.',
          'Style secondary actions as links or outline.'
        ],
        expected_impact: 'More clicks on the main purchase action.',
        impact: 'Clarity'
      },
      {
        title: 'Lack of trust signals',
        severity: 'Low',
        category: 'Copy Clarity',
        problem: 'Proof like reviews and delivery terms are not visible near the price.',
        evidence: 'Ratings and shipping notes are far below the product gallery.',
        recommendation_steps: [
          'Show the star rating near the title.',
          'Add a short shipping and returns line near the price.'
        ],
        expected_impact: 'More confidence to buy.',
        impact: 'Trust'
      }
    ],
    quickWins: [
      {
        title: 'Surface the shipping promise',
        action: 'Add a one line shipping and returns note under the price.',
        expected_impact: 'Reduces last minute doubt.'
      },
      {
        title: 'Highlight the main button',
        action: 'Use one solid color for Buy Now and add more spacing around it.',
        expected_impact: 'Makes the next step obvious.'
      },
      {
        title: 'Move the top benefit up',
        action: 'Place the best benefit above the gallery.',
        expected_impact: 'Shoppers get the value faster.'
      }
    ],
    nextSteps: [
      'Test a benefit first headline against the current one.',
      'Track clicks on Buy Now after the button update.',
      'Add review count near the title and measure add to cart change.'
    ],
    whyThisMatters: 'Clear value and trust cues help shoppers decide without extra scrolling.'
  }),
  createScenario({
    id: 'landing-saas',
    title: 'Landing Page',
    description: 'Marketing landing page for a software trial.',
    sampleInput: { type: 'url', value: 'https://product.example.com' },
    uxScore: 68,
    scoreBreakdown: {
      'Visual Hierarchy': 66,
      'CTA & Conversion': 60,
      'Copy Clarity': 64,
      'Layout & Spacing': 70,
      Accessibility: 72
    },
    summary: {
      top_3_priorities: [
        'Make the primary button pop with contrast and spacing.',
        'Replace generic words with a clear outcome.',
        'Add a short reason to start now.'
      ],
      overall_notes:
        'The page feels polished, but the main action blends into the top section.'
    },
    issues: [
      {
        title: "CTA doesn't stand out",
        severity: 'High',
        category: 'CTA & Conversion',
        problem: 'The primary button blends into the top section.',
        evidence: 'The button color is close to the background and nearby links.',
        recommendation_steps: [
          'Increase contrast on the main button.',
          'Add more space around the main button.'
        ],
        expected_impact: 'More visitors notice the action.',
        impact: 'Conversion'
      },
      {
        title: 'Copy is generic or vague',
        severity: 'Medium',
        category: 'Copy Clarity',
        problem: 'The headline uses broad words that could fit any product.',
        evidence: 'The first line does not name a clear outcome for the user.',
        recommendation_steps: [
          'Add one concrete outcome in the headline.',
          'Name who the page is for in the first sentence.'
        ],
        expected_impact: 'Visitors know the value faster.',
        impact: 'Clarity'
      },
      {
        title: 'No sense of urgency or motivation',
        severity: 'Low',
        category: 'CTA & Conversion',
        problem: 'There is no reason to start now instead of later.',
        evidence: 'The page does not mention setup time or a quick win.',
        recommendation_steps: [
          'Add a short line about how fast setup is.',
          'Mention a real time bound if available.'
        ],
        expected_impact: 'More people take action right away.',
        impact: 'Trust'
      }
    ],
    quickWins: [
      {
        title: 'Boost button contrast',
        action: 'Use a darker solid color for the primary button.',
        expected_impact: 'The action becomes easier to see.'
      },
      {
        title: 'Add a one line outcome',
        action: 'Include a short result statement under the headline.',
        expected_impact: 'Visitors grasp the promise faster.'
      },
      {
        title: 'Mention setup speed',
        action: 'Add a line like "Set up in 10 minutes".',
        expected_impact: 'Reduces hesitation to start.'
      }
    ],
    nextSteps: [
      'Test two button colors and compare click rate.',
      'Rewrite the headline with a concrete result.',
      'Add a short line about the first win timeline.'
    ],
    whyThisMatters: 'Visitors decide fast, so the main action and outcome must be clear.'
  }),
  createScenario({
    id: 'pricing-page',
    title: 'Pricing Page',
    description: 'Pricing page with multiple plans.',
    sampleInput: { type: 'url', value: 'https://product.example.com/pricing' },
    uxScore: 64,
    scoreBreakdown: {
      'Visual Hierarchy': 60,
      'CTA & Conversion': 62,
      'Copy Clarity': 58,
      'Layout & Spacing': 66,
      Accessibility: 70
    },
    summary: {
      top_3_priorities: [
        'Match the pricing headline to what the cards show.',
        'Put price and billing terms before long lists.',
        'Add outcome focused labels to each plan.'
      ],
      overall_notes:
        'Pricing cards feel busy and the headline does not match the amount of detail.'
    },
    issues: [
      {
        title: 'Weak headline-message alignment',
        severity: 'High',
        category: 'Copy Clarity',
        problem: 'The headline promises simplicity but the cards feel complex.',
        evidence: 'Each plan shows a long list before the price and main button.',
        recommendation_steps: [
          'Align the headline with the plan structure.',
          'Shorten the plan copy near the top.'
        ],
        expected_impact: 'Users trust the pricing message.',
        impact: 'Conversion'
      },
      {
        title: "Information order doesn't match user intent",
        severity: 'Medium',
        category: 'Visual Hierarchy',
        problem: 'Plan features appear before price and billing terms.',
        evidence: 'Users must scan long lists before seeing cost details.',
        recommendation_steps: [
          'Place price and billing near the top of each card.',
          'Move long feature lists below the main button.'
        ],
        expected_impact: 'Users find pricing faster.',
        impact: 'Clarity'
      },
      {
        title: 'Too much emphasis on features, not outcomes',
        severity: 'Low',
        category: 'Copy Clarity',
        problem: 'Plans list features without stating user results.',
        evidence: 'No short line explains what each plan helps achieve.',
        recommendation_steps: [
          'Add a one line outcome for each plan.',
          'Use plain language for results.'
        ],
        expected_impact: 'Plans feel more relevant.',
        impact: 'Trust'
      }
    ],
    quickWins: [
      {
        title: 'Move price to the top',
        action: 'Place the monthly price above the feature list.',
        expected_impact: 'Users understand cost sooner.'
      },
      {
        title: 'Add a "Best for" line',
        action: 'Add a short label like "Best for small teams".',
        expected_impact: 'Helps visitors pick the right plan.'
      },
      {
        title: 'Shorten the feature list',
        action: 'Show the top 4 features first and hide the rest.',
        expected_impact: 'Cards feel less crowded.'
      }
    ],
    nextSteps: [
      'Test a simpler card layout with price on top.',
      'Reduce copy to top features only.',
      'Add a short outcome line per plan.'
    ],
    whyThisMatters: 'Pricing should answer "what do I pay" at first glance.'
  }),
  createScenario({
    id: 'checkout',
    title: 'Checkout',
    description: 'Checkout page with form and summary.',
    sampleInput: { type: 'url', value: 'https://shop.example.com/checkout' },
    uxScore: 59,
    scoreBreakdown: {
      'Visual Hierarchy': 56,
      'CTA & Conversion': 52,
      'Copy Clarity': 61,
      'Layout & Spacing': 58,
      Accessibility: 63
    },
    summary: {
      top_3_priorities: [
        'Surface the primary checkout action earlier.',
        'Break the form into shorter steps.',
        'Simplify the layout to reduce noise.'
      ],
      overall_notes:
        'The checkout flow has the right elements, but the main action is easy to miss.'
    },
    issues: [
      {
        title: 'No clear next step',
        severity: 'High',
        category: 'CTA & Conversion',
        problem: 'The main checkout button sits below a long summary.',
        evidence: 'Users must scroll to see the primary action.',
        recommendation_steps: [
          'Move the main button closer to the top.',
          'Keep only one primary button in view.'
        ],
        expected_impact: 'More users complete checkout.',
        impact: 'Conversion'
      },
      {
        title: 'Form feels intimidating',
        severity: 'Medium',
        category: 'Layout & Spacing',
        problem: 'All fields appear at once without grouping.',
        evidence: 'The form looks long and dense on first view.',
        recommendation_steps: [
          'Group fields into shorter sections.',
          'Reduce optional fields where possible.'
        ],
        expected_impact: 'The form feels quicker to finish.',
        impact: 'Trust'
      },
      {
        title: 'Design feels busy or cluttered',
        severity: 'Low',
        category: 'Visual Hierarchy',
        problem: 'Multiple boxes and highlights compete for attention.',
        evidence: 'Borders and labels repeat across the page.',
        recommendation_steps: [
          'Remove extra borders around summary items.',
          'Use one highlight style for totals only.'
        ],
        expected_impact: 'The page feels calmer to scan.',
        impact: 'Clarity'
      }
    ],
    quickWins: [
      {
        title: 'Pin the checkout action',
        action: 'Make the main button visible without scrolling.',
        expected_impact: 'More users see the next step.'
      },
      {
        title: 'Group the form',
        action: 'Separate address, payment, and review sections.',
        expected_impact: 'Reduces the feeling of a long form.'
      },
      {
        title: 'Clean up the summary',
        action: 'Show only totals and remove extra borders.',
        expected_impact: 'Less visual noise during payment.'
      }
    ],
    nextSteps: [
      'Test a two step checkout layout.',
      'Measure drop off after form simplification.',
      'Reduce visual noise in the order summary.'
    ],
    whyThisMatters: 'Checkout needs one clear action and a calm layout.'
  }),
  createScenario({
    id: 'signup-form',
    title: 'Signup Form',
    description: 'Account signup page with a long intro.',
    sampleInput: { type: 'image', value: 'signup-form.png' },
    uxScore: 61,
    scoreBreakdown: {
      'Visual Hierarchy': 59,
      'CTA & Conversion': 57,
      'Copy Clarity': 63,
      'Layout & Spacing': 60,
      Accessibility: 65
    },
    summary: {
      top_3_priorities: [
        'Bring the form into the first screen.',
        'Simplify headings so the form stands out.',
        'Add a short privacy reassurance.'
      ],
      overall_notes:
        'The form is important, but it sits too far down and feels less visible.'
    },
    issues: [
      {
        title: 'Too much content above the fold',
        severity: 'High',
        category: 'Layout & Spacing',
        problem: 'Intro content pushes the form below the first screen.',
        evidence: 'Users must scroll to reach the first input.',
        recommendation_steps: [
          'Move the form higher on the page.',
          'Cut extra text in the intro block.'
        ],
        expected_impact: 'More users start the form.',
        impact: 'Conversion'
      },
      {
        title: 'Visual hierarchy is confusing',
        severity: 'Medium',
        category: 'Visual Hierarchy',
        problem: 'Multiple headings compete with form labels.',
        evidence: 'Two large headlines sit above the form.',
        recommendation_steps: [
          'Keep one headline and one short subline.',
          'Reduce emphasis on secondary text.'
        ],
        expected_impact: 'The form becomes the focus.',
        impact: 'Clarity'
      },
      {
        title: 'Lack of trust signals',
        severity: 'Low',
        category: 'Copy Clarity',
        problem: 'There is no short privacy note near the email field.',
        evidence: 'Users cannot see how their data is used.',
        recommendation_steps: [
          'Add a short privacy note under the email field.',
          'Mention that data is not shared.'
        ],
        expected_impact: 'More users feel safe to sign up.',
        impact: 'Trust'
      }
    ],
    quickWins: [
      {
        title: 'Move the form higher',
        action: 'Place the form beside the intro instead of below it.',
        expected_impact: 'More users see the first input.'
      },
      {
        title: 'Reduce intro copy',
        action: 'Keep the intro to one short sentence.',
        expected_impact: 'Less scrolling before the form.'
      },
      {
        title: 'Add a privacy line',
        action: 'Add a short line about data privacy under the email field.',
        expected_impact: 'Builds trust before submission.'
      }
    ],
    nextSteps: [
      'Track form start rate after the layout change.',
      'Test a shorter form with fewer fields.',
      'Add a trust note below the main button.'
    ],
    whyThisMatters: 'Signup works best when the form is visible and feels safe.'
  }),
  createScenario({
    id: 'mobile-layout',
    title: 'Mobile Layout',
    description: 'Mobile screenshot with a top section and main button.',
    sampleInput: { type: 'image', value: 'mobile-landing.png' },
    uxScore: 63,
    scoreBreakdown: {
      'Visual Hierarchy': 60,
      'CTA & Conversion': 56,
      'Copy Clarity': 61,
      'Layout & Spacing': 67,
      Accessibility: 69
    },
    summary: {
      top_3_priorities: [
        'Increase contrast on the main mobile button.',
        'Use a specific benefit in the first line.',
        'Align colors and spacing across sections.'
      ],
      overall_notes:
        'On mobile, the main action blends into the background and the first line feels broad.'
    },
    issues: [
      {
        title: "CTA doesn't stand out",
        severity: 'High',
        category: 'CTA & Conversion',
        problem: 'The main button blends with the card background on mobile.',
        evidence: 'The button color is close to nearby panels.',
        recommendation_steps: [
          'Increase contrast on the main button.',
          'Add more padding around the button.'
        ],
        expected_impact: 'More taps on the main action.',
        impact: 'Conversion'
      },
      {
        title: 'Copy is generic or vague',
        severity: 'Medium',
        category: 'Copy Clarity',
        problem: 'The first line does not state a clear outcome.',
        evidence: 'The text uses broad terms like "better results".',
        recommendation_steps: [
          'Add a specific result in the first line.',
          'Keep the line under 8 words.'
        ],
        expected_impact: 'Users understand the value quickly.',
        impact: 'Clarity'
      },
      {
        title: 'Visual style feels inconsistent',
        severity: 'Low',
        category: 'Visual Hierarchy',
        problem: 'Cards and icons switch styles across sections.',
        evidence: 'Different corner styles and icon weights are mixed.',
        recommendation_steps: [
          'Use one corner style for all cards.',
          'Standardize icon line weight.'
        ],
        expected_impact: 'The layout feels more cohesive.',
        impact: 'Trust'
      }
    ],
    quickWins: [
      {
        title: 'Increase button contrast',
        action: 'Use a darker color for the main button on mobile.',
        expected_impact: 'The action stands out on small screens.'
      },
      {
        title: 'Shorten the first line',
        action: 'Replace broad text with a specific benefit.',
        expected_impact: 'Users understand the offer faster.'
      },
      {
        title: 'Align card styles',
        action: 'Use the same corner radius across all cards.',
        expected_impact: 'The page feels more consistent.'
      }
    ],
    nextSteps: [
      'Test a higher contrast button color on mobile.',
      'Rewrite the first line with a clear result.',
      'Standardize spacing between mobile sections.'
    ],
    whyThisMatters: 'Mobile users decide fast, so clarity and contrast matter most.'
  }),
  createScenario({
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Product dashboard with metrics and widgets.',
    sampleInput: { type: 'url', value: 'https://app.example.com/dashboard' },
    uxScore: 66,
    scoreBreakdown: {
      'Visual Hierarchy': 58,
      'CTA & Conversion': 62,
      'Copy Clarity': 68,
      'Layout & Spacing': 70,
      Accessibility: 73
    },
    summary: {
      top_3_priorities: [
        'Add one primary action to the dashboard header.',
        'Emphasize the key metric and de-emphasize secondary widgets.',
        'Reorder sections to match daily tasks.'
      ],
      overall_notes:
        'The dashboard shows many metrics, but the next action is not clear.'
    },
    issues: [
      {
        title: 'No clear next step',
        severity: 'High',
        category: 'CTA & Conversion',
        problem: 'The dashboard shows data but no main action.',
        evidence: 'There is no primary button in the header.',
        recommendation_steps: [
          'Add one primary action in the header.',
          'Pin a main task card near the top.'
        ],
        expected_impact: 'Users know what to do next.',
        impact: 'Conversion'
      },
      {
        title: 'Visual hierarchy is confusing',
        severity: 'Medium',
        category: 'Visual Hierarchy',
        problem: 'Key metrics look similar to secondary widgets.',
        evidence: 'All cards use the same size and weight.',
        recommendation_steps: [
          'Make the top metric larger and bolder.',
          'Reduce emphasis on secondary cards.'
        ],
        expected_impact: 'Users spot the main metric faster.',
        impact: 'Clarity'
      },
      {
        title: "Information order doesn't match user intent",
        severity: 'Low',
        category: 'Layout & Spacing',
        problem: 'Less used widgets appear before daily tasks.',
        evidence: 'Recent tasks are placed below charts and tables.',
        recommendation_steps: [
          'Move daily tasks to the top section.',
          'Group low use widgets lower on the page.'
        ],
        expected_impact: 'Users find key tasks faster.',
        impact: 'Clarity'
      }
    ],
    quickWins: [
      {
        title: 'Add a primary action',
        action: 'Place a single main button in the header.',
        expected_impact: 'Guides users to the next step.'
      },
      {
        title: 'Promote the main metric',
        action: 'Increase the size of the main metric card.',
        expected_impact: 'Improves scannability.'
      },
      {
        title: 'Move tasks higher',
        action: 'Place recent tasks above secondary widgets.',
        expected_impact: 'Faster access to common work.'
      }
    ],
    nextSteps: [
      'Interview users about their top daily task.',
      'Reorder widgets based on task frequency.',
      'Track clicks on the new primary action.'
    ],
    whyThisMatters: 'Dashboards need one clear action and a readable order.'
  }),
  createScenario({
    id: 'blog-article',
    title: 'Blog Article',
    description: 'Content article with a subscribe goal.',
    sampleInput: { type: 'url', value: 'https://blog.example.com/post/design-tips' },
    uxScore: 67,
    scoreBreakdown: {
      'Visual Hierarchy': 64,
      'CTA & Conversion': 59,
      'Copy Clarity': 71,
      'Layout & Spacing': 68,
      Accessibility: 74
    },
    summary: {
      top_3_priorities: [
        'Place a clear subscribe action near the intro.',
        'Reduce sidebar noise around the article.',
        'Add a light reason to subscribe now.'
      ],
      overall_notes:
        'Readers reach the end without a clear action, and the page feels crowded.'
    },
    issues: [
      {
        title: 'No clear next step',
        severity: 'High',
        category: 'CTA & Conversion',
        problem: 'There is no clear action after the article content.',
        evidence: 'The subscribe prompt only appears in the footer.',
        recommendation_steps: [
          'Add a subscribe banner near the intro.',
          'Repeat the subscribe action mid article.'
        ],
        expected_impact: 'More readers subscribe while engaged.',
        impact: 'Conversion'
      },
      {
        title: 'Design feels busy or cluttered',
        severity: 'Medium',
        category: 'Layout & Spacing',
        problem: 'Sidebars and widgets compete with the article.',
        evidence: 'Multiple boxes flank the content on both sides.',
        recommendation_steps: [
          'Reduce sidebar items to the top two.',
          'Increase spacing around the article.'
        ],
        expected_impact: 'The article becomes easier to read.',
        impact: 'Clarity'
      },
      {
        title: 'No sense of urgency or motivation',
        severity: 'Low',
        category: 'Copy Clarity',
        problem: 'Readers are not told why to subscribe now.',
        evidence: 'The subscribe prompt lacks a short reason.',
        recommendation_steps: [
          'Add a short line about weekly tips or updates.',
          'Mention a real benefit of subscribing.'
        ],
        expected_impact: 'More readers take action sooner.',
        impact: 'Trust'
      }
    ],
    quickWins: [
      {
        title: 'Add an inline subscribe banner',
        action: 'Place a short subscribe block after the first section.',
        expected_impact: 'Captures attention while readers are engaged.'
      },
      {
        title: 'Simplify the sidebar',
        action: 'Keep only the top two sidebar items.',
        expected_impact: 'Less distraction around the article.'
      },
      {
        title: 'Add a reason to subscribe',
        action: 'Add a line like "Get weekly tips in your inbox".',
        expected_impact: 'Improves motivation to subscribe.'
      }
    ],
    nextSteps: [
      'Test mid article subscribe placement.',
      'Reduce sidebar to the top two items.',
      'Measure subscription conversion after copy update.'
    ],
    whyThisMatters: 'Readers need a clear action while they are still engaged.'
  })
];

export const DEFAULT_DEMO_SCENARIO_ID = demoScenarios[0]?.id ?? 'ecommerce-pdp';

export const getDemoScenarioById = (id: string): DemoScenario => {
  return demoScenarios.find((scenario) => scenario.id === id) ?? demoScenarios[0];
};
