import Link from 'next/link';


export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-md">
      <div className="section-container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
           </div>
           <span className="text-xl font-bold tracking-tight text-slate-900">UXAudit AI</span>
        </Link>
        <Link href="/audit" className="btn-secondary hidden py-2 text-xs sm:inline-flex">
          Audit Now
        </Link>
      </div>
    </header>
  );
}
