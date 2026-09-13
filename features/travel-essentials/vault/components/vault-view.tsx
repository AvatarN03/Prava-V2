"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Link as PrismaLink } from "@prisma/client";
import {
  Bookmark,
  Compass,
  ExternalLink,
  FolderPlus,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { ConfirmDeleteDialog } from "@/components/app-shell/confirm-delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import { deleteVaultLink } from "../actions";
import { AddVaultLinkDialog } from "./add-vault-link-dialog";
import { AttachToTripDialog } from "./attach-to-trip-dialog";
import { EditVaultLinkDialog } from "./edit-vault-link-dialog";

interface VaultViewProps {
  initialLinks: PrismaLink[];
}

const CATEGORY_COLORS: Record<string, string> = {
  "Visa & Embassy": "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800",
  "Flights & Transit": "bg-sky-500/10 text-sky-600 border-sky-200 dark:border-sky-800",
  "Guides & Blogs": "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800",
  "Accommodations": "bg-violet-500/10 text-violet-600 border-violet-200 dark:border-violet-800",
  "Gear & Packing": "bg-pink-500/10 text-pink-600 border-pink-200 dark:border-pink-800",
  "Emergency & Safety": "bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-800",
  "Food & Dining": "bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-800",
  "Resource": "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800",
};

export function VaultView({ initialLinks }: VaultViewProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const [editingLink, setEditingLink] = useState<PrismaLink | null>(null);
  const [attachingLink, setAttachingLink] = useState<PrismaLink | null>(null);
  const [deletingLink, setDeletingLink] = useState<PrismaLink | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const categories = useMemo(() => {
    const list = Array.from(
      new Set(initialLinks.map((l) => l.category || "Resource"))
    );
    return list;
  }, [initialLinks]);

  const filteredLinks = useMemo(() => {
    return initialLinks.filter((link) => {
      const matchesCategory =
        selectedCategory === "ALL" || link.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        link.title.toLowerCase().includes(q) ||
        link.url.toLowerCase().includes(q) ||
        (link.description && link.description.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [initialLinks, selectedCategory, searchQuery]);

  const handleDelete = async () => {
    if (!deletingLink) return;
    try {
      setIsDeleting(true);
      const res = await deleteVaultLink(deletingLink.id);
      if (res.success) {
        toast.success("Bookmark removed from Vault.");
        setDeletingLink(null);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to remove link.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search vault bookmarks & URLs..."
              className="pl-8 h-8 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory("ALL")}
              className={`px-2.5 py-1 text-xs rounded-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === "ALL"
                  ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              All ({initialLinks.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs rounded-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <AddVaultLinkDialog />
      </div>

      {/* Vault Grid or Empty State */}
      {filteredLinks.length === 0 ? (
        <Card className="border-dashed rounded-md">
          <CardHeader className="text-center py-14">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary mb-3">
              <Bookmark className="h-6 w-6" />
            </div>
            <CardTitle className="text-base font-bold">
              {initialLinks.length === 0
                ? "Your Travel Resource Vault is empty"
                : "No matching vault bookmarks"}
            </CardTitle>
            <CardDescription className="max-w-md mx-auto text-xs mt-1">
              {initialLinks.length === 0
                ? "Save visa application portals, packing checklists, train pass tools, and travel blogs here to easily attach them to future trips."
                : "Try adjusting your search keywords or category filter."}
            </CardDescription>
          </CardHeader>
          {initialLinks.length === 0 && (
            <CardContent className="flex justify-center pb-14">
              <AddVaultLinkDialog
                trigger={
                  <Button size="sm" className="gap-1.5 cursor-pointer font-medium">
                    <Plus className="w-4 h-4" />
                    Save Your First Link
                  </Button>
                }
              />
            </CardContent>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredLinks.map((link) => {
            const categoryBadgeClass =
              CATEGORY_COLORS[link.category || "Resource"] ||
              "bg-secondary text-secondary-foreground border-border";

            return (
              <Card
                key={link.id}
                className="border-border bg-card flex flex-col justify-between hover:border-border/80 transition-colors"
              >
                <CardHeader className="p-4 pb-2 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-medium px-2 py-0.5 border ${categoryBadgeClass}`}
                    >
                      {link.category || "Resource"}
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer -mr-1"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="text-xs">
                        <DropdownMenuItem
                          className="cursor-pointer gap-2"
                          onClick={() => setAttachingLink(link)}
                        >
                          <FolderPlus className="w-3.5 h-3.5 text-primary" />
                          Attach to Trip...
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer gap-2"
                          onClick={() => setEditingLink(link)}
                        >
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                          onClick={() => setDeletingLink(link)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Bookmark
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                      {link.title}
                    </h3>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline truncate max-w-full mt-0.5"
                    >
                      <span className="truncate">{link.url.replace(/^https?:\/\//, "")}</span>
                      <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                    </a>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-1 space-y-3">
                  {link.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {link.description}
                    </p>
                  )}

                  <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      Saved {new Date(link.createdAt).toLocaleDateString()}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1.5 cursor-pointer font-medium hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                      onClick={() => setAttachingLink(link)}
                    >
                      <Compass className="w-3 h-3" />
                      Attach to Trip
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      {editingLink && (
        <EditVaultLinkDialog
          item={editingLink}
          open={!!editingLink}
          onOpenChange={(open) => !open && setEditingLink(null)}
        />
      )}

      {attachingLink && (
        <AttachToTripDialog
          item={attachingLink}
          open={!!attachingLink}
          onOpenChange={(open) => !open && setAttachingLink(null)}
        />
      )}

      {deletingLink && (
        <ConfirmDeleteDialog
          open={!!deletingLink}
          onOpenChange={(open) => !open && setDeletingLink(null)}
          title="Delete Vault Bookmark"
          description={`Are you sure you want to remove "${deletingLink.title}" from your Travel Resource Vault?`}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
