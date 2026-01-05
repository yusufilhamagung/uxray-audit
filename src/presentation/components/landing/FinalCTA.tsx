import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-transparent">
         {/* Optional bottom gradient */}
         <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-accent/10 to-transparent opacity-50"></div>
      </div>
      
      <div className="section-container relative z-10 text-center">
         <h2 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-6">
           Fix your page before you <br className="hidden sm:block" />
           <span className="text-accent">spend another dollar on ads.</span>
         </h2>
         <p className="mx-auto max-w-xl text-lg text-muted-foreground mb-10">
           Takes less than 2 minutes. No credit card required to start.
         </p>
         
         <Link href="/audit" className="btn-primary text-lg px-8 py-4 shadow-xl shadow-glow">
            Run My Audit
         </Link>
      </div>
    </section>
  );
}
