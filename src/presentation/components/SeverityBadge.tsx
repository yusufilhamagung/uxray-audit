import type { Severity } from '@/shared/validation/schema';

const styles: Record<string, string> = {
  High: 'border-rose-200 bg-rose-50 text-rose-700',
  Medium: 'border-amber-200 bg-amber-50 text-amber-700',
  Low: 'border-emerald-200 bg-emerald-50 text-emerald-700'
};

export function SeverityBadge({ severity }: { severity: string }) {
  const style = styles[severity] || 'border-slate-200 bg-slate-50 text-slate-700';
  return <span className={`badge ${style}`}>{severity}</span>;
}
