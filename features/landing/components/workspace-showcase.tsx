"use client";

import { useState } from "react";

import {
  BedDouble,
  Calendar,
  Check,
  CheckSquare,
  Compass,
  ExternalLink,
  FileText,
  Link2,
  Lock,
  Receipt,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

type WorkspaceTab =
  | "overview"
  | "itinerary"
  | "accommodation"
  | "expenses"
  | "notes"
  | "checklist"
  | "links";

export function WorkspaceShowcase() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({
    task1: true,
    task2: true,
    task3: false,
    task4: false,
    task5: true,
    task6: false,
  });

  const toggleTask = (id: string) => {
    setCheckedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section
      id="workspace"
      className="py-16 sm:py-24 lg:py-28 bg-[#FAFAF9] dark:bg-zinc-950 transition-colors"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-10 lg:px-16 space-y-10">
        {/* Section Header with Responsive Typography */}
        <div className="space-y-3 max-w-2xl">
          <span className="text-[11px] font-semibold tracking-widest text-[#2D9BF0] uppercase">
            The Workspace
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.15] break-words [text-wrap:balance]">
            Your trip has a{" "}
            <span className="font-serif italic text-zinc-700 dark:text-zinc-300 block sm:inline">
              home.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed pt-1 break-words [text-wrap:balance]">
            A quiet, structured canvas tailored to human travel. Not a data warehouse,
            but a responsive workspace built for clarity on the road.
          </p>
        </div>

        {/* MacBook Hardware Chassis / Display Enclosure */}
        <div className="rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 p-2 sm:p-3 shadow-2xl shadow-zinc-300/60 dark:shadow-black/80 ring-1 ring-zinc-200 dark:ring-zinc-800/80">
          {/* MacBook Top Bezel Camera Dot */}
          <div className="hidden sm:flex items-center justify-center pb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700/80 shadow-inner" />
          </div>

          {/* The Workspace Window Frame (Retina Display Screen) */}
          <div className="rounded-lg border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-inner">
            {/* macOS Chrome Header / Title Bar */}
            <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/90 dark:bg-zinc-900/95 px-4 py-2.5 text-xs text-zinc-500 select-none">
              {/* Left Group: Traffic Light Buttons + Left-Aligned Rectangular Address Bar */}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                {/* macOS Traffic Light Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="h-3 w-3 rounded-full bg-[#FF5F56] border border-[#E0443E] hover:opacity-80 transition-opacity shadow-2xs cursor-pointer inline-block"
                    title="Close window"
                  />
                  <span
                    className="h-3 w-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] hover:opacity-80 transition-opacity shadow-2xs cursor-pointer inline-block"
                    title="Minimize window"
                  />
                  <span
                    className="h-3 w-3 rounded-full bg-[#27C93F] border border-[#1AAB29] hover:opacity-80 transition-opacity shadow-2xs cursor-pointer inline-block"
                    title="Fullscreen"
                  />
                </div>

                {/* Simple Non-Rounded Rectangular Address Bar Input Box */}
                <div className="flex items-center gap-2 px-3 py-1 rounded-none bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-[11px] text-zinc-600 dark:text-zinc-300 shadow-2xs max-w-[320px] sm:max-w-md truncate tracking-wider">
                  <Lock className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="tracking-wider font-normal truncate">
                    <span className="text-zinc-400 dark:text-zinc-500 font-normal">https://</span>
                    <span className="font-normal text-zinc-800 dark:text-zinc-200">prava-workspace</span>
                    <span className="text-zinc-500 dark:text-zinc-400 font-normal">/rajasthan-heritage-2026</span>
                  </span>
                </div>
              </div>

              {/* Right Window Meta */}
              <div className="hidden sm:block text-[11px] text-zinc-500 dark:text-zinc-400 tabular-nums shrink-0 tracking-wide">
                NOV 14 – 22 · 2 travelers
              </div>
            </div>

            {/* Interior Grid: Left Nav Sidebar + Right Active Canvas with increased height */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[660px] md:min-h-[700px] lg:min-h-[740px]">
              {/* Left Workspace Navigation Sidebar */}
              <div className="md:col-span-3 border-b md:border-b-0 md:border-r border-zinc-200/80 dark:border-zinc-800/80 p-4 sm:p-5 flex flex-col justify-between bg-zinc-50/70 dark:bg-zinc-950/60">
                <div className="space-y-5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#2D9BF0]">
                        Active Trip
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm text-zinc-950 dark:text-zinc-50">
                      Royal Rajasthan Circuit
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      8 Days · 18 Stops
                    </p>
                  </div>

                  {/* 7 Tab Navigation Items */}
                  <nav className="space-y-1">
                    {[
                      { id: "overview", label: "Overview", icon: Compass },
                      { id: "itinerary", label: "Itinerary", icon: Calendar, badge: "18" },
                      { id: "accommodation", label: "Accommodation", icon: BedDouble, badge: "2" },
                      { id: "expenses", label: "Expenses", icon: Receipt, badge: "₹54k" },
                      { id: "notes", label: "Notes", icon: FileText, badge: "3" },
                      { id: "checklist", label: "Checklist", icon: CheckSquare, badge: "4" },
                      { id: "links", label: "Links & Saves", icon: Link2, badge: "4" },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id as WorkspaceTab)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-xs font-medium transition-all cursor-pointer ${
                            isActive
                              ? "bg-white text-zinc-950 shadow-xs border border-zinc-200/90 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700"
                              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="h-3.5 w-3.5" />
                            <span>{tab.label}</span>
                          </div>
                          {tab.badge && (
                            <span
                              className={`text-[10px] tabular-nums px-1.5 py-0.5 rounded-xs font-medium ${
                                isActive
                                  ? "bg-zinc-100 text-zinc-800 border border-zinc-200/80 dark:bg-zinc-700 dark:text-zinc-200 dark:border-zinc-600"
                                  : "text-zinc-400 dark:text-zinc-500"
                              }`}
                            >
                              {tab.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Bottom Offline Status and Collaborators */}
                <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span>Trip members</span>
                    <div className="flex -space-x-1.5">
                      <span className="h-5 w-5 rounded-full bg-[#2D9BF0] text-white text-[9px] font-semibold flex items-center justify-center ring-1 ring-white dark:ring-zinc-900">
                        AR
                      </span>
                      <span className="h-5 w-5 rounded-full bg-amber-500 text-white text-[9px] font-semibold flex items-center justify-center ring-1 ring-white dark:ring-zinc-900">
                        KD
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500">
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Synced offline
                    </span>
                    <span className="tabular-nums">v1.0</span>
                  </div>
                </div>
              </div>

              {/* Right Active Workspace Canvas */}
              <div className="md:col-span-9 p-5 sm:p-7 lg:p-8 bg-white dark:bg-zinc-900 flex flex-col justify-between space-y-6">
                {/* TAB 1: OVERVIEW */}
                {activeTab === "overview" && (
                  <div className="space-y-6 animate-in fade-in duration-200 h-full flex flex-col justify-between">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xl sm:text-2xl font-light tracking-tight text-zinc-950 dark:text-zinc-50">
                            Journey Overview
                          </h4>
                          <Badge
                            variant="outline"
                            className="text-[10px] border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-normal"
                          >
                            Day 2 of 8
                          </Badge>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                          Amer Fort & Pink City corridor · Today's base: Jaipur
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-500">
                        <span className="px-2.5 py-1 rounded-xs bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300">
                          24°C Pleasant
                        </span>
                        <span className="px-2.5 py-1 rounded-xs bg-zinc-100 dark:bg-zinc-800/80 font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">
                          1 USD = 83.2 INR
                        </span>
                      </div>
                    </div>

                    {/* 2x2 Elevated Feature Cards Grid with Generous Height */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1">
                      {/* Card 1: Today's Route */}
                      <div className="rounded-xs border border-zinc-200/90 dark:border-zinc-800 p-4 sm:p-5 space-y-4 bg-zinc-50/70 dark:bg-zinc-950/70 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-zinc-500">
                            <span className="font-medium">Today's Route</span>
                            <button
                              type="button"
                              onClick={() => setActiveTab("itinerary")}
                              className="text-[#2D9BF0] hover:underline cursor-pointer normal-case font-normal"
                            >
                              View all 8 days →
                            </button>
                          </div>
                          <div className="space-y-3 text-xs">
                            <div className="flex items-start gap-3">
                              <span className="text-[11px] text-zinc-400 shrink-0 tabular-nums font-medium pt-0.5">
                                08:30
                              </span>
                              <div className="border-l-2 border-zinc-200 dark:border-zinc-800 pl-3">
                                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                                  Amer Palace & Sheesh Mahal
                                </p>
                                <p className="text-[11px] text-zinc-500">
                                  Amber Ridge · Morning mirror mosaic light (2h 30m)
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="text-[11px] text-zinc-400 shrink-0 tabular-nums font-medium pt-0.5">
                                11:30
                              </span>
                              <div className="border-l-2 border-zinc-200 dark:border-zinc-800 pl-3">
                                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                                  Panna Meena Ka Kund Stepwell
                                </p>
                                <p className="text-[11px] text-zinc-500">
                                  Amber · Geometric architecture dwell (1h)
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="text-[11px] font-semibold text-[#2D9BF0] shrink-0 tabular-nums pt-0.5">
                                17:15
                              </span>
                              <div className="border-l-2 border-[#2D9BF0]/60 pl-3">
                                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                                  Sunset at Nahargarh Fort (Booked)
                                </p>
                                <p className="text-[11px] text-zinc-500">
                                  Aravalli Ridge · Overlook across Pink City sunset
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-zinc-200/70 dark:border-zinc-800/70 flex items-center justify-between text-[11px] text-zinc-500">
                          <span>Transit: 12m auto + 20m cab</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            All passes saved offline
                          </span>
                        </div>
                      </div>

                      {/* Card 2: Current Stay */}
                      <div className="rounded-xs border border-zinc-200/90 dark:border-zinc-800 p-4 sm:p-5 space-y-4 bg-zinc-50/70 dark:bg-zinc-950/70 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-zinc-500">
                            <span className="font-medium">Current Stay</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              3 nights remaining
                            </span>
                          </div>
                          <div>
                            <h5 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                              Samode Haveli
                            </h5>
                            <p className="text-xs text-zinc-500 mt-0.5">
                              Gangapole, Old Pink City, Jaipur
                            </p>
                          </div>
                          <div className="rounded-xs bg-white dark:bg-zinc-900 p-2.5 border border-zinc-200/60 dark:border-zinc-800 text-xs space-y-1">
                            <p className="font-medium text-zinc-800 dark:text-zinc-200">
                              Deluxe Heritage Courtyard Suite
                            </p>
                            <p className="text-[11px] text-zinc-500">
                              Breakfast included · Heritage garden pool access
                            </p>
                          </div>
                        </div>
                        <div className="pt-3 text-xs text-zinc-500 space-y-1 border-t border-zinc-200/70 dark:border-zinc-800/70">
                          <div className="flex items-center justify-between">
                            <span>Check-in: 14:00 · Digital voucher saved</span>
                            <span className="text-zinc-800 dark:text-zinc-200 font-medium tabular-nums">
                              SMD-88102-R
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400">
                            Concierge desk: +91 141 263 2407
                          </p>
                        </div>
                      </div>

                      {/* Card 3: Expense Ledger */}
                      <div className="rounded-xs border border-zinc-200/90 dark:border-zinc-800 p-4 sm:p-5 space-y-4 bg-zinc-50/70 dark:bg-zinc-950/70 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-zinc-500">
                            <span className="font-medium">Expense Ledger</span>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                              ₹54,200 / ₹1,50,000
                            </span>
                          </div>
                          {/* Segmented Budget Progress */}
                          <div className="space-y-1.5">
                            <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                              <div
                                className="h-full bg-[#2D9BF0] w-[21.3%]"
                                title="Lodging (₹32,000)"
                              />
                              <div
                                className="h-full bg-emerald-500 w-[7.6%]"
                                title="Transit (₹11,400)"
                              />
                              <div
                                className="h-full bg-amber-500 w-[4.8%]"
                                title="Dining (₹7,200)"
                              />
                              <div
                                className="h-full bg-purple-500 w-[2.4%]"
                                title="Activities (₹3,600)"
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-zinc-500">
                              <span>36.1% allocated</span>
                              <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                                ₹95,800 headroom left
                              </span>
                            </div>
                          </div>
                          {/* Category Breakdown Chips */}
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="p-2 rounded-xs bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 flex justify-between">
                              <span className="text-zinc-500">Lodging</span>
                              <span className="font-medium text-zinc-800 dark:text-zinc-200 tabular-nums">
                                ₹32,000
                              </span>
                            </div>
                            <div className="p-2 rounded-xs bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 flex justify-between">
                              <span className="text-zinc-500">Transit</span>
                              <span className="font-medium text-zinc-800 dark:text-zinc-200 tabular-nums">
                                ₹11,400
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-zinc-200/70 dark:border-zinc-800/70 flex items-center justify-between text-[11px] text-zinc-500">
                          <span>Last entry: Amer Heritage Pass (₹1,800)</span>
                          <span className="font-medium text-zinc-700 dark:text-zinc-300 tabular-nums">
                            ≈ $651.44 USD
                          </span>
                        </div>
                      </div>

                      {/* Card 4: Immediate Tasks */}
                      <div className="rounded-xs border border-zinc-200/90 dark:border-zinc-800 p-4 sm:p-5 space-y-4 bg-zinc-50/70 dark:bg-zinc-950/70 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-zinc-500">
                            <span className="font-medium">Immediate Tasks</span>
                            <span className="text-[#2D9BF0] font-semibold">2 pending</span>
                          </div>
                          <ul className="space-y-2 text-xs">
                            <li className="flex items-start gap-2.5 p-2 rounded-xs bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                              <div className="flex-1">
                                <p className="text-zinc-800 dark:text-zinc-200">
                                  Forward Lake Pichola sunset boat pass to Kabir
                                </p>
                                <span className="text-[10px] text-zinc-400">
                                  Experiences · High Priority
                                </span>
                              </div>
                            </li>
                            <li className="flex items-start gap-2.5 p-2 rounded-xs bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                              <div className="flex-1">
                                <p className="text-zinc-800 dark:text-zinc-200">
                                  Re-check Vande Bharat return timing from Jaipur Jn
                                </p>
                                <span className="text-[10px] text-zinc-400">
                                  Transit · Nov 18 departure
                                </span>
                              </div>
                            </li>
                          </ul>
                        </div>
                        <div className="pt-3 border-t border-zinc-200/70 dark:border-zinc-800/70 flex items-center justify-between text-[11px] text-zinc-500">
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            ✓ 2 checklists completed
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveTab("checklist")}
                            className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer font-medium"
                          >
                            Open checklist →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: ITINERARY */}
                {activeTab === "itinerary" && (
                  <div className="space-y-5 animate-in fade-in duration-200 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                        <div>
                          <h4 className="text-xl sm:text-2xl font-light text-zinc-950 dark:text-zinc-50">
                            Day 02 · Amer & Pink City
                          </h4>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            Sunday, November 15 · 3 Scheduled Stops
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs border-zinc-300 dark:border-zinc-700">
                          Pacing: Unhurried (3h dwell)
                        </Badge>
                      </div>

                      <div className="space-y-3.5 mt-4">
                        {[
                          {
                            time: "07:15",
                            duration: "45m · Morning Ritual",
                            title: "Sunrise Cardamom Chai at Hawa Mahal",
                            location: "Badi Chaupar · Pink City",
                            desc: "Quiet dawn light hitting the 953 sandstone windows before traffic begins.",
                            transit: "12 min e-rickshaw through Johari Bazaar",
                          },
                          {
                            time: "09:30",
                            duration: "2h 30m · Rajput Heritage",
                            title: "Amer Palace & Sheesh Mahal",
                            location: "Amber Ridge · Overlooking Maota Lake",
                            desc: "Pillar arcades, marble courtyards, and mirror mosaics illuminated by morning sun.",
                            transit: "Private AC cab via scenic Aravalli bypass (20 min)",
                          },
                          {
                            time: "13:00",
                            duration: "1h 30m · Culinary & Craft",
                            title: "Royal Thali Tasting & Hand-Block Museum",
                            location: "1135 AD & Anokhi Museum",
                            desc: "Hand-ground spices and slow-cooked dal baati, followed by indigo block demonstrations.",
                            transit: "15 min drive to Nahargarh sunset ridge",
                          },
                          {
                            time: "17:15",
                            duration: "2h · Golden Hour",
                            title: "Sunset Overlook at Nahargarh Fort",
                            location: "Aravalli Ridge Ramparts",
                            desc: "Panoramic twilight over the pink terracotta roofs with Jaipur city lights coming alive.",
                            transit: "Return cab to Samode Haveli (25 min)",
                          },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className="rounded-xs border border-zinc-200 dark:border-zinc-800 p-4 space-y-2 bg-zinc-50/70 dark:bg-zinc-950/70 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                                {item.time}{" "}
                                <span className="font-normal text-zinc-500">({item.duration})</span>
                              </span>
                              <span className="text-[10px] bg-zinc-200/80 dark:bg-zinc-800 px-2 py-0.5 rounded-xs text-zinc-700 dark:text-zinc-300">
                                {item.transit}
                              </span>
                            </div>
                            <h5 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                              {item.title}
                            </h5>
                            <p className="text-xs text-zinc-500">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-3 border-t border-zinc-200/70 dark:border-zinc-800/70 flex items-center justify-between text-xs text-zinc-500">
                      <span>Total day movement: 3 stops · 48km transit</span>
                      <button
                        type="button"
                        onClick={() => setActiveTab("overview")}
                        className="text-[#2D9BF0] hover:underline cursor-pointer"
                      >
                        ← Back to overview
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: ACCOMMODATION */}
                {activeTab === "accommodation" && (
                  <div className="space-y-4 animate-in fade-in duration-200 h-full flex flex-col justify-between">
                    <div>
                      <div className="pb-3 border-b border-zinc-200 dark:border-zinc-800">
                        <h4 className="text-xl sm:text-2xl font-light text-zinc-950 dark:text-zinc-50">
                          Stays & Bookings
                        </h4>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          2 Verified Accommodations · Jaipur & Udaipur
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="rounded-xs border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 space-y-3 bg-zinc-50/70 dark:bg-zinc-950/70">
                          <div className="flex items-center justify-between text-[11px] text-zinc-500">
                            <span>LODGING 01</span>
                            <span className="text-[#2D9BF0] font-semibold">Active Stay</span>
                          </div>
                          <h5 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                            Samode Haveli
                          </h5>
                          <p className="text-xs text-zinc-500">Gangapole, Old Pink City, Jaipur</p>
                          <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 pt-2.5 border-t border-zinc-200/70 dark:border-zinc-800/70">
                            <p>Check-in: Nov 14, 14:00 · Check-out: Nov 18, 11:00 (4 nights)</p>
                            <p className="tabular-nums">Confirmation: SMD-88102-R · Paid ₹74,000</p>
                            <p className="text-[11px] text-zinc-500">Amenities: Courtyard pool, breakfast included, airport transfer</p>
                          </div>
                        </div>

                        <div className="rounded-xs border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 space-y-3 bg-zinc-50/70 dark:bg-zinc-950/70">
                          <div className="flex items-center justify-between text-[11px] text-zinc-500">
                            <span>LODGING 02</span>
                            <span className="text-zinc-500">Upcoming</span>
                          </div>
                          <h5 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                            The Oberoi Udaivilas
                          </h5>
                          <p className="text-xs text-zinc-500">Lake Pichola Waterfront, Udaipur</p>
                          <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 pt-2.5 border-t border-zinc-200/70 dark:border-zinc-800/70">
                            <p>Check-in: Nov 18, 14:00 · Check-out: Nov 22, 11:00 (4 nights)</p>
                            <p className="tabular-nums">Confirmation: OBR-4901-U · Lake View Suite</p>
                            <p className="text-[11px] text-zinc-500">Amenities: Private jetty boat arrival, semi-private pool, spa pass</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-zinc-200/70 dark:border-zinc-800/70 flex items-center justify-between text-xs text-zinc-500">
                      <span>Total lodging budget: ₹1,58,000 across 8 nights</span>
                      <button
                        type="button"
                        onClick={() => setActiveTab("overview")}
                        className="text-[#2D9BF0] hover:underline cursor-pointer"
                      >
                        ← Back to overview
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 4: EXPENSES */}
                {activeTab === "expenses" && (
                  <div className="space-y-4 animate-in fade-in duration-200 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                        <div>
                          <h4 className="text-xl sm:text-2xl font-light text-zinc-950 dark:text-zinc-50">
                            Expense Ledger
                          </h4>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            Multi-currency tracker with real spot conversions
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-[#2D9BF0] tabular-nums">
                          Headroom: ₹95,800 left
                        </span>
                      </div>

                      <div className="rounded-xs border border-zinc-200 dark:border-zinc-800 overflow-hidden text-xs mt-4">
                        <table className="w-full text-left">
                          <thead className="bg-zinc-100 dark:bg-zinc-800/80 text-[11px] text-zinc-500">
                            <tr>
                              <th className="p-3">Expense</th>
                              <th className="p-3">Category</th>
                              <th className="p-3">Date</th>
                              <th className="p-3 text-right">INR</th>
                              <th className="p-3 text-right">USD</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
                            <tr>
                              <td className="p-3 font-medium">Samode Haveli Suite Deposit</td>
                              <td className="p-3 text-zinc-500">Lodging</td>
                              <td className="p-3 text-zinc-500">Nov 14</td>
                              <td className="p-3 text-right font-semibold tabular-nums">₹18,500</td>
                              <td className="p-3 text-right text-zinc-500 tabular-nums">$222.35</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-medium">Vande Bharat Express (Exec Chair Car)</td>
                              <td className="p-3 text-zinc-500">Transit</td>
                              <td className="p-3 text-zinc-500">Nov 15</td>
                              <td className="p-3 text-right font-semibold tabular-nums">₹3,600</td>
                              <td className="p-3 text-right text-zinc-500 tabular-nums">$43.26</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-medium">Amer Palace & Stepwell Pass</td>
                              <td className="p-3 text-zinc-500">Culture</td>
                              <td className="p-3 text-zinc-500">Nov 16</td>
                              <td className="p-3 text-right font-semibold tabular-nums">₹1,800</td>
                              <td className="p-3 text-right text-zinc-500 tabular-nums">$21.63</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-medium">Royal Thali Tasting at 1135 AD</td>
                              <td className="p-3 text-zinc-500">Dining</td>
                              <td className="p-3 text-zinc-500">Nov 16</td>
                              <td className="p-3 text-right font-semibold tabular-nums">₹3,400</td>
                              <td className="p-3 text-right text-zinc-500 tabular-nums">$40.86</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-medium">Nahargarh Fort Private Cab Service</td>
                              <td className="p-3 text-zinc-500">Transit</td>
                              <td className="p-3 text-zinc-500">Nov 16</td>
                              <td className="p-3 text-right font-semibold tabular-nums">₹1,200</td>
                              <td className="p-3 text-right text-zinc-500 tabular-nums">$14.42</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-zinc-200/70 dark:border-zinc-800/70 flex items-center justify-between text-xs text-zinc-500">
                      <span>Live conversion rate: 1 USD = 83.20 INR</span>
                      <button
                        type="button"
                        onClick={() => setActiveTab("overview")}
                        className="text-[#2D9BF0] hover:underline cursor-pointer"
                      >
                        ← Back to overview
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 5: NOTES */}
                {activeTab === "notes" && (
                  <div className="space-y-4 animate-in fade-in duration-200 h-full flex flex-col justify-between">
                    <div>
                      <div className="pb-3 border-b border-zinc-200 dark:border-zinc-800">
                        <h4 className="text-xl sm:text-2xl font-light text-zinc-950 dark:text-zinc-50">
                          Trip Notes & Guides
                        </h4>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Markdown documentation and local advice
                        </p>
                      </div>

                      <div className="space-y-3.5 text-xs mt-4">
                        <div className="rounded-xs border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/70 dark:bg-zinc-950/70 space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-zinc-500">
                            <span className="font-medium text-[#2D9BF0]">PINNED NOTE · TRANSIT & UPI</span>
                            <span>Updated 1 day ago</span>
                          </div>
                          <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                            IRCTC Vande Bharat & QR Payments
                          </h5>
                          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Vande Bharat Train 20978 departs New Delhi at 06:10. Executive Chair Car C1
                            includes hot breakfast and tea. UPI One World wallet scans QR codes at every
                            handicraft shop and street vendor without cash changes.
                          </p>
                        </div>

                        <div className="rounded-xs border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/70 dark:bg-zinc-950/70 space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-zinc-500">
                            <span className="font-medium text-[#2D9BF0]">PINNED NOTE · LOCAL ARTISANS</span>
                            <span>Kabir's verified advice</span>
                          </div>
                          <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                            Old Jaipur Bazaars & Evening Stepwells
                          </h5>
                          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Visit Lassiwala on MI Road for thick kulhad lassi before 11 AM. For sunset,
                            head to Nahargarh Fort ramparts overlooking the pink terracotta rooftops.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-zinc-200/70 dark:border-zinc-800/70 flex items-center justify-between text-xs text-zinc-500">
                      <span>2 pinned docs · Offline synchronized</span>
                      <button
                        type="button"
                        onClick={() => setActiveTab("overview")}
                        className="text-[#2D9BF0] hover:underline cursor-pointer"
                      >
                        ← Back to overview
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 6: CHECKLIST */}
                {activeTab === "checklist" && (
                  <div className="space-y-4 animate-in fade-in duration-200 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                        <div>
                          <h4 className="text-xl sm:text-2xl font-light text-zinc-950 dark:text-zinc-50">
                            Packing & Essentials
                          </h4>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            Collaborative checklist with completion trackers
                          </p>
                        </div>
                        <span className="text-xs text-[#2D9BF0] font-semibold tabular-nums">
                          {Object.values(checkedTasks).filter(Boolean).length} of 6 complete
                        </span>
                      </div>

                      <div className="space-y-2.5 text-xs mt-4">
                        {[
                          { id: "task1", label: "Apply for Indian Tourist e-Visa pass", cat: "Documents" },
                          { id: "task2", label: "Activate UPI One World QR digital wallet", cat: "Finance" },
                          { id: "task3", label: "Book private sunset boat on Lake Pichola", cat: "Experiences" },
                          { id: "task4", label: "Pack breathable linen layers and polarized glasses", cat: "Packing" },
                          { id: "task5", label: "Download offline maps for Jaipur & Udaipur districts", cat: "Navigation" },
                          { id: "task6", label: "Print physical backup vouchers for palace heritage passes", cat: "Backup" },
                        ].map((task) => (
                          <button
                            key={task.id}
                            type="button"
                            onClick={() => toggleTask(task.id)}
                            className="w-full flex items-center justify-between p-3 rounded-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/70 text-left hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-4 w-4 rounded-xs border flex items-center justify-center transition-colors ${
                                  checkedTasks[task.id]
                                    ? "bg-[#2D9BF0] border-[#2D9BF0] text-white"
                                    : "border-zinc-400 bg-white dark:bg-zinc-900"
                                }`}
                              >
                                {checkedTasks[task.id] && <Check className="h-3 w-3" />}
                              </div>
                              <span
                                className={
                                  checkedTasks[task.id]
                                    ? "line-through text-zinc-400 dark:text-zinc-600"
                                    : "text-zinc-900 dark:text-zinc-100 font-medium"
                                }
                              >
                                {task.label}
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                              {task.cat}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="pt-3 border-t border-zinc-200/70 dark:border-zinc-800/70 flex items-center justify-between text-xs text-zinc-500">
                      <span>Checklist syncs across all trip collaborators</span>
                      <button
                        type="button"
                        onClick={() => setActiveTab("overview")}
                        className="text-[#2D9BF0] hover:underline cursor-pointer"
                      >
                        ← Back to overview
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 7: LINKS */}
                {activeTab === "links" && (
                  <div className="space-y-4 animate-in fade-in duration-200 h-full flex flex-col justify-between">
                    <div>
                      <div className="pb-3 border-b border-zinc-200 dark:border-zinc-800">
                        <h4 className="text-xl sm:text-2xl font-light text-zinc-950 dark:text-zinc-50">
                          Saved Links & Bookmarks
                        </h4>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Reference URLs, rail vouchers, and heritage guides
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs mt-4">
                        {[
                          {
                            title: "IRCTC Vande Bharat Train Portal",
                            url: "irctc.co.in/nget/train-search",
                            tag: "Transit",
                          },
                          {
                            title: "Rajasthan Tourism Heritage Pass",
                            url: "rajasthantourism.gov.in/monuments",
                            tag: "Tickets",
                          },
                          {
                            title: "Samode Haveli Guest Concierge",
                            url: "samode.com/samodehaveli",
                            tag: "Stay",
                          },
                          {
                            title: "Anokhi Hand-Printing Museum Schedule",
                            url: "anokhi.com/museum/schedule",
                            tag: "Culture",
                          },
                          {
                            title: "Lake Pichola Sunset Boat Schedule",
                            url: "citypalaceudaipur.com/boat-rides",
                            tag: "Experiences",
                          },
                          {
                            title: "Jaipur International Airport Taxi Guide",
                            url: "jaipurairport.com/transport",
                            tag: "Logistics",
                          },
                        ].map((link, idx) => (
                          <div
                            key={idx}
                            className="rounded-xs border border-zinc-200 dark:border-zinc-800 p-3.5 bg-zinc-50/70 dark:bg-zinc-950/70 space-y-1.5 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors"
                          >
                            <div className="flex items-center justify-between text-[10px] text-zinc-400">
                              <span className="uppercase font-medium">{link.tag}</span>
                              <ExternalLink className="h-3 w-3 text-zinc-400" />
                            </div>
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{link.title}</p>
                            <p className="text-[11px] text-[#2D9BF0] truncate font-medium">{link.url}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-3 border-t border-zinc-200/70 dark:border-zinc-800/70 flex items-center justify-between text-xs text-zinc-500">
                      <span>All external resources cached for offline access</span>
                      <button
                        type="button"
                        onClick={() => setActiveTab("overview")}
                        className="text-[#2D9BF0] hover:underline cursor-pointer"
                      >
                        ← Back to overview
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MacBook Display Hinge / Chin */}
          <div className="hidden sm:block h-1 w-28 bg-zinc-300 dark:bg-zinc-800 rounded-b-md mx-auto mt-0.5" />
        </div>
      </div>
    </section>
  );
}
