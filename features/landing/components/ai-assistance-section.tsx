"use client";

import { useState } from "react";

import { Check, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AiAssistanceSection() {
  const [applied, setApplied] = useState(false);
  const [showReasoning, setShowReasoning] = useState(true);
  const [activePrompt, setActivePrompt] = useState(
    "Can you rearrange tomorrow's stops in Jaipur to avoid the afternoon desert heat?"
  );

  const prompts = [
    "Can you rearrange tomorrow's stops in Jaipur to avoid the afternoon desert heat?",
    "Find a quiet rooftop chai vantage point overlooking Lake Pichola at sunset",
    "Suggest a verified artisan block-printing workshop near Amber",
  ];

  return (
    <section className="py-16 sm:py-24 lg:py-28 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-[#FAFAF9]/80 dark:bg-zinc-950/60 backdrop-blur-xs transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-10 lg:px-16 space-y-10 sm:space-y-12">
        {/* Editorial Split Header with Responsive Typography */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end">
          <div className="lg:col-span-6 space-y-3">
            <span className="font-mono text-[11px] font-semibold tracking-widest text-zinc-500 uppercase">
              Intelligent Accelerant
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.15] break-words [text-wrap:balance]">
              When you need
              <span className="block sm:inline sm:ml-2">
                <span className="font-serif italic font-normal text-zinc-900 dark:text-zinc-100">
                  a little help.
                </span>
              </span>
            </h2>
          </div>

          <div className="lg:col-span-6">
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed break-words [text-wrap:balance]">
              Prava Assist is not an autonomous bot taking over your plans—it is an
              intelligent thinking partner grounded directly in your trip's real
              constraints. AI helps you plan. Prava keeps the plan yours.
            </p>
          </div>
        </div>

        {/* AI Proposal Card Simulation */}
        <div className="rounded-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-950/5 dark:shadow-black/40 overflow-hidden">
          {/* Card Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-950/70 px-5 sm:px-6 py-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-[#2D9BF0]" />
              <span className="truncate">
                Contextual Journey Assistant · Trip: Royal Rajasthan (Day 02 context)
              </span>
            </div>
            <span className="text-zinc-400 text-[11px] shrink-0">High Reasoning Active</span>
          </div>

          <div className="p-5 sm:p-8 space-y-6">
            {/* User Prompt Row */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-[10px] font-mono font-semibold text-zinc-600 dark:text-zinc-300 shrink-0">
                YOU
              </div>
              <p className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 pt-1 break-words">
                "{activePrompt}"
              </p>
            </div>

            {/* Prava Assistant Proposal Box */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-xs font-bold shrink-0">
                P
              </div>

              <div className="flex-1 space-y-4">
                {/* Collapsible Reasoning Process */}
                <div className="rounded-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/60 p-3 sm:p-3.5 space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowReasoning(!showReasoning)}
                    className="w-full flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-zinc-500 cursor-pointer"
                  >
                    <span>Reasoning Process</span>
                    {showReasoning ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                  {showReasoning && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60 break-words">
                      Analyzing solar angle and transit between Pink City, Amer Ridge, and
                      Nahargarh. Moving open-air Amer Palace to 08:30 avoids peak 32°C afternoon
                      heat and crowds. Shifting Anokhi Museum indoor galleries to 13:00 provides
                      cool shelter, saving Nahargarh Fort ramparts for golden hour at 17:15.
                    </p>
                  )}
                </div>

                {/* Narrative Summary */}
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed break-words">
                  Here's an optimized schedule for tomorrow. By visiting Amer early in the morning,
                  you avoid the harsh desert sun and gain an unhurried shaded lunch before
                  climbing to Nahargarh for sunset.
                </p>

                {/* Structured Proposal Schedule */}
                <div className="rounded-xs border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950 text-xs shadow-2xs">
                  <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 font-mono text-[11px] text-zinc-400 uppercase tracking-wider border-b border-zinc-200/80 dark:border-zinc-800/80">
                    <span>Re-sequenced Jaipur Itinerary</span>
                    <span>4 stops</span>
                  </div>

                  <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
                    {[
                      {
                        time: "08:30",
                        title: "Amer Palace & Sheesh Mahal",
                        loc: "Amber Ridge · Morning Light",
                      },
                      {
                        time: "11:30",
                        title: "Panna Meena Ka Kund Stepwell",
                        loc: "Geometric Stepwell · 30m dwell",
                      },
                      {
                        time: "13:00",
                        title: "Anokhi Hand-Block Museum & Lunch",
                        loc: "1135 AD Ramparts · Shaded dining",
                      },
                      {
                        time: "17:15",
                        title: "Sunset over Nahargarh Fort",
                        loc: "Aravalli Range · Golden hour view",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="p-3 flex items-center justify-between gap-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[11px] font-semibold text-[#2D9BF0] w-12 shrink-0">
                            {item.time}
                          </span>
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">
                            {item.title}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-400 hidden sm:inline truncate">
                          {item.loc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accept Proposal Action Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <span className="text-[11px] font-mono text-zinc-400">
                    Atomic transaction: 4 stops reordered in your workspace
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => setApplied(true)}
                      disabled={applied}
                      className={`text-xs font-mono h-8 rounded-sm gap-1.5 transition-all cursor-pointer ${
                        applied
                          ? "bg-emerald-600 text-white hover:bg-emerald-600"
                          : "bg-zinc-950 text-white hover:bg-black dark:bg-zinc-100 dark:text-zinc-950"
                      }`}
                    >
                      {applied ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Applied to Itinerary</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Accept Proposal</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Prompt Suggestions */}
                <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-zinc-400">
                    Try other contextual prompts:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {prompts.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setActivePrompt(p);
                          setApplied(false);
                        }}
                        className="text-[11px] px-2.5 py-1 rounded-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer text-left truncate max-w-full"
                      >
                        "{p}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
