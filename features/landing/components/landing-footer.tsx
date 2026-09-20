import Image from "next/image";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-sky-100 dark:border-slate-800/90 bg-white dark:bg-slate-950 py-10 text-xs text-slate-500 dark:text-slate-400 transition-colors">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Brand & Mission */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-tr from-[#2D9BF0] to-[#55B8FF] p-0.5 shadow-2xs">
            <Image
              src="/logo.png"
              alt="Prava Logo"
              width={22}
              height={22}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">Prava</span>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span>Workspace First, AI Second.</span>
          </div>
        </div>

        {/* Operational Status Pill */}
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/40 text-[11px] text-emerald-800 dark:text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Gemini 2.5 Flash Connected</span>
        </div>

        {/* Navigation Links & Copyright */}
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6">
          <a
            href="#features"
            className="hover:text-[#2D9BF0] dark:hover:text-sky-400 transition-colors cursor-pointer"
          >
            Features
          </a>
          <a
            href="#workflow"
            className="hover:text-[#2D9BF0] dark:hover:text-sky-400 transition-colors cursor-pointer"
          >
            How it Works
          </a>
          <Link
            href="/community"
            className="hover:text-[#2D9BF0] dark:hover:text-sky-400 transition-colors cursor-pointer"
          >
            Community
          </Link>
          <Link
            href="/templates"
            className="hover:text-[#2D9BF0] dark:hover:text-sky-400 transition-colors cursor-pointer"
          >
            Templates
          </Link>
          <Link
            href="/subscription"
            className="hover:text-[#2D9BF0] dark:hover:text-sky-400 transition-colors cursor-pointer"
          >
            Subscription
          </Link>
          <Link
            href="/auth"
            className="hover:text-[#2D9BF0] dark:hover:text-sky-400 transition-colors cursor-pointer"
          >
            Sign In
          </Link>
          <span className="text-slate-400 dark:text-slate-600">
            © {new Date().getFullYear()} Prava
          </span>
        </div>
      </div>
    </footer>
  );
}
