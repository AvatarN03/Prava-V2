import {
  BookOpen,
  Globe,
  Layers,
  Share2,
  ShieldCheck,
  WifiOff,
} from "lucide-react";

const FEATURES = [
  {
    icon: Layers,
    title: "7-Tab Structured Workspaces",
    description:
      "Dedicated workspaces for daily itineraries, stay bookings, expense reconciliations, Markdown notes, checklists, links, and AI.",
  },
  {
    icon: ShieldCheck,
    title: "Governed AI Action Proposals",
    description:
      "Gemini 2.5 Flash generates structured mutation proposals. You review visual diffs and approve before anything touches your database.",
  },
  {
    icon: Globe,
    title: "Live Travel Essentials Engine",
    description:
      "Real-time OpenWeather forecasts, European Central Bank FX rates via Frankfurter API, REST Countries intelligence, and maps.",
  },
  {
    icon: Share2,
    title: "1-Click Community Cloning",
    description:
      "Browse itineraries and templates. Clone entire trips, schedules, and packing checklists directly into your private workspace.",
  },
  {
    icon: WifiOff,
    title: "Offline Sync & Local Durability",
    description:
      "IndexedDB client-side caching ensures full access to your itinerary, packing lists, and emergency info mid-flight or without roaming.",
  },
  {
    icon: BookOpen,
    title: "Creator Profiles & Travel Stories",
    description:
      "Publish rich Markdown stories, link your trips, and showcase your verified itineraries under a locked immutable @username profile.",
  },
];

export function FeatureHighlights() {
  return (
    <section
      id="features"
      className="py-16 md:py-24 bg-slate-50/70 dark:bg-slate-950/50 border-b border-border/60 transition-colors"
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold tracking-wider uppercase text-[#2D9BF0] bg-sky-50 dark:bg-sky-950/80 border border-sky-200/80 dark:border-sky-800/80 px-3 py-1 rounded-full">
            Core Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-3">
            Built for Travelers Who Value Structure
          </h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            Everything you need to orchestrate complex journeys without bloated
            feeds, chaotic spreadsheets, or algorithmic noise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-sky-100/90 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 sm:p-6 space-y-3 shadow-2xs hover:border-[#2D9BF0]/50 dark:hover:border-[#2D9BF0]/50 transition-all hover:shadow-md"
              >
                <div className="h-10 w-10 rounded-lg bg-sky-50 dark:bg-sky-950/80 text-[#2D9BF0] flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
