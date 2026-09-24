"use client";

export function ThesisSection() {
  return (
    <section className="border-y border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 py-20 sm:py-28 transition-colors">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-start">
          
          {/* Left Metadata Column */}
          <div className="md:col-span-3 space-y-2 font-mono text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            <p className="font-semibold text-zinc-800 dark:text-zinc-300">Thesis</p>
            <p>Section 01</p>
            <p className="text-zinc-500">The Problem of Fragmentation</p>
          </div>

          {/* Right Statement Column */}
          <div className="md:col-span-9 space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.2]">
              Travel planning gets complicated{" "}
              <span className="font-serif italic font-normal text-zinc-900 dark:text-zinc-100">
                when everything lives somewhere else.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed max-w-2xl">
              Prava brings your itinerary, stays, expenses, notes, checklists and travel
              essentials into one workspace.
            </p>

            <div className="pt-6 flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-500 dark:text-zinc-400 tracking-wider uppercase">
              <span>Workspace First</span>
              <span>·</span>
              <span>AI Second</span>
              <span>·</span>
              <span>Human Intent</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
