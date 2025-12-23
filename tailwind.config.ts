import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/presentation/**/*.{ts,tsx}',
    './src/shared/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        card: 'hsl(var(--surface) / <alpha-value>)',
        'card-foreground': 'hsl(var(--foreground) / <alpha-value>)',
        surface: 'hsl(var(--surface) / <alpha-value>)',
        'surface-2': 'hsl(var(--surface-2) / <alpha-value>)',
        'surface-3': 'hsl(var(--surface-3) / <alpha-value>)',
        muted: 'hsl(var(--surface-2) / <alpha-value>)',
        'muted-foreground': 'hsl(var(--text-muted) / <alpha-value>)',
        subtle: 'hsl(var(--text-subtle) / <alpha-value>)',
        border: 'hsl(var(--border) / <alpha-value>)',
        divider: 'hsl(var(--divider) / <alpha-value>)',
        input: 'hsl(var(--input) / <alpha-value>)',
        'input-border': 'hsl(var(--input-border) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',
        primary: 'hsl(var(--primary) / <alpha-value>)',
        'primary-foreground': 'hsl(var(--primary-foreground) / <alpha-value>)',
        accent: 'hsl(var(--accent) / <alpha-value>)',
        'accent-foreground': 'hsl(var(--accent-foreground) / <alpha-value>)',
        'accent-deep': 'hsl(var(--accent-deep) / <alpha-value>)',
        status: {
          error: 'hsl(var(--status-error) / <alpha-value>)',
          warning: 'hsl(var(--status-warning) / <alpha-value>)',
          success: 'hsl(var(--status-success) / <alpha-value>)'
        }
      },
      boxShadow: {
        glow: '0 12px 30px hsl(var(--shadow-color) / 0.25)'
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' }
        }
      },
      animation: {
        'fade-up': 'fadeUp 0.7s ease-out both',
        'pulse-soft': 'pulseSoft 2.4s ease-in-out infinite'
      }
    }
  },
  plugins: []
};

export default config;
