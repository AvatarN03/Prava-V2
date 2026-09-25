"use client";

import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { User } from "@supabase/supabase-js";

interface CtaBannerProps {
  user: User | null;
}

export function CtaBanner({ user }: CtaBannerProps) {
  return (
    <section className="py-20 sm:py-28 lg:py-32 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/60 backdrop-blur-xs text-center transition-colors">
      <div className="mx-auto max-w-4xl px-4 sm:px-10 space-y-6">
        <span className="font-mono text-[11px] font-semibold tracking-widest text-[#2D9BF0] uppercase">
          Get Started
        </span>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.12] break-words [text-wrap:balance]">
          Make space
          <span className="block sm:inline sm:ml-2.5">
            <span className="font-serif italic font-normal text-zinc-900 dark:text-zinc-100">
              for the journey.
            </span>
          </span>
        </h2>

        <p className="text-sm sm:text-base lg:text-lg text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed max-w-md mx-auto break-words [text-wrap:balance]">
          Plan less chaotically. Travel more intentionally.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-3 sm:pt-4">
          <Button
            asChild
            className="bg-zinc-950 hover:bg-black text-white dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white text-xs font-medium px-6 h-11 rounded-sm gap-2 cursor-pointer shadow-none transition-all"
          >
            <Link href={user ? "/dashboard" : "/auth?tab=signup"}>
              <span>Start Planning</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>

          <a
            href="#workspace"
            className="text-xs font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer px-4 py-2.5"
          >
            Explore Prava
          </a>
        </div>

        <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 pt-3 sm:pt-4">
          Available on Web, iOS & Android · Free Explorer tier included
        </p>
      </div>
    </section>
  );
}
