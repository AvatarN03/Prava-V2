"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import {
  Compass,
  Filter,
  LayoutTemplate,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { TemplateCard } from "./template-card";
import { TemplatePreviewDialog } from "./template-preview-dialog";
import {
  DurationFilter,
  InclusionFilter,
  SortOption,
  TemplateTripItem,
} from "../types";

interface TemplatesViewProps {
  initialTrips: TemplateTripItem[];
}

export function TemplatesView({ initialTrips }: TemplatesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("ALL");
  const [inclusionFilter, setInclusionFilter] = useState<InclusionFilter>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("NEWEST");
  const [previewTrip, setPreviewTrip] = useState<TemplateTripItem | null>(null);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    durationFilter !== "ALL" ||
    inclusionFilter !== "ALL" ||
    sortBy !== "NEWEST";

  const handleResetFilters = () => {
    setSearchQuery("");
    setDurationFilter("ALL");
    setInclusionFilter("ALL");
    setSortBy("NEWEST");
  };

  const filteredTrips = useMemo(() => {
    let result = [...initialTrips];

    // 1. Destination & Keyword Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((trip) => {
        return (
          trip.title.toLowerCase().includes(q) ||
          (trip.destination && trip.destination.toLowerCase().includes(q)) ||
          (trip.description && trip.description.toLowerCase().includes(q)) ||
          (trip.author.fullName && trip.author.fullName.toLowerCase().includes(q)) ||
          (trip.author.username && trip.author.username.toLowerCase().includes(q)) ||
          trip.itinerary.some((i) => i.title.toLowerCase().includes(q))
        );
      });
    }

    // 2. Duration Filter
    if (durationFilter === "WEEKEND") {
      result = result.filter((t) => t.durationDays <= 3);
    } else if (durationFilter === "SHORT") {
      result = result.filter((t) => t.durationDays >= 4 && t.durationDays <= 7);
    } else if (durationFilter === "EXTENDED") {
      result = result.filter((t) => t.durationDays >= 8 && t.durationDays <= 14);
    } else if (durationFilter === "LONG") {
      result = result.filter((t) => t.durationDays >= 15);
    }

    // 3. Inclusions Filter
    if (inclusionFilter === "HAS_STAYS") {
      result = result.filter((t) => t.inclusions.hasStays);
    } else if (inclusionFilter === "HAS_EXPENSES") {
      result = result.filter((t) => t.inclusions.hasExpenses);
    } else if (inclusionFilter === "HAS_CHECKLIST") {
      result = result.filter((t) => t.inclusions.hasChecklist);
    } else if (inclusionFilter === "HAS_STORY") {
      result = result.filter((t) => t.inclusions.hasStory);
    }

    // 4. Sorting
    if (sortBy === "MOST_ACTIONABLE") {
      result.sort(
        (a, b) =>
          b.metrics.activityCount +
          b.metrics.checklistCount -
          (a.metrics.activityCount + a.metrics.checklistCount)
      );
    } else if (sortBy === "DURATION") {
      result.sort((a, b) => a.durationDays - b.durationDays);
    } else {
      // NEWEST
      result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return result;
  }, [initialTrips, searchQuery, durationFilter, inclusionFilter, sortBy]);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary/10 text-primary">
              <LayoutTemplate className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Trip Templates & Blueprints
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1">
            Curated Community Itineraries
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
            Real trip blueprints published by travelers. Preview complete day-by-day schedules, accommodations, and estimated budgets, then clone directly into your workspace with 1 click.
          </p>
        </div>

        <div className="relative w-full sm:w-80 shrink-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search destination, keyword, creator..."
            className="pl-8.5 h-9 text-xs bg-card"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Grounded Filter Strip (No Fake Styles or Hardcoded Continents) */}
      <div className="space-y-3 bg-muted/20 border border-border p-3.5 rounded-md">
        {/* Row 1: Duration Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-muted-foreground mr-1.5 shrink-0 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-primary" /> Duration:
          </span>

          <button
            type="button"
            onClick={() => setDurationFilter("ALL")}
            className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors cursor-pointer ${
              durationFilter === "ALL"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "bg-background border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All Durations
          </button>

          <button
            type="button"
            onClick={() => setDurationFilter("WEEKEND")}
            className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors cursor-pointer ${
              durationFilter === "WEEKEND"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "bg-background border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Weekend (1–3d)
          </button>

          <button
            type="button"
            onClick={() => setDurationFilter("SHORT")}
            className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors cursor-pointer ${
              durationFilter === "SHORT"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "bg-background border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Short Trip (4–7d)
          </button>

          <button
            type="button"
            onClick={() => setDurationFilter("EXTENDED")}
            className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors cursor-pointer ${
              durationFilter === "EXTENDED"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "bg-background border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Extended (8–14d)
          </button>

          <button
            type="button"
            onClick={() => setDurationFilter("LONG")}
            className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors cursor-pointer ${
              durationFilter === "LONG"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "bg-background border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Long Journey (15+d)
          </button>
        </div>

        {/* Row 2: Inclusions & Sorting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-muted-foreground mr-1.5 shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3 text-primary" /> Inclusions:
            </span>

            <button
              type="button"
              onClick={() => setInclusionFilter("ALL")}
              className={`px-2.5 py-0.5 rounded-sm text-[11px] transition-colors cursor-pointer ${
                inclusionFilter === "ALL"
                  ? "bg-primary/20 text-primary font-bold border border-primary/40"
                  : "bg-background border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Any
            </button>

            <button
              type="button"
              onClick={() => setInclusionFilter("HAS_STAYS")}
              className={`px-2.5 py-0.5 rounded-sm text-[11px] transition-colors cursor-pointer ${
                inclusionFilter === "HAS_STAYS"
                  ? "bg-primary/20 text-primary font-bold border border-primary/40"
                  : "bg-background border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Has Stays
            </button>

            <button
              type="button"
              onClick={() => setInclusionFilter("HAS_EXPENSES")}
              className={`px-2.5 py-0.5 rounded-sm text-[11px] transition-colors cursor-pointer ${
                inclusionFilter === "HAS_EXPENSES"
                  ? "bg-primary/20 text-primary font-bold border border-primary/40"
                  : "bg-background border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Has Budget
            </button>

            <button
              type="button"
              onClick={() => setInclusionFilter("HAS_CHECKLIST")}
              className={`px-2.5 py-0.5 rounded-sm text-[11px] transition-colors cursor-pointer ${
                inclusionFilter === "HAS_CHECKLIST"
                  ? "bg-primary/20 text-primary font-bold border border-primary/40"
                  : "bg-background border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Has Packing List
            </button>

            <button
              type="button"
              onClick={() => setInclusionFilter("HAS_STORY")}
              className={`px-2.5 py-0.5 rounded-sm text-[11px] transition-colors cursor-pointer ${
                inclusionFilter === "HAS_STORY"
                  ? "bg-primary/20 text-primary font-bold border border-primary/40"
                  : "bg-background border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Has Creator Story
            </button>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <span className="text-[11px] text-muted-foreground font-medium">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-7 rounded-sm border border-border bg-background px-2 text-xs text-foreground cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-primary"
            >
              <option value="NEWEST">Newest First</option>
              <option value="MOST_ACTIONABLE">Most Actionable</option>
              <option value="DURATION">Trip Duration</option>
            </select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Results Counter */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Showing <strong>{filteredTrips.length}</strong> trip{" "}
          {filteredTrips.length === 1 ? "template" : "templates"}
        </span>

        <span className="text-[11px] flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-primary" /> 1-Click Atomic Workspace
          Clone
        </span>
      </div>

      {/* Grid of Templates */}
      {filteredTrips.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card/40 p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Compass className="h-7 w-7 text-primary" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              {hasActiveFilters
                ? "No trip templates match your filters"
                : "No public templates published yet"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              {hasActiveFilters
                ? "Try adjusting your search query, duration range, or inclusions to discover more travel plans."
                : "Be the first to publish a public itinerary! Navigate to any of your trips in the workspace and toggle 'Public' in the header to share your plan."}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            {hasActiveFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs"
              >
                Clear All Filters
              </Button>
            ) : (
              <Link href="/trips">
                <Button size="sm" className="gap-1.5 text-xs shadow-xs">
                  <Plus className="h-3.5 w-3.5" /> View My Trips
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <TemplateCard
              key={trip.id}
              trip={trip}
              onPreview={(selected) => setPreviewTrip(selected)}
            />
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <TemplatePreviewDialog
        trip={previewTrip}
        open={Boolean(previewTrip)}
        onOpenChange={(open) => {
          if (!open) setPreviewTrip(null);
        }}
      />
    </div>
  );
}
