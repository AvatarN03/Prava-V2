"use client";

import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 py-12 transition-colors">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          
          {/* Brand & Tagline */}
          <div className="space-y-1">
            <span className="font-brand font-medium text-base tracking-[0.24em] uppercase text-zinc-950 dark:text-zinc-50">
              Prava
            </span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              A workspace for better journeys.
            </p>
          </div>

          {/* Minimalist Navigation */}
          <nav className="flex flex-wrap items-center gap-6 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
            <a href="#workspace" className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer">
              Workspace
            </a>
            <a href="#travel-tools" className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer">
              Travel Tools
            </a>
            <a href="#community" className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer">
              Community
            </a>
            <a href="#pricing" className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer">
              Pricing
            </a>
            <Link href="/privacy" className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer">
              Terms
            </Link>
          </nav>

          {/* Copyright */}
          <div className="font-mono text-[11px] text-zinc-400">
            © {new Date().getFullYear()} Prava Inc.
          </div>

        </div>
      </div>
    </footer>
  );
}
