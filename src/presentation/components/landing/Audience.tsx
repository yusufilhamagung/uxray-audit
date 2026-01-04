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
    <section className="py-24 bg-background">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Who needs UXRay?
          </h2>
          <p className="mt-4 text-muted-foreground">Built for teams that move fast and convert quality.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {personas.map((persona, idx) => (
            <div key={idx} className="group p-8 rounded-3xl bg-surface-2 border border-border hover:border-accent/30 hover:bg-surface hover:shadow-xl transition-all duration-300">
               <div className="mb-4">
                  <h3 className="text-lg font-bold text-foreground">{persona.role}</h3>
                  <p className="text-xs font-medium uppercase tracking-wide text-accent">{persona.company}</p>
               </div>
               <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                 {persona.desc}
               </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
