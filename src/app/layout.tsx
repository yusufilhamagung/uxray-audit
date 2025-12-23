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
          <div className="pointer-events-none absolute left-[-10%] top-[-15%] h-96 w-96 rounded-full bg-orange-200/40 blur-3xl opacity-50" />
          <div className="pointer-events-none absolute right-[-15%] top-[15%] h-96 w-96 rounded-full bg-yellow-200/40 blur-3xl opacity-50" />
          {children}
        </div>
      </body>
    </html>
  );
}
