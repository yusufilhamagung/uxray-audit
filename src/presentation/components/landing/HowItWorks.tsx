export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Upload Screenshot',
      desc: 'Or simply paste your URL. Our AI visualizes your site just like a user would.',
    },
    {
      num: '02',
      title: 'AI Analysis',
      desc: 'Our models scan for contrast, hierarchy errors, and common UX pitfalls.',
    },
    {
      num: '03',
      title: 'Get Results',
      desc: 'Receive a prioritized list of fixes that increase your conversion rate instantly.',
    },
  ];

  return (
    <section className="py-24 bg-slate-50/50">
      <div className="section-container">
        <div className="flex flex-col items-center justify-center text-center mb-16">
           <div className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-6">
             Three simple steps
           </div>
           <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
             From screenshot to strategy in minutes
           </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3 relative">
           {/* Connecting Line (Desktop) */}
           <div className="absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-200 hidden md:block border-t border-dashed border-slate-300"></div>

           {steps.map((step, idx) => (
             <div key={idx} className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-white border-4 border-slate-50 shadow-md flex items-center justify-center text-xl font-bold text-green-500 mb-6 z-10">
                   {step.num}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 max-w-xs mx-auto">{step.desc}</p>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}
