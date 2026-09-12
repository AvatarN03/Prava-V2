"use client";

import { useMemo, useState } from "react";
import { Plus, Link2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Link as PrismaLink } from "@prisma/client";
import { LinkCard } from "./link-card";
import { AddLinkDialog } from "./add-link-dialog";

interface LinksGridProps {
  tripId: string;
  items: PrismaLink[];
}

export function LinksGrid({ tripId, items }: LinksGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  const categories = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.category || "Other")));
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((link) => {
      const matchesSearch =
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (link.description &&
          link.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat =
        categoryFilter === "ALL" ? true : link.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [items, searchQuery, categoryFilter]);

  if (items.length === 0) {
    return (
      <Card className="border-dashed rounded-md">
        <CardHeader className="text-center py-14">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary mb-3">
            <Link2 className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg font-bold">No bookmarks saved yet</CardTitle>
          <CardDescription className="max-w-md mx-auto text-xs mt-1">
            Bookmark travel blogs, hotel listings, Google Maps pins, transit trackers, or ticket confirmation URLs.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-14">
          <AddLinkDialog
            tripId={tripId}
            trigger={
              <Button size="sm" className="cursor-pointer gap-1.5">
                <Plus className="w-4 h-4" />
                Add First Link
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search links & URLs..."
              className="pl-8 h-8 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <button
              type="button"
              onClick={() => setCategoryFilter("ALL")}
              className={`px-2.5 py-1 text-xs rounded-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                categoryFilter === "ALL"
                  ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              All ({items.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 text-xs rounded-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <AddLinkDialog tripId={tripId} />
      </div>

      {/* Links Grid */}
      {filteredItems.length === 0 ? (
        <Card className="rounded-md border border-dashed p-8 text-center">
          <p className="text-sm font-semibold text-foreground">No links found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search query or category filter.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((link) => (
            <LinkCard key={link.id} item={link} />
          ))}
        </div>
      )}
    </div>
  );
}
