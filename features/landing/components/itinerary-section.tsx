"use client";

import { Clock, MapPin, Navigation } from "lucide-react";

export function ItinerarySection() {
  const scheduleItems = [
    {
      time: "07:15",
      duration: "45m · Morning Ritual",
      title: "Sunrise Chai at Hawa Mahal",
      location: "Badi Chaupar · Pink City Old Quarters",
      description:
        "Quiet dawn light hitting the 953 honeycomb sandstone windows. Sip spiced cardamom kulhad chai before morning street vendors arrive.",
      transit: "12 min e-rickshaw through historic Johari Bazaar",
    },
    {
      time: "09:30",
      duration: "2h 30m · Heritage Exploration",
      title: "Amer Fort & Sheesh Mahal (Mirror Palace)",
      location: "Amber Ridge · Overlooking Maota Lake",
      description:
        "Wander through Rajput courtyards, marble pillar arcades, and concave Belgian glass mosaics illuminated by morning sun rays.",
      transit: "Private AC transit via scenic Aravalli bypass road (20 min)",
    },
    {
      time: "13:00",
      duration: "1h 30m · Artisan & Culinary",
      title: "Royal Thali Tasting & Hand-Block Ateliers",
      location: "1135 AD & Anokhi Museum of Printing",
      description:
        "Traditional hand-ground spices and slow-cooked dal baati churma, followed by demonstrations of heritage indigo block printing.",
      transit: "15 min gentle drive toward Nahargarh scenic ridge",
    },
    {
      time: "17:15",
      duration: "1h 15m · Golden Hour",
      title: "Sunset over Nahargarh Stepwell",
      location: "Nahargarh Fort · Aravalli Crest",
      description:
        "Watch the setting sun cast warm amber hues across the entire Pink City basin from the carved ramparts.",
      transit: "Evening descent back to Samode Haveli (25 min)",
    },
  ];

  return (
    <section data-nav-theme="light" className="py-16 sm:py-24 lg:py-28 border-t border-zinc-200/80 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-10 lg:px-16 space-y-10 sm:space-y-12">
        {/* Editorial Split Header with Responsive Typography */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end">
          <div className="lg:col-span-6 space-y-3">
            <span className="text-[11px] font-semibold tracking-widest text-[#2D9BF0] uppercase">
              Temporal Structure
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-zinc-950 leading-[1.15] break-words [text-wrap:balance]">
              Plan the days.
              <span className="block font-serif italic font-normal text-zinc-800 mt-1 sm:mt-2">
                Not the chaos.
              </span>
            </h2>
          </div>

          <div className="lg:col-span-6">
            <p className="text-sm sm:text-base text-zinc-600 font-normal leading-relaxed break-words [text-wrap:balance]">
              An itinerary should breathe. Prava organizes your hours with natural transit
              buffers, contextual coordinates, and unhurried pacing so your travel feels like
              discovery, not a frantic checklist.
            </p>
          </div>
        </div>

        {/* Timeline Items in Pure Crisp Light Theme */}
        <div className="border border-zinc-200/90 rounded-sm divide-y divide-zinc-200/80 bg-[#FAFAF9]/80 overflow-hidden shadow-xs">
          {scheduleItems.map((item, index) => (
            <div
              key={index}
              className="p-5 sm:p-7 lg:p-8 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-start hover:bg-white transition-colors"
            >
              {/* Time Column */}
              <div className="md:col-span-3 space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#2D9BF0] md:hidden" />
                  <span className="text-2xl sm:text-3xl font-light text-zinc-950 tracking-tight tabular-nums">
                    {item.time}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 tracking-normal">{item.duration}</p>
              </div>

              {/* Main Detail Column */}
              <div className="md:col-span-6 space-y-2">
                <h3 className="text-base sm:text-lg font-semibold text-[#2D9BF0] break-words">
                  {item.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed pt-1 break-words">
                  {item.description}
                </p>
              </div>

              {/* Transit Note Column */}
              <div className="md:col-span-3 md:pl-4">
                <div className="rounded-xs border border-zinc-200/90 bg-white p-3.5 space-y-1 text-xs shadow-2xs">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
                    <Navigation className="h-3 w-3 text-[#2D9BF0]" />
                    <span>Transit Buffer</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-snug">
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
