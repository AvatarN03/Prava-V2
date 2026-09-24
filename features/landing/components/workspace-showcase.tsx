"use client";

import { useState } from "react";

import {
  ArrowUpRight,
  BedDouble,
  Calendar,
  Check,
  CheckSquare,
  Clock,
  Compass,
  CreditCard,
  ExternalLink,
  FileText,
  Link2,
  MapPin,
  Receipt,
  Sparkles,
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
  });

  const toggleTask = (id: string) => {
    setCheckedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section id="workspace" className="py-20 sm:py-28 bg-[#FAFAF9] dark:bg-zinc-950 transition-colors">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 space-y-10">
        
        {/* Section Header */}
        <div className="space-y-3 max-w-2xl">
          <span className="font-mono text-[11px] font-semibold tracking-widest text-zinc-500 uppercase">
            The Workspace
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.15]">
            Your trip has a home.
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed pt-1">
            A quiet, structured canvas tailored to human travel. Not a data warehouse,
            but a responsive workspace built for clarity on the road.
          </p>
        </div>

        {/* The Workspace Window Frame */}
        <div className="rounded-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-950/5 dark:shadow-black/50 overflow-hidden">
          
          {/* Mock Browser/App Header */}
          <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/90 px-4 py-2.5 text-xs font-mono text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="ml-2 text-zinc-700 dark:text-zinc-300">
                prava.app / tokyo-autumn-2026
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
              OCT 12 – 19 · 2 travelers
            </div>
          </div>

          {/* Interior Grid: Left Nav Sidebar + Right Active Canvas */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
            
            {/* Left Workspace Navigation Sidebar */}
            <div className="md:col-span-3 border-b md:border-b-0 md:border-r border-zinc-200/80 dark:border-zinc-800/80 p-4 sm:p-5 flex flex-col justify-between bg-zinc-50/40 dark:bg-zinc-950/40">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-zinc-950 dark:text-zinc-50">
                    Tokyo & Hakone
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                    7 Days · 16 Stops
                  </p>
                </div>

                {/* 7 Tab Navigation Items */}
                <nav className="space-y-1">
                  {[
                    { id: "overview", label: "Overview", icon: Compass },
                    { id: "itinerary", label: "Itinerary", icon: Calendar, badge: "16" },
                    { id: "accommodation", label: "Accommodation", icon: BedDouble, badge: "2" },
                    { id: "expenses", label: "Expenses", icon: Receipt, badge: "¥74k" },
                    { id: "notes", label: "Notes", icon: FileText, badge: "3" },
                    { id: "checklist", label: "Checklist", icon: CheckSquare, badge: "4" },
                    { id: "links", label: "Links & Saves", icon: Link2, badge: "6" },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as WorkspaceTab)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs font-medium transition-all cursor-pointer ${
                          isActive
                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs"
                            : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5" />
                          <span>{tab.label}</span>
                        </div>
                        {tab.badge && (
                          <span
                            className={`font-mono text-[10px] px-1.5 py-0.5 rounded-xs ${
                              isActive
                                ? "bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800"
                                : "text-zinc-400"
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

              {/* Bottom Offline Status */}
              <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Synced offline
                </span>
                <span>v2.4</span>
              </div>
            </div>

            {/* Right Active Workspace Canvas */}
            <div className="md:col-span-9 p-6 sm:p-8 bg-white dark:bg-zinc-900 space-y-6">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
                    <div>
                      <h4 className="text-xl font-light tracking-tight text-zinc-950 dark:text-zinc-50">
                        Journey Overview
                      </h4>
                      <p className="text-xs font-mono text-zinc-500 mt-1">
                        Day 02 of 07 · Shibuya & Roppongi transit corridor
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono text-zinc-500">
                      <span>18°C Sunny</span>
                      <span>·</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        1 USD = 153.2 JPY
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Today's Route */}
                    <div className="rounded-xs border border-zinc-200 dark:border-zinc-800 p-4 space-y-3 bg-[#FAFAF9] dark:bg-zinc-950">
                      <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                        <span>Today's Route</span>
                        <button
                          type="button"
                          onClick={() => setActiveTab("itinerary")}
                          className="text-[#2D9BF0] hover:underline cursor-pointer"
                        >
                          View all 7 days →
                        </button>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-start gap-2.5">
                          <span className="font-mono text-[11px] text-zinc-400 shrink-0">09:30</span>
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-zinc-100">
                              Fuglen Tokyo Coffee
                            </p>
                            <p className="text-[11px] text-zinc-500">
                              Tomigaya 1-19-6 · 5m from Yoyogi-Koen
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <span className="font-mono text-[11px] text-zinc-400 shrink-0">11:00</span>
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-zinc-100">
                              Nezu Museum Grounds
                            </p>
                            <p className="text-[11px] text-zinc-500">
                              Minamiaoyama · Garden stroll
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <span className="font-mono text-[11px] font-semibold text-[#2D9BF0] shrink-0">
                            15:00
                          </span>
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-zinc-100">
                              Mori Art Museum (Booked)
                            </p>
                            <p className="text-[11px] text-zinc-500">
                              Roppongi Hills · Level 53
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Current Stay */}
                    <div className="rounded-xs border border-zinc-200 dark:border-zinc-800 p-4 space-y-2.5 bg-[#FAFAF9] dark:bg-zinc-950">
                      <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                        <span>Current Stay</span>
                        <span className="text-zinc-700 dark:text-zinc-300">4 nights remaining</span>
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          TRUNK (HOTEL) Yoyogi Park
                        </h5>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          1-15-2 Tomigaya, Shibuya-ku, Tokyo
                        </p>
                      </div>
                      <div className="pt-2 text-xs font-mono text-zinc-500 space-y-1 border-t border-zinc-200/70 dark:border-zinc-800/70">
                        <p>Check-in: 15:00 · Key in digital wallet</p>
                        <p>Confirmation: TRK-99201-B</p>
                      </div>
                    </div>

                    {/* Expense Ledger Summary */}
                    <div className="rounded-xs border border-zinc-200 dark:border-zinc-800 p-4 space-y-3 bg-[#FAFAF9] dark:bg-zinc-950">
                      <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                        <span>Expense Ledger</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          ¥74,200 / ¥200,000
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-900 dark:bg-zinc-300 w-[37.1%]" />
                      </div>
                      <p className="text-[11px] text-zinc-500">
                        Last entry: 2x Mori Museum admission (¥4,400)
                      </p>
                    </div>

                    {/* Immediate Tasks */}
                    <div className="rounded-xs border border-zinc-200 dark:border-zinc-800 p-4 space-y-2.5 bg-[#FAFAF9] dark:bg-zinc-950">
                      <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                        <span>Immediate Tasks</span>
                        <span className="text-[#2D9BF0] font-semibold">2 pending</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                        <li className="flex items-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <span>Pick up Hakone Free Pass at Shinjuku Odakyu Sightseeing</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <span>Forward dinner booking confirmation to Julian</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ITINERARY */}
              {activeTab === "itinerary" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <div>
                      <h4 className="text-xl font-light text-zinc-950 dark:text-zinc-50">
                        Day 02 · Shibuya & Minamiaoyama
                      </h4>
                      <p className="text-xs text-zinc-500 mt-0.5">Tuesday, October 13 · 3 Scheduled Stops</p>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs border-zinc-300">
                      Pacing: Calm (3h dwell)
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        time: "09:00",
                        duration: "45m · Morning Ritual",
                        title: "Espresso & Norwegian Waffles",
                        location: "Fuglen Tokyo · Tomigaya",
                        desc: "Quiet morning neighborhood roaster opposite Yoyogi Park. Sit outside along the cedar siding.",
                        transit: "7 min walk through Yoyogi-Koen residential lanes",
                      },
                      {
                        time: "10:30",
                        duration: "2h · Urban Walk",
                        title: "Architectural Exploration: Cat Street & Aoyama",
                        location: "Shibuya to Minamiaoyama",
                        desc: "Observe small independent boutiques, concrete facades by Tadao Ando, and discreet alleys away from main thoroughfares.",
                        transit: "Tokyo Metro Ginza line from Omotesando to Gaienmae (3 min)",
                      },
                      {
                        time: "13:00",
                        duration: "1h 15m · Culinary",
                        title: "Seasonal Handcrafted Lunch",
                        location: "Toriyoshi Roppongi",
                        desc: "Quiet counter seating. Known for hand-pulled soba and seasonal vegetable tempura.",
                        transit: "10 min stroll toward Roppongi Hills terrace",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-xs border border-zinc-200 dark:border-zinc-800 p-4 space-y-2 bg-[#FAFAF9] dark:bg-zinc-950 hover:border-zinc-400 transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                            {item.time} <span className="font-normal text-zinc-500">({item.duration})</span>
                          </span>
                          <span className="font-mono text-[10px] bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-xs text-zinc-700 dark:text-zinc-300">
                            {item.transit}
                          </span>
                        </div>
                        <h5 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{item.title}</h5>
                        <p className="text-xs text-zinc-500">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: ACCOMMODATION */}
              {activeTab === "accommodation" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <h4 className="text-xl font-light text-zinc-950 dark:text-zinc-50">Stays & Bookings</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">2 Verified Accommodations · Tokyo & Hakone</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xs border border-zinc-200 dark:border-zinc-800 p-4 space-y-3 bg-[#FAFAF9] dark:bg-zinc-950">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                        <span>LODGING 01</span>
                        <span className="text-[#2D9BF0] font-semibold">Active Stay</span>
                      </div>
                      <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        TRUNK (HOTEL) Yoyogi Park
                      </h5>
                      <p className="text-xs text-zinc-500">1-15-2 Tomigaya, Shibuya-ku, Tokyo</p>
                      <div className="text-xs font-mono text-zinc-600 dark:text-zinc-400 space-y-1 pt-2 border-t border-zinc-200/70 dark:border-zinc-800/70">
                        <p>Check-in: Oct 12, 15:00</p>
                        <p>Check-out: Oct 16, 11:00 (4 nights)</p>
                        <p>Confirmation: TRK-99201-B · Paid ¥192,000</p>
                      </div>
                    </div>

                    <div className="rounded-xs border border-zinc-200 dark:border-zinc-800 p-4 space-y-3 bg-[#FAFAF9] dark:bg-zinc-950">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                        <span>LODGING 02</span>
                        <span className="text-zinc-500">Upcoming</span>
                      </div>
                      <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        Hakone Ginyu Onsen Ryokan
                      </h5>
                      <p className="text-xs text-zinc-500">100-1 Miyanoshita, Hakone-machi, Kanagawa</p>
                      <div className="text-xs font-mono text-zinc-600 dark:text-zinc-400 space-y-1 pt-2 border-t border-zinc-200/70 dark:border-zinc-800/70">
                        <p>Check-in: Oct 16, 14:00</p>
                        <p>Check-out: Oct 19, 10:00 (3 nights)</p>
                        <p>Confirmation: HKN-4402-A · Kaiseki Included</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: EXPENSES */}
              {activeTab === "expenses" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <div>
                      <h4 className="text-xl font-light text-zinc-950 dark:text-zinc-50">Expense Ledger</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">Multi-currency tracker with real ECB conversions</p>
                    </div>
                    <span className="font-mono text-xs font-semibold text-[#2D9BF0]">
                      Headroom: ¥125,800 left
                    </span>
                  </div>

                  <div className="rounded-xs border border-zinc-200 dark:border-zinc-800 overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-zinc-100 dark:bg-zinc-800/80 font-mono text-[11px] text-zinc-500">
                        <tr>
                          <th className="p-3">Expense</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Date</th>
                          <th className="p-3 text-right">JPY</th>
                          <th className="p-3 text-right">USD</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
                        <tr>
                          <td className="p-3 font-medium">TRUNK (HOTEL) Deposit</td>
                          <td className="p-3 text-zinc-500">Lodging</td>
                          <td className="p-3 font-mono text-zinc-500">Oct 12</td>
                          <td className="p-3 text-right font-mono font-semibold">¥48,000</td>
                          <td className="p-3 text-right font-mono text-zinc-500">$313.31</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium">Hakone Free Pass (3-Day)</td>
                          <td className="p-3 text-zinc-500">Transit</td>
                          <td className="p-3 font-mono text-zinc-500">Oct 13</td>
                          <td className="p-3 text-right font-mono font-semibold">¥12,400</td>
                          <td className="p-3 text-right font-mono text-zinc-500">$80.94</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium">Mori Art Museum & Sky Deck</td>
                          <td className="p-3 text-zinc-500">Culture</td>
                          <td className="p-3 font-mono text-zinc-500">Oct 14</td>
                          <td className="p-3 text-right font-mono font-semibold">¥4,400</td>
                          <td className="p-3 text-right font-mono text-zinc-500">$28.72</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium">Omakase Soba Tasting</td>
                          <td className="p-3 text-zinc-500">Dining</td>
                          <td className="p-3 font-mono text-zinc-500">Oct 14</td>
                          <td className="p-3 text-right font-mono font-semibold">¥9,400</td>
                          <td className="p-3 text-right font-mono text-zinc-500">$61.35</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: NOTES */}
              {activeTab === "notes" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <h4 className="text-xl font-light text-zinc-950 dark:text-zinc-50">Trip Notes & Guides</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">Markdown documentation and local advice</p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="rounded-xs border border-zinc-200 dark:border-zinc-800 p-4 bg-[#FAFAF9] dark:bg-zinc-950 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                        <span>PINNED NOTE · TRANSIT</span>
                        <span>Updated 2 days ago</span>
                      </div>
                      <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        Digital Suica & Shinkansen Luggage Rules
                      </h5>
                      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Add Suica card directly via Apple Wallet (use Mastercard or Amex). Baggage
                        exceeding 160cm total dimensions requires reserved oversized baggage area on
                        the Tokaido Shinkansen line.
                      </p>
                    </div>

                    <div className="rounded-xs border border-zinc-200 dark:border-zinc-800 p-4 bg-[#FAFAF9] dark:bg-zinc-950 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                        <span>PINNED NOTE · LOCAL DINING</span>
                        <span>Julian's recommendations</span>
                      </div>
                      <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        Daikanyama T-Site & Evening Yakitori
                      </h5>
                      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Visit Tsutaya Books Daikanyama around 17:00 when ambient garden lighting turns
                        on. Toriyoshi requires counter booking 24h prior.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: CHECKLIST */}
              {activeTab === "checklist" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <div>
                      <h4 className="text-xl font-light text-zinc-950 dark:text-zinc-50">Packing & Tasks</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">Collaborative checklist with completion trackers</p>
                    </div>
                    <span className="font-mono text-xs text-[#2D9BF0]">
                      {Object.values(checkedTasks).filter(Boolean).length} of 4 complete
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {[
                      { id: "task1", label: "Collect JR Hokuriku Pass at Shinjuku Station", cat: "Transit" },
                      { id: "task2", label: "Activate Ubigi eSIM profile for Japan", cat: "Tech" },
                      { id: "task3", label: "Forward dinner reservation confirmation to Julian", cat: "Dining" },
                      { id: "task4", label: "Pack Type-A 100V power adapter and portable battery", cat: "Packing" },
                    ].map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => toggleTask(task.id)}
                        className="w-full flex items-center justify-between p-3 rounded-xs border border-zinc-200 dark:border-zinc-800 bg-[#FAFAF9] dark:bg-zinc-950 text-left hover:border-zinc-400 transition-colors cursor-pointer"
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
                        <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
                          {task.cat}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: LINKS */}
              {activeTab === "links" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <h4 className="text-xl font-light text-zinc-950 dark:text-zinc-50">Saved Links & Bookmarks</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">Reference URLs, ticket vouchers, and restaurant menus</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {[
                      {
                        title: "Mori Art Museum Exhibition Pass",
                        url: "mori.art.museum/en/exhibitions/future",
                        tag: "Tickets",
                      },
                      {
                        title: "Odakyu Hakone Romancecar Timetable",
                        url: "odakyu.jp/english/romancecar/timetable",
                        tag: "Transit",
                      },
                      {
                        title: "Tabelog: Toriyoshi Roppongi Menu",
                        url: "tabelog.com/en/tokyo/A1307/A130701",
                        tag: "Dining",
                      },
                      {
                        title: "Japan-Guide: Tokyo Autumn Foliage Forecast",
                        url: "japan-guide.com/e/e2014_when.html",
                        tag: "Guide",
                      },
                    ].map((link, idx) => (
                      <div
                        key={idx}
                        className="rounded-xs border border-zinc-200 dark:border-zinc-800 p-3 bg-[#FAFAF9] dark:bg-zinc-950 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                          <span className="uppercase">{link.tag}</span>
                          <ExternalLink className="h-3 w-3 text-zinc-400" />
                        </div>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">{link.title}</p>
                        <p className="font-mono text-[11px] text-[#2D9BF0] truncate">{link.url}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
