"use client";

import { useState } from "react";

import {
  Bed,
  Calendar,
  CheckCircle2,
  DollarSign,
  MapPin,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Sun,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

type MockupTab = "overview" | "itinerary" | "stays" | "expenses" | "essentials";

export function InteractiveMockup() {
  const [activeTab, setActiveTab] = useState<MockupTab>("itinerary");
  const [proposalStatus, setProposalStatus] = useState<
    "pending" | "accepted" | "dismissed"
  >("pending");

  return (
    <div className="mx-auto max-w-5xl px-6 sm:px-8 pt-8 pb-16">
      <div className="text-center mb-6">
        <span className="text-xs font-semibold tracking-wider uppercase text-[#2D9BF0] bg-sky-50 dark:bg-sky-950/80 border border-sky-200/80 dark:border-sky-800/80 px-3 py-1 rounded-full">
          Interactive Live Simulation
        </span>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
          Experience the Workspace in Action
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Click tabs or test the AI mutation proposal to see how changes are governed.
        </p>
      </div>

      <div className="rounded-xl border border-sky-100 dark:border-slate-800 bg-card shadow-xl shadow-sky-950/5 dark:shadow-black/40 overflow-hidden transition-colors">
        {/* Mock Window Header */}
        <div className="flex items-center justify-between border-b border-border bg-slate-50/80 dark:bg-slate-900/90 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            <span className="ml-2 text-xs font-mono text-slate-500 dark:text-slate-400">
              prava://trips/kyoto-autumn-2026/{activeTab}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-[10px] px-2 py-0.5 bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800"
            >
              Active Workspace
            </Badge>
          </div>
        </div>

        {/* Mock Workspace Interior */}
        <div className="p-5 sm:p-7 space-y-5 bg-white dark:bg-slate-950 transition-colors">
          {/* Trip Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Royal Rajasthan Cultural Expedition
                </h3>
                <Badge
                  variant="secondary"
                  className="text-xs bg-sky-50 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800"
                >
                  8 Days
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#2D9BF0]" /> India • Nov 14 – Nov 22, 2026
              </p>
            </div>

            {/* Interactive Workspace Tab Bar */}
            <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-slate-900/90 p-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 overflow-x-auto">
              {(
                [
                  { id: "itinerary", label: "Itinerary" },
                  { id: "overview", label: "Overview" },
                  { id: "stays", label: "Stays" },
                  { id: "expenses", label: "Expenses" },
                  { id: "essentials", label: "Essentials" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-semibold"
                      : "hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* TAB 1: ITINERARY VIEW (SPLIT WITH AI PROPOSAL) */}
          {activeTab === "itinerary" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Left: Itinerary Timeline */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <span>Day 1 — Arashiyama & Bamboo Groves</span>
                  <span className="text-[11px] font-normal normal-case text-muted-foreground">
                    3 activities scheduled
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/90 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <div className="text-xs font-mono font-bold text-[#2D9BF0] shrink-0 mt-0.5">
                      08:30
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        Arashiyama Bamboo Grove Walk
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Early morning walk before crowds peak. Est. 1.5 hrs
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/90 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <div className="text-xs font-mono font-bold text-[#2D9BF0] shrink-0 mt-0.5">
                      11:00
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        Tenryu-ji Zen Temple & Gardens
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        UNESCO World Heritage Site with authentic vegetarian lunch
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/90 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <div className="text-xs font-mono font-bold text-[#2D9BF0] shrink-0 mt-0.5">
                      15:00
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        Traditional Matcha Tea Ceremony
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Camellia Tea House reservation confirmed
                      </div>
                    </div>
                  </div>

                  {/* Dynamically added item upon accepting proposal */}
                  {proposalStatus === "accepted" && (
                    <div className="flex items-start gap-3 p-3 rounded-lg border border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/60 dark:bg-emerald-950/40 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                        18:30
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                          <span>Gion Lantern District Evening Stroll</span>
                          <span className="text-[10px] bg-emerald-200/80 dark:bg-emerald-900/90 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.2 rounded font-mono">
                            NEW
                          </span>
                        </div>
                        <div className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                          Added via Governed AI Action • Evening illumination
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: AI Proposal Card */}
              <div className="rounded-xl border border-sky-200 dark:border-sky-800/60 bg-gradient-to-b from-sky-50/80 via-white to-sky-50/40 dark:from-slate-900/90 dark:via-slate-900/90 dark:to-slate-950 p-4 space-y-3 flex flex-col justify-between shadow-2xs">
                {proposalStatus === "pending" && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-sky-950 dark:text-sky-200">
                          <Sparkles className="h-3.5 w-3.5 text-[#2D9BF0]" />
                          <span>AI Structured Proposal</span>
                        </div>
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-mono">
                          PENDING
                        </span>
                      </div>
                      <p className="text-[11px] text-sky-900 dark:text-sky-300 leading-relaxed">
                        &quot;I noticed your evening is free on Day 1. Would you like to
                        add an illumination walk at Gion?&quot;
                      </p>

                      <div className="rounded-lg border border-sky-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-[11px] space-y-1 shadow-2xs">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          + Add Activity (18:30)
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 text-[10px]">
                          Gion Lantern District Evening Stroll
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setProposalStatus("accepted")}
                        className="flex-1 rounded-lg bg-gradient-to-r from-[#2D9BF0] to-[#1279CE] px-3 py-1.5 text-[11px] font-semibold text-white hover:from-[#1D8BE0] hover:to-[#0D6AB9] transition-all shadow-2xs cursor-pointer"
                      >
                        Accept Proposal
                      </button>
                      <button
                        type="button"
                        onClick={() => setProposalStatus("dismissed")}
                        className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </>
                )}

                {proposalStatus === "accepted" && (
                  <div className="space-y-3 py-2 text-center">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Proposal Accepted!
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Item committed to database via Prisma $transaction.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProposalStatus("pending")}
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#2D9BF0] hover:underline cursor-pointer pt-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Reset simulation</span>
                    </button>
                  </div>
                )}

                {proposalStatus === "dismissed" && (
                  <div className="space-y-3 py-2 text-center">
                    <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                      <X className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Proposal Dismissed
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Your workspace remains unchanged.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProposalStatus("pending")}
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#2D9BF0] hover:underline cursor-pointer pt-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Try again</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: OVERVIEW VIEW */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-[#2D9BF0]" /> Total Spent
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  $1,420
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">of $3,000 budget</div>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-emerald-500" /> Countdown
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  32 Days
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Departs Oct 14</div>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-500" /> Checklist
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  18 / 24
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                  75% packed
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Bed className="h-3.5 w-3.5 text-purple-500" /> Stays Booked
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  2 Bookings
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Jaipur & Udaipur</div>
              </div>
            </div>
          )}

          {/* TAB 3: STAYS VIEW */}
          {activeTab === "stays" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Samode Haveli
                  </div>
                  <span className="text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                    Confirmed
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Check-in: Nov 14, 2026 • 4 Nights • Heritage Deluxe Haveli Suite
                </div>
                <div className="text-[10px] font-mono text-muted-foreground">
                  Conf: #SMD-88102 • +91 141-263-2407
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    The Oberoi Udaivilas
                  </div>
                  <span className="text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                    Confirmed
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Check-in: Nov 18, 2026 • 4 Nights • Lake View Luxury Pavilion
                </div>
                <div className="text-[10px] font-mono text-muted-foreground">
                  Conf: #OBR-4901 • +91 294-243-3300
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EXPENSES VIEW */}
          {activeTab === "expenses" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white pb-1 border-b border-border">
                <span>Category Breakdown</span>
                <span className="text-muted-foreground font-normal">Active Currency: USD</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-md border border-border bg-slate-50/40 dark:bg-slate-900/40">
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">Lodging</div>
                  <div className="font-bold text-slate-900 dark:text-white">$680 (48%)</div>
                </div>
                <div className="p-2.5 rounded-md border border-border bg-slate-50/40 dark:bg-slate-900/40">
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">Transit & Rail</div>
                  <div className="font-bold text-slate-900 dark:text-white">$340 (24%)</div>
                </div>
                <div className="p-2.5 rounded-md border border-border bg-slate-50/40 dark:bg-slate-900/40">
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">Food & Dining</div>
                  <div className="font-bold text-slate-900 dark:text-white">$260 (18%)</div>
                </div>
                <div className="p-2.5 rounded-md border border-border bg-slate-50/40 dark:bg-slate-900/40">
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">Activities</div>
                  <div className="font-bold text-slate-900 dark:text-white">$140 (10%)</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ESSENTIALS VIEW */}
          {activeTab === "essentials" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-border bg-slate-50/50 dark:bg-slate-900/50 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sun className="h-3.5 w-3.5 text-amber-500" /> Kyoto Weather
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">19°C</div>
                <div className="text-[11px] text-slate-500">Sunny • UV 4 (Moderate) • 0% Rain</div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-slate-50/50 dark:bg-slate-900/50 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5 text-[#2D9BF0]" /> Live FX Rate
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  1 USD = 83.20 INR
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Interbank Spot Rate
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-slate-50/50 dark:bg-slate-900/50 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-red-500" /> Emergency
                </div>
                <div className="text-xs text-slate-800 dark:text-slate-200 font-mono">
                  Emergency: 112 • Helpline: 1363
                </div>
                <div className="text-[11px] text-slate-500">Tourist Support 24/7</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
