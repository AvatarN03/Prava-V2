"use client";

import { useState } from "react";

import {
  Bookmark,
  Calendar,
  CheckCircle2,
  CheckSquare,
  CloudSun,
  FileSpreadsheet,
  FileText,
  Hotel,
  MapPin,
  MessageSquare,
  Receipt,
  Search,
  Sparkles,
  Train,
} from "lucide-react";

export function ScatteredVsUnified() {
  const [mode, setMode] = useState<"scattered" | "unified">("scattered");

  const scatteredItems = [
    {
      icon: Search,
      header: "Browser Tab 1",
      title: '"best dal baati churma and lassi near old jaipur"',
      detail: "14 tabs open · conflicting blog reviews",
    },
    {
      icon: FileText,
      header: "Quick Note (Untitled 4)",
      title: "- buy UPI One World pass at Delhi airport?\n- Kabir says visit Panna Meena Stepwell early\n- luggage cloakroom at Jaipur Jn??",
      detail: "Unformatted notes app scratchpad",
    },
    {
      icon: Train,
      header: "IRCTC Train Confirmation",
      title: "Vande Bharat Express 20978 · Exec Chair Car C1",
      detail: "Depart 06:10 · New Delhi to Jaipur · PNR: 2458991204",
    },
    {
      icon: MapPin,
      header: "Saved Pins (42 items)",
      title: "Unsorted Rajasthan pins",
      detail: "Pins clustered across Jaipur, Jodhpur & Udaipur without days",
    },
    {
      icon: FileSpreadsheet,
      header: "Trip Budget & Split_final",
      title: "Samode Haveli: ₹37,000\nVande Bharat: ₹7,200",
      detail: "Total?: Missing auto-rickshaw receipts",
    },
    {
      icon: Bookmark,
      header: "Saved Reel",
      title: '"Secret rooftop overlooking Lake Pichola at sunset"',
      detail: "No location tagged · screenshot buried in gallery",
    },
    {
      icon: CloudSun,
      header: "Weather App",
      title: "Jaipur 28°C · Dry desert breeze on Tuesday",
      detail: "Need to shift open-air Amer Palace to morning",
    },
    {
      icon: MessageSquare,
      header: "Group Chat",
      title: '"Hey did anyone book the sunset boat on Lake Pichola yet?"',
      detail: "Sent 2 days ago · no confirmation",
    },
  ];

  const unifiedItems = [
    {
      icon: Calendar,
      header: "Itinerary Tab",
      title: "08:30 Amer Palace & Sheesh Mahal",
      detail: "Scheduled in Day 02 morning corridor with scenic Aravalli transit buffer",
      accent: true,
    },
    {
      icon: Hotel,
      header: "Accommodations Tab",
      title: "Samode Haveli · Deluxe Suite",
      detail: "Check-in Nov 14, booking voucher code, and hotel phone stored in one card",
    },
    {
      icon: Receipt,
      header: "Expenses Tab",
      title: "Multi-Currency Ledger & Splits",
      detail: "Logged ₹54,200 with automatic USD conversion · 50/50 split among travelers",
    },
    {
      icon: FileText,
      header: "Notes Tab",
      title: "Rajasthan Rail & UPI Transit Guide",
      detail: "Clean markdown doc with pinned IRCTC schedules & verified station tips",
    },
    {
      icon: CheckSquare,
      header: "Checklist Tab",
      title: "Packing & Pre-Trip To-Dos",
      detail: "Verified ILP permits, camera gear, and electrolyte packs checked off",
    },
    {
      icon: Bookmark,
      header: "Links & Bookmarks",
      title: "Lake Pichola Sunset Pier",
      detail: "Saved restaurant reservation and verified boat jetty coordinate links",
    },
    {
      icon: CloudSun,
      header: "Travel Essentials",
      title: "Live Weather, FX & Country Guide",
      detail: "5-day forecast, ECB exchange rates, and 24/7 tourist helpline (1363)",
    },
    {
      icon: Sparkles,
      header: "Workspace AI",
      title: "Contextual Route Proposals",
      detail: "Suggests optimal morning stop order to avoid desert midday heat",
      accent: true,
    },
  ];

  return (
    <section data-nav-theme="light" className="py-16 sm:py-24 lg:py-28 border-t border-zinc-200/80 bg-[#FAFAF9] text-zinc-950 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-10 lg:px-16 space-y-10 sm:space-y-12">
        {/* Editorial Split Header with Responsive Typography */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end">
          <div className="lg:col-span-7 space-y-3">
            <span className="font-sans text-[11px] font-semibold tracking-widest text-[#2D9BF0] uppercase">
              The Architecture of Travel
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-zinc-950 leading-[1.15] break-words">
              Scattered across apps,
              <br />
              <span className="block font-serif italic font-normal text-zinc-900 mt-1 sm:mt-2">
                or unified in one workspace.
              </span>
            </h2>
          </div>

          <div className="lg:col-span-5 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
            {/* Minimalist Switch Toggle */}
            <div className="inline-flex rounded-sm p-1 bg-zinc-200/60 border border-zinc-200 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setMode("scattered")}
                className={`px-3.5 py-1.5 text-xs font-sans rounded-xs transition-all cursor-pointer ${
                  mode === "scattered"
                    ? "bg-white text-zinc-950 shadow-xs font-semibold"
                    : "text-zinc-600 hover:text-zinc-950 font-medium"
                }`}
              >
                The Scattered Way
              </button>
              <button
                type="button"
                onClick={() => setMode("unified")}
                className={`px-3.5 py-1.5 text-xs font-sans rounded-xs transition-all cursor-pointer ${
                  mode === "unified"
                    ? "bg-zinc-950 text-white shadow-xs font-semibold"
                    : "text-zinc-600 hover:text-zinc-950 font-medium"
                }`}
              >
                The Prava Workspace
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Card Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mode === "scattered"
            ? scatteredItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="rounded-md border border-zinc-200/90 bg-white/70 p-4 flex flex-col justify-between space-y-3 opacity-90 hover:opacity-100 transition-opacity"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-sans font-semibold uppercase tracking-wider text-zinc-400">
                        <span>{item.header}</span>
                        <Icon className="h-3.5 w-3.5 text-zinc-400" />
                      </div>
                      <p className="text-xs font-medium text-zinc-800 whitespace-pre-line leading-relaxed font-sans">
                        {item.title}
                      </p>
                    </div>
                    <span className="text-[10px] font-sans text-zinc-400 border-t border-zinc-200/60 pt-2">
                      {item.detail}
                    </span>
                  </div>
                );
              })
            : unifiedItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className={`rounded-md border p-4 flex flex-col justify-between space-y-3 transition-all ${
                      item.accent
                        ? "border-[#2D9BF0]/40 bg-[#F0F8FF]/80 shadow-xs"
                        : "border-zinc-200/90 bg-white shadow-xs"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-sans font-semibold uppercase tracking-wider">
                        <span
                          className={
                            item.accent
                              ? "text-[#2D9BF0]"
                              : "text-zinc-500"
                          }
                        >
                          {item.header}
                        </span>
                        <Icon
                          className={`h-3.5 w-3.5 ${
                            item.accent ? "text-[#2D9BF0]" : "text-zinc-400"
                          }`}
                        />
                      </div>
                      <p className="text-xs font-semibold text-zinc-900 leading-snug font-sans">
                        {item.title}
                      </p>
                    </div>
                    <span className="text-[10px] font-sans text-zinc-500 border-t border-zinc-200/60 pt-2 leading-relaxed">
                      {item.detail}
                    </span>
                  </div>
                );
              })}
        </div>

        {/* Bottom Editorial Callout */}
        <div className="rounded-md border border-zinc-200/90 bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs font-sans">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-[#2D9BF0] shrink-0" />
            <span className="text-zinc-700 font-medium">
              Zero fragmentation. Everything connected to real calendar dates and coordinates.
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 shrink-0 font-medium">
            Export ready · Offline sync · Multi-currency
          </span>
        </div>
      </div>
    </section>
  );
}
