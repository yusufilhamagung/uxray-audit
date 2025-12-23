import Link from 'next/link';
import BrandLogo from '@/presentation/components/BrandLogo';
import ThemeSwitcher from '@/presentation/components/ThemeSwitcher';
export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="section-container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
           <BrandLogo size={32} />
           <span className="text-xl font-bold tracking-tight text-foreground">UXRay</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <Link href="/audit" className="btn-secondary hidden py-2 text-xs sm:inline-flex">
            Audit Now
          </Link>
        </div>
      </div>
    </header>
  );
}
