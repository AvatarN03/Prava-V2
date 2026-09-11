const STEPS = [
  {
    number: "STEP 01",
    title: "Create Your Trip Workspace",
    description:
      "Set your destination, dates, and budget. Initialize a fresh workspace with 7 sub-modules or clone a curated itinerary from the community.",
  },
  {
    number: "STEP 02",
    title: "Collaborate with Governed AI",
    description:
      "Ask AI to structure day-by-day activities, optimize transit routes, or suggest accommodations. Review structured visual diffs before accepting.",
  },
  {
    number: "STEP 03",
    title: "Execute with Confidence",
    description:
      "Access packing checklists, currency rates, emergency contacts, and maps offline or on mobile during your journey with zero friction.",
  },
];

export function WorkflowSection() {
  return (
    <section id="workflow" className="py-16 md:py-24 border-b border-border/60 transition-colors">
      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold tracking-wider uppercase text-[#2D9BF0] bg-sky-50 dark:bg-sky-950/80 border border-sky-200/80 dark:border-sky-800/80 px-3 py-1 rounded-full">
            The Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-3">
            How Prava AI Works
          </h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            A linear, predictable process from concept to on-the-ground execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-3 shadow-2xs hover:border-[#2D9BF0]/40 transition-colors"
            >
              <div className="text-xs font-mono font-bold text-[#2D9BF0]">
                {step.number}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {step.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
