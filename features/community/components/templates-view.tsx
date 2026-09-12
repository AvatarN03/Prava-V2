"use client";

import { useMemo, useState } from "react";
import {
  Compass,
  Filter,
  LayoutTemplate,
  Search,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { CommunityTripCard } from "@/features/community/components/community-trip-card";
import { TripPreviewDialog } from "@/features/community/components/trip-preview-dialog";

import {
  CommunityCategoryFilter,
  CommunityRegionFilter,
  CommunityTripItem,
} from "@/features/community/types";

interface TemplatesViewProps {
  initialTrips: CommunityTripItem[];
}

const REGIONS: CommunityRegionFilter[] = [
  "ALL",
  "Asia",
  "Europe",
  "Americas",
  "Middle East",
  "Oceania",
];

const CATEGORIES: CommunityCategoryFilter[] = [
  "ALL",
  "Cultural",
  "Adventure",
  "Relaxation",
  "Food & Wine",
  "Scenic",
];

export function TemplatesView({ initialTrips }: TemplatesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState<CommunityRegionFilter>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<CommunityCategoryFilter>("ALL");
  const [previewTrip, setPreviewTrip] = useState<CommunityTripItem | null>(null);

  const filteredTrips = useMemo(() => {
    return initialTrips.filter((trip) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        trip.title.toLowerCase().includes(q) ||
        (trip.destination && trip.destination.toLowerCase().includes(q)) ||
        (trip.description && trip.description.toLowerCase().includes(q)) ||
        (trip.authorName && trip.authorName.toLowerCase().includes(q));

      const matchesRegion =
        regionFilter === "ALL" ||
        trip.region?.toLowerCase() === regionFilter.toLowerCase();

      const matchesCategory =
        categoryFilter === "ALL" ||
        trip.category?.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesRegion && matchesCategory;
    });
  }, [initialTrips, searchQuery, regionFilter, categoryFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary/10 text-primary">
              <LayoutTemplate className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Trip Templates
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1">
            Curated Itineraries & Templates
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
            Jumpstart your journey with pre-planned travel blueprints. Preview day-by-day schedules, accommodations, and 1-click clone directly into your workspace.
          </p>
        </div>

        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search destination, style, creator..."
            className="pl-8.5 h-9 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-muted/20 p-3 rounded-lg border border-border/60">
        {/* Region Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-[11px] font-semibold text-muted-foreground mr-1 shrink-0">
            Region:
          </span>
          {REGIONS.map((region) => (
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

        {/* Category Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-[11px] font-semibold text-muted-foreground mr-1 shrink-0">
            Style:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-2 py-0.5 text-xs rounded-sm border font-medium transition-colors whitespace-nowrap cursor-pointer ${
                categoryFilter === cat
                  ? "bg-slate-800 text-white border-slate-800 dark:bg-slate-200 dark:text-slate-900"
                  : "bg-background text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {cat === "ALL" ? "All Styles" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing <strong className="text-foreground">{filteredTrips.length}</strong> {filteredTrips.length === 1 ? "template" : "templates"}
        </span>
        {(searchQuery || regionFilter !== "ALL" || categoryFilter !== "ALL") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setRegionFilter("ALL");
              setCategoryFilter("ALL");
            }}
            className="h-7 text-xs text-primary hover:text-primary/80 cursor-pointer"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Templates Grid */}
      {filteredTrips.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/40 p-12 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">No templates match your filters</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Try adjusting your search terms or clearing region and travel style filters.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <CommunityTripCard
              key={trip.id}
              trip={trip}
              onPreview={(t) => setPreviewTrip(t)}
            />
          ))}
        </div>
      )}

      {/* Trip Preview & Cloning Dialog */}
      <TripPreviewDialog
        trip={previewTrip}
        open={Boolean(previewTrip)}
        onOpenChange={(open) => !open && setPreviewTrip(null)}
      />
    </div>
  );
}
