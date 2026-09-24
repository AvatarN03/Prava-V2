"use client";

import { MapPin, Navigation } from "lucide-react";

export function ItinerarySection() {
  const scheduleItems = [
    {
      time: "09:00",
      duration: "45m · Morning Ritual",
      title: "Espresso & Norwegian Waffles",
      location: "Fuglen Tokyo · Tomigaya",
      description:
        "Quiet morning neighborhood roaster opposite Yoyogi Park. Sit outside along the cedar siding.",
      transit: "7 min walk through Yoyogi-Koen residential lanes",
    },
    {
      time: "10:30",
      duration: "2h · Urban Walk",
      title: "Architectural Exploration: Cat Street & Aoyama",
      location: "Shibuya to Minamiaoyama",
      description:
        "Observe small independent boutiques, concrete facades by Tadao Ando, and discreet alleys away from main thoroughfares.",
      transit: "Tokyo Metro Ginza line from Omotesando to Gaienmae (3 min)",
    },
    {
      time: "13:00",
      duration: "1h 15m · Culinary",
      title: "Seasonal Handcrafted Lunch",
      location: "Toriyoshi Roppongi",
      description:
        "Quiet counter seating. Known for hand-pulled soba and seasonal vegetable tempura.",
      transit: "10 min stroll toward Roppongi Hills terrace",
    },
  ];

  return (
    <section className="py-20 sm:py-28 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 transition-colors">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 space-y-12">
        
        {/* Editorial Split Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end">
          <div className="lg:col-span-6 space-y-3">
            <span className="font-mono text-[11px] font-semibold tracking-widest text-zinc-500 uppercase">
              Temporal Structure
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.15]">
              Plan the days.{" "}
              <span className="font-serif italic font-normal text-zinc-900 dark:text-zinc-100">
                Not the chaos.
              </span>
            </h2>
          </div>

          <div className="lg:col-span-6">
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
              An itinerary should breathe. Prava organizes your hours with natural transit
              buffers, contextual addresses, and unhurried pacing so your travel feels like
              discovery, not a sprint.
            </p>
          </div>
        </div>

        {/* Timeline Items */}
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-sm divide-y divide-zinc-200/80 dark:divide-zinc-800/80 bg-[#FAFAF9] dark:bg-zinc-900/60 overflow-hidden">
          {scheduleItems.map((item, index) => (
            <div
              key={index}
              className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start hover:bg-white dark:hover:bg-zinc-900 transition-colors"
            >
              {/* Time Column */}
              <div className="md:col-span-3 space-y-1 font-mono">
                <span className="text-2xl sm:text-3xl font-light text-zinc-950 dark:text-zinc-50 tracking-tight">
                  {item.time}
                </span>
                <p className="text-xs text-zinc-500 tracking-normal">{item.duration}</p>
              </div>

              {/* Main Detail Column */}
              <div className="md:col-span-6 space-y-2">
                <h3 className="text-base sm:text-lg font-semibold text-[#2D9BF0] dark:text-[#3BA8FC] hover:underline cursor-pointer">
                  {item.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <MapPin className="h-3 w-3 text-zinc-400 shrink-0" />
                  <span>{item.location}</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pt-1">
                  {item.description}
                </p>
              </div>

              {/* Transit Note Column */}
              <div className="md:col-span-3 md:pl-4">
                <div className="rounded-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                    <Navigation className="h-3 w-3 text-zinc-500" />
                    <span>Transit Note</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug">
                    {item.transit}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
