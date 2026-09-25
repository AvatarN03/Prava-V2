"use client";

import Link from "next/link";
import { useState } from "react";

import { Check, ShieldCheck, Sparkles, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { User } from "@supabase/supabase-js";

interface PricingSectionProps {
  user: User | null;
}

export function PricingSection({ user }: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  return (
    <section
      id="pricing"
      className="py-20 sm:py-28 lg:py-32 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/60 backdrop-blur-xs transition-colors"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-10 lg:px-16 space-y-12 sm:space-y-16">
        
        {/* Section Header with Responsive Typography */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="font-mono text-[11px] font-semibold tracking-widest text-[#2D9BF0] uppercase">
            Transparent Membership
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.15] break-words [text-wrap:balance]">
            Simple, transparent
            <span className="block sm:inline sm:ml-2">
              <span className="font-serif italic font-normal text-zinc-900 dark:text-zinc-100">
                pricing for every journey.
              </span>
            </span>
          </h2>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed break-words [text-wrap:balance]">
            Start free with full workspace access. Upgrade when you need higher trip capacities
            and deeper AI reasoning for complex itineraries.
          </p>

          {/* Billing Switcher */}
          <div className="pt-2 flex items-center justify-center">
            <div className="inline-flex items-center rounded-sm p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-3 py-1.5 text-xs font-mono rounded-xs transition-all cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-xs font-semibold"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-xs transition-all cursor-pointer ${
                  billingCycle === "annual"
                    ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs font-semibold"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                }`}
              >
                <span>Annual</span>
                <span className="bg-[#2D9BF0] text-white text-[10px] px-1.5 py-0.2 rounded-xs font-medium">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 2-Tier Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          
          {/* Plan 1: Free Explorer */}
          <div className="rounded-sm border border-zinc-200 dark:border-zinc-800 bg-[#FAFAF9] dark:bg-zinc-900/80 p-6 sm:p-8 flex flex-col justify-between space-y-8 shadow-xs">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-zinc-950 dark:text-zinc-50">
                    Free Explorer
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    For solo travelers and occasional explorers.
                  </p>
                </div>
                <span className="font-mono text-xs uppercase px-2 py-0.5 rounded-xs bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  Starter
                </span>
              </div>

              <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-light font-mono text-zinc-950 dark:text-zinc-50">
                    ₹0
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">/ forever</span>
                </div>
                <p className="text-[11px] font-mono text-zinc-400 mt-1">
                  No credit card required. Free tier forever.
                </p>
              </div>

              {/* Feature Checklist */}
              <ul className="space-y-3 text-xs text-zinc-700 dark:text-zinc-300 pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80">
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#2D9BF0] shrink-0 mt-0.5" />
                  <span>
                    <strong>10 Trips</strong> total workspace capacity
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#2D9BF0] shrink-0 mt-0.5" />
                  <span>
                    <strong>30 AI Credits</strong> per month (Gemini Flash)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#2D9BF0] shrink-0 mt-0.5" />
                  <span>Full 7-tab trip workspace (Itinerary, Stays, Expenses, Notes)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#2D9BF0] shrink-0 mt-0.5" />
                  <span>Live travel essentials (Weather, Currency FX, Emergency)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#2D9BF0] shrink-0 mt-0.5" />
                  <span>Offline cache via IndexedDB for flights & roaming</span>
                </li>
              </ul>
            </div>

            <Button
              asChild
              variant="outline"
              className="w-full text-xs font-mono h-10 rounded-sm border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer shadow-none"
            >
              <Link href={user ? "/dashboard" : "/auth?tab=signup"}>
                <span>{user ? "Open Dashboard" : "Start Planning Free"}</span>
              </Link>
            </Button>
          </div>

          {/* Plan 2: Pro Wanderer (Featured) */}
          <div className="relative rounded-sm border-2 border-[#2D9BF0] bg-white dark:bg-zinc-900 p-6 sm:p-8 flex flex-col justify-between space-y-8 shadow-xl shadow-[#2D9BF0]/5">
            {/* Popular Badge */}
            <div className="absolute -top-3 right-6 bg-[#2D9BF0] text-white text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-xs shadow-xs flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              <span>Recommended</span>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-zinc-950 dark:text-zinc-50">
                    Pro Wanderer
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    For frequent adventurers, digital nomads & creators.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-light font-mono text-zinc-950 dark:text-zinc-50">
                    {billingCycle === "annual" ? "₹399" : "₹499"}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">
                    / mo {billingCycle === "annual" ? "(billed annually)" : ""}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-zinc-400 mt-1">
                  {billingCycle === "annual"
                    ? "₹4,788 billed once per year · Save ₹1,200"
                    : "Cancel or pause subscription anytime"}
                </p>
              </div>

              {/* Feature Checklist */}
              <ul className="space-y-3 text-xs text-zinc-700 dark:text-zinc-300 pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80">
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#2D9BF0] shrink-0 mt-0.5" />
                  <span>
                    <strong>25 Active Trips</strong> with unlimited trip archives
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#2D9BF0] shrink-0 mt-0.5" />
                  <span>
                    <strong>150 AI Reasoning Credits</strong> per month (5x capacity)
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#2D9BF0] shrink-0 mt-0.5" />
                  <span>AI Route & Itinerary Resequencing (heat & transit buffers)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#2D9BF0] shrink-0 mt-0.5" />
                  <span>Publish unlimited public itineraries & travel stories</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#2D9BF0] shrink-0 mt-0.5" />
                  <span>Verified Creator badge & custom @username profile</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#2D9BF0] shrink-0 mt-0.5" />
                  <span>Priority multi-device cloud synchronization</span>
                </li>
              </ul>
            </div>

            <Button
              asChild
              className="w-full text-xs font-mono h-10 rounded-sm bg-zinc-950 hover:bg-black text-white dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white cursor-pointer shadow-none transition-all"
            >
              <Link href={user ? "/subscription" : "/auth?tab=signup"}>
                <span>{user ? "Manage Subscription" : "Upgrade to Pro"}</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Guarantee Banner */}
        <div className="max-w-2xl mx-auto rounded-sm border border-zinc-200/80 dark:border-zinc-800/80 bg-[#FAFAF9]/80 dark:bg-zinc-900/60 p-4 flex flex-wrap items-center justify-around gap-4 text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[#2D9BF0]" />
            <span>Encrypted Payments</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-[#2D9BF0]" />
            <span>Instant Activation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-[#2D9BF0]" />
            <span>Cancel Anytime</span>
          </div>
        </div>

      </div>
    </section>
  );
}
