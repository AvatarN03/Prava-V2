"use client";

import { useMemo, useState } from "react";
import { Plus, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Note } from "@prisma/client";
import { NoteCard } from "./note-card";
import { AddNoteDialog } from "./add-note-dialog";

interface NotesGridProps {
  tripId: string;
  items: Note[];
}

export function NotesGrid({ tripId, items }: NotesGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  const categories = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.category || "General")));
  }, [items]);

  const filteredItems = useMemo(() => {
    return items
      .filter((note) => {
        const matchesSearch =
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat =
          categoryFilter === "ALL" ? true : note.category === categoryFilter;
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        // Pinned notes first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [items, searchQuery, categoryFilter]);

  if (items.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="text-center py-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-lg">No notes recorded yet</CardTitle>
          <CardDescription className="max-w-sm mx-auto">
            Write down travel tips, restaurant recommendations, metro directions, or packing reminders.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-12">
          <AddNoteDialog
            tripId={tripId}
            trigger={
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1.5" />
                Create First Note
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
              placeholder="Search notes..."
              className="pl-8 h-8 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setCategoryFilter("ALL")}
              className={`px-2.5 py-1 text-xs rounded-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                categoryFilter === "ALL"
                  ? "bg-primary text-primary-foreground"
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
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <AddNoteDialog tripId={tripId} />
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((note) => (
          <NoteCard key={note.id} item={note} />
        ))}
      </div>
    </div>
  );
}
