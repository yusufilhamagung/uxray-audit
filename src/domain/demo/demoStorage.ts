const DEMO_SCENARIO_KEY = 'uxray_demo_scenario';

export const readDemoScenarioId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(DEMO_SCENARIO_KEY);
};

export const writeDemoScenarioId = (scenarioId: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DEMO_SCENARIO_KEY, scenarioId);
};

export const clearDemoScenarioId = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(DEMO_SCENARIO_KEY);
};

export const DEMO_SCENARIO_STORAGE_KEY = DEMO_SCENARIO_KEY;
