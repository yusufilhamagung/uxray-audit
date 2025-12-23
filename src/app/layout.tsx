import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import { ThemeProvider } from '@/presentation/providers/ThemeProvider';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans'
});

export const metadata: Metadata = {
  title: 'UXAudit AI',
  description: 'Audit UX website kamu dalam 2 menit - tanpa konsultan, tanpa ribet.'
};

const themeScript = `
(function() {
  try {
    var storageKey = 'uxaudit-theme';
    var theme = localStorage.getItem(storageKey);
    var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var resolved = theme === 'dark' || (theme !== 'light' && systemDark);
    var root = document.documentElement;
    root.classList.toggle('dark', resolved);
    root.dataset.theme = theme || 'system';
    root.style.colorScheme = resolved ? 'dark' : 'light';
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={spaceGrotesk.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-background text-foreground">
        <ThemeProvider>
          <div className="relative isolate min-h-screen">
            <div className="pointer-events-none absolute left-[-10%] top-[-15%] h-96 w-96 rounded-full bg-accent/20 blur-3xl opacity-50" />
            <div className="pointer-events-none absolute right-[-15%] top-[15%] h-96 w-96 rounded-full bg-primary/20 blur-3xl opacity-50" />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
