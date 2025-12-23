import Link from 'next/link';

export default function Pricing() {
  return (
    <section className="py-24 bg-slate-50/50">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-slate-600">
            No long-term contracts. Cancel anytime.
          </p>
        </div>

        <div className="mx-auto grid max-w-lg gap-8 lg:max-w-4xl lg:grid-cols-2 lg:gap-12">
          {/* Card 1: Pay As You Go */}
          <div className="flex flex-col rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 xl:p-10">
            <h3 className="text-lg font-semibold leading-8 text-slate-900">Pay As You Go</h3>
            <p className="border-b border-slate-100 pb-6 text-sm leading-6 text-slate-600">Perfect for one-off audits</p>
            <div className="my-6">
               <span className="text-4xl font-bold tracking-tight text-slate-900">$5</span>
               <span className="text-sm font-semibold leading-6 text-slate-600"> / audit</span>
            </div>
            <ul role="list" className="mt-2 mb-8 space-y-3 text-sm leading-6 text-slate-600">
               <li className="flex gap-x-3">
                 <svg className="h-6 w-5 flex-none text-orange-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                 Full Website Audit
               </li>
               <li className="flex gap-x-3">
                 <svg className="h-6 w-5 flex-none text-orange-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                 Actionable Recommendations
               </li>
               <li className="flex gap-x-3">
                 <svg className="h-6 w-5 flex-none text-orange-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                 PDF Report
               </li>
            </ul>
            <Link href="/audit" className="mt-auto block w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">
               Buy Now
            </Link>
          </div>

          {/* Card 2: Pro */}
          <div className="relative flex flex-col rounded-3xl bg-orange-50/50 p-8 shadow-lg shadow-orange-100 ring-1 ring-orange-200 xl:p-10">
             <div className="absolute -top-4 right-8 rounded-full bg-orange-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                BEST VALUE
             </div>
            <h3 className="text-lg font-semibold leading-8 text-orange-900">Pro Monthly</h3>
            <p className="border-b border-orange-200/50 pb-6 text-sm leading-6 text-orange-700">For agencies & power users</p>
            <div className="my-6">
               <span className="text-4xl font-bold tracking-tight text-slate-900">$19</span>
               <span className="text-sm font-semibold leading-6 text-slate-600"> / month</span>
            </div>
            <ul role="list" className="mt-2 mb-8 space-y-3 text-sm leading-6 text-slate-700">
               <li className="flex gap-x-3">
                 <svg className="h-6 w-5 flex-none text-orange-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                 Unlimited Audits
               </li>
               <li className="flex gap-x-3">
                 <svg className="h-6 w-5 flex-none text-orange-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                 Priority Generation
               </li>
               <li className="flex gap-x-3">
                 <svg className="h-6 w-5 flex-none text-orange-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                 Compare Histories
               </li>
               <li className="flex gap-x-3">
                 <svg className="h-6 w-5 flex-none text-orange-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                 Coming Anytime
               </li>
            </ul>
            <Link href="/audit" className="mt-auto block w-full rounded-2xl bg-orange-600 px-3 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">
               Get Pro Plan
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
