"use client";

import { useState } from "react";

import { Sidebar } from "@/components/app-shell/sidebar";
import { TopBar } from "@/components/app-shell/top-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    // Outer shell: Matches sidebar theme (Dark in light mode, Light in dark mode)
    <div className="h-screen w-full bg-[#090E1A] dark:bg-slate-100 transition-colors flex overflow-hidden">
      {/* Sidebar: Natural flex child on desktop, fixed overlay drawer on mobile */}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Right Content Canvas with Left-Side Rounded Corners Only (Pure flex-1 sibling, no padding offset) */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0 rounded-none md:rounded-tl-[20px] md:rounded-bl-[20px] md:my-2 md:mr-0 bg-slate-50 text-slate-900 dark:bg-[#0A0F1D] dark:text-slate-100 shadow-2xl overflow-hidden md:border-l-8 border-blue-500 dark:border-blue-300/60 transition-colors">
          <TopBar onMobileMenuOpen={() => setMobileOpen(true)} />
          <main className="flex-1 min-h-0 overflow-y-auto w-full p-4 sm:p-6 lg:p-8 thin-scrollbar">
            <div className="w-full max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

