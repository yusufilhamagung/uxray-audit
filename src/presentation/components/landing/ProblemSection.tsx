export default function ProblemSection() {
  const problems = [
    {
      title: 'Analytics are silent',
      description: 'Google Analytics shows high bounce rates but cannot tell you why the main button is easy to miss.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      bg: 'bg-primary/10',
    },
    {
      title: 'Consultants are slow',
      description: 'Hiring a design expert takes weeks and costs thousands. You need answers today, not next month.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-accent/10',
    },
    {
      title: 'Feedback is biased',
      description: 'Asking friends for feedback gives you compliments, not the brutal data-driven truths you need.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
      bg: 'bg-accent-deep/10',
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why are visitors not taking action?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {`Analytics tell you "what" is happening, but they don't tell you "why". That's where we come in.`}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {problems.map((problem, idx) => (
            <div key={idx} className="group rounded-3xl p-8 bg-surface-2 hover:bg-surface border border-transparent hover:border-border shadow-sm hover:shadow-xl transition-all duration-300">
              <div className={`w-12 h-12 rounded-2xl ${problem.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {problem.icon}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{problem.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
