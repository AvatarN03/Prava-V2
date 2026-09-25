"use client";

import { useState } from "react";

import { AlertCircle, Cloud, Globe2, PhoneCall, Sun, Zap } from "lucide-react";

export function TravelEssentialsSection() {
  const [inrAmount, setInrAmount] = useState<number>(10000);
  const exchangeRate = 83.2; // INR per USD
  const usdEquivalent = (inrAmount / exchangeRate).toFixed(2);

  return (
    <section
      id="travel-tools"
      data-nav-theme="light"
      className="py-16 sm:py-24 lg:py-28 border-t border-zinc-200/80 bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-10 lg:px-16 space-y-10 sm:space-y-12">
        {/* Section Header with Responsive Typography */}
        <div className="space-y-3 max-w-2xl">
          <span className="text-[11px] font-semibold tracking-widest text-[#2D9BF0] uppercase">
            Contextual Utilities
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-zinc-950 leading-[1.15] break-words [text-wrap:balance]">
            Useful when you need it.
            <span className="block font-serif italic font-normal text-zinc-800 mt-1 sm:mt-2">
              Quiet when you don't.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 font-normal leading-relaxed pt-1 break-words [text-wrap:balance]">
            No cluttering app switchboards or widget bars. Weather forecasts, live spot
            currency conversions, country guide matrices, and emergency helplines live quietly
            alongside your itinerary.
          </p>
        </div>

        {/* 3-Column Card Grid in Pure Crisp Light Theme */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Weather (OpenWeather live matrix) */}
          <div className="rounded-sm border border-zinc-200/90 bg-[#FAFAF9]/80 p-5 sm:p-6 flex flex-col justify-between space-y-6 shadow-xs hover:border-zinc-300 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[11px] text-zinc-500 uppercase tracking-wider font-medium">
                <span>Destination Weather</span>
                <span>Jaipur · Nov</span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-5xl font-light text-zinc-950 tracking-tight tabular-nums">
                    24°
                  </span>
                  <p className="text-xs font-semibold text-zinc-900 mt-1">
                    Clear & Pleasant
                  </p>
                  <p className="text-[11px] text-zinc-500 tabular-nums">
                    High 28° · Low 15° · UV Index 4 (Moderate)
                  </p>
                </div>
                <Sun className="h-9 w-9 text-amber-500/80 stroke-1" />
              </div>

              {/* 5-Day Forecast Strip */}
              <div className="grid grid-cols-5 gap-1 pt-3 text-center border-t border-zinc-200/80">
                {[
                  { day: "MON", temp: "25°", icon: Sun },
                  { day: "TUE", temp: "24°", icon: Sun },
                  { day: "WED", temp: "23°", icon: Cloud },
                  { day: "THU", temp: "24°", icon: Sun },
                  { day: "FRI", temp: "26°", icon: Sun },
                ].map((d, i) => {
                  const Icon = d.icon;
                  return (
                    <div key={i} className="space-y-1">
                      <span className="text-[10px] text-zinc-400 font-medium">{d.day}</span>
                      <Icon className="h-3.5 w-3.5 mx-auto text-amber-500/80" />
                      <span className="text-[11px] block text-zinc-800 font-medium tabular-nums">
                        {d.temp}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200/80 text-[11px] text-zinc-500 leading-relaxed">
              OpenWeather integration: Afternoon sunshine is warm; morning palace corridors require a light jacket.
            </div>
          </div>

          {/* Card 2: Currency Converter (Frankfurter ECB rates) */}
          <div className="rounded-sm border border-zinc-200/90 bg-[#FAFAF9]/80 p-5 sm:p-6 flex flex-col justify-between space-y-6 shadow-xs hover:border-zinc-300 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[11px] text-zinc-500 uppercase tracking-wider font-medium">
                <span>Spot FX Converter</span>
                <span>ECB Central Rates</span>
              </div>

              <div className="space-y-3">
                <div className="rounded-xs border border-zinc-300/90 bg-white p-3.5 shadow-2xs">
                  <label
                    htmlFor="inr-spend-input"
                    className="block text-[10px] uppercase text-zinc-500 font-medium tracking-wider"
                  >
                    You Spend (INR)
                  </label>
                  <div className="flex items-center mt-1">
                    <span className="text-base text-zinc-500 mr-2 font-medium">
                      ₹
                    </span>
                    <input
                      id="inr-spend-input"
                      type="number"
                      aria-label="Amount in Indian Rupees"
                      value={inrAmount}
                      onChange={(e) => setInrAmount(Number(e.target.value) || 0)}
                      className="w-full text-xl font-light text-zinc-950 bg-transparent focus:outline-hidden tabular-nums"
                    />
                  </div>
                </div>

                <div className="text-center text-[11px] text-zinc-500 tabular-nums">
                  Live Rate: 1 USD = 83.20 INR
                </div>

                <div className="rounded-xs border border-zinc-300/90 bg-white p-3.5 shadow-2xs">
                  <span className="block text-[10px] uppercase text-zinc-500 font-medium tracking-wider">
                    Equivalent in USD
                  </span>
                  <div className="text-2xl font-light text-[#2D9BF0] mt-1 tabular-nums">
                    ${usdEquivalent}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200/80 text-[11px] text-zinc-500">
              Offline calculator cached in IndexedDB · Zero roaming data needed.
            </div>
          </div>

          {/* Card 3: Country Brief & Emergency (REST Countries v3.1) */}
          <div className="rounded-sm border border-zinc-200/90 bg-[#FAFAF9]/80 p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-xs hover:border-zinc-300 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wider">
                <span className="text-zinc-500 font-medium">Country Guide · India</span>
                <span className="text-emerald-600 font-semibold">
                  Verified
                </span>
              </div>

              <div className="space-y-3.5 text-xs leading-relaxed">
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-zinc-900">
                    <Globe2 className="h-3.5 w-3.5 text-[#2D9BF0]" />
                    <h5>UPI & Digital Payments</h5>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    UPI One World wallet lets international travelers scan QR codes at bazaars and auto-rickshaws.
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-zinc-900">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    <h5>Power & Voltage</h5>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    230V / 50Hz · Type C, D, and M round pin sockets standard in hotels.
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-zinc-900">
                    <PhoneCall className="h-3.5 w-3.5 text-rose-500" />
                    <h5>Emergency Helplines</h5>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5 tabular-nums">
                    Universal: 112 · Tourist Helpline: 1363 (24/7 Toll-Free) · Ambulance: 108
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-200/80 text-[10px] text-zinc-500">
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                ✓ Indian e-Visa ready
              </span>
              <span>REST Countries v3.1</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
