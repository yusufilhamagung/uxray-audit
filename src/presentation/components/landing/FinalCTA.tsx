import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-transparent">
         {/* Optional bottom gradient */}
         <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-orange-50 to-transparent opacity-50"></div>
      </div>
      
      <div className="section-container relative z-10 text-center">
         <h2 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-6">
           Fix your UX before you <br className="hidden sm:block" />
           <span className="text-orange-600">spend another dollar on ads.</span>
         </h2>
         <p className="mx-auto max-w-xl text-lg text-slate-600 mb-10">
           Takes less than 2 minutes. No credit card required to start.
         </p>
         
         <Link href="/audit" className="btn-primary text-lg px-8 py-4 shadow-xl shadow-orange-200">
            Run My UX Audit
         </Link>
      </div>
    </section>
  );
}
