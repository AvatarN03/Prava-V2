"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Bookmark, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { createVaultLink } from "../actions";
import { VaultCategory } from "../schema";

const CATEGORIES: { label: string; value: VaultCategory }[] = [
  { label: "Resource & Reference", value: "Resource" },
  { label: "Visa & Embassy Portals", value: "Visa & Embassy" },
  { label: "Flights & Transit", value: "Flights & Transit" },
  { label: "Guides & Blogs", value: "Guides & Blogs" },
  { label: "Accommodations & Stays", value: "Accommodations" },
  { label: "Gear & Packing", value: "Gear & Packing" },
  { label: "Food & Dining", value: "Food & Dining" },
  { label: "Emergency & Safety", value: "Emergency & Safety" },
];

interface AddVaultLinkDialogProps {
  trigger?: React.ReactNode;
}

export function AddVaultLinkDialog({ trigger }: AddVaultLinkDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<VaultCategory>("Resource");
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setTitle("");
    setUrl("");
    setCategory("Resource");
    setDescription("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      toast.error("Please provide both a title and valid URL.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createVaultLink({
        title: title.trim(),
        url: url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`,
        category,
        description: description.trim() || null,
      });

      if (res.success) {
        toast.success("Bookmark saved to your Travel Vault.");
        resetForm();
        setOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to save link.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-1.5 cursor-pointer font-medium">
            <Plus className="w-4 h-4" />
            Save to Vault
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-primary/10 text-primary">
                <Bookmark className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">
                  Save to Travel Vault
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Store global bookmarks, visa portals, and guides to reuse across trips.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3.5 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="vault-title" className="text-xs font-medium">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="vault-title"
                placeholder="e.g. Official Japan Rail Pass Portal"
                className="h-8 text-xs"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vault-url" className="text-xs font-medium">
                URL Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="vault-url"
                placeholder="https://www.japanrailpass.net/en/"
                className="h-8 text-xs"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vault-category" className="text-xs font-medium">
                Category
              </Label>
              <Select
                value={category}
                onValueChange={(val) => setCategory(val as VaultCategory)}
              >
                <SelectTrigger id="vault-category" className="h-8 text-xs">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="text-xs">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vault-desc" className="text-xs font-medium">
                Description / Notes <span className="text-muted-foreground text-[10px]">(Optional)</span>
              </Label>
              <Textarea
                id="vault-desc"
                placeholder="Key details, booking windows, or reference instructions..."
                className="text-xs resize-none min-h-[70px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs cursor-pointer"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs gap-1.5 cursor-pointer font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Link
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
