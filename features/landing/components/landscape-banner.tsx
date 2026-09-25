"use client";

import Link from "next/link";

import { ArrowRight } from "lucide-react";

export function LandscapeBanner() {
  return (
    <section className="relative w-full h-[460px] sm:h-[540px] overflow-hidden flex items-center justify-center border-y border-zinc-200 dark:border-zinc-800">
      {/* Background Scenic Himalayan Pass / Tea Estate Landscape */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=2000&q=85"
        alt="Scenic tea hills mist and mountain highway"
        className="absolute inset-0 h-full w-full object-cover object-center brightness-[0.55] contrast-[1.08]"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/65" />

      {/* Center Editorial Content with Responsive Typography */}
      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 text-center space-y-4 sm:space-y-5">
        <span className="font-mono text-[11px] font-semibold tracking-widest text-zinc-300 uppercase">
          Where Next?
        </span>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white leading-tight break-words [text-wrap:balance]">
          The journey
          <span className="block sm:inline sm:ml-2.5">
            <span className="font-serif italic font-normal text-white">
              is yours.
            </span>
          </span>
        </h2>

        <p className="text-sm sm:text-base text-zinc-200 font-normal leading-relaxed max-w-xl mx-auto break-words [text-wrap:balance]">
          From high Himalayan passes to quiet backwaters, keep every step organized in peace.
        </p>

        <div className="pt-2 sm:pt-3">
          <Link
            href="/trips"
            className="inline-flex items-center gap-2 bg-white text-zinc-950 hover:bg-zinc-100 px-5 py-2.5 rounded-sm text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-lg"
          >
            <span>Explore Prava</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
