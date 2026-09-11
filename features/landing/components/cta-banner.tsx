import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { User } from "@supabase/supabase-js";

interface CtaBannerProps {
  user: User | null;
}

export function CtaBanner({ user }: CtaBannerProps) {
  return (
    <section className="py-16 md:py-20 transition-colors">
      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        <div className="rounded-2xl border border-sky-100 dark:border-slate-800 bg-gradient-to-br from-sky-50/70 via-white to-sky-50/50 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-950 p-8 sm:p-14 text-center space-y-4 shadow-sm">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Ready to take control of your travels?
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            No credit card required. Free instant access with a full 7-tab
            workspace ready in seconds.
          </p>
          <div className="pt-3">
            <Link href={user ? "/dashboard" : "/auth?tab=signup"}>
              <Button
                size="lg"
                className="gap-2 px-8 h-12 text-sm font-semibold bg-gradient-to-r from-[#2D9BF0] to-[#1279CE] hover:from-[#1D8BE0] hover:to-[#0D6AB9] text-white shadow-md shadow-[#2D9BF0]/30 transition-all cursor-pointer"
              >
                <span>{user ? "Open Your Workspace" : "Get Started Free"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
