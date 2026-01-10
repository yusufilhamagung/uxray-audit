'use client';

type AuditHeaderStatusProps = {
  hasEarlyAccess: boolean;
  hasFullAccess: boolean;
  earlyAccessRemainingAttempts: number;
  isLoading?: boolean;
};

export function AuditHeaderStatus({
  hasEarlyAccess,
  hasFullAccess,
  earlyAccessRemainingAttempts,
  isLoading = false,
}: AuditHeaderStatusProps) {
  // Determine access status label
  const getStatusLabel = (): string => {
    if (hasFullAccess) return 'Pro';
    if (hasEarlyAccess) return 'Early Access';
    return 'Free';
  };

  // Determine status badge style
  const getStatusStyle = (): string => {
    if (hasFullAccess) {
      return 'border-primary/30 bg-primary/10 text-primary';
    }
    if (hasEarlyAccess) {
      return 'border-status-success/30 bg-status-success/10 text-status-success';
    }
    return 'border-border bg-surface-2 text-muted-foreground';
  };

  // Determine token display
  const getTokenDisplay = (): string => {
    if (hasFullAccess) return 'Unlimited';
    if (hasEarlyAccess && earlyAccessRemainingAttempts > 0) {
      return `Sisa: ${earlyAccessRemainingAttempts}`;
    }
    if (hasEarlyAccess && earlyAccessRemainingAttempts === 0) {
      return 'Sisa: 0';
    }
    // Free mode or unknown
    return '—';
  };

  // Token badge style
  const getTokenStyle = (): string => {
    if (hasFullAccess) {
      return 'border-primary/30 bg-primary/10 text-primary';
    }
    if (hasEarlyAccess && earlyAccessRemainingAttempts > 0) {
      return 'border-status-success/30 bg-status-success/10 text-status-success';
    }
    if (hasEarlyAccess && earlyAccessRemainingAttempts === 0) {
      return 'border-status-warning/30 bg-status-warning/10 text-status-warning';
    }
    return 'border-border bg-surface-2 text-muted-foreground';
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <span className="badge border-border bg-surface-2 text-muted-foreground animate-pulse">
          <span className="opacity-50">Audit: —</span>
        </span>
        <span className="badge border-border bg-surface-2 text-muted-foreground animate-pulse">
          <span className="opacity-50">Status</span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`badge ${getTokenStyle()}`} title="Audit tersisa">
        Audit: {getTokenDisplay()}
      </span>
      <span className={`badge ${getStatusStyle()}`} title="Status akses">
        {getStatusLabel()}
      </span>
    </div>
  );
}
