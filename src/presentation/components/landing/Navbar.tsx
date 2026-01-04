import Link from 'next/link';
import BrandLogo from '@/presentation/components/BrandLogo';
import ThemeSwitcher from '@/presentation/components/ThemeSwitcher';

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="section-container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <BrandLogo size={32} />
          <span className="truncate text-lg sm:text-xl font-bold tracking-tight text-foreground">
            UXRay
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeSwitcher />

          <Link
            href="/audit"
            className="btn-secondary hidden md:inline-flex items-center justify-center px-4 py-2 text-sm"
          >
            Audit Now
          </Link>
        </div>
      </div>
    </header>
  );
}
