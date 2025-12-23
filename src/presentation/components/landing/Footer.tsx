import BrandLogo from '@/presentation/components/BrandLogo';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="section-container flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-2">
            <BrandLogo size={24} />
            <span className="font-bold text-foreground">UXRay</span>
         </div>
         
         <div className="flex gap-8 text-sm text-muted-foreground">
            <a href="/privacy" className="hover:text-accent transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-accent transition-colors">Terms</a>
            <a href="/contact" className="hover:text-accent transition-colors">Contact</a>
         </div>
         
         <div className="text-sm text-subtle">
            &copy; {new Date().getFullYear()} UXRay. All rights reserved.
         </div>
      </div>
    </footer>
  );
}
