"use client";

import { useState } from "react";

import { Check, ChevronDown, ChevronUp, Compass, MapPin, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AiAssistanceSection() {
  const [applied, setApplied] = useState(false);
  const [showReasoning, setShowReasoning] = useState(true);
  const [activePrompt, setActivePrompt] = useState(
    "Can you rearrange tomorrow's stops in Jaipur to avoid the afternoon desert heat?"
  );

  const [acceptedStops, setAcceptedStops] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
    3: true,
  });

  const toggleStop = (index: number, value: boolean) => {
    setAcceptedStops((prev) => ({ ...prev, [index]: value }));
    setApplied(false);
  };

  const selectedCount = Object.values(acceptedStops).filter(Boolean).length;

  const prompts = [
    "Can you rearrange tomorrow's stops in Jaipur to avoid the afternoon desert heat?",
    "Find a quiet rooftop chai vantage point overlooking Lake Pichola at sunset",
    "Suggest a verified artisan block-printing workshop near Amber",
  ];

  return (
    <section data-nav-theme="dark" className="py-16 sm:py-24 lg:py-28 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-[#FAFAF9]/80 dark:bg-zinc-950/60 backdrop-blur-xs transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-10 lg:px-16 space-y-10 sm:space-y-12">
        {/* Editorial Split Header with Responsive Typography */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end">
          <div className="lg:col-span-6 space-y-3">
            <span className="text-[11px] font-semibold tracking-widest text-[#2D9BF0] uppercase">
              Intelligent Accelerant
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.15] break-words [text-wrap:balance]">
              When you need{" "}
              <span className="block font-serif italic font-normal text-zinc-800 dark:text-zinc-200 mt-1 sm:mt-2">
                a little help.
              </span>
            </h2>
          </div>

          <div className="lg:col-span-6">
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed break-words [text-wrap:balance]">
              Prava Assist is not an autonomous bot taking over your plans—it is an
              intelligent thinking partner grounded directly in your trip's real
              constraints. AI drafts proposals. You stay in full control.
            </p>
          </div>
        </div>

        {/* AI Proposal Card Simulation */}
        <div className="rounded-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-950/5 dark:shadow-black/40 overflow-hidden">
          {/* Card Top Bar (Green badge removed) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-950/70 px-5 sm:px-6 py-3 text-xs">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-[#2D9BF0]" />
              <span className="truncate font-medium">
                Contextual Journey Assistant · Trip: Royal Rajasthan (Day 02 context)
              </span>
            </div>
            <span className="text-zinc-500 dark:text-zinc-400 text-[11px] shrink-0 font-medium">
              Structured Route Proposal
            </span>
          </div>

          <div className="p-5 sm:p-8 space-y-6">
            {/* User Prompt Row with Default User Image from /avatars/default-avatar.jpg */}
            <div className="flex items-start gap-3 sm:gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/avatars/default-avatar.jpg"
                alt="User Avatar"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover border border-zinc-300 dark:border-zinc-700 shrink-0 shadow-2xs"
              />
              <p className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 pt-1.5 break-words">
                "{activePrompt}"
              </p>
            </div>

            {/* Prava Assistant Proposal Box with Ichinose Image from /avatars/ichinose.png */}
            <div className="flex items-start gap-3 sm:gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/avatars/ichinose.png"
                alt="Prava Assistant"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover border border-[#2D9BF0]/50 shrink-0 shadow-2xs"
              />

              <div className="flex-1 space-y-4">
                {/* Collapsible Reasoning Process */}
                <div className="rounded-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/60 p-3.5 space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowReasoning(!showReasoning)}
                    className="w-full flex items-center justify-between text-[11px] uppercase tracking-wider text-zinc-500 cursor-pointer font-medium"
                  >
                    <span className="flex items-center gap-1.5">
                      <Compass className="h-3 w-3 text-[#2D9BF0]" />
                      Route Reasoning & Solar Calculation
                    </span>
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
                      heat and tourist crowds. Shifting Anokhi Museum indoor galleries to 13:00 provides
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

                {/* Structured Travel Proposal Schedule with Generous Padding & Yes/No Options */}
                <div className="rounded-xs border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950 text-xs shadow-2xs">
                  <div className="flex items-center justify-between p-4 sm:px-6 bg-zinc-50 dark:bg-zinc-900 text-[11px] text-zinc-500 uppercase tracking-wider border-b border-zinc-200/80 dark:border-zinc-800/80 font-medium">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#2D9BF0]" />
                      Re-sequenced Jaipur Itinerary
                    </span>
                    <span className="tabular-nums">
                      {selectedCount} of 4 Included
                    </span>
                  </div>

                  <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
                    {[
                      {
                        time: "08:30",
                        title: "Amer Palace & Sheesh Mahal",
                        loc: "Amber Ridge · Morning mirror mosaic light",
                        tag: "Outdoor Heritage",
                        duration: "2h 30m dwell",
                      },
                      {
                        time: "11:30",
                        title: "Panna Meena Ka Kund Stepwell",
                        loc: "Geometric stepwell dwell in Amber foothills",
                        tag: "Architectural Dwell",
                        duration: "45m dwell",
                      },
                      {
                        time: "13:00",
                        title: "Anokhi Hand-Block Museum & Lunch",
                        loc: "1135 AD Amber Ramparts · Shaded indoor thali",
                        tag: "Shaded Dining",
                        duration: "1h 30m dining",
                      },
                      {
                        time: "17:15",
                        title: "Sunset over Nahargarh Fort",
                        loc: "Aravalli Range crest overlooking Pink City basin",
                        tag: "Sunset Overlook",
                        duration: "1h 45m golden hour",
                      },
                    ].map((item, index) => {
                      const isChosen = acceptedStops[index] !== false;
                      return (
                        <div
                          key={index}
                          className={`p-4 sm:p-5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-colors ${
                            isChosen
                              ? "hover:bg-zinc-50/60 dark:hover:bg-zinc-900/50"
                              : "opacity-50 bg-zinc-100/40 dark:bg-zinc-950/40"
                          }`}
                        >
                          {/* Left: Time + Title + Context Details */}
                          <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                            <span className="text-xs font-semibold text-[#2D9BF0] w-12 shrink-0 tabular-nums pt-0.5">
                              {item.time}
                            </span>
                            <div className="space-y-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`font-medium text-sm text-zinc-900 dark:text-zinc-100 ${
                                    !isChosen ? "line-through text-zinc-400 dark:text-zinc-500" : ""
                                  }`}
                                >
                                  {item.title}
                                </span>
                                <span className="text-[10px] text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full font-medium">
                                  {item.tag}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-500 truncate">
                                {item.loc} · <span className="text-zinc-400">{item.duration}</span>
                              </p>
                            </div>
                          </div>

                          {/* Right: Interactive Yes / No Selection Buttons */}
                          <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium hidden xs:inline">
                              Include?
                            </span>
                            <div className="inline-flex items-center rounded-xs p-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => toggleStop(index, true)}
                                className={`px-2.5 py-1 text-[11px] rounded-2xs font-medium transition-all cursor-pointer ${
                                  isChosen
                                    ? "bg-white dark:bg-zinc-900 text-[#2D9BF0] shadow-xs font-semibold"
                                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                                }`}
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleStop(index, false)}
                                className={`px-2.5 py-1 text-[11px] rounded-2xs font-medium transition-all cursor-pointer ${
                                  !isChosen
                                    ? "bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs font-semibold"
                                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                                }`}
                              >
                                No
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Accept Proposal Action Row with Dynamic Count */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Atomic transaction: {selectedCount} of 4 stops selected to update in your workspace
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => setApplied(true)}
                      disabled={applied || selectedCount === 0}
                      className={`text-xs h-9 px-4 rounded-sm gap-1.5 transition-all cursor-pointer font-medium ${
                        applied
                          ? "bg-emerald-600 text-white hover:bg-emerald-600"
                          : "bg-zinc-950 text-white hover:bg-black dark:bg-zinc-100 dark:text-zinc-950"
                      }`}
                    >
                      {applied ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Applied {selectedCount} Stops to Itinerary</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Accept {selectedCount} Stops</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Prompt Suggestions */}
                <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
                  <span className="text-[10px] uppercase text-zinc-500 font-medium tracking-wider">
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
