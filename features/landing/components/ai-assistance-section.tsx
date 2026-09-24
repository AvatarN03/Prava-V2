"use client";

import { useState } from "react";

import { Check, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AiAssistanceSection() {
  const [applied, setApplied] = useState(false);
  const [showReasoning, setShowReasoning] = useState(true);
  const [activePrompt, setActivePrompt] = useState(
    "Can you rearrange tomorrow's itinerary so I have less travel time?"
  );

  const prompts = [
    "Can you rearrange tomorrow's itinerary so I have less travel time?",
    "Find a quiet green garden stop between Omotesando and Roppongi",
    "Suggest a calm evening dinner spot near our hotel in Tomigaya",
  ];

  return (
    <section className="py-20 sm:py-28 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-[#FAFAF9] dark:bg-zinc-950 transition-colors">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 space-y-12">
        
        {/* Editorial Split Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end">
          <div className="lg:col-span-6 space-y-3">
            <span className="font-mono text-[11px] font-semibold tracking-widest text-zinc-500 uppercase">
              Intelligent Accelerant
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.15]">
              When you need{" "}
              <span className="font-serif italic font-normal text-zinc-900 dark:text-zinc-100">
                a little help.
              </span>
            </h2>
          </div>

          <div className="lg:col-span-6">
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
              Prava Assist is not an autonomous bot taking over your plans—it is an
              intelligent thinking partner grounded directly in your trip's real
              constraints. AI helps you plan. Prava keeps the plan yours.
            </p>
          </div>
        </div>

        {/* AI Proposal Card Simulation */}
        <div className="rounded-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-950/5 dark:shadow-black/40 overflow-hidden">
          
          {/* Card Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-950/70 px-6 py-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-[#2D9BF0]" />
              <span>Contextual Journey Assistant · Trip: Tokyo Autumn (Day 02 context)</span>
            </div>
            <span className="text-zinc-400 text-[11px]">High Reasoning Mode Enabled</span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* User Prompt Row */}
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-[10px] font-mono font-semibold text-zinc-600 dark:text-zinc-300 shrink-0">
                YOU
              </div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 pt-1">
                "{activePrompt}"
              </p>
            </div>

            {/* Prava Assistant Proposal Box */}
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-xs font-bold shrink-0">
                P
              </div>

              <div className="flex-1 space-y-4">
                {/* Collapsible Reasoning Process */}
                <div className="rounded-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/60 p-3.5 space-y-2">
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
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
                      Analyzing transit times between Tomigaya, Aoyama, and Roppongi. Moving Nezu
                      Museum to late morning eliminates back-and-forth subway transfers on the
                      Chiyoda and Hibiya lines.
                    </p>
                  )}
                </div>

                {/* Narrative Summary */}
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Here's a more efficient order for tomorrow. By clustering the morning around
                  Tomigaya and Omotesando, you avoid two subway transfers and gain 45 unhurried
                  minutes before your 15:00 Mori Art Museum slot.
                </p>

                {/* Structured Proposal Schedule */}
                <div className="rounded-xs border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950 text-xs">
                  <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 font-mono text-[11px] text-zinc-400 uppercase tracking-wider border-b border-zinc-200/80 dark:border-zinc-800/80">
                    <span>Re-sequenced Schedule</span>
                    <span>4 stops</span>
                  </div>

                  <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
                    {[
                      { time: "09:30", title: "Breakfast at Fuglen", loc: "Tomigaya · Morning" },
                      { time: "11:00", title: "Nezu Museum & Bamboo Garden", loc: "Minamiaoyama · Architecture" },
                      { time: "13:15", title: "Lunch at Toriyoshi Roppongi", loc: "Roppongi · Dining" },
                      { time: "15:00", title: "Mori Art Museum (Booked)", loc: "Roppongi Hills · Exhibition" },
                    ].map((row, i) => (
                      <div key={i} className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-zinc-500 w-12">{row.time}</span>
                          <div>
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {row.title}
                            </p>
                            <p className="text-[11px] text-zinc-400">{row.loc}</p>
                          </div>
                        </div>
                        {applied && <Check className="h-4 w-4 text-[#2D9BF0]" />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Acceptance Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <p className="text-xs text-zinc-500 font-mono">
                    Workspace remains unchanged until you approve.
                  </p>
                  <Button
                    type="button"
                    onClick={() => setApplied(true)}
                    className={`text-xs font-medium px-4 h-8 rounded-sm gap-2 transition-all cursor-pointer ${
                      applied
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-zinc-950 hover:bg-black text-white dark:bg-zinc-100 dark:text-zinc-950"
                    }`}
                  >
                    {applied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Applied to Day 02</span>
                      </>
                    ) : (
                      <span>Apply to Day 02</span>
                    )}
                  </Button>
                </div>

              </div>
            </div>
          </div>

          {/* Contextual Queries Drawer */}
          <div className="p-4 sm:p-6 bg-zinc-50/80 dark:bg-zinc-950/80 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
              Try asking a contextual query:
            </span>
            <div className="flex flex-wrap gap-2">
              {prompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActivePrompt(p);
                    setApplied(false);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-xs border transition-all cursor-pointer text-left ${
                    activePrompt === p
                      ? "border-zinc-900 bg-white dark:border-white dark:bg-zinc-800 text-zinc-950 dark:text-white font-medium"
                      : "border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"
                  }`}
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
