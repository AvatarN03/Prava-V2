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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ItineraryItem } from "@prisma/client";
import { toast } from "sonner";
import { deleteItineraryItem } from "../actions";
import { EditItineraryDialog } from "./edit-itinerary-dialog";

const CAT_STYLES: Record<
  string,
  { label: string; icon: React.ElementType; dot: string; badge: string }
> = {
  Activity: {
    label: "Activity",
    icon: Camera,
    dot: "bg-[#2D9BF0]",
    badge: "bg-sky-100 text-sky-800 border-sky-200",
  },
  Food: {
    label: "Food & Dining",
    icon: Utensils,
    dot: "bg-amber-400",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
  },
  Transport: {
    label: "Transport",
    icon: Bus,
    dot: "bg-violet-400",
    badge: "bg-violet-50 text-violet-800 border-violet-200",
  },
  Accommodation: {
    label: "Accommodation",
    icon: Bed,
    dot: "bg-emerald-400",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  Flight: {
    label: "Flight",
    icon: Plane,
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-800 border-blue-200",
  },
  Shopping: {
    label: "Shopping",
    icon: ShoppingBag,
    dot: "bg-pink-400",
    badge: "bg-pink-50 text-pink-800 border-pink-200",
  },
  Tour: {
    label: "Tour",
    icon: CheckCircle2,
    dot: "bg-teal-400",
    badge: "bg-teal-50 text-teal-800 border-teal-200",
  },
};

interface ItineraryCardProps {
  item: ItineraryItem;
}

export function ItineraryCard({ item }: ItineraryCardProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    startDelete(async () => {
      await deleteItineraryItem({ id: item.id, tripId: item.tripId });
      toast.success("Event removed from itinerary.");
      router.refresh();
    });
  };

  const catKey = item.category || "Activity";
  const cfg = CAT_STYLES[catKey] || CAT_STYLES.Activity;
  const Icon = cfg.icon;

  return (
    <>
      <div className="group relative flex items-start gap-3">
        {/* Timeline dot + vertical line connector handled by parent but we provide the dot */}
        <div className="flex flex-col items-center shrink-0 mt-1">
          <div
            className={`h-8 w-8 rounded-xl flex items-center justify-center ${cfg.badge} border shadow-2xs`}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>

        {/* Card body */}
        <div className="flex-1 rounded-2xl border border-slate-200 bg-white hover:border-sky-300 hover:shadow-xs transition-all duration-200 p-4 space-y-2 group-last:mb-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0">
              {/* Category + time row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold border rounded-full px-2.5 py-0.5 ${cfg.badge}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>

                {item.time && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {item.time}
                  </span>
                )}

                {item.cost !== null && item.cost > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                    <DollarSign className="w-3 h-3" />
                    {item.cost.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Title */}
              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {item.title}
              </h4>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
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
                  onClick={handleDelete}
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
            <p className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-[#2D9BF0] shrink-0" />
              {item.location}
            </p>
          )}

          {/* Description */}
          {item.description && (
            <p className="text-xs text-slate-600 leading-relaxed pt-0.5 whitespace-pre-wrap border-t border-slate-100 pt-2">
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
    </>
  );
}
