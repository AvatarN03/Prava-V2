"use client";

import { useState, useEffect } from "react";

import { Sidebar } from "@/components/app-shell/sidebar";
import { TopBar } from "@/components/app-shell/top-bar";
import { WorkspaceAiPanel } from "@/features/trip-workspace/ai/components/workspace-ai-panel";

import { useWorkspaceAi } from "@/features/trip-workspace/context/workspace-ai-context";

import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAiOpen, closeAi, activeTrip } = useWorkspaceAi();

  useEffect(() => {
    // Lock document.body overflow to completely eliminate redundant outer window scrollbar
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    // Outer shell: Fixed viewport lock prevents window from ever establishing an outer scrollbar
    <div className="fixed inset-0 h-dvh w-screen bg-[#090E1A] dark:bg-slate-100 transition-colors flex overflow-hidden">
      {/* Sidebar: Natural flex child on desktop, fixed overlay drawer on mobile */}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Center Content Canvas - Flush against AI Assistant Panel */}
      <div className="flex-1 h-full flex flex-col min-w-0 overflow-hidden md:py-1.5 transition-all duration-300 ease-in-out md:pr-0">
        <div className="flex-1 h-full flex flex-col min-h-0 rounded-none md:rounded-l-[20px] md:rounded-r-none bg-slate-50 text-slate-900 dark:bg-[#0A0F1D] dark:text-slate-100 shadow-2xl overflow-hidden md:border-l-8 border-blue-500 dark:border-blue-300/60 md:border-r-0 transition-all duration-300 ease-in-out">
          <TopBar onMobileMenuOpen={() => setMobileOpen(true)} />
          <main className="flex-1 min-h-0 overflow-y-auto w-full p-4 sm:p-6 lg:p-8 thin-scrollbar bg-prava-pattern">
            <div className="w-full max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Complete Right: Ichinose AI Assistant Panel (Matching Sidebar Theme) */}
      {activeTrip && (
        <WorkspaceAiPanel
          tripId={activeTrip.tripId}
          tripTitle={activeTrip.tripTitle}
          destination={activeTrip.destination}
          isOpen={isAiOpen}
          onClose={closeAi}
        />
      )}
    </div>
  );
}


