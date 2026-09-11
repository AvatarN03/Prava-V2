"use client";

import { useState } from "react";

import { Sidebar } from "@/components/app-shell/sidebar";
import { TopBar } from "@/components/app-shell/top-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    // Outer shell: Matches sidebar theme (Dark in light mode, Light in dark mode)
    <div className="min-h-screen bg-[#090E1A] dark:bg-slate-200 transition-colors">
      {/* Permanently Fixed Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Right Content Canvas with Left-Side Rounded Corners (Opposite theme surface) */}
      <div className="min-h-screen md:pl-64 flex flex-col">
        <div className="flex-1 flex flex-col md:rounded-tl-[28px] md:rounded-bl-[28px] md:my-1.5 md:mr-1.5 bg-slate-50 text-slate-900 dark:bg-[#0A0F1D] dark:text-slate-100 shadow-2xl overflow-hidden border-l border-slate-200/50 dark:border-slate-800 transition-colors">
          <TopBar onMobileMenuOpen={() => setMobileOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
