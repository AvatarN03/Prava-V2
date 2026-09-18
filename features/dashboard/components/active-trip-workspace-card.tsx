import Link from "next/link";

import {
  ArrowUpRight,
  Bookmark,
  CheckCircle2,
  CheckSquare,
  FileText,
  Square,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";

import type { UpcomingTripDetails } from "../queries";

interface ActiveTripWorkspaceCardProps {
  trip: UpcomingTripDetails;
}

export function ActiveTripWorkspaceCard({ trip }: ActiveTripWorkspaceCardProps) {
  const pendingTasks = trip.checklistItems.filter((item) => !item.isCompleted);
  const displayedTasks = pendingTasks.slice(0, 3);
  const displayedNotes = trip.notes.slice(0, 2);
  const displayedLinks = trip.links.slice(0, 4);

  return (
    <Card className="border-border bg-card shadow-xs">
      <CardHeader className="p-4 pb-3 border-b border-border/60 flex flex-row items-center justify-between">
        <div className="space-y-0.5">
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
            Active {trip.destination || trip.title} Workspace
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">
            Quick access to checklist, notes, and places
          </p>
        </div>

        <Badge variant="outline" className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Synced
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Section 1: Tasks & Checklist */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-primary" />
              Tasks &amp; Checklist
            </span>
            <Link
              href={`/trips/${trip.id}/checklist`}
              className="text-[11px] text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              {pendingTasks.length} remaining
            </Link>
          </div>

          <div className="space-y-1.5">
            {displayedTasks.length === 0 ? (
              <div className="p-2 text-center text-xs text-muted-foreground rounded-sm border border-dashed border-border">
                No pending tasks for this trip.
              </div>
            ) : (
              displayedTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/trips/${trip.id}/checklist`}
                  className="flex items-start gap-2 p-2 rounded-sm border border-border/80 bg-background hover:border-primary/40 hover:bg-accent/30 transition-colors text-xs group"
                >
                  <Square className="w-3.5 h-3.5 mt-0.5 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                  <span className="text-foreground font-medium group-hover:text-primary transition-colors line-clamp-1">
                    {task.title}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Section 2: Recent Notes */}
        <div className="space-y-2 pt-1 border-t border-border/60">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-primary" />
              Recent notes
            </span>
            <Link
              href={`/trips/${trip.id}/notes`}
              className="text-[11px] text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              {trip.notes.length} notes
            </Link>
          </div>

          <div className="space-y-2">
            {displayedNotes.length === 0 ? (
              <div className="p-2 text-center text-xs text-muted-foreground rounded-sm border border-dashed border-border">
                No notes created yet.
              </div>
            ) : (
              displayedNotes.map((note) => (
                <Link
                  key={note.id}
                  href={`/trips/${trip.id}/notes`}
                  className="block p-2.5 rounded-sm border border-border/80 bg-background hover:border-primary/40 hover:bg-accent/30 transition-colors group"
                >
                  <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {note.title}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5 truncate">
                    <span>Updated {formatRelativeTime(note.updatedAt)}</span>
                    {note.category && (
                      <>
                        <span>·</span>
                        <span>{note.category}</span>
                      </>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Section 3: Saved Places / Bookmarks */}
        <div className="space-y-2 pt-1 border-t border-border/60">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-primary" />
              Saved places &amp; links
            </span>
            <Link
              href={`/trips/${trip.id}/links`}
              className="text-[11px] text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              {trip.links.length} saved
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {displayedLinks.length === 0 ? (
              <div className="w-full p-2 text-center text-xs text-muted-foreground rounded-sm border border-dashed border-border">
                No bookmarks or saved places yet.
              </div>
            ) : (
              displayedLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm border border-border bg-background hover:border-primary/40 hover:bg-accent/40 text-xs font-medium text-foreground transition-colors group cursor-pointer"
                >
                  <span className="truncate max-w-[130px]">{link.title}</span>
                  <ArrowUpRight className="w-3 h-3 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                </Link>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
