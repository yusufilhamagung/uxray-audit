'use client';

import { useTheme, type ThemeMode } from '@/presentation/providers/ThemeProvider';

const options: Array<{ value: ThemeMode; label: string }> = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' }
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 p-1 text-xs"
      role="radiogroup"
      aria-label="Theme"
    >
      {options.map((option) => {
        const isActive = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setTheme(option.value)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              isActive
                ? 'bg-surface text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
