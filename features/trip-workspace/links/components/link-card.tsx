"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  Globe,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  MapPin,
  Home,
  Plane,
  Compass,
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
import { ConfirmDeleteDialog } from "@/components/app-shell/confirm-delete-dialog";
import { Link as PrismaLink } from "@prisma/client";
import { toast } from "sonner";
import { deleteLink } from "../actions";
import { EditLinkDialog } from "./edit-link-dialog";

interface LinkCardProps {
  item: PrismaLink;
}

export function LinkCard({ item }: LinkCardProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleDelete = async () => {
    const res = await deleteLink({ id: item.id, tripId: item.tripId! });
    if (res.success) {
      toast.success("Bookmark deleted.");
      setIsDeleteOpen(false);
      router.refresh();
    } else {
      toast.error(res.error || "Failed to delete bookmark.");
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(item.url);
    toast.success("URL copied to clipboard!");
  };

  const getDomainInfo = (urlStr: string) => {
    try {
      const u = new URL(urlStr);
      const host = u.hostname.toLowerCase().replace(/^www\./, "");

      if (host.includes("google.com") && u.pathname.includes("maps")) {
        return { label: "Google Maps", icon: MapPin, color: "text-emerald-600 dark:text-emerald-400" };
      }
      if (host.includes("airbnb")) {
        return { label: "Airbnb", icon: Home, color: "text-rose-600 dark:text-rose-400" };
      }
      if (host.includes("booking.com")) {
        return { label: "Booking.com", icon: Home, color: "text-blue-600 dark:text-blue-400" };
      }
      if (host.includes("tripadvisor")) {
        return { label: "TripAdvisor", icon: Compass, color: "text-teal-600 dark:text-teal-400" };
      }
      if (host.includes("skyscanner") || host.includes("kayak") || host.includes("expedia") || host.includes("airline")) {
        return { label: "Flights/Travel", icon: Plane, color: "text-sky-600 dark:text-sky-400" };
      }

      return { label: host, icon: Globe, color: "text-primary" };
    } catch {
      return { label: "External Link", icon: Globe, color: "text-primary" };
    }
  };

  const domainInfo = getDomainInfo(item.url);
  const DomainIcon = domainInfo.icon;

  return (
    <>
      <div className="group relative flex flex-col justify-between p-4 rounded-md border border-border bg-card hover:border-primary/40 hover:shadow-2xs transition-all duration-150">
        <div className="space-y-2.5">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                {item.category && (
                  <Badge variant="secondary" className="text-[10px]">
                    {item.category}
                  </Badge>
                )}
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${domainInfo.color}`}>
                  <DomainIcon className="w-3 h-3" />
                  <span className="truncate max-w-[140px]">{domainInfo.label}</span>
                </span>
              </div>

              <h4 className="text-sm font-bold text-foreground leading-snug line-clamp-1 pt-0.5">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary hover:underline transition-colors"
                >
                  {item.title}
                </a>
              </h4>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer -mr-1 -mt-1"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                  <span className="sr-only">Options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyUrl} className="cursor-pointer">
                  <Copy className="h-3.5 w-3.5 mr-2" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="cursor-pointer">
                  <Pencil className="h-3.5 w-3.5 mr-2" />
                  Edit Bookmark
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsDeleteOpen(true)}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete Bookmark
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        {/* Footer Link & Copy */}
        <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleCopyUrl}
            className="text-muted-foreground hover:text-foreground text-[11px] inline-flex items-center gap-1 font-medium cursor-pointer"
          >
            <Copy className="w-3 h-3" />
            <span>Copy URL</span>
          </button>

          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline text-xs"
          >
            <span>Visit Link</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <EditLinkDialog
        item={item}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <ConfirmDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Reference Link"
        description={`Are you sure you want to delete "${item.title}"?`}
        onConfirm={handleDelete}
      />
    </>
  );
}
