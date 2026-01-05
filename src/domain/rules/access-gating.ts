import type { AuditReport } from '@/domain/entities/audit-report';
import type { AccessLevel } from '@/domain/value-objects/access-level';

type Issue = AuditReport['issues'][number];
type QuickWin = AuditReport['quick_wins'][number];

type TeaserSection = {
  issues: Issue[];
  quickWins: QuickWin[];
};

type LockedSection = {
  issues: Issue[];
  quickWins: QuickWin[];
};

export type AuditLockState = {
  level: AccessLevel;
  canViewDetails: boolean;
  canViewFull: boolean;
  showLockedCta: boolean;
};

export type AuditAccessView = {
  lockState: AuditLockState;
  visibleIssues: Issue[];
  visibleQuickWins: QuickWin[];
  visibleNextSteps: AuditReport['next_steps'];
  teaser: TeaserSection;
  locked: LockedSection;
};

export const getAuditLockState = (level: AccessLevel): AuditLockState => {
  if (level === 'full') {
    return {
      level,
      canViewDetails: true,
      canViewFull: true,
      showLockedCta: false
    };
  }

  if (level === 'early_access') {
    return {
      level,
      canViewDetails: true,
      canViewFull: false,
      showLockedCta: true
    };
  }

  return {
    level: 'free',
    canViewDetails: false,
    canViewFull: false,
    showLockedCta: true
  };
};

const buildTeaser = (report: AuditReport): TeaserSection => ({
  issues: report.issues.slice(0, 2),
  quickWins: report.quick_wins.slice(0, 1)
});

const buildLocked = (report: AuditReport): LockedSection => ({
  issues: report.issues.slice(2),
  quickWins: report.quick_wins.slice(1)
});

export const buildAuditAccessView = (report: AuditReport, level: AccessLevel): AuditAccessView => {
  const lockState = getAuditLockState(level);
  const teaser = lockState.showLockedCta ? buildTeaser(report) : { issues: [], quickWins: [] };
  const locked = lockState.showLockedCta ? buildLocked(report) : { issues: [], quickWins: [] };

  return {
    lockState,
    visibleIssues: lockState.canViewDetails ? report.issues : [],
    visibleQuickWins: lockState.canViewFull ? report.quick_wins : [],
    visibleNextSteps: lockState.canViewFull ? report.next_steps : [],
    teaser,
    locked
  };
};
