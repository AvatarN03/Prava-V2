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
        "Accommodations, vouchers, passes, express train routes, UPI payments, and split expenses reside in a single coherent workspace.",
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
    <section data-nav-theme="light" className="py-16 sm:py-24 lg:py-28 bg-[#FAFAF9] border-t border-zinc-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-10 lg:px-16 space-y-12 sm:space-y-16">
        {/* Section Header with Responsive Typography */}
        <div className="space-y-3 max-w-2xl">
          <span className="text-[11px] font-semibold tracking-widest text-[#2D9BF0] uppercase">
            Core Philosophy
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-zinc-950 leading-[1.15] break-words [text-wrap:balance]">
            Three principles for
            <span className="block font-serif italic font-normal text-zinc-800 mt-1 sm:mt-2">
              modern journeys.
            </span>
          </h2>
        </div>

        {/* 3 Columns in Pure Crisp Light Theme */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-16 pt-4 border-t border-zinc-200/80">
          {principles.map((item, index) => (
            <div key={index} className="space-y-3 sm:space-y-4">
              <span className="text-xs text-zinc-400 block tabular-nums font-medium">
                {item.num}
              </span>
              <h3 className="font-bold text-lg tracking-tight text-zinc-950">
                {item.title}
              </h3>
              <p className="text-sm font-medium text-zinc-800">
                {item.subtitle}
              </p>
              <p className="text-xs sm:text-sm text-zinc-600 font-normal leading-relaxed break-words">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
