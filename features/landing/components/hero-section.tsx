"use client";

import Link from "next/link";
import { useState } from "react";

import { ArrowRight, Check, Compass, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

import { HeroBackgroundPattern } from "./hero-background-pattern";

import type { User } from "@supabase/supabase-js";

interface HeroSectionProps {
  user: User | null;
}

interface DestinationJourney {
  id: string;
  name: string;
  region: string;
  dates: string;
  coordinates: string;
  photos: {
    url: string;
    caption: string;
  }[];
  itinerary: {
    time: string;
    title: string;
    location: string;
    isPrimary?: boolean;
  }[];
  budget: {
    total: string;
    spent: string;
    left: string;
    percent: string;
  };
  checklist: string[];
}

const INDIAN_JOURNEYS: DestinationJourney[] = [
  {
    id: "ladakh",
    name: "LADAKH",
    region: "Trans-Himalayas",
    dates: "10 — 18 JUL",
    coordinates: "34.1526° N, 77.5771° E · ELEV 3,500M",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80",
        caption: "FRAME 01 · Pangong Tso Glacial Waterline",
      },
      {
        url: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80",
        caption: "FRAME 02 · Thiksey Monastery Indus Ridge",
      },
      {
        url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
        caption: "FRAME 03 · Hunder High Altitude Sand Dunes",
      },
    ],
    itinerary: [
      {
        time: "06:30",
        title: "Sunrise Prayers at Thiksey",
        location: "Indus Valley · Morning chanting dwell",
      },
      {
        time: "11:00",
        title: "Khardung La Pass Crossing",
        location: "5,359m Summit · Prayer flag corridor",
      },
      {
        time: "16:00",
        title: "Nubra Valley Sand Dunes",
        location: "Hunder · High mountain desert oasis",
        isPrimary: true,
      },
    ],
    budget: {
      total: "₹1,10,000",
      spent: "₹42,500",
      left: "₹67,500 left",
      percent: "38%",
    },
    checklist: [
      "Inner Line Permit (ILP) approved",
      "Acclimatization salts & hydration packed",
      "Offline Leh & Nubra maps cached",
    ],
  },
  {
    id: "rajasthan",
    name: "RAJASTHAN",
    region: "Royal Heritage",
    dates: "14 — 22 NOV",
    coordinates: "26.9124° N, 75.7873° E · JAIPUR & UDAIPUR",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
        caption: "FRAME 01 · Amer Palace over Maota Lake",
      },
      {
        url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
        caption: "FRAME 02 · Lake Pichola Dusk over Udaipur",
      },
      {
        url: "https://images.unsplash.com/photo-1609137144822-26302b115664?auto=format&fit=crop&w=1200&q=80",
        caption: "FRAME 03 · Hawa Mahal Sandstone Honeycomb",
      },
    ],
    itinerary: [
      {
        time: "08:30",
        title: "Amer Palace & Sheesh Mahal",
        location: "Amber · Morning light on mirror mosaics",
      },
      {
        time: "12:30",
        title: "Culinary Tasting at 1135 AD",
        location: "Amer Fort Ramparts · Royal Rajasthani thali",
      },
      {
        time: "17:00",
        title: "Sunset at Nahargarh Stepwell",
        location: "Aravalli Range · Overlook across Pink City",
        isPrimary: true,
      },
    ],
    budget: {
      total: "₹1,45,000",
      spent: "₹54,200",
      left: "₹90,800 left",
      percent: "37%",
    },
    checklist: [
      "Samode Haveli stay confirmed",
      "UPI One World pass active",
      "Private Lake Pichola boat reserved",
    ],
  },
  {
    id: "kerala",
    name: "KERALA",
    region: "Coastal South",
    dates: "04 — 12 DEC",
    coordinates: "9.4981° N, 76.3388° E · ALLEPPEY & MUNNAR",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
        caption: "FRAME 01 · Alleppey Kettuvallam Houseboat Drift",
      },
      {
        url: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=1200&q=80",
        caption: "FRAME 02 · Munnar Tea Highlands Emerald Mist",
      },
      {
        url: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80",
        caption: "FRAME 03 · Vembanad Waterway Sunset Dwell",
      },
    ],
    itinerary: [
      {
        time: "07:00",
        title: "Canoe Exploration of Backwaters",
        location: "Vembanad Lake · Morning birdsong canal",
      },
      {
        time: "12:30",
        title: "Traditional Lunch on Houseboat",
        location: "Punnamada Waterway · Karimeen pollichathu",
      },
      {
        time: "17:30",
        title: "Fort Kochi Heritage Stroll",
        location: "Jew Town & Chinese Fishing Nets sunset",
        isPrimary: true,
      },
    ],
    budget: {
      total: "₹95,000",
      spent: "₹34,800",
      left: "₹60,200 left",
      percent: "36%",
    },
    checklist: [
      "Houseboat boarding pass saved",
      "Ayurvedic wellness session booked",
      "Mosquito repellent & rain gear packed",
    ],
  },
  {
    id: "varanasi",
    name: "VARANASI",
    region: "Ancient Ghats",
    dates: "18 — 25 OCT",
    coordinates: "25.3176° N, 82.9739° E · SACRED GANGA",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80",
        caption: "FRAME 01 · Dawn Rowboats on River Ganga",
      },
      {
        url: "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1200&q=80",
        caption: "FRAME 02 · Ancient Sandstone Ghats of Kashi",
      },
      {
        url: "https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=1200&q=80",
        caption: "FRAME 03 · Dashashwamedh Maha Aarti Ritual",
      },
    ],
    itinerary: [
      {
        time: "05:45",
        title: "Subah-e-Banaras Sunrise Boat",
        location: "Assi to Manikarnika · Morning classical flute",
      },
      {
        time: "09:30",
        title: "Chowk Heritage Weavers Walk",
        location: "Old Alleyways · Banarasi silk ateliers & kachori",
      },
      {
        time: "18:30",
        title: "Dashashwamedh Maha Aarti",
        location: "Ganga Waterfront · Chants and brass fire lamps",
        isPrimary: true,
      },
    ],
    budget: {
      total: "₹75,000",
      spent: "₹24,100",
      left: "₹50,900 left",
      percent: "32%",
    },
    checklist: [
      "Assi Ghat sunrise boatman reserved",
      "Sarnath archaeological pass downloaded",
      "Temple modest dress guidelines noted",
    ],
  },
];

export function HeroSection({ user }: HeroSectionProps) {
  const [selectedJourneyIndex, setSelectedJourneyIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);

  const currentJourney = INDIAN_JOURNEYS[selectedJourneyIndex];
  const currentPhoto = currentJourney.photos[photoIndex % currentJourney.photos.length];

  const handleSelectJourney = (index: number) => {
    setSelectedJourneyIndex(index);
    setPhotoIndex(0);
  };

  const handleCyclePhoto = () => {
    setPhotoIndex((prev) => (prev + 1) % currentJourney.photos.length);
  };

  return (
    <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28 bg-[#FAFAF9] text-zinc-950">
      {/* Topographic & Cartographic Background Pattern */}
      <HeroBackgroundPattern />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* Left Editorial Narrative Column */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8 lg:pt-4">
            <div className="space-y-4">
              <span className="font-sans text-[11px] font-semibold tracking-widest text-[#2D9BF0] uppercase">
                Prava Travel Workspace
              </span>
              
              {/* Responsive Title with Strict Line Break at Font Transition */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-zinc-950 leading-[1.14] break-words">
                Your journey,
                <span className="block font-serif italic font-normal text-zinc-900 mt-1 sm:mt-2">
                  in one place.
                </span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-zinc-600 font-normal leading-relaxed max-w-lg pt-1 break-words [text-wrap:balance]">
                Plan the route. Organize the details.
                <span className="block sm:inline sm:ml-1">Keep the journey moving.</span>
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
              <Button
                asChild
                className="bg-zinc-950 hover:bg-black text-white text-xs font-medium px-5 py-2.5 h-10 rounded-sm gap-2 cursor-pointer shadow-sm transition-all"
              >
                <Link href={user ? "/dashboard" : "/auth?tab=signup"}>
                  <span>Start Planning</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>

              <a
                href="#workspace"
                className="text-xs font-medium text-zinc-600 hover:text-zinc-950 transition-colors cursor-pointer px-3 py-2 font-sans"
              >
                Explore Workspace
              </a>
            </div>

            {/* Interactive Journey Switcher Chips (2 per row in 2x2 grid) */}
            <div className="pt-2 sm:pt-4 space-y-2.5">
              <span className="block font-sans text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                Featured Indian Journeys
              </span>

              <div className="grid grid-cols-2 gap-2.5 max-w-md">
                {INDIAN_JOURNEYS.map((journey, idx) => {
                  const isSelected = idx === selectedJourneyIndex;
                  return (
                    <button
                      key={journey.id}
                      type="button"
                      onClick={() => handleSelectJourney(idx)}
                      className={`text-xs px-3.5 py-2 rounded-sm font-sans font-medium transition-all cursor-pointer border flex items-center justify-between text-left ${
                        isSelected
                          ? "bg-zinc-950 text-white border-zinc-950 shadow-xs"
                          : "bg-white/90 text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-white shadow-2xs"
                      }`}
                    >
                      <span className="font-semibold">{journey.name}</span>
                      <span className="opacity-60 text-[10px]">
                        {journey.region}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3 Numbered Micro-Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6 sm:pt-8 border-t border-zinc-200/80">
              <div className="space-y-1">
                <span className="font-sans text-[11px] font-semibold text-zinc-900">
                  01. Route
                </span>
                <p className="text-xs text-zinc-500 leading-normal font-sans">
                  Day-by-day flow without clutter
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-sans text-[11px] font-semibold text-zinc-900">
                  02. Stay & Docs
                </span>
                <p className="text-xs text-zinc-500 leading-normal font-sans">
                  Bookings, tickets & Vande Bharat passes
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-sans text-[11px] font-semibold text-zinc-900">
                  03. Essentials
                </span>
                <p className="text-xs text-zinc-500 leading-normal font-sans">
                  UPI, offline maps & emergency numbers
                </p>
              </div>
            </div>
          </div>

          {/* Right Dynamic Indian Workspace Preview Frame */}
          <div className="lg:col-span-6 w-full">
            <div className="rounded-md border border-zinc-200/90 bg-white/95 backdrop-blur-md p-4 sm:p-5 transition-all shadow-xl shadow-zinc-950/5">
              {/* Top Frame Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 text-[11px] font-sans font-medium tracking-wider text-zinc-600 border-b border-zinc-200/80">
                <div className="flex items-center gap-2">
                  <Compass className="h-3.5 w-3.5 text-[#2D9BF0]" />
                  <span className="font-semibold text-zinc-900">
                    {currentJourney.name} · {currentJourney.dates}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 truncate font-sans">
                  {currentJourney.coordinates}
                </span>
              </div>

              {/* Dynamic Archival Photo with Dynamic Photo Switcher */}
              <div className="relative mt-3.5 h-64 sm:h-80 w-full overflow-hidden rounded-xs border border-zinc-200/80 bg-zinc-100 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={currentPhoto.url}
                  src={currentPhoto.url}
                  alt={currentPhoto.caption}
                  className="h-full w-full object-cover grayscale-[10%] contrast-[1.04] transition-all duration-700 animate-fadeIn"
                />
                
                <div className="absolute bottom-2.5 left-2.5 rounded-xs bg-black/75 px-2.5 py-1 text-[10px] font-sans font-medium uppercase tracking-wider text-white backdrop-blur-xs max-w-[85%] truncate">
                  {currentPhoto.caption}
                </div>

                {/* Switch Photo Button in Top Right */}
                <button
                  type="button"
                  onClick={handleCyclePhoto}
                  className="absolute top-2.5 right-2.5 rounded-xs bg-black/75 hover:bg-black px-2 py-1 text-[10px] font-sans font-medium text-white/90 backdrop-blur-xs flex items-center gap-1 transition-all cursor-pointer"
                  title="Next photo"
                >
                  <RefreshCw className="h-2.5 w-2.5" />
                  <span>
                    Photo {(photoIndex % currentJourney.photos.length) + 1}/
                    {currentJourney.photos.length}
                  </span>
                </button>
              </div>

              {/* Dynamic Widgets Below Photo */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-4 pt-3.5 border-t border-zinc-200/80">
                
                {/* Day Itinerary Highlights */}
                <div className="sm:col-span-7 space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] font-sans font-semibold tracking-wider uppercase text-zinc-500">
                    <span>Day 02 · Itinerary</span>
                    <span className="text-zinc-500 font-sans">
                      {currentJourney.itinerary.length} stops logged
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {currentJourney.itinerary.map((stop, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-2.5">
                        <span
                          className={`font-sans text-[11px] font-medium shrink-0 ${
                            stop.isPrimary
                              ? "font-semibold text-[#2D9BF0]"
                              : "text-zinc-500"
                          }`}
                        >
                          {stop.time}
                        </span>
                        <div>
                          <p className="font-medium text-zinc-900 font-sans">
                            {stop.title}
                          </p>
                          <p className="text-[11px] text-zinc-500 leading-snug font-sans">
                            {stop.location}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Sub-Widgets: Budget in INR & Verified Checklist */}
                <div className="sm:col-span-5 space-y-3.5 border-t sm:border-t-0 sm:border-l border-zinc-200/80 pt-3 sm:pt-0 sm:pl-4">
                  {/* Budget */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-sans font-semibold uppercase tracking-wider text-zinc-500">
                      <span>Trip Budget</span>
                      <span className="font-semibold text-zinc-900 font-sans">
                        {currentJourney.budget.total}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-100 border border-zinc-200/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-zinc-900 transition-all duration-500"
                        style={{ width: currentJourney.budget.percent }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-zinc-500 font-sans">
                        Spent {currentJourney.budget.spent}
                      </span>
                      <span className="font-semibold text-[#2D9BF0] font-sans">
                        {currentJourney.budget.left}
                      </span>
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="space-y-1.5 pt-2 border-t border-zinc-200/80">
                    <div className="flex items-center justify-between text-[10px] font-sans font-semibold uppercase tracking-wider text-zinc-500">
                      <span>Checklist</span>
                      <span className="font-sans">3 of 3</span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-zinc-700 font-sans">
                      {currentJourney.checklist.map((item, cIdx) => (
                        <li key={cIdx} className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-[#2D9BF0] shrink-0" />
                          <span className="truncate">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
