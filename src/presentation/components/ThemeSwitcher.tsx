'use client';

import { useTheme, type ThemeMode } from '@/presentation/providers/ThemeProvider';

const options: Array<{ value: ThemeMode; label: string }> = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' }
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <div className="flex items-center gap-2">
      <div
        className="hidden min-[431px]:inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 p-1 text-xs"
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
              className={`rounded-full px-3 py-2 text-xs font-semibold transition-all min-h-[44px] ${
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

      <button
        type="button"
        role="switch"
        aria-checked={theme === 'dark'}
        aria-label={`Toggle ${theme === 'dark' ? 'dark' : 'light'} mode`}
        onClick={toggleTheme}
        className="inline-flex min-[431px]:hidden items-center justify-center rounded-full border border-border bg-surface-2 px-4 py-2 text-xs font-semibold text-foreground shadow-sm transition-colors min-h-[44px]"
      >
        {theme === 'dark' ? 'Dark' : 'Light'}
      </button>
    </div>
  );
}
