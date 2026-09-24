"use client";

import { useState } from "react";

import { Cloud, CloudRain, Sun } from "lucide-react";

export function TravelEssentialsSection() {
  const [jpyAmount, setJpyAmount] = useState<number>(10000);
  const exchangeRate = 153.2; // JPY per USD
  const usdEquivalent = (jpyAmount / exchangeRate).toFixed(2);

  return (
    <section id="travel-tools" className="py-20 sm:py-28 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 transition-colors">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 space-y-12">
        
        {/* Section Header */}
        <div className="space-y-3 max-w-2xl">
          <span className="font-mono text-[11px] font-semibold tracking-widest text-zinc-500 uppercase">
            Contextual Utilities
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.15]">
            Useful when you need it.{" "}
            <span className="font-serif italic font-normal text-zinc-900 dark:text-zinc-100">
              Quiet when you don't.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed pt-1">
            No cluttering app switchboards or widget bars. Weather, currency calculations,
            entry requirements, and transit phrases live quietly alongside your itinerary.
          </p>
        </div>

        {/* 3-Column Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Weather */}
          <div className="rounded-sm border border-zinc-200 dark:border-zinc-800 bg-[#FAFAF9] dark:bg-zinc-900 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between font-mono text-[11px] text-zinc-400 uppercase tracking-wider">
                <span>Weather · Tokyo</span>
                <span>October</span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-5xl font-light text-zinc-950 dark:text-zinc-50 font-mono tracking-tight">
                    19°
                  </span>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
                    Clear & Crisp
                  </p>
                  <p className="text-[11px] text-zinc-500 font-mono">High 22° · Low 14°</p>
                </div>
                <Sun className="h-8 w-8 text-amber-500/80 stroke-1" />
              </div>

              {/* 5-Day Mini Strip */}
              <div className="grid grid-cols-5 gap-1 pt-3 text-center border-t border-zinc-200/80 dark:border-zinc-800/80">
                {[
                  { day: "MON", temp: "20°", icon: Sun },
                  { day: "TUE", temp: "17°", icon: CloudRain, rain: true },
                  { day: "WED", temp: "19°", icon: Cloud },
                  { day: "THU", temp: "21°", icon: Sun },
                  { day: "FRI", temp: "22°", icon: Sun },
                ].map((d, i) => {
                  const Icon = d.icon;
                  return (
                    <div key={i} className="space-y-1">
                      <span className="font-mono text-[10px] text-zinc-400">{d.day}</span>
                      <Icon
                        className={`h-3.5 w-3.5 mx-auto ${
                          d.rain ? "text-[#2D9BF0]" : "text-zinc-400"
                        }`}
                      />
                      <span
                        className={`font-mono text-[11px] block ${
                          d.rain ? "text-[#2D9BF0] font-semibold" : "text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {d.temp}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80 text-[11px] text-zinc-500 leading-relaxed">
              Automatic advice: Rain expected Tuesday afternoon; outdoor gardens re-routed to Mori
              Art Museum.
            </div>
          </div>

          {/* Card 2: Currency Converter */}
          <div className="rounded-sm border border-zinc-200 dark:border-zinc-800 bg-[#FAFAF9] dark:bg-zinc-900 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between font-mono text-[11px] text-zinc-400 uppercase tracking-wider">
                <span>Currency Converter</span>
                <span>Interbank</span>
              </div>

              <div className="space-y-3">
                <div className="rounded-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3">
                  <label htmlFor="jpy-spend-input" className="block text-[10px] font-mono uppercase text-zinc-400">
                    You Spend (JPY)
                  </label>
                  <div className="flex items-center mt-1">
                    <span className="text-sm font-mono text-zinc-500 mr-1">¥</span>
                    <input
                      id="jpy-spend-input"
                      type="number"
                      aria-label="Amount in Japanese Yen"
                      value={jpyAmount}
                      onChange={(e) => setJpyAmount(Number(e.target.value) || 0)}
                      className="w-full text-xl font-light font-mono text-zinc-900 dark:text-zinc-100 bg-transparent focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="text-center font-mono text-[11px] text-zinc-400">
                  ≈ 1 USD = 153.20 JPY
                </div>

                <div className="rounded-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3">
                  <span className="block text-[10px] font-mono uppercase text-zinc-400">
                    Equivalent in USD
                  </span>
                  <div className="text-2xl font-light font-mono text-[#2D9BF0] mt-1">
                    ${usdEquivalent}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80 text-[11px] font-mono text-zinc-400">
              Offline lookup available without roaming.
            </div>
          </div>

          {/* Card 3: Country Brief */}
          <div className="rounded-sm border border-zinc-200 dark:border-zinc-800 bg-[#FAFAF9] dark:bg-zinc-900 p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider">
                <span className="text-zinc-400">Country Brief · Japan</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Essentials</span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <div>
                  <h5 className="font-semibold text-zinc-900 dark:text-zinc-100">Transit & IC Cards</h5>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Digital Suica or Pasmo cards in Apple Wallet work across subway lines, local buses,
                    vending machines, and konbini (7-Eleven/Lawson).
                  </p>
                </div>

                <div>
                  <h5 className="font-semibold text-zinc-900 dark:text-zinc-100">Tipping Custom</h5>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    No tipping anywhere. Service charge is included; leaving extra cash can cause
                    confusion.
                  </p>
                </div>

                <div>
                  <h5 className="font-semibold text-zinc-900 dark:text-zinc-100">Emergency Numbers</h5>
                  <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                    Police: 110 · Medical / Ambulance: 119 · Japan Helpline: 0570-000-911
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80 text-[10px] font-mono text-zinc-400">
              <span>Verified for tourist visa waivers</span>
              <span>Updated Sept 2026</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
