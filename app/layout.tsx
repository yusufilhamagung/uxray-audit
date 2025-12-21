import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={spaceGrotesk.variable}>
      <body>
        <div className="relative isolate min-h-screen">
          <div className="pointer-events-none absolute left-[-10%] top-[-15%] h-64 w-64 rounded-full bg-orange-200/40 blur-3xl" />
          <div className="pointer-events-none absolute right-[-15%] top-[15%] h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
          {children}
        </div>
      </body>
    </html>
  );
}
