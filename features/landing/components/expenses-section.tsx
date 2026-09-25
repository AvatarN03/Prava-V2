"use client";

import { ArrowUpRight, CheckCircle2, Coins, Compass, Hotel, PieChart, ShieldCheck, TrendingUp, Utensils } from "lucide-react";

export function ExpensesSection() {
  const expenseEntries = [
    {
      title: "Samode Haveli Heritage Suite",
      category: "Accommodation",
      date: "Nov 14",
      paidBy: "Shared · 2 travelers",
      inr: "₹18,500",
      usd: "≈ $222 USD",
    },
    {
      title: "Vande Bharat Express (Delhi — Jaipur AC Exec)",
      category: "Transport",
      date: "Nov 15",
      paidBy: "Personal",
      inr: "₹3,600",
      usd: "≈ $43 USD",
    },
    {
      title: "Amer Palace & Jantar Mantar Heritage Pass",
      category: "Activities",
      date: "Nov 16",
      paidBy: "Shared · 2 travelers",
      inr: "₹1,800",
      usd: "≈ $21 USD",
    },
    {
      title: "Royal Thali Tasting at 1135 AD Amer",
      category: "Food & Dining",
      date: "Nov 16",
      paidBy: "Shared",
      inr: "₹3,400",
      usd: "≈ $41 USD",
    },
  ];

  return (
    <section data-nav-theme="dark" className="py-16 sm:py-24 lg:py-28 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-[#FAFAF9]/80 dark:bg-zinc-950/60 backdrop-blur-xs transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-10 lg:px-16 space-y-10 sm:space-y-12">
        {/* Editorial Split Header with Responsive Typography */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end">
          <div className="lg:col-span-6 space-y-3">
            <span className="text-[11px] font-semibold tracking-widest text-[#2D9BF0] uppercase">
              Financial Clarity
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.15] break-words [text-wrap:balance]">
              Know where the{" "}
              <span className="block font-serif italic font-normal text-zinc-800 dark:text-zinc-200 mt-1 sm:mt-2">
                budget goes.
              </span>
            </h2>
          </div>

          <div className="lg:col-span-6">
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed break-words [text-wrap:balance]">
              Travel expenses shouldn't feel like spreadsheets. Prava records stays, transit
              fares, dining, and activity tickets with live spot currency conversions, category
              headroom meters, and offline entry.
            </p>
          </div>
        </div>

        {/* 3 Budget KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-zinc-200 dark:bg-zinc-800 rounded-sm overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="p-5 sm:p-6 bg-white dark:bg-zinc-900 space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
              Trip Budget
            </span>
            <div className="text-2xl sm:text-3xl font-light text-zinc-950 dark:text-zinc-50 tabular-nums">
              ₹1,50,000
            </div>
            <p className="text-xs text-zinc-500">Allocated across 8 days in Rajasthan</p>
          </div>

          <div className="p-5 sm:p-6 bg-white dark:bg-zinc-900 space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
              Logged to Date
            </span>
            <div className="text-2xl sm:text-3xl font-light text-zinc-950 dark:text-zinc-50 tabular-nums">
              ₹54,200
            </div>
            <p className="text-xs text-zinc-500">36.1% allocated · On pace with itinerary</p>
          </div>

          <div className="p-5 sm:p-6 bg-white dark:bg-zinc-900 space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
              Remaining Headroom
            </span>
            <div className="text-2xl sm:text-3xl font-light text-[#2D9BF0] tabular-nums">
              ₹95,800
            </div>
            <p className="text-xs text-zinc-500">Approx. $1,151 USD at live ECB spot rate</p>
          </div>
        </div>

        {/* Recent Expense Entries Table */}
        <div className="rounded-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
          <div className="flex items-center justify-between p-4 sm:px-6 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-950/60 text-xs text-zinc-500 uppercase tracking-wider font-medium">
            <span>Recent Workspace Entries</span>
            <span>Spot Converted (INR / USD)</span>
          </div>

          <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
            {expenseEntries.map((item, index) => (
              <div
                key={index}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    <span className="text-[#2D9BF0] font-medium">{item.category}</span> · {item.date} · {item.paidBy}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 tabular-nums">
                    {item.inr}
                  </span>
                  <p className="text-[11px] text-zinc-400 tabular-nums">{item.usd}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 sm:px-6 bg-zinc-50/40 dark:bg-zinc-950/40 border-t border-zinc-200/80 dark:border-zinc-800/80 text-[11px] text-zinc-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              IndexedDB offline persistence with auto-sync
            </span>
            <span className="text-zinc-700 dark:text-zinc-300 font-medium">
              Category breakdowns · CSV export ready
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
