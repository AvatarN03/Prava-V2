"use client";

import { useState } from "react";

import {
  Bookmark,
  Calendar,
  CheckCircle2,
  CloudSun,
  FileSpreadsheet,
  FileText,
  Globe,
  MapPin,
  MessageSquare,
  Plane,
  Receipt,
  Search,
  Sparkles,
} from "lucide-react";

export function ScatteredVsUnified() {
  const [mode, setMode] = useState<"scattered" | "unified">("scattered");

  const scatteredItems = [
    {
      icon: Search,
      header: "Browser Tab 1",
      title: '"best coffee roasters near tokyo yoyogi park"',
      detail: "14 articles open · no summary",
    },
    {
      icon: FileText,
      header: "Quick Note (Untitled 4)",
      title: "- buy suica at airport?\n- Julian says visit Daikanyama T-Site\n- what about luggage delivery??",
      detail: "Unformatted notes app scratchpad",
    },
    {
      icon: Plane,
      header: "Airline Confirmation",
      title: "ANA NH 217 · Seat 14K",
      detail: "Depart 12:45 · Terminal 3 · PNR: 7X89LM",
    },
    {
      icon: MapPin,
      header: "Saved Pins (37 items)",
      title: "Unsorted Tokyo list",
      detail: "Pins clustered all over Kanto without day grouping",
    },
    {
      icon: FileSpreadsheet,
      header: "Expense Sheet v2_final",
      title: "Hotel Aman: $2,450.00\nShinkansen: $290.00",
      detail: "Total?: Missing receipts",
    },
    {
      icon: Bookmark,
      header: "Saved Reel",
      title: '"Secret bar behind a vending machine"',
      detail: "No address saved · screenshot in camera roll",
    },
    {
      icon: CloudSun,
      header: "Weather App",
      title: "Tokyo 18°C · Rain on Tuesday",
      detail: "Need to shift outdoor garden visit to Wednesday",
    },
    {
      icon: MessageSquare,
      header: "Group Chat",
      title: '"Hey did anyone book Mori Art Museum yet?"',
      detail: "3 days ago · no reply",
    },
  ];

  const unifiedItems = [
    {
      icon: Calendar,
      header: "Itinerary Tab",
      title: "09:30 Fuglen Espresso & Waffles",
      detail: "Scheduled in Day 02 morning corridor with walking transit buffers",
      accent: true,
    },
    {
      icon: FileText,
      header: "Notes Tab",
      title: "Tokyo Transit & Neighborhood Guide",
      detail: "Clean markdown doc with pinned Suica & Daikanyama recommendations",
    },
    {
      icon: Plane,
      header: "Accommodation & Stays",
      title: "ANA NH 217 + TRUNK HOTEL",
      detail: "Check-in time, terminal directions, and PNR codes stored in one stay card",
    },
    {
      icon: MapPin,
      header: "Contextual Route Map",
      title: "Corridor Filtered Stops",
      detail: "Activities clustered by Shibuya & Roppongi transit lines to save subway trips",
    },
    {
      icon: Receipt,
      header: "Expenses Tab",
      title: "Multi-Currency Ledger",
      detail: "Real-time JPY to USD auto-conversion with headroom budget progress",
      accent: true,
    },
    {
      icon: Bookmark,
      header: "Links & Saves Tab",
      title: "Curated Spot Bookmarks",
      detail: "Metadata-enriched links with addresses, tags, and opening hours",
    },
    {
      icon: CloudSun,
      header: "Live Essentials",
      title: "Weather & Intelligent Rerouting",
      detail: "Automatic rain prompt re-routing outdoor garden visit to indoor museum",
      accent: true,
    },
    {
      icon: CheckCircle2,
      header: "Checklist Tab",
      title: "Collaborative Packing & Tasks",
      detail: "Assigned tickets, JR pass collection status, and dinner reservations verified",
    },
  ];

  return (
    <section className="py-20 sm:py-28 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-[#FAFAF9] dark:bg-zinc-950 transition-colors">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 space-y-10">
        
        {/* Section Header with Segmented Toggle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="font-mono text-[11px] font-semibold tracking-widest text-zinc-500 uppercase">
              The Reality of Travel Prep
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.15]">
              Too many tabs.{" "}
              <span className="font-serif italic font-normal text-zinc-900 dark:text-zinc-100">
                One trip.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed pt-1">
              Bring everything together with Prava. Stop stitching between email threads,
              spreadsheet formulas, map pins, and screenshot folders.
            </p>
          </div>

          {/* Segmented Control */}
          <div className="inline-flex rounded-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1 self-start md:self-end">
            <button
              type="button"
              onClick={() => setMode("scattered")}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xs transition-all cursor-pointer ${
                mode === "scattered"
                  ? "bg-zinc-900 text-white shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              Scattered (8 tabs)
            </button>
            <button
              type="button"
              onClick={() => setMode("unified")}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                mode === "unified"
                  ? "bg-zinc-900 text-white shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              <span>Unified in Prava</span>
              <CheckCircle2 className="h-3 w-3 text-[#2D9BF0]" />
            </button>
          </div>
        </div>

        {/* Status Line */}
        <div className="flex items-center justify-between text-xs font-mono text-zinc-500 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-4">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                mode === "scattered" ? "bg-amber-500 animate-pulse" : "bg-[#2D9BF0]"
              }`}
            />
            <span>
              {mode === "scattered"
                ? "Current state: 8 disconnected surfaces"
                : "Unified state: 1 cohesive workspace with 7 focused tabs"}
            </span>
          </div>
          <span className="hidden sm:inline text-zinc-400">
            {mode === "scattered" ? "High cognitive friction" : "Zero tab clutter"}
          </span>
        </div>

        {/* 8 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(mode === "scattered" ? scatteredItems : unifiedItems).map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`rounded-sm border p-4 space-y-2 transition-all ${
                  mode === "scattered"
                    ? "border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/60"
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs hover:border-[#2D9BF0]/40"
                }`}
              >
                <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                  <Icon className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                  <span className="uppercase tracking-wider">{item.header}</span>
                </div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 whitespace-pre-line leading-snug">
                  {item.title}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
                  {item.detail}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom Editorial Callout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 text-xs text-zinc-500">
          <p>Cognitive overload before the journey even begins.</p>
          <button
            type="button"
            onClick={() => setMode(mode === "scattered" ? "unified" : "scattered")}
            className="text-zinc-900 dark:text-zinc-200 font-medium hover:text-[#2D9BF0] transition-colors self-start sm:self-auto cursor-pointer"
          >
            {mode === "scattered"
              ? "Click to see how Prava brings these together →"
              : "← Switch back to view scattered state"}
          </button>
        </div>

      </div>
    </section>
  );
}
