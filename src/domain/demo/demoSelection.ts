import { demoScenarios, DEFAULT_DEMO_SCENARIO_ID, getDemoScenarioById } from './demoScenarios';

const normalize = (value: string) => value.toLowerCase();

const stableHash = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const scenarioByHash = (seed: string) => {
  const index = stableHash(seed) % demoScenarios.length;
  return demoScenarios[index];
};

const matchKeyword = (source: string, keywords: string[]) =>
  keywords.some((keyword) => source.includes(keyword));

export const selectScenarioByUrl = (url: string) => {
  const normalized = normalize(url);

  if (matchKeyword(normalized, ['checkout', 'cart'])) {
    return getDemoScenarioById('checkout');
  }
  if (matchKeyword(normalized, ['pricing', 'plan', 'billing'])) {
    return getDemoScenarioById('pricing-page');
  }
  if (matchKeyword(normalized, ['signup', 'register', 'sign-up'])) {
    return getDemoScenarioById('signup-form');
  }
  if (matchKeyword(normalized, ['shop', 'product', 'pdp', 'store'])) {
    return getDemoScenarioById('ecommerce-pdp');
  }
  if (matchKeyword(normalized, ['dashboard', 'app', 'workspace'])) {
    return getDemoScenarioById('dashboard');
  }
  if (matchKeyword(normalized, ['blog', 'article', 'docs', 'guide'])) {
    return getDemoScenarioById('blog-article');
  }
  if (matchKeyword(normalized, ['mobile', 'ios', 'android'])) {
    return getDemoScenarioById('mobile-layout');
  }
  if (matchKeyword(normalized, ['landing', 'home'])) {
    return getDemoScenarioById('landing-saas');
  }

  return scenarioByHash(normalized);
};

export const selectScenarioByFilename = (filename: string | null | undefined) => {
  if (!filename) {
    return getDemoScenarioById(DEFAULT_DEMO_SCENARIO_ID);
  }

  const normalized = normalize(filename);

  if (matchKeyword(normalized, ['checkout', 'cart'])) {
    return getDemoScenarioById('checkout');
  }
  if (matchKeyword(normalized, ['pricing', 'plan', 'billing'])) {
    return getDemoScenarioById('pricing-page');
  }
  if (matchKeyword(normalized, ['signup', 'register', 'sign-up'])) {
    return getDemoScenarioById('signup-form');
  }
  if (matchKeyword(normalized, ['shop', 'product', 'pdp', 'store'])) {
    return getDemoScenarioById('ecommerce-pdp');
  }
  if (matchKeyword(normalized, ['dashboard', 'app', 'workspace'])) {
    return getDemoScenarioById('dashboard');
  }
  if (matchKeyword(normalized, ['blog', 'article', 'docs', 'guide'])) {
    return getDemoScenarioById('blog-article');
  }
  if (matchKeyword(normalized, ['mobile', 'ios', 'android'])) {
    return getDemoScenarioById('mobile-layout');
  }
  if (matchKeyword(normalized, ['landing', 'home'])) {
    return getDemoScenarioById('landing-saas');
  }

  return getDemoScenarioById(DEFAULT_DEMO_SCENARIO_ID);
};
