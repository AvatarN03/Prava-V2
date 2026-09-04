"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  MoreHorizontal,
  Pencil,
  Trash2,
  Sparkles,
  Globe,
  Lock,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trip } from "@/features/trips/types";
import { EditTripDialog } from "@/features/trips/components/edit-trip-dialog";
import { DeleteTripDialog } from "@/features/trips/components/delete-trip-dialog";
import { WorkspaceAiPanel } from "@/features/trip-workspace/ai/components/workspace-ai-panel";
import { toggleTripPublishStatus } from "@/features/community/actions";
import { CoverImage } from "@/components/storage/cover-image";
import { toast } from "sonner";

interface WorkspaceHeaderProps {
  trip: Trip & { isPublic?: boolean };
}

export function WorkspaceHeader({ trip }: WorkspaceHeaderProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(Boolean(trip.isPublic));
  const [isPublishing, startPublishing] = useTransition();

  const handleTogglePublish = () => {
    startPublishing(async () => {
      const nextState = !isPublic;
      const res = await toggleTripPublishStatus(trip.id, nextState);
      if (res.success) {
        setIsPublic(Boolean(res.isPublic));
        if (res.isPublic) {
          toast.success("Trip published to Community Hub!");
        } else {
          toast.info("Trip visibility changed to Private.");
        }
      } else {
        toast.error(res.error || "Failed to update trip visibility.");
      }
    });
  };

  const formatDateRange = (start?: Date | null, end?: Date | null) => {
    if (!start && !end) return "Dates not set";
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
    if (start && end) {
      const s = new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const e = new Date(end).toLocaleDateString("en-US", options);
      return `${s} – ${e}`;
    }
    if (start) {
      return `Starts ${new Date(start).toLocaleDateString("en-US", options)}`;
    }
    return `Ends ${new Date(end!).toLocaleDateString("en-US", options)}`;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "PLANNING":
        return "planning";
      case "ACTIVE":
        return "active";
      case "COMPLETED":
        return "completed";
      case "ARCHIVED":
        return "archived";
      default:
        return "secondary";
    }
  };

  return (
    <>
      <div className="space-y-4 pb-3">
        {/* Cover Banner */}
        <CoverImage
          tripId={trip.id}
          coverImageUrl={trip.coverImageUrl}
          title={trip.title}
          destination={trip.destination}
          isEditable={true}
        />

        <div className="flex items-center justify-between">
          <Link
            href="/trips"
            className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Trips
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs font-medium border-primary/30 hover:border-primary hover:bg-primary/5 text-primary"
              onClick={() => setIsAiPanelOpen(true)}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Assistant
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Trip Settings</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                  <Pencil className="h-3.5 w-3.5 mr-2" />
                  Edit Trip Details
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleTogglePublish} disabled={isPublishing}>
                  {isPublishing ? (
                    <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                  ) : isPublic ? (
                    <Lock className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  ) : (
                    <Globe className="h-3.5 w-3.5 mr-2 text-primary" />
                  )}
                  {isPublic ? "Make Private" : "Share to Community"}
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsDeleteOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete Trip
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={getStatusVariant(trip.status)}>
                {trip.status.toLowerCase()}
              </Badge>
              {isPublic && (
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  <Globe className="w-2.5 h-2.5 text-primary" /> Public
                </Badge>
              )}
              {trip.destination && (
                <span className="inline-flex items-center text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-muted-foreground/80" />
                  {trip.destination}
                </span>
              )}
              <span className="inline-flex items-center text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 mr-1 text-muted-foreground/80" />
                {formatDateRange(trip.startDate, trip.endDate)}
              </span>
            </div>

            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {trip.title}
            </h1>
          </div>
        </div>
      </div>

      <EditTripDialog
        trip={trip}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <DeleteTripDialog
        trip={trip}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />

      <WorkspaceAiPanel
        tripId={trip.id}
        tripTitle={trip.title}
        destination={trip.destination}
        isOpen={isAiPanelOpen}
        onClose={() => setIsAiPanelOpen(false)}
      />
    </>
  );
}
