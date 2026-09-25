"use client";

import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import { CtaBackgroundPattern } from "./cta-background-pattern";

import type { User } from "@supabase/supabase-js";

interface CtaBannerProps {
  user: User | null;
}

export function CtaBanner({ user }: CtaBannerProps) {
  return (
    <section data-nav-theme="light" className="relative py-20 sm:py-28 lg:py-32 border-t border-zinc-200/80 bg-white text-center overflow-hidden">
      {/* Animated Fluid Canvas Background */}
      <CtaBackgroundPattern />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-10 space-y-6">
        <span className="text-[11px] font-semibold tracking-widest text-[#2D9BF0] uppercase">
          Get Started
        </span>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-zinc-950 leading-[1.12] break-words [text-wrap:balance]">
          Make space
          <span className="block font-serif italic font-normal text-zinc-800 mt-1 sm:mt-2">
            for the journey.
          </span>
        </h2>

        <p className="text-sm sm:text-base lg:text-lg text-zinc-600 font-normal leading-relaxed max-w-md mx-auto break-words [text-wrap:balance]">
          Plan less chaotically. Travel more intentionally.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-3 sm:pt-4">
          <Button
            asChild
            className="bg-zinc-950 hover:bg-black text-white text-xs font-medium px-6 h-11 rounded-sm gap-2 cursor-pointer shadow-none transition-all"
          >
            <Link href={user ? "/dashboard" : "/auth?tab=signup"}>
              <span>Start Planning</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>

          <a
            href="#workspace"
            className="text-xs font-medium text-zinc-600 hover:text-zinc-950 transition-colors cursor-pointer px-4 py-2.5"
          >
            Explore Prava
          </a>
        </div>


      </div>
    </section>
  );
}
