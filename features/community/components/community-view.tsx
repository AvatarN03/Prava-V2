"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Compass,
  Search,
  Globe,
  Route,
  BookOpen,
  Users,
  LayoutGrid,
  Plus,
  Sparkles,
  ArrowRight,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CommunityTripItem,
  CommunityCreatorItem,
  CommunityRegionFilter,
  CommunityCategoryFilter,
  CommunityTabFilter,
} from "../types";
import { CommunityTripCard } from "./community-trip-card";
import { CommunityCreatorCard } from "./community-creator-card";
import { TripPreviewDialog } from "./trip-preview-dialog";
import { StoryCard, StoryCardItem } from "@/features/blog/components/story-card";

interface CommunityViewProps {
  initialTrips: CommunityTripItem[];
  initialStories?: StoryCardItem[];
  initialCreators?: CommunityCreatorItem[];
}

export function CommunityView({
  initialTrips,
  initialStories = [],
  initialCreators = [],
}: CommunityViewProps) {
  const [activeTab, setActiveTab] = useState<CommunityTabFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState<CommunityRegionFilter>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<CommunityCategoryFilter>("ALL");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [previewTrip, setPreviewTrip] = useState<CommunityTripItem | null>(null);

  const regions: CommunityRegionFilter[] = [
    "ALL",
    "Asia",
    "Europe",
    "Americas",
    "Middle East",
    "Oceania",
  ];
  const categories: CommunityCategoryFilter[] = [
    "ALL",
    "Cultural",
    "Adventure",
    "Relaxation",
    "Food & Wine",
    "Scenic",
  ];

  // Extract all unique tags across stories
  const allStoryTags = useMemo(() => {
    const tags = new Set<string>();
    initialStories.forEach((s) => s.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags);
  }, [initialStories]);

  // Filtered trips
  const filteredTrips = useMemo(() => {
    return initialTrips.filter((trip) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        trip.title.toLowerCase().includes(q) ||
        (trip.destination && trip.destination.toLowerCase().includes(q)) ||
        (trip.description && trip.description.toLowerCase().includes(q)) ||
        (trip.authorUsername && trip.authorUsername.toLowerCase().includes(q)) ||
        trip.authorName.toLowerCase().includes(q);

      const matchesRegion = regionFilter === "ALL" ? true : trip.region === regionFilter;
      const matchesCat = categoryFilter === "ALL" ? true : trip.category === categoryFilter;

      return matchesSearch && matchesRegion && matchesCat;
    });
  }, [initialTrips, searchQuery, regionFilter, categoryFilter]);

  // Filtered stories
  const filteredStories = useMemo(() => {
    return initialStories.filter((story) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        story.title.toLowerCase().includes(q) ||
        (story.excerpt && story.excerpt.toLowerCase().includes(q)) ||
        (story.tags && story.tags.some((t) => t.toLowerCase().includes(q))) ||
        (story.profile?.username && story.profile.username.toLowerCase().includes(q)) ||
        (story.profile?.fullName && story.profile.fullName.toLowerCase().includes(q));

      const matchesTag = !selectedTag || (story.tags && story.tags.includes(selectedTag));

      return matchesSearch && matchesTag;
    });
  }, [initialStories, searchQuery, selectedTag]);

  // Filtered creators
  const filteredCreators = useMemo(() => {
    return initialCreators.filter((creator) => {
      const q = searchQuery.toLowerCase();
      return (
        !q ||
        creator.username.toLowerCase().includes(q) ||
        (creator.fullName && creator.fullName.toLowerCase().includes(q)) ||
        (creator.bio && creator.bio.toLowerCase().includes(q)) ||
        (creator.topDestinations &&
          creator.topDestinations.some((d) => d.toLowerCase().includes(q)))
      );
    });
  }, [initialCreators, searchQuery]);

  const totalResults =
    activeTab === "all"
      ? filteredTrips.length + filteredStories.length + filteredCreators.length
      : activeTab === "itineraries"
      ? filteredTrips.length
      : activeTab === "stories"
      ? filteredStories.length
      : filteredCreators.length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary/10 text-primary">
              <Globe className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Prava Community Hub
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1">
            Discover Itineraries, Stories & Creators
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
            Explore curated trip templates, clone ready-made itineraries into your workspace, read inspiring travel stories, and discover expert creators.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/stories/new">
            <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Write Story
            </Button>
          </Link>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search destination, creator, topic..."
              className="pl-8.5 h-9 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabs Navigation using shadcn Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as CommunityTabFilter)} className="w-full">
        <TabsList className="h-11 bg-slate-100 p-1 rounded-xl border border-slate-200/80 gap-1 w-full justify-start overflow-x-auto">
          <TabsTrigger
            value="all"
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs cursor-pointer"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            All Content
          </TabsTrigger>

          <TabsTrigger
            value="itineraries"
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs cursor-pointer"
          >
            <Route className="h-3.5 w-3.5 text-[#2D9BF0]" />
            Itineraries & Templates
            <span className="ml-1 rounded-full bg-sky-100 px-2 py-0.2 text-[10px] font-bold text-sky-800">
              {filteredTrips.length}
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="stories"
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs cursor-pointer"
          >
            <BookOpen className="h-3.5 w-3.5 text-amber-500" />
            Travel Stories
            <span className="ml-1 rounded-full bg-sky-100 px-2 py-0.2 text-[10px] font-bold text-sky-800">
              {filteredStories.length}
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="creators"
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs cursor-pointer"
          >
            <Users className="h-3.5 w-3.5 text-emerald-500" />
            Verified Creators
            <span className="ml-1 rounded-full bg-sky-100 px-2 py-0.2 text-[10px] font-bold text-sky-800">
              {filteredCreators.length}
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filter Bar (for Itineraries or All) */}
      {(activeTab === "all" || activeTab === "itineraries") && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-muted/20 p-3 rounded-lg border border-border/60">
          {/* Region Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-[11px] font-semibold text-muted-foreground mr-1 shrink-0">
              Region:
            </span>
            {regions.map((region) => (
              <button
                key={region}
                type="button"
                onClick={() => setRegionFilter(region)}
                className={`px-2.5 py-1 text-xs rounded-sm border font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  regionFilter === region
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:bg-muted"
                }`}
              >
                {region === "ALL" ? "All Regions" : region}
              </button>
            ))}
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-[11px] font-semibold text-muted-foreground mr-1 shrink-0">
              Style:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2 py-0.5 text-xs rounded-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  categoryFilter === cat
                    ? "bg-foreground text-background"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat === "ALL" ? "All Styles" : cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Story Tag Strip (for Stories tab or when selected) */}
      {activeTab === "stories" && allStoryTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-semibold text-muted-foreground mr-1 shrink-0">
            Tags:
          </span>
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className={`px-2.5 py-0.5 text-xs rounded-full font-medium transition-colors cursor-pointer ${
              selectedTag === null
                ? "bg-primary text-primary-foreground"
                : "bg-muted/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            All Tags
          </button>
          {allStoryTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2.5 py-0.5 text-xs rounded-full font-medium transition-colors cursor-pointer ${
                selectedTag === tag
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {totalResults === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-lg space-y-3 bg-card/30">
          <Compass className="w-9 h-9 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">
            No community content matches your criteria
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search terms or clearing region and category filters.
          </p>
          {(searchQuery || regionFilter !== "ALL" || categoryFilter !== "ALL" || selectedTag) && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => {
                setSearchQuery("");
                setRegionFilter("ALL");
                setCategoryFilter("ALL");
                setSelectedTag(null);
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* TAB 1: ALL CONTENT (Consolidated Multi-Section View) */}
          {activeTab === "all" && (
            <div className="space-y-10">
              {/* Featured Itineraries Section */}
              {filteredTrips.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                        <Route className="h-4 w-4 text-primary" />
                        Curated Itineraries & Templates
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Ready-to-clone day-by-day travel plans designed by travelers and experts.
                      </p>
                    </div>
                    {filteredTrips.length > 3 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("itineraries")}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        View all {filteredTrips.length} <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredTrips.slice(0, 6).map((trip) => (
                      <CommunityTripCard
                        key={trip.id}
                        trip={trip}
                        onPreview={(selected) => setPreviewTrip(selected)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Travel Stories Section */}
              {filteredStories.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        Travel Stories & Guides
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Creator narratives, hidden gems, and practical travel insights.
                      </p>
                    </div>
                    {filteredStories.length > 3 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("stories")}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        View all {filteredStories.length} <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredStories.slice(0, 3).map((story) => (
                      <StoryCard key={story.id} story={story} />
                    ))}
                  </div>
                </div>
              )}

              {/* Public Creators Section */}
              {filteredCreators.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Featured Travel Creators
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Follow their public itineraries and stories to inspire your next trip.
                      </p>
                    </div>
                    {filteredCreators.length > 3 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("creators")}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        View all {filteredCreators.length} <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredCreators.slice(0, 3).map((creator) => (
                      <CommunityCreatorCard key={creator.id} creator={creator} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ITINERARIES ONLY */}
          {activeTab === "itineraries" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTrips.map((trip) => (
                <CommunityTripCard
                  key={trip.id}
                  trip={trip}
                  onPreview={(selected) => setPreviewTrip(selected)}
                />
              ))}
            </div>
          )}

          {/* TAB 3: TRAVEL STORIES ONLY */}
          {activeTab === "stories" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          )}

          {/* TAB 4: CREATORS ONLY */}
          {activeTab === "creators" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCreators.map((creator) => (
                <CommunityCreatorCard key={creator.id} creator={creator} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Full Preview Modal for Itineraries */}
      <TripPreviewDialog
        trip={previewTrip}
        open={!!previewTrip}
        onOpenChange={(open) => !open && setPreviewTrip(null)}
      />
    </div>
  );
}
