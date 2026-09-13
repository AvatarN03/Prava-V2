"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Link as PrismaLink } from "@prisma/client";
import { Edit2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

import { updateVaultLink } from "../actions";
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

interface EditVaultLinkDialogProps {
  item: PrismaLink;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditVaultLinkDialog({
  item,
  open,
  onOpenChange,
}: EditVaultLinkDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState(item.title);
  const [url, setUrl] = useState(item.url);
  const [category, setCategory] = useState<VaultCategory>(
    (item.category as VaultCategory) || "Resource"
  );
  const [description, setDescription] = useState(item.description || "");

  useEffect(() => {
    setTitle(item.title);
    setUrl(item.url);
    setCategory((item.category as VaultCategory) || "Resource");
    setDescription(item.description || "");
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      toast.error("Please provide both a title and valid URL.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await updateVaultLink({
        id: item.id,
        title: title.trim(),
        url: url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`,
        category,
        description: description.trim() || null,
      });

      if (res.success) {
        toast.success("Vault bookmark updated.");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update link.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-primary/10 text-primary">
                <Edit2 className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">
                  Edit Vault Bookmark
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Update reference details and link destination.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3.5 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-vault-title" className="text-xs font-medium">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-vault-title"
                className="h-8 text-xs"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-vault-url" className="text-xs font-medium">
                URL Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-vault-url"
                className="h-8 text-xs"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-vault-category" className="text-xs font-medium">
                Category
              </Label>
              <Select
                value={category}
                onValueChange={(val) => setCategory(val as VaultCategory)}
              >
                <SelectTrigger id="edit-vault-category" className="h-8 text-xs">
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
              <Label htmlFor="edit-vault-desc" className="text-xs font-medium">
                Description / Notes <span className="text-muted-foreground text-[10px]">(Optional)</span>
              </Label>
              <Textarea
                id="edit-vault-desc"
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
              onClick={() => onOpenChange(false)}
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
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
