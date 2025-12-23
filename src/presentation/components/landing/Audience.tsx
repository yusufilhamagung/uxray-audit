export default function Audience() {
  const personas = [
    {
      role: 'Founders',
      company: 'Building Creating Ltd.',
      desc: 'Focus on shipping, not nitpicking pixels. Fix professional debt faster without hiring a designer.',
    },
    {
      role: 'Marketers',
      company: 'Campaign Optimization',
      desc: 'Uncover why your landing pages perform poorly. Get specific edits to supercharge conversion.',
    },
    {
      role: 'Freelancers',
      company: 'Agency Admins',
      desc: 'Offer concrete add-on services to your clients. Audit their current site instantly to close deals.',
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Who needs UXAudit AI?
          </h2>
          <p className="mt-4 text-slate-600">Built for teams that move fast and convert quality.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {personas.map((persona, idx) => (
            <div key={idx} className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-orange-100 hover:bg-white hover:shadow-xl transition-all duration-300">
               <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900">{persona.role}</h3>
                  <p className="text-xs font-medium uppercase tracking-wide text-orange-600">{persona.company}</p>
               </div>
               <p className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors">
                 {persona.desc}
               </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
