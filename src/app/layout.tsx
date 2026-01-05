import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import { ThemeProvider } from '@/presentation/providers/ThemeProvider';
import { AccessProvider } from '@/presentation/providers/AccessProvider';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans'
});

export const metadata: Metadata = {
  title: 'UXRay',
  description: 'Upload one screenshot. Get clear fixes in seconds.'
};

// NOTE: no "system" anymore. Only 'light' | 'dark'.
const themeScript = `
(function () {
  try {
    var storageKey = 'uxaudit-theme';
    var theme = localStorage.getItem(storageKey);
    if (theme !== 'light' && theme !== 'dark') theme = 'dark';

    var root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={spaceGrotesk.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <AccessProvider>
            {/* Root shell */}
            <div className="relative isolate flex min-h-screen flex-col overflow-x-hidden">
              {/* Background blobs: kept, but prevented from causing horizontal scroll */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-[-12%] top-[-18%] h-96 w-96 rounded-full bg-accent/20 blur-3xl opacity-50"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-[-18%] top-[10%] h-96 w-96 rounded-full bg-primary/20 blur-3xl opacity-50"
              />

              {/* Content */}
              <main className="flex-1">
                {children}
              </main>
            </div>
          </AccessProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
