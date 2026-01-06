"use client";

type LockedSectionProps = {
  onUnlockClick: () => void;
};

const bullets = [
  'Priority UX issues (what to fix first)',
  'Clear fix suggestions (no jargon)',
  'Copy & CTA improvement ideas'
];

export default function LockedSection({ onUnlockClick }: LockedSectionProps) {
  return (
    <section className="card p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 11c1.1 0 2 .9 2 2v2a2 2 0 0 1-4 0v-2c0-1.1.9-2 2-2zm5-3h-1V6a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2z"
                />
              </svg>
            </span>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Stop Guessing. Get UX Clarity.</h3>
              <p className="mt-1 text-sm text-muted-foreground">Turn one screenshot into a clear action plan.</p>
            </div>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-accent" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto">
          <button type="button" className="btn-primary w-full sm:w-auto" onClick={onUnlockClick}>
            👉 Unlock Full Report
          </button>
          <p className="text-xs text-muted-foreground">No payment required — early access only</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="h-4 w-full rounded-full bg-surface-2/80 blur-sm" />
        <div className="h-4 w-[92%] rounded-full bg-surface-2/80 blur-sm" />
        <div className="h-4 w-[86%] rounded-full bg-surface-2/80 blur-sm" />
      </div>
    </section>
  );
}
