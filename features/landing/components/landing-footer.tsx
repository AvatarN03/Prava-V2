"use client";

export function LandingFooter() {
  return (
    <footer className="border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 py-12 transition-colors">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 text-center md:text-left">
          {/* Column 1 (Left 1/3): Brand & Tagline */}
          <div className="space-y-1">
            <span className="font-brand font-medium text-base tracking-[0.24em] uppercase text-zinc-950 dark:text-zinc-50">
              Prava
            </span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              A workspace for better journeys.
            </p>
          </div>

          {/* Column 2 (Center 1/3): Minimalist Navigation */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
            <a
              href="#workspace"
              className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              Workspace
            </a>
            <a
              href="#travel-tools"
              className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              Travel Tools
            </a>
            <a
              href="#community"
              className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              Community
            </a>
            <a
              href="#pricing"
              className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              Pricing
            </a>
          </nav>

          {/* Column 3 (Right 1/3): Copyright */}
          <div className="text-xs text-zinc-500 dark:text-zinc-400 md:text-right tabular-nums">
            © {new Date().getFullYear()} Prava Inc.
          </div>
        </div>
      </div>
    </footer>
  );
}
