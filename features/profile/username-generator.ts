import { db } from "@/lib/db";
import { isReservedUsername } from "./reserved-usernames";

/**
 * Clean and normalize a string into a valid username candidate.
 * Keeps only lowercase letters, digits, and underscores.
 */
export function normalizeToUsernameCandidate(input: string): string {
  if (!input) return "traveler";

  // Transliterate / clean accents & special characters
  let clean = input
    .toLowerCase()
    .trim()
    // Replace spaces and hyphens with underscores
    .replace(/[\s-]+/g, "_")
    // Remove all non-alphanumeric and non-underscore chars
    .replace(/[^a-z0-9_]/g, "")
    // Collapse multiple underscores
    .replace(/_+/g, "_")
    // Trim leading/trailing underscores
    .replace(/^_+|_+$/g, "");

  if (clean.length < 3) {
    clean = (clean + "_traveler").slice(0, 20);
  }

  // Cap at 20 characters to allow numeric suffix if needed
  if (clean.length > 20) {
    clean = clean.slice(0, 20);
  }

  return clean || "traveler";
}

/**
 * Smart algorithm to generate a unique, non-reserved username from a full name or email.
 * If candidate is taken or reserved, appends random digits or smart suffixes.
 */
export async function generateSmartUniqueUsername(
  fullNameOrEmail: string,
  excludeUserId?: string
): Promise<string> {
  const baseCandidate = normalizeToUsernameCandidate(fullNameOrEmail);

  // Check if baseCandidate is valid & available
  if (!isReservedUsername(baseCandidate)) {
    const existing = await db.profile.findUnique({
      where: { username: baseCandidate },
      select: { id: true },
    });

    if (!existing || (excludeUserId && existing.id === excludeUserId)) {
      return baseCandidate;
    }
  }

  // Attempt with random 2-digit to 4-digit numeric suffixes
  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = Math.floor(10 + Math.random() * 990); // 10 to 999
    const candidate = `${baseCandidate.slice(0, 16)}_${suffix}`;

    if (isReservedUsername(candidate)) continue;

    const existing = await db.profile.findUnique({
      where: { username: candidate },
      select: { id: true },
    });

    if (!existing || (excludeUserId && existing.id === excludeUserId)) {
      return candidate;
    }
  }

  // Fallback with timestamp slice
  return `${baseCandidate.slice(0, 14)}_${Date.now().toString().slice(-4)}`;
}
