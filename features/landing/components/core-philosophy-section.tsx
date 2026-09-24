"use client";

export function CorePhilosophySection() {
  const principles = [
    {
      num: "01",
      title: "PLAN",
      subtitle: "Build your trip your way.",
      description:
        "No rigid pre-baked templates. Add stops, flexible timeblocks, and open exploration hours with total creative freedom.",
    },
    {
      num: "02",
      title: "ORGANIZE",
      subtitle: "Keep everything together.",
      description:
        "Accommodations, vouchers, passes, subway routes, and split expenses reside in a single coherent workspace.",
    },
    {
      num: "03",
      title: "ASSIST",
      subtitle: "Use AI when you need it.",
      description:
        "Never an overbearing chatbot. Contextual intelligence that respects your taste, solves route puzzles, and stays quiet otherwise.",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#FAFAF9] dark:bg-zinc-950 transition-colors">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 space-y-16">
        
        {/* Section Header */}
        <div className="space-y-3 max-w-2xl">
          <span className="font-mono text-[11px] font-semibold tracking-widest text-zinc-500 uppercase">
            Core Philosophy
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.15]">
            Three principles for modern journeys.
          </h2>
        </div>

        {/* 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80">
          {principles.map((item, index) => (
            <div key={index} className="space-y-4">
              <span className="font-mono text-xs text-zinc-400 block">
                {item.num}
              </span>
              <h3 className="font-bold text-lg tracking-tight text-zinc-950 dark:text-zinc-50">
                {item.title}
              </h3>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {item.subtitle}
              </p>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
