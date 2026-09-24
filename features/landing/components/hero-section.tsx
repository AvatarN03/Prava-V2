"use client";

import Link from "next/link";

import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { User } from "@supabase/supabase-js";

interface HeroSectionProps {
  user: User | null;
}

export function HeroSection({ user }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Editorial Narrative Column */}
          <div className="lg:col-span-6 space-y-8 lg:pt-8">
            <div className="space-y-4">
              <span className="font-mono text-[11px] font-medium tracking-widest text-zinc-500 uppercase">
                Prava Workspace V2
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.12]">
                Your journey,
                <br />
                <span className="font-serif italic font-normal text-zinc-900 dark:text-zinc-100">
                  in one place.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed max-w-lg pt-1">
                Plan the route. Organize the details. Keep the journey moving.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                asChild
                className="bg-zinc-950 hover:bg-black text-white dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white text-xs font-medium px-5 py-2.5 h-10 rounded-sm gap-2 cursor-pointer shadow-none transition-all"
              >
                <Link href={user ? "/dashboard" : "/auth?tab=signup"}>
                  <span>Start Planning</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>

              <a
                href="#workspace"
                className="text-xs font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer px-3 py-2"
              >
                Explore Workspace
              </a>
            </div>

            {/* 3 Numbered Micro-Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-zinc-200/80 dark:border-zinc-800/80">
              <div className="space-y-1">
                <span className="font-mono text-[11px] font-semibold text-zinc-900 dark:text-zinc-200">
                  01. Route
                </span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
                  Day-by-day flow without clutter
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[11px] font-semibold text-zinc-900 dark:text-zinc-200">
                  02. Stay & Docs
                </span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
                  Bookings, tickets and vouchers
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[11px] font-semibold text-zinc-900 dark:text-zinc-200">
                  03. Essentials
                </span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
                  Weather, currency and notes
                </p>
              </div>
            </div>
          </div>

          {/* Right Archival Workspace Tokyo Preview Frame */}
          <div className="lg:col-span-6">
            <div className="rounded-sm border border-zinc-200 dark:border-zinc-800 bg-[#FBFBFA] dark:bg-zinc-900/60 p-4 sm:p-5 transition-colors">
              {/* Top Frame Metadata */}
              <div className="flex items-center justify-between pb-3.5 text-[11px] font-mono tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200/70 dark:border-zinc-800/70">
                <span className="font-medium text-zinc-900 dark:text-zinc-200">
                  TOKYO · 12 — 19 OCT
                </span>
                <span>35.6628° N, 139.7313° E</span>
              </div>

              {/* Archival Street Photo */}
              <div className="relative mt-3.5 h-64 sm:h-80 w-full overflow-hidden rounded-xs border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100 dark:bg-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80"
                  alt="Tomigaya Corridor Tokyo"
                  className="h-full w-full object-cover grayscale-[15%] contrast-[1.05]"
                />
                <div className="absolute bottom-2.5 left-2.5 rounded-xs bg-black/75 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-white backdrop-blur-xs">
                  ARCHIVE FRAME 04 · Tomigaya Morning Corridors
                </div>
              </div>

              {/* Widgets Below Photo */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-4 pt-3.5 border-t border-zinc-200/70 dark:border-zinc-800/70">
                {/* Day 02 Itinerary Highlights */}
                <div className="sm:col-span-7 space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] font-mono tracking-wider uppercase text-zinc-500 dark:text-zinc-400">
                    <span>Day 02 · Itinerary</span>
                    <span className="text-zinc-400 dark:text-zinc-500">3 stops planned</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2.5">
                      <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 shrink-0">
                        09:30
                      </span>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          Espresso at Fuglen
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Tomigaya · 20m quiet dwell
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 shrink-0">
                        11:00
                      </span>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          Nezu Museum & Gardens
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Minamiaoyama · Kengo Kuma facade
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="font-mono text-[11px] font-semibold text-[#2D9BF0] shrink-0">
                        15:00
                      </span>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          Mori Art Museum
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Roppongi Hills · Ticket #8491
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Sub-Widgets: Budget & Checklist */}
                <div className="sm:col-span-5 space-y-3.5 border-t sm:border-t-0 sm:border-l border-zinc-200/70 dark:border-zinc-800/70 pt-3 sm:pt-0 sm:pl-4">
                  {/* Budget */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      <span>Trip Budget</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-200">JPY ¥200,000</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-zinc-900 dark:bg-zinc-300 w-[37%]" />
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-zinc-500">Spent ¥74,200</span>
                      <span className="font-semibold text-[#2D9BF0]">¥125,800 left</span>
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="space-y-1.5 pt-2 border-t border-zinc-200/70 dark:border-zinc-800/70">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      <span>Checklist</span>
                      <span>3 of 3</span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-zinc-700 dark:text-zinc-300">
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-[#2D9BF0] shrink-0" />
                        <span className="truncate">Collect JR Hokuriku Pass</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-[#2D9BF0] shrink-0" />
                        <span className="truncate">eSIM activated (Ubigi)</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-[#2D9BF0] shrink-0" />
                        <span className="truncate">Toriyoshi dinner booked</span>
                      </li>
                    </ul>
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
