import type { Severity } from '@/shared/validation/schema';

const styles: Record<Severity, string> = {
  High: 'border-rose-200 bg-rose-50 text-rose-700',
  Medium: 'border-amber-200 bg-amber-50 text-amber-700',
  Low: 'border-emerald-200 bg-emerald-50 text-emerald-700'
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return <span className={`badge ${styles[severity]}`}>{severity}</span>;
}
