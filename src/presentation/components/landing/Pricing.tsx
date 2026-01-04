import Link from 'next/link';

export default function Pricing() {
  return (
    <section className="py-24 bg-surface-2">
      <div className="section-container px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-muted-foreground">
            No long-term contracts. Cancel anytime.
          </p>
        </div>

        <div className="mx-auto grid max-w-lg gap-8 lg:max-w-4xl lg:grid-cols-2 lg:gap-12">
          {/* Card 1: Pay As You Go */}
          <div className="flex flex-col rounded-3xl bg-card p-8 shadow-sm ring-1 ring-border xl:p-10 w-full">
            <h3 className="text-lg font-semibold leading-8 text-foreground">Pay As You Go</h3>
            <p className="border-b border-border/60 pb-6 text-sm leading-6 text-muted-foreground">Perfect for one-off audits</p>
            <div className="my-6">
               <span className="text-4xl font-bold tracking-tight text-foreground">$5</span>
               <span className="text-sm font-semibold leading-6 text-muted-foreground"> / audit</span>
            </div>
            <ul role="list" className="mt-2 mb-8 space-y-3 text-sm leading-6 text-muted-foreground">
               <li className="flex gap-x-3">
                 <svg className="h-6 w-5 flex-none text-accent" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                 Full Website Audit
               </li>
               <li className="flex gap-x-3">
                 <svg className="h-6 w-5 flex-none text-accent" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                 Actionable Recommendations
               </li>
               <li className="flex gap-x-3">
                 <svg className="h-6 w-5 flex-none text-accent" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                 PDF Report
               </li>
            </ul>
            <Link href="/audit" className="mt-auto block w-full rounded-2xl border border-border bg-surface px-3 py-3 text-center text-sm font-semibold text-foreground shadow-sm hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
               Buy Now
            </Link>
          </div>

          {/* Card 2: Pro */}
          <div className="relative flex flex-col rounded-3xl bg-accent/10 p-8 shadow-lg shadow-glow ring-1 ring-accent/30 xl:p-10 w-full">
             <div className="absolute -top-4 right-8 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground shadow-sm">
                BEST VALUE
             </div>
            <h3 className="text-lg font-semibold leading-8 text-accent-deep">Pro Monthly</h3>
            <p className="border-b border-accent/30 pb-6 text-sm leading-6 text-accent">For agencies & power users</p>
            <div className="my-6">
               <span className="text-4xl font-bold tracking-tight text-foreground">$19</span>
               <span className="text-sm font-semibold leading-6 text-muted-foreground"> / month</span>
            </div>
            <ul role="list" className="mt-2 mb-8 space-y-3 text-sm leading-6 text-muted-foreground">
               <li className="flex gap-x-3">
                 <svg className="h-6 w-5 flex-none text-accent" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                 Unlimited Audits
               </li>
               <li className="flex gap-x-3">
                 <svg className="h-6 w-5 flex-none text-accent" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                 Priority Generation
               </li>
               <li className="flex gap-x-3">
                 <svg className="h-6 w-5 flex-none text-accent" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                 Compare Histories
               </li>
               <li className="flex gap-x-3">
                 <svg className="h-6 w-5 flex-none text-accent" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                 Coming Anytime
               </li>
            </ul>
            <Link href="/audit" className="mt-auto block w-full rounded-2xl bg-accent px-3 py-3 text-center text-sm font-semibold text-accent-foreground shadow-sm hover:bg-accent-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
               Get Pro Plan
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
