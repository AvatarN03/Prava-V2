"use client";

export function ExpensesSection() {
  const expenseEntries = [
    {
      title: "TRUNK (HOTEL) Yoyogi Park",
      category: "Lodging",
      date: "Oct 12",
      split: "2 travelers",
      jpy: "¥48,000",
      usd: "$313 USD",
    },
    {
      title: "Hakone Free Pass (3-Day transit passes)",
      category: "Transit",
      date: "Oct 13",
      split: "Personal",
      jpy: "¥12,400",
      usd: "$81 USD",
    },
    {
      title: "Mori Art Museum & Sky Deck Admission",
      category: "Culture",
      date: "Oct 14",
      split: "2 travelers",
      jpy: "¥4,400",
      usd: "$29 USD",
    },
    {
      title: "Omakase Soba Tasting at Toriyoshi",
      category: "Dining",
      date: "Oct 14",
      split: "Shared",
      jpy: "¥9,400",
      usd: "$61 USD",
    },
  ];

  return (
    <section className="py-20 sm:py-28 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-[#FAFAF9] dark:bg-zinc-950 transition-colors">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 space-y-12">
        
        {/* Editorial Split Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end">
          <div className="lg:col-span-6 space-y-3">
            <span className="font-mono text-[11px] font-semibold tracking-widest text-zinc-500 uppercase">
              Financial Clarity
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.15]">
              Know where the{" "}
              <span className="font-serif italic font-normal text-zinc-900 dark:text-zinc-100">
                budget goes.
              </span>
            </h2>
          </div>

          <div className="lg:col-span-6">
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
              Travel expenses shouldn't feel like bookkeeping. Prava maintains a clear,
              multi-currency ledger of accommodations, transit passes, and shared dinners
              without taking you away from the journey.
            </p>
          </div>
        </div>

        {/* 3 Budget KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-zinc-200 dark:bg-zinc-800 rounded-sm overflow-hidden border border-zinc-200 dark:border-zinc-800">
          <div className="p-6 bg-white dark:bg-zinc-900 space-y-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
              Trip Budget
            </span>
            <div className="text-3xl font-light font-mono text-zinc-950 dark:text-zinc-50">
              ¥200,000
            </div>
            <p className="text-xs text-zinc-500">Allocated for 7 days in Tokyo & Hakone</p>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900 space-y-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
              Logged to Date
            </span>
            <div className="text-3xl font-light font-mono text-zinc-950 dark:text-zinc-50">
              ¥74,200
            </div>
            <p className="text-xs text-zinc-500">37.1% spent · on pace for itinerary</p>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900 space-y-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
              Remaining Headroom
            </span>
            <div className="text-3xl font-light font-mono text-[#2D9BF0]">
              ¥125,800
            </div>
            <p className="text-xs text-zinc-500">Approx. $821 USD at spot exchange</p>
          </div>
        </div>

        {/* Recent Expense Entries Table */}
        <div className="rounded-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="flex items-center justify-between p-4 sm:px-6 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-950/60 text-xs font-mono text-zinc-500 uppercase tracking-wider">
            <span>Recent Expense Entries</span>
            <span>Auto-converted JPY / USD</span>
          </div>

          <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
            {expenseEntries.map((item, index) => (
              <div
                key={index}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {item.category} · {item.date} · {item.split}
                  </p>
                </div>

                <div className="text-left sm:text-right font-mono">
                  <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                    {item.jpy}
                  </span>
                  <p className="text-[11px] text-zinc-400">{item.usd}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 sm:px-6 bg-zinc-50/40 dark:bg-zinc-950/40 border-t border-zinc-200/80 dark:border-zinc-800/80 text-[11px] font-mono text-zinc-400">
            <span>Receipt attachments stored offline in Prava secure cache</span>
            <span className="text-zinc-700 dark:text-zinc-300 font-medium">Export CSV / PDF ready</span>
          </div>
        </div>

      </div>
    </section>
  );
}
