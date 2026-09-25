"use client";

import { useMemo, useState } from "react";

import { ArrowUpRight, Compass } from "lucide-react";

interface Story {
  id: string;
  category: "all" | "himalayas" | "heritage" | "south" | "east";
  destination: string;
  title: string;
  excerpt: string;
  author: string;
  meta: string;
  imageUrl: string;
  href: string;
}

const ALL_STORIES: Story[] = [
  {
    id: "ladakh",
    category: "himalayas",
    destination: "LADAKH · TRANS-HIMALAYAS",
    title: "High Passes & Ancient Chants: 7 Days in Ladakh",
    excerpt:
      "Waking at 5:30 AM to monastic horns at Thiksey, traversing prayer flags over Khardung La at 5,359m, and watching twilight settle on the cyan waters of Pangong Tso.",
    author: "Tenzin Norbu & Priya Sharma",
    meta: "14 stops · 3 monastery stays",
    imageUrl:
      "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80",
    href: "/community",
  },
  {
    id: "rajasthan",
    category: "heritage",
    destination: "JAIPUR & UDAIPUR · RAJASTHAN",
    title: "The Amber Route: A Slow Guide to Royal Rajasthan",
    excerpt:
      "Stepping past courtyards of mirrored glass in Amer Palace, discovering forgotten stepwells in the Aravalli hills, and drifting across Lake Pichola at sunset.",
    author: "Kabir Sen",
    meta: "11 stops · 2 heritage havelis",
    imageUrl:
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
    href: "/community",
  },
  {
    id: "kerala",
    category: "south",
    destination: "ALLEPPEY & MUNNAR · KERALA",
    title: "Where the Waters Slow Down: Kerala's Backwater Corridors",
    excerpt:
      "Drifting in a cedar kettuvallam through narrow canals lined with coconut palms, tasting fresh karimeen pollichathu, and winding upward into the cool tea mist of Munnar.",
    author: "Ananya Nair",
    meta: "9 stops · 1 kettuvallam stay",
    imageUrl:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    href: "/community",
  },
  {
    id: "varanasi",
    category: "east",
    destination: "VARANASI · UTTAR PRADESH",
    title: "Dawn on the Sacred Ghats of Kashi",
    excerpt:
      "Boarding an oarsman's wooden boat at Assi Ghat before sunrise, watching sacred lamps illuminate the morning river mist, and threading ancient lanes for Banarasi silk.",
    author: "Devraj Mukherjee",
    meta: "8 stops · 4 morning rituals",
    imageUrl:
      "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
    href: "/community",
  },
  {
    id: "hampi",
    category: "south",
    destination: "HAMPI · KARNATAKA",
    title: "Boulders and Empires: Cycling the Forgotten Capital",
    excerpt:
      "Pedaling between surreal granite boulders, crossing the Tungabhadra River in round coracles, and admiring the monolithic stone chariot of Vijayanagara at dusk.",
    author: "Vikram Rao",
    meta: "12 stops · 2 riverside stays",
    imageUrl:
      "https://images.unsplash.com/photo-1600100397608-f010f444f417?auto=format&fit=crop&w=800&q=80",
    href: "/community",
  },
  {
    id: "meghalaya",
    category: "east",
    destination: "MEGHALAYA · NORTHEAST",
    title: "Living Root Bridges & The Clouds of Cherrapunji",
    excerpt:
      "Descending 3,500 stone steps into the subtropical valleys of Nongriat to cross double-decker living root bridges and swimming in the glass-clear waters of the Umngot River.",
    author: "Natasha Lyngdoh",
    meta: "10 stops · 2 eco-homestays",
    imageUrl:
      "https://images.unsplash.com/photo-1626014303757-646633b3ea59?auto=format&fit=crop&w=800&q=80",
    href: "/community",
  },
];

export function CommunityStoriesSection() {
  const [activeCategory, setActiveCategory] = useState<
    "all" | "himalayas" | "heritage" | "south" | "east"
  >("all");

  const filteredStories = useMemo(() => {
    if (activeCategory === "all") {
      return ALL_STORIES.slice(0, 3);
    }
    return ALL_STORIES.filter((s) => s.category === activeCategory).slice(0, 3);
  }, [activeCategory]);

  return (
    <section
      id="community"
      data-nav-theme="light"
      className="py-16 sm:py-24 lg:py-28 border-t border-zinc-200/80 bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-10 lg:px-16 space-y-10 sm:space-y-12">
        {/* Editorial Split Header with Responsive Typography */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end">
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center gap-2">
              <Compass className="h-3.5 w-3.5 text-[#2D9BF0]" />
              <span className="text-[11px] font-semibold tracking-widest text-[#2D9BF0] uppercase">
                Shared Journeys
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-zinc-950 leading-[1.15] break-words [text-wrap:balance]">
              Before you go,
              <span className="block font-serif italic font-normal text-zinc-800 mt-1 sm:mt-2">
                see how others travelled.
              </span>
            </h2>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <p className="text-sm sm:text-base text-zinc-600 font-normal leading-relaxed break-words [text-wrap:balance]">
              Authentic travel itineraries shared by creators, writers,
              and explorers. Clone verified stops, palace stays, and mountain passes
              straight into your own Prava workspace with 1 click.
            </p>

            {/* Filter Controls with Little Rounded Corners */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {[
                { id: "all", label: "All Journeys" },
                { id: "himalayas", label: "Himalayas" },
                { id: "heritage", label: "Royal Heritage" },
                { id: "south", label: "Coastal & South" },
                { id: "east", label: "Ancient & East" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`text-xs px-3.5 py-1.5 rounded-md transition-all cursor-pointer font-medium ${
                    activeCategory === cat.id
                      ? "bg-zinc-950 text-white shadow-xs"
                      : "bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Dynamic Editorial Story Cards in Pure Crisp Light Theme */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <div
              key={story.id}
              className="group flex flex-col justify-between rounded-sm border border-zinc-200/90 bg-[#FAFAF9]/90 overflow-hidden hover:border-zinc-300 transition-all cursor-pointer shadow-xs"
            >
              <div>
                {/* Cover Image with Archival Destination Tag */}
                <div className="relative h-60 w-full overflow-hidden bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={story.imageUrl}
                    alt={story.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-103"
                  />
                  <div className="absolute top-3 left-3 bg-black/75 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-white backdrop-blur-xs font-medium rounded-xs">
                    {story.destination}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-base text-zinc-950 leading-snug group-hover:text-[#2D9BF0] transition-colors break-words">
                      {story.title}
                    </h3>
                    <ArrowUpRight className="h-4 w-4 text-zinc-400 group-hover:text-[#2D9BF0] transition-colors shrink-0 mt-0.5" />
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed font-sans line-clamp-3 break-words">
                    {story.excerpt}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-5 pt-3 border-t border-zinc-200/80 flex items-center justify-between text-[11px] text-zinc-500">
                <span className="truncate max-w-[60%] font-medium">By {story.author}</span>
                <span className="shrink-0 tabular-nums">{story.meta}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
