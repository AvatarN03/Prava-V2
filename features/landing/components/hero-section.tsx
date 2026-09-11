import Link from "next/link";

import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { User } from "@supabase/supabase-js";

interface HeroSectionProps {
  user: User | null;
}

export function HeroSection({ user }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-14 pb-16 md:pt-20 md:pb-24 border-b border-border/60">
      {/* Radiant Ambient Gradient Orbs */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 -z-10 h-80 w-[640px] rounded-full bg-gradient-to-tr from-[#2D9BF0]/20 via-[#67C2FF]/15 to-transparent dark:from-[#2D9BF0]/20 dark:via-[#0284c7]/15 dark:to-transparent blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-5xl px-6 sm:px-8 text-center">
        {/* Tagline Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/90 dark:border-sky-800/80 bg-gradient-to-r from-sky-50 to-blue-50/80 dark:from-sky-950/60 dark:to-blue-950/60 px-3.5 py-1 text-xs font-semibold text-sky-900 dark:text-sky-300 mb-6 shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-[#2D9BF0]" />
          <span>Workspace-First Travel OS • Powered by Gemini AI</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.15]">
          Plan trips with precision.{" "}
          <span className="bg-gradient-to-r from-[#2D9BF0] via-[#43ABF8] to-[#0E6EB8] dark:from-[#38BDF8] dark:via-[#60A5FA] dark:to-[#2D9BF0] bg-clip-text text-transparent">
            Governed by you
          </span>
          , accelerated by AI.
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Prava AI combines structured workspaces, real-time travel essentials,
          and governed AI proposals. AI assists with suggestions and
          calculations—you remain in complete control.
        </p>

        {/* Hero Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          {user ? (
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto gap-2 px-7 h-12 text-sm font-semibold bg-gradient-to-r from-[#2D9BF0] to-[#1279CE] hover:from-[#1D8BE0] hover:to-[#0D6AB9] text-white shadow-md shadow-[#2D9BF0]/30 transition-all cursor-pointer"
              >
                <span>Open Your Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/auth?tab=signup" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto gap-2 px-7 h-12 text-sm font-semibold bg-gradient-to-r from-[#2D9BF0] to-[#1279CE] hover:from-[#1D8BE0] hover:to-[#0D6AB9] text-white shadow-md shadow-[#2D9BF0]/30 transition-all cursor-pointer"
                >
                  <span>Start Planning Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/community" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-7 h-12 text-sm font-medium border-slate-300 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-sky-900 dark:hover:text-sky-300 transition-colors cursor-pointer"
                >
                  Explore Public Itineraries
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Value Guarantees */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#2D9BF0]" />
            <span>No unsolicited AI overrides</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#2D9BF0]" />
            <span>1-Click deep cloning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#2D9BF0]" />
            <span>PostgreSQL durability</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#2D9BF0]" />
            <span>Offline-ready caching</span>
          </div>
        </div>
      </div>
    </section>
  );
}
