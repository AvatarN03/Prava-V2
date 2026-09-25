"use client";

import { Calendar, CheckCircle2, CreditCard, Hotel } from "lucide-react";

export function ThesisSection() {
  const pillars = [
    {
      index: "01",
      tag: "Daily Route Flow",
      title: "Multi-Day Itineraries",
      description:
        "Organize daily stops, departure times, transport routes, and travel notes in a structured timeline you can adjust anytime.",
      icon: Calendar,
      detail: "Timed stops · Map coordinates · Reorderable days",
    },
    {
      index: "02",
      tag: "Stays & Reservations",
      title: "Accommodations & Passes",
      description:
        "Keep hotel addresses, check-in dates, confirmation numbers, and transit tickets together without searching across email inboxes.",
      icon: Hotel,
      detail: "Booking references · Check-in dates · Address cards",
    },
    {
      index: "03",
      tag: "Budgets & Essentials",
      title: "Expenses & Travel Tools",
      description:
        "Track shared costs with multi-currency conversions, manage packing checklists, and check live weather forecasts and country guides.",
      icon: CreditCard,
      detail: "Multi-currency ledger · Packing items · Live weather & FX",
    },
  ];

  return (
    <section data-nav-theme="dark" className="relative border-y border-zinc-200/80 dark:border-zinc-800/80 bg-[#FAFAF9] dark:bg-[#070B12] text-zinc-950 dark:text-zinc-50 py-16 sm:py-24 lg:py-28 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-10 lg:px-16 space-y-12 sm:space-y-16">
        
        {/* Top Editorial Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* Left Metadata Column */}
          <div className="lg:col-span-3 space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[10px] font-sans">
              <span>Section 01</span>
              <span>·</span>
              <span className="text-[#2D9BF0]">Thesis</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium font-sans">
              The Problem of Fragmentation
            </p>
          </div>

          {/* Right Statement Column */}
          <div className="lg:col-span-9 space-y-3 sm:space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.15] break-words [text-wrap:balance]">
              Travel planning gets complicated
              <br />
              <span className="block font-serif italic font-normal text-zinc-900 dark:text-zinc-100 mt-1 sm:mt-2">
                when everything lives somewhere else.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed max-w-3xl pt-1 [text-wrap:balance]">
              From hotel reservations and train tickets to daily routes, group budgets, and packing lists.
              Prava brings every part of your trip into one clear, reliable workspace built specifically for travel.
            </p>
          </div>
        </div>

        {/* 3 Real Feature Architecture Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.index}
                className="group relative rounded-md border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/60 p-6 sm:p-7 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-9 w-9 rounded-sm bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-[#2D9BF0] border border-zinc-200/70 dark:border-zinc-700/70 transition-transform group-hover:scale-105">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <span className="font-sans text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                      {pillar.index}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="font-sans text-[10px] font-semibold tracking-wider text-[#2D9BF0] uppercase">
                      {pillar.tag}
                    </span>
                    <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                      {pillar.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-4 mt-5 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 text-[11px] font-sans font-medium text-zinc-500 dark:text-zinc-400">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#2D9BF0] shrink-0" />
                  <span className="truncate">{pillar.detail}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Real Workspace Capabilities Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-zinc-200/80 dark:border-zinc-800/80">
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-light text-zinc-950 dark:text-zinc-50 font-sans tracking-tight">
              7 Tabs
            </span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans">
              Dedicated trip workspace
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-light text-zinc-950 dark:text-zinc-50 font-sans tracking-tight">
              Live FX
            </span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans">
              Multi-currency budgeting
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-light text-zinc-950 dark:text-zinc-50 font-sans tracking-tight">
              Offline
            </span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans">
              Cached trip itineraries
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-light text-zinc-950 dark:text-zinc-50 font-sans tracking-tight">
              1-Click
            </span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans">
              Community trip cloning
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
