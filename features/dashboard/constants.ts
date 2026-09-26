/**
 * Trip status → Badge configuration for dashboard components.
 * Maps trip status strings to a display label and shadcn Badge variant.
 */
export const TRIP_STATUS_BADGES: Record<
  string,
  { label: string; variant: "default" | "outline" | "secondary" }
> = {
  ACTIVE: { label: "Active", variant: "default" },
  PLANNING: { label: "Planning", variant: "outline" },
  COMPLETED: { label: "Completed", variant: "secondary" },
  ARCHIVED: { label: "Archived", variant: "outline" },
};

/**
 * Returns the badge config for a given trip status.
 * Falls back to a lowercase label with `"secondary"` variant for unknown statuses.
 */
export function getTripStatusBadge(status: string) {
  return (
    TRIP_STATUS_BADGES[status] ?? {
      label: status.toLowerCase(),
      variant: "secondary" as const,
    }
  );
}
