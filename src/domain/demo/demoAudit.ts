import type { AccessLevel } from '@/domain/value-objects/access-level';
import type { AuditReport } from '@/domain/entities/audit-report';
import { getAuditLockState, type AuditLockState } from '@/domain/rules/access-gating';
import type { DemoScenario } from '@/domain/demo/demoScenarios';

export type DemoAuditPayload = {
  audit_id: string;
  result: AuditReport;
  image_url: string;
  model_used: string;
  latency_ms: number;
  created_at: string;
  lock_state: AuditLockState;
};

const stableHash = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const buildDemoTimestamp = (scenarioId: string) => {
  const base = Date.UTC(2025, 0, 1);
  const offsetDays = stableHash(scenarioId) % 180;
  return new Date(base + offsetDays * 24 * 60 * 60 * 1000).toISOString();
};

export const selectDemoResult = (scenario: DemoScenario, accessLevel: AccessLevel): AuditReport => {
  if (accessLevel === 'full') return scenario.resultFull;
  return scenario.resultFree;
};

export const buildDemoAuditPayload = (
  scenario: DemoScenario,
  accessLevel: AccessLevel,
  imageUrl: string
): DemoAuditPayload => {
  const lockState = getAuditLockState(accessLevel);
  return {
    audit_id: scenario.id,
    result: selectDemoResult(scenario, accessLevel),
    image_url: imageUrl,
    model_used: 'demo',
    latency_ms: 0,
    created_at: buildDemoTimestamp(scenario.id),
    lock_state: lockState
  };
};
