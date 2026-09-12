"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  MapPin,
  DollarSign,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  Utensils,
  Bus,
  Camera,
  Bed,
  Plane,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDeleteDialog } from "@/components/app-shell/confirm-delete-dialog";
import { ItineraryItem } from "@prisma/client";
import { deleteItineraryItem } from "../actions";
import { EditItineraryDialog } from "./edit-itinerary-dialog";

const CAT_STYLES: Record<
  string,
  { label: string; icon: React.ElementType; badgeClass: string }
> = {
  Activity: {
    label: "Activity",
    icon: Camera,
    badgeClass: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  },
  Food: {
    label: "Food & Dining",
    icon: Utensils,
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  },
  Transport: {
    label: "Transport",
    icon: Bus,
    badgeClass: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
  },
  Accommodation: {
    label: "Accommodation",
    icon: Bed,
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
  Flight: {
    label: "Flight",
    icon: Plane,
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  },
  Shopping: {
    label: "Shopping",
    icon: ShoppingBag,
    badgeClass: "bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20",
  },
  Tour: {
    label: "Tour",
    icon: CheckCircle2,
    badgeClass: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20",
  },
};

interface ItineraryCardProps {
  item: ItineraryItem;
}

export function ItineraryCard({ item }: ItineraryCardProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  const handleDelete = () => {
    startDelete(async () => {
      try {
        await deleteItineraryItem({ id: item.id, tripId: item.tripId });
        toast.success(`Removed "${item.title}" from itinerary`);
        setIsDeleteOpen(false);
        router.refresh();
      } catch {
        toast.error("Failed to delete event");
      }
    });
  };

  const catKey = item.category || "Activity";
  const cfg = CAT_STYLES[catKey] || CAT_STYLES.Activity;
  const Icon = cfg.icon;

  return (
    <>
      <div className="group relative flex items-start gap-3">
        {/* Timeline connector badge */}
        <div className="flex flex-col items-center shrink-0 mt-1">
          <div
            className={`h-8 w-8 rounded-sm flex items-center justify-center border shadow-2xs ${cfg.badgeClass}`}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>

        {/* Card body */}
        <div className="flex-1 rounded-md border border-border bg-card hover:border-primary/40 hover:shadow-2xs transition-all duration-150 p-4 space-y-2 group-last:mb-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0 flex-1">
              {/* Category + time row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-semibold border rounded-xs px-2 py-0.5 ${cfg.badgeClass}`}
                >
                  {cfg.label}
                </span>

                {item.time && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                    <Clock className="w-3 h-3 text-muted-foreground/70" />
                    {item.time}
                  </span>
                )}

                {item.cost !== null && item.cost > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xs px-2 py-0.5">
                    <DollarSign className="w-3 h-3" />
                    {item.cost.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Title */}
              <h4 className="text-sm font-semibold text-foreground leading-snug pt-0.5">
                {item.title}
              </h4>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="cursor-pointer">
                  <Pencil className="h-3.5 w-3.5 mr-2" />
                  Edit Event
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsDeleteOpen(true)}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Location */}
          {item.location && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary/80 shrink-0" />
              <span>{item.location}</span>
            </p>
          )}

          {/* Description */}
          {item.description && (
            <p className="text-xs text-muted-foreground leading-relaxed pt-1 whitespace-pre-wrap border-t border-border/60">
              {item.description}
            </p>
          )}
        </div>
      </div>

      <EditItineraryDialog
        item={item}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <ConfirmDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Itinerary Event"
        description={`Are you sure you want to delete "${item.title}" from Day ${item.dayNumber || 1}?`}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
