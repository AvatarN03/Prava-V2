"use client";

import { Compass, Hotel, MapPin, Plus, Sparkles, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { CreateTripDialog } from "@/features/trips/components/create-trip-dialog";

export function DashboardEmptyState() {
  return (
    <Card className="border-border bg-card shadow-xs rounded-md overflow-hidden relative">
      {/* Subtle blueprint grid ambient overlay */}
      <div className="absolute inset-0 bg-prava-pattern opacity-40 pointer-events-none" />

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-12">
        {/* Left Content Column */}
        <div className="lg:col-span-7 space-y-5 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs font-sans text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Compass className="w-3.5 h-3.5" />
            <span>Travel Workspace Ready</span>
          </div>

          <div className="space-y-2">
            <h2 className="font-sans text-xl sm:text-2xl lg:text-3xl font-light tracking-tight text-foreground">
              Start Planning Your{" "}
              <span className="font-serif italic font-normal text-zinc-700 dark:text-zinc-300">
                Next Journey
              </span>
            </h2>
            <p className="font-sans text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl font-normal">
              Create your first trip to organize smart daily schedules, track stays &amp; bookings, manage multi-currency expenses in INR, and pack with essential checklists.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-1">
            <div className="flex items-center gap-2 font-sans text-xs text-slate-700 dark:text-slate-300">
              <span className="flex h-5 w-5 items-center justify-center rounded-xs bg-[#2D9BF0]/15 text-[#2D9BF0] shrink-0">
                <Sparkles className="w-3 h-3" />
              </span>
              <span>Daily Itinerary &amp; Timeline</span>
            </div>
            <div className="flex items-center gap-2 font-sans text-xs text-slate-700 dark:text-slate-300">
              <span className="flex h-5 w-5 items-center justify-center rounded-xs bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Hotel className="w-3 h-3" />
              </span>
              <span>Stays &amp; Confirmation Codes</span>
            </div>
            <div className="flex items-center gap-2 font-sans text-xs text-slate-700 dark:text-slate-300">
              <span className="flex h-5 w-5 items-center justify-center rounded-xs bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
                <Wallet className="w-3 h-3" />
              </span>
              <span>Multi-Currency Budget in INR</span>
            </div>
            <div className="flex items-center gap-2 font-sans text-xs text-slate-700 dark:text-slate-300">
              <span className="flex h-5 w-5 items-center justify-center rounded-xs bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shrink-0">
                <MapPin className="w-3 h-3" />
              </span>
              <span>Offline Notes &amp; Essentials</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex justify-end sm:justify-start">
            <CreateTripDialog
              trigger={
                <Button
                  className="h-10 sm:h-9 px-5 sm:px-4 py-2.5 sm:py-1.5 rounded-sm font-sans text-xs font-semibold gap-2 cursor-pointer shadow-xs hover:shadow transition-all active:scale-[0.98] bg-[#2D9BF0] hover:bg-[#2587D3] text-white border border-[#2D9BF0]/30"
                >
                  <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  <span>Create Your First Trip</span>
                </Button>
              }
            />
          </div>
        </div>

        {/* Right Travel Illustration Column */}
        <div className="lg:col-span-5 flex items-center justify-center">
          <div className="w-full max-w-[280px] sm:max-w-[320px] aspect-square relative flex items-center justify-center">
            {/* Subtle glow background */}
            <div className="absolute inset-4 rounded-full bg-[#2D9BF0]/10 dark:bg-[#2D9BF0]/15 blur-2xl pointer-events-none" />

            {/* Travel Theme Vector SVG */}
            <svg
              viewBox="0 0 320 320"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full relative z-10 drop-shadow-sm select-none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="globeGrad" x1="60" y1="60" x2="260" y2="260" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2D9BF0" stopOpacity="0.15" />
                  <stop offset="1" stopColor="#2D9BF0" stopOpacity="0.03" />
                </linearGradient>
                <linearGradient id="planeGrad" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2D9BF0" />
                  <stop offset="1" stopColor="#1E80CE" />
                </linearGradient>
                <linearGradient id="luggageGrad" x1="100" y1="130" x2="220" y2="270" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2D9BF0" stopOpacity="0.2" />
                  <stop offset="1" stopColor="#2D9BF0" stopOpacity="0.08" />
                </linearGradient>
              </defs>

              {/* Background Globe Wireframe */}
              <circle cx="160" cy="160" r="100" fill="url(#globeGrad)" stroke="#2D9BF0" strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="3 3" />
              <ellipse cx="160" cy="160" rx="100" ry="40" stroke="#2D9BF0" strokeOpacity="0.2" strokeWidth="1.2" />
              <ellipse cx="160" cy="160" rx="42" ry="100" stroke="#2D9BF0" strokeOpacity="0.2" strokeWidth="1.2" />
              <line x1="60" y1="160" x2="260" y2="160" stroke="#2D9BF0" strokeOpacity="0.2" strokeWidth="1.2" />

              {/* Flight Trajectory Arc */}
              <path
                d="M 60 210 Q 140 40 260 110"
                fill="none"
                stroke="#2D9BF0"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="5 5"
                className="opacity-80"
              />

              {/* Airplane on flight arc */}
              <g transform="translate(210, 80) rotate(35)">
                <path
                  d="M15 0 L20 12 L30 15 L20 18 L15 30 L12 18 L0 15 L12 12 Z"
                  fill="url(#planeGrad)"
                  stroke="#ffffff"
                  strokeWidth="1"
                />
              </g>

              {/* Central Travel Luggage / Suitcase */}
              <g transform="translate(100, 140)">
                {/* Luggage Body */}
                <rect x="10" y="24" width="100" height="85" rx="6" fill="var(--card, #ffffff)" stroke="#2D9BF0" strokeWidth="2" />
                <rect x="14" y="28" width="92" height="77" rx="4" fill="url(#luggageGrad)" />
                
                {/* Vertical Ribs */}
                <line x1="38" y1="28" x2="38" y2="105" stroke="#2D9BF0" strokeOpacity="0.3" strokeWidth="1.5" />
                <line x1="60" y1="28" x2="60" y2="105" stroke="#2D9BF0" strokeOpacity="0.3" strokeWidth="1.5" />
                <line x1="82" y1="28" x2="82" y2="105" stroke="#2D9BF0" strokeOpacity="0.3" strokeWidth="1.5" />

                {/* Handle */}
                <path d="M 45 24 L 45 10 Q 45 6 50 6 L 70 6 Q 75 6 75 10 L 75 24" fill="none" stroke="#2D9BF0" strokeWidth="2.5" strokeLinecap="round" />
                <rect x="42" y="8" width="36" height="5" rx="2" fill="#2D9BF0" />

                {/* Corner Reinforcements */}
                <rect x="10" y="24" width="10" height="10" rx="3" fill="#2D9BF0" fillOpacity="0.3" />
                <rect x="100" y="24" width="10" height="10" rx="3" fill="#2D9BF0" fillOpacity="0.3" />
                <rect x="10" y="99" width="10" height="10" rx="3" fill="#2D9BF0" fillOpacity="0.3" />
                <rect x="100" y="99" width="10" height="10" rx="3" fill="#2D9BF0" fillOpacity="0.3" />

                {/* Wheels */}
                <circle cx="28" cy="112" r="4" fill="#64748b" />
                <circle cx="92" cy="112" r="4" fill="#64748b" />

                {/* Destination Sticker Pill */}
                <g transform="translate(42, 60)">
                  <rect width="36" height="16" rx="3" fill="#2D9BF0" />
                  <text x="18" y="11.5" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle" letterSpacing="0.5">PRAVA</text>
                </g>
              </g>

              {/* Map Pin 1 (Top Left) */}
              <g transform="translate(68, 105)">
                <circle cx="12" cy="12" r="16" fill="#2D9BF0" fillOpacity="0.1" />
                <path d="M12 2 C7 2 3 6 3 11 C3 18 12 25 12 25 C12 25 21 18 21 11 C21 6 17 2 12 2 Z" fill="#2D9BF0" />
                <circle cx="12" cy="10" r="3.5" fill="#ffffff" />
              </g>

              {/* Map Pin 2 (Bottom Right) */}
              <g transform="translate(230, 200)">
                <circle cx="10" cy="10" r="12" fill="#10B981" fillOpacity="0.15" />
                <path d="M10 2 C6 2 3 5 3 9 C3 15 10 20 10 20 C10 20 17 15 17 9 C17 5 14 2 10 2 Z" fill="#10B981" />
                <circle cx="10" cy="8" r="2.5" fill="#ffffff" />
              </g>

              {/* Compass Rose Accent (Top Right) */}
              <g transform="translate(235, 45)">
                <circle cx="15" cy="15" r="15" fill="#2D9BF0" fillOpacity="0.08" stroke="#2D9BF0" strokeOpacity="0.3" strokeWidth="1" />
                <polygon points="15,4 18,15 15,13 12,15" fill="#2D9BF0" />
                <polygon points="15,26 18,15 15,17 12,15" fill="#94a3b8" />
                <polygon points="4,15 15,12 13,15 15,18" fill="#94a3b8" />
                <polygon points="26,15 15,12 17,15 15,18" fill="#94a3b8" />
                <circle cx="15" cy="15" r="2" fill="#2D9BF0" />
              </g>

              {/* Passport Stamp (Bottom Left) */}
              <g transform="translate(50, 215) rotate(-15)">
                <rect x="0" y="0" width="45" height="28" rx="4" fill="none" stroke="#2D9BF0" strokeOpacity="0.4" strokeWidth="1.2" strokeDasharray="2 2" />
                <text x="22.5" y="12" fill="#2D9BF0" fillOpacity="0.6" fontSize="6" fontWeight="bold" textAnchor="middle">APPROVED</text>
                <text x="22.5" y="20" fill="#2D9BF0" fillOpacity="0.6" fontSize="5" textAnchor="middle">★ EXPEDITION ★</text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default DashboardEmptyState;
