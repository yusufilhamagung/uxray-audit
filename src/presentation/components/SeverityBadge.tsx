import type { Severity } from '@/shared/validation/schema';

const styles: Record<string, string> = {
  High: 'border-status-error/30 bg-status-error/10 text-status-error',
  Medium: 'border-status-warning/30 bg-status-warning/10 text-status-warning',
  Low: 'border-status-success/30 bg-status-success/10 text-status-success'
};

export function SeverityBadge({ severity }: { severity: string }) {
  const style = styles[severity] || 'border-border bg-surface-2 text-muted-foreground';
  return <span className={`badge ${style}`}>{severity}</span>;
}
