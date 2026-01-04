export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Upload Screenshot',
      desc: 'Or paste your URL. We visualize your site through a user lens.',
    },
    {
      num: '02',
      title: 'Instant Review',
      desc: 'We scan for contrast, hierarchy errors, and common UX pitfalls.',
    },
    {
      num: '03',
      title: 'Get Results',
      desc: 'Receive a prioritized list of fixes that increase your conversion clarity.',
    },
  ];

  return (
    <section className="py-24 bg-surface-2">
      <div className="section-container">
        <div className="flex flex-col items-center justify-center text-center mb-16">
           <div className="inline-flex items-center rounded-md border border-border bg-surface px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">
             Three simple steps
           </div>
           <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
             From screenshot to strategy in minutes
           </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3 relative">
           {/* Connecting Line (Desktop) */}
           <div className="absolute top-12 left-[16%] right-[16%] hidden h-0.5 border-t border-dashed border-border bg-border md:block"></div>

           {steps.map((step, idx) => (
             <div key={idx} className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-surface border-4 border-surface-2 shadow-md flex items-center justify-center text-xl font-bold text-primary mb-6 z-10">
                   {step.num}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">{step.desc}</p>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}
