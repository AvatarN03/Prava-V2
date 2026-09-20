"use client";

import * as React from "react";
import { useState, useEffect, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  MapPin,
  Calendar as CalendarIcon,
  ImageIcon,
  RotateCw,
  Check,
  UploadCloud,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DatePicker } from "@/components/ui/date-picker";
import { ImageUpload } from "@/components/storage/image-upload";
import { updateTrip, getDestinationCoverImages } from "../actions";
import { Trip, TripStatus } from "../types";
import { UnsplashImage } from "@/services/unsplash";

interface EditTripDialogProps {
  trip: Trip;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTripDialog({
  trip,
  open,
  onOpenChange,
}: EditTripDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const formatDateForInput = (d?: Date | string | null) => {
    if (!d) return "";
    const date = new Date(d);
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    id: trip.id,
    title: trip.title,
    destination: trip.destination ?? "",
    description: trip.description ?? "",
    startDate: formatDateForInput(trip.startDate),
    endDate: formatDateForInput(trip.endDate),
    status: trip.status as TripStatus,
    coverImageUrl: trip.coverImageUrl || "",
  });

  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [imagePage, setImagePage] = useState(1);
  const [uploadMode, setUploadMode] = useState<"suggestions" | "custom">("suggestions");

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const lastSearchedDest = React.useRef<string>(trip.destination || "");
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Fetch cover images helper
  const fetchCoverImages = useCallback(async (destination: string, page: number = 1) => {
    try {
      setImagesLoading(true);
      const res = await getDestinationCoverImages(destination, page);
      if (res.success && res.images?.length > 0) {
        setImages(res.images);
      }
    } catch (err) {
      console.error("Failed to load cover images:", err);
    } finally {
      setImagesLoading(false);
    }
  }, []);

  // Initial load of fallback images when dialog opens (zero Unsplash API rate limit consumption)
  useEffect(() => {
    if (open && images.length === 0) {
      fetchCoverImages(formData.destination || "", 1);
    }
  }, [open, fetchCoverImages, formData.destination, images.length]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setFormData({
      id: trip.id,
      title: trip.title,
      destination: trip.destination ?? "",
      description: trip.description ?? "",
      startDate: formatDateForInput(trip.startDate),
      endDate: formatDateForInput(trip.endDate),
      status: trip.status as TripStatus,
      coverImageUrl: trip.coverImageUrl || "",
    });
    setError(null);
    setFieldErrors({});
  }, [trip, open]);

  // Trigger search only when user changes destination and leaves input (onBlur / Enter)
  const triggerDestinationSearch = useCallback((dest: string) => {
    const trimmed = dest.trim();
    if (trimmed === lastSearchedDest.current) return;
    lastSearchedDest.current = trimmed;
    setImagePage(1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // If destination is cleared, load curated fallbacks without calling Unsplash API
    if (!trimmed) {
      fetchCoverImages("", 1);
      return;
    }

    // Only query Unsplash API when user has typed a non-empty destination
    debounceTimerRef.current = setTimeout(() => {
      fetchCoverImages(trimmed, 1);
    }, 400);
  }, [fetchCoverImages]);

  const handleRefreshImages = (e: React.MouseEvent) => {
    e.preventDefault();
    const nextPage = imagePage + 1;
    setImagePage(nextPage);
    fetchCoverImages(lastSearchedDest.current, nextPage);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const res = await updateTrip({
        ...formData,
        coverImageUrl: formData.coverImageUrl || null,
      });

      if (res.success) {
        onOpenChange(false);
        router.refresh();
      } else {
        setError(res.error || "Failed to update trip");
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:w-full sm:max-w-[560px] h-[75vh] max-h-[75vh] sm:h-auto sm:max-h-[80vh] flex flex-col p-0 gap-0 overflow-hidden shadow-2xl border-border/80">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 pr-12 border-b border-border/60 shrink-0 text-left bg-card">
            <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight">Edit Trip Details</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update destination, scheduled dates, cover photo, and workspace settings.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 space-y-4 comfortable-scrollbar">
            {error && (
              <div className="rounded-sm bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-3.5">
            {/* Title */}
            <div className="space-y-1">
              <Label htmlFor="edit-title" className="text-xs font-medium">Trip Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={isPending}
                className="h-9 text-sm"
              />
              {fieldErrors.title && (
                <p className="text-[11px] text-destructive">{fieldErrors.title[0]}</p>
              )}
            </div>

            {/* Destination */}
            <div className="space-y-1">
              <Label htmlFor="edit-destination" className="text-xs font-medium flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-muted-foreground" /> Destination
              </Label>
              <Input
                id="edit-destination"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                onBlur={() => triggerDestinationSearch(formData.destination)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    triggerDestinationSearch(formData.destination);
                  }
                }}
                disabled={isPending}
                className="h-9 text-sm"
              />
              {fieldErrors.destination && (
                <p className="text-[11px] text-destructive">{fieldErrors.destination[0]}</p>
              )}
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-startDate" className="text-xs font-medium flex items-center gap-1.5">
                  <CalendarIcon className="h-3 w-3 text-muted-foreground" /> Start Date
                </Label>
                <DatePicker
                  date={formData.startDate ? new Date(formData.startDate) : null}
                  onDateChange={(d) => {
                    const str = d ? d.toISOString().split("T")[0] : "";
                    setFormData({ ...formData, startDate: str });
                  }}
                  placeholder="Select start date"
                  disabled={isPending}
                  maxDate={formData.endDate ? new Date(formData.endDate) : null}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-endDate" className="text-xs font-medium flex items-center gap-1.5">
                  <CalendarIcon className="h-3 w-3 text-muted-foreground" /> End Date
                </Label>
                <DatePicker
                  date={formData.endDate ? new Date(formData.endDate) : null}
                  onDateChange={(d) => {
                    const str = d ? d.toISOString().split("T")[0] : "";
                    setFormData({ ...formData, endDate: str });
                  }}
                  placeholder="Select end date"
                  disabled={isPending}
                  minDate={formData.startDate ? new Date(formData.startDate) : null}
                />
              </div>
            </div>
            {fieldErrors.endDate && (
              <p className="text-[11px] text-destructive">{fieldErrors.endDate[0]}</p>
            )}

            {/* Status */}
            <div className="space-y-1">
              <Label htmlFor="edit-status" className="text-xs font-medium">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val) => setFormData({ ...formData, status: val as TripStatus })}
                disabled={isPending}
              >
                <SelectTrigger id="edit-status" className="h-9 text-sm">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNING">Planning</SelectItem>
                  <SelectItem value="ACTIVE">Active (In Progress)</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cover Photo Management */}
            <div className="space-y-2 pt-1 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-primary" /> Cover Photo
                </Label>

                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setUploadMode("suggestions")}
                    className={`px-2 py-0.5 rounded-xs font-medium cursor-pointer ${
                      uploadMode === "suggestions"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Suggestions
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode("custom")}
                    className={`px-2 py-0.5 rounded-xs font-medium cursor-pointer ${
                      uploadMode === "custom"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Upload Custom
                  </button>
                </div>
              </div>

              {uploadMode === "custom" ? (
                <div className="pt-1">
                  <ImageUpload
                    folder="trips"
                    currentImageUrl={formData.coverImageUrl}
                    onUploaded={(url) => setFormData({ ...formData, coverImageUrl: url })}
                    onRemoved={() => setFormData({ ...formData, coverImageUrl: "" })}
                    aspectRatio="banner"
                    label="Upload high-resolution trip banner (JPEG, PNG, WebP)"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Select from curated destination photography:</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRefreshImages}
                      disabled={imagesLoading || isPending}
                      className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-primary gap-1 cursor-pointer"
                    >
                      <RotateCw className={`h-3 w-3 ${imagesLoading ? "animate-spin" : ""}`} />
                      <span>Refresh</span>
                    </Button>
                  </div>

                  {/* 6 Image Choices Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {imagesLoading && images.length === 0 ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 rounded-md" />
                      ))
                    ) : (
                      images.map((img) => {
                        const isSelected = formData.coverImageUrl === img.url;
                        return (
                          <div
                            key={img.id}
                            role="button"
                            tabIndex={0}
                            aria-label={img.alt}
                            aria-pressed={isSelected}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                coverImageUrl: isSelected ? "" : img.url,
                              });
                            }}
                            className={`group relative h-16 rounded-md overflow-hidden cursor-pointer border transition-all ${
                              isSelected
                                ? "border-primary ring-2 ring-primary ring-offset-1 shadow-xs"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.thumbUrl}
                              alt={img.alt}
                              className="h-full w-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white shadow-xs">
                                <Check className="h-2.5 w-2.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {formData.coverImageUrl && (
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-emerald-600 font-medium flex items-center gap-1">
                        <Check className="h-3 w-3" /> Cover image active
                      </span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, coverImageUrl: "" })}
                        className="text-muted-foreground hover:text-destructive hover:underline cursor-pointer"
                      >
                        Remove Cover
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label htmlFor="edit-description" className="text-xs font-medium">
                Description & Notes
              </Label>
              <Textarea
                id="edit-description"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isPending}
                className="text-sm resize-none"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="p-3 sm:p-4 sm:px-6 border-t border-border/60 shrink-0 bg-muted/15 sm:bg-card flex flex-row items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isPending}
            className="bg-[#2D9BF0] hover:bg-[#1279CE] text-white shadow-xs cursor-pointer"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
    </Dialog>
  );
}
