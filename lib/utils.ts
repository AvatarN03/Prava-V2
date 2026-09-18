import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a start and end date into a clean, human-readable date range string.
 * Example: "Oct 14 – Oct 21, 2026" or "Starts Oct 14, 2026".
 */
export function formatDateRange(
  start?: Date | string | null,
  end?: Date | string | null
): string {
  if (!start && !end) return "Dates not set";
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  if (start && end) {
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return "Dates not set";
    if (s.getFullYear() === e.getFullYear()) {
      const sPart = s.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const ePart = e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      return `${sPart} – ${ePart}`;
    }
    return `${s.toLocaleDateString("en-US", options)} – ${e.toLocaleDateString("en-US", options)}`;
  }
  if (start) {
    const s = new Date(start);
    return isNaN(s.getTime()) ? "Dates not set" : `Starts ${s.toLocaleDateString("en-US", options)}`;
  }
  const e = new Date(end!);
  return isNaN(e.getTime()) ? "Dates not set" : `Ends ${e.toLocaleDateString("en-US", options)}`;
}

/**
 * Format a date into a concise relative time string (e.g., "Just now", "5m ago", "2h ago", "Yesterday", "3d ago").
 */
export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Generate a URL-safe, clean lowercase slug from a title string.
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

