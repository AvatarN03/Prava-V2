"use client";

import Link from "next/link";

import { ArrowUpRight } from "lucide-react";

export function CommunityStoriesSection() {
  const stories = [
    {
      destination: "KYOTO · JAPAN",
      title: "48 hours in Kyoto",
      excerpt:
        "Waking before dawn to walk through the moss paths of Gio-ji, followed by tea ceremonies in historic Gion backstreets away from main tour buses.",
      author: "Elena Vance",
      meta: "12 stops · 2 ryokans",
      imageUrl:
        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
      href: "/stories/kyoto-48-hours",
    },
    {
      destination: "LISBON · PORTUGAL",
      title: "Three quiet places worth visiting in Lisbon",
      excerpt:
        "A curated route taking in the hidden miradouro terraces of Graça, quiet fado bookshops in Alfama, and morning pastéis along the sunlit riverbank.",
      author: "Marcus Lind",
      meta: "8 stops · 3 cafes",
      imageUrl:
        "https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&w=800&q=80",
      href: "/stories/quiet-lisbon",
    },
    {
      destination: "SEOUL · SOUTH KOREA",
      title: "A first-timer's guide to Seoul",
      excerpt:
        "Navigating contemporary concrete art spaces in Hannam-dong, traditional Hanok courtyards in Bukchon, and late-night noodle stalls.",
      author: "Soo-Jin Park",
      meta: "16 stops · 4 districts",
      imageUrl:
        "https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=800&q=80",
      href: "/stories/first-timers-seoul",
    },
  ];

  return (
    <section id="community" className="py-20 sm:py-28 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 transition-colors">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 space-y-12">
        
        {/* Editorial Split Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end">
          <div className="lg:col-span-6 space-y-3">
            <span className="font-mono text-[11px] font-semibold tracking-widest text-zinc-500 uppercase">
              Shared Journeys
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.15]">
              Before you go,{" "}
              <span className="font-serif italic font-normal text-zinc-900 dark:text-zinc-100">
                see how others travelled.
              </span>
            </h2>
          </div>

          <div className="lg:col-span-6">
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
              Authentic travel itineraries shared by creators, writers, and travelers.
              Clone verified stops, routes, and hotel recommendations straight into your
              own Prava workspace.
            </p>
          </div>
        </div>

        {/* 3 Editorial Story Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stories.map((story, index) => (
            <div
              key={index}
              className="group flex flex-col justify-between rounded-sm border border-zinc-200 dark:border-zinc-800 bg-[#FAFAF9] dark:bg-zinc-900 overflow-hidden hover:border-zinc-400 transition-all cursor-pointer"
            >
              <div>
                {/* Cover Image with Archival Tag */}
                <div className="relative h-60 w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={story.imageUrl}
                    alt={story.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103 grayscale-[10%]"
                  />
                  <div className="absolute top-3 left-3 bg-black/75 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-white backdrop-blur-xs">
                    {story.destination}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-base text-zinc-950 dark:text-zinc-50 leading-snug group-hover:text-[#2D9BF0] transition-colors">
                      {story.title}
                    </h3>
                    <ArrowUpRight className="h-4 w-4 text-zinc-400 group-hover:text-[#2D9BF0] transition-colors shrink-0 mt-0.5" />
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans line-clamp-3">
                    {story.excerpt}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-5 pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>By {story.author}</span>
                <span>{story.meta}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
