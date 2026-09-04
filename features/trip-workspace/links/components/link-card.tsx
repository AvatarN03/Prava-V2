"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  Globe,
  MoreHorizontal,
  Pencil,
  Trash2,
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
    const res = await deleteLink({ id: item.id, tripId: item.tripId });
    if (res.success) {
      toast.success("Bookmark deleted.");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to delete bookmark.");
    }
  };

  const getDomain = (urlStr: string) => {
    try {
      const u = new URL(urlStr);
      return u.hostname.replace(/^www\./, "");
    } catch {
      return urlStr;
    }
  };

  return (
    <>
      <div className="group relative flex flex-col justify-between p-4 rounded-sm border border-border bg-card hover:border-primary/40 transition-colors">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              {item.category && (
                <Badge variant="secondary">{item.category}</Badge>
              )}
              <h4 className="text-sm font-semibold text-foreground leading-snug line-clamp-1 pt-0.5">
                {item.title}
              </h4>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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

          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between">
          <span className="inline-flex items-center text-[11px] text-muted-foreground truncate max-w-[180px]">
            <Globe className="w-3 h-3 mr-1 text-muted-foreground/70 shrink-0" />
            {getDomain(item.url)}
          </span>

          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs font-medium text-primary hover:underline"
          >
            Visit Link
            <ExternalLink className="w-3 h-3 ml-1" />
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
        title="Delete this bookmark?"
        description={`"${item.title}" will be permanently removed. This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </>
  );
}
