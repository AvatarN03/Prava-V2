"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Link as PrismaLink } from "@prisma/client";
import { Bookmark, Check, Download, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { getVaultLinks } from "@/features/travel-essentials/vault/actions";
import { createLink } from "../actions";

interface ImportFromVaultDialogProps {
  tripId: string;
  existingUrls: string[];
  trigger?: React.ReactNode;
}

export function ImportFromVaultDialog({
  tripId,
  existingUrls,
  trigger,
}: ImportFromVaultDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [vaultLinks, setVaultLinks] = useState<PrismaLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      getVaultLinks()
        .then((res) => {
          if (res.success && res.data) {
            setVaultLinks(res.data);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [open]);

  const handleImport = async (link: PrismaLink) => {
    try {
      setImportingId(link.id);
      const res = await createLink({
        tripId,
        title: link.title,
        url: link.url,
        category: link.category || "Resource",
        description: link.description || null,
      });

      if (res.success) {
        toast.success(`Imported "${link.title}" into this trip.`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to import link.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setImportingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 cursor-pointer font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <Bookmark className="w-3.5 h-3.5 text-primary" />
            Import from Vault
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Import from Travel Resource Vault
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Quickly add your saved global bookmarks and reference links into this trip.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-2.5 min-h-[220px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-xs text-muted-foreground gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Loading your Travel Vault bookmarks...
            </div>
          ) : vaultLinks.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-xs text-muted-foreground">
                No saved bookmarks found in your Travel Resource Vault.
              </p>
              <p className="text-[11px] text-muted-foreground/80">
                You can save reusable links in Travel Essentials → Resource Vault.
              </p>
            </div>
          ) : (
            vaultLinks.map((item) => {
              const alreadyImported = existingUrls.includes(item.url);
              const isImporting = importingId === item.id;

              return (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-md border border-border bg-card/60 hover:bg-card transition-colors"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground truncate">
                        {item.title}
                      </span>
                      {item.category && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4">
                          {item.category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                      <span className="truncate">{item.url}</span>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                      </a>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant={alreadyImported ? "secondary" : "outline"}
                    className="text-xs h-7 gap-1 cursor-pointer flex-shrink-0"
                    disabled={alreadyImported || isImporting}
                    onClick={() => handleImport(item)}
                  >
                    {isImporting ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : alreadyImported ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        Added
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3" />
                        Import
                      </>
                    )}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
