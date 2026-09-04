export const RESERVED_USERNAMES = new Set([
  "admin",
  "administrator",
  "api",
  "app",
  "auth",
  "blog",
  "community",
  "dashboard",
  "dev",
  "docs",
  "edit",
  "explore",
  "feedback",
  "help",
  "home",
  "legal",
  "login",
  "logout",
  "new",
  "posts",
  "privacy",
  "profile",
  "profiles",
  "public",
  "root",
  "search",
  "settings",
  "signin",
  "signout",
  "signup",
  "stories",
  "support",
  "system",
  "terms",
  "travel-essentials",
  "trip",
  "trips",
  "u",
  "user",
  "users",
  "workspace",
  "workspaces",
  "ai",
  "explore",
  "stories",
  "prava",
]);

export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.has(username.toLowerCase().trim());
}

/**
 * Validates a username according to Prava AI creator identity rules.
 */
export function validateUsername(rawUsername: string): { valid: boolean; error?: string; cleanUsername?: string } {
  const clean = rawUsername.trim().toLowerCase();

  if (!clean) {
    return { valid: false, error: "Username cannot be empty." };
  }

  if (clean.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters long." };
  }

  if (clean.length > 30) {
    return { valid: false, error: "Username cannot exceed 30 characters." };
  }

  const usernameRegex = /^[a-z0-9][a-z0-9_-]*[a-z0-9]$/;
  if (!usernameRegex.test(clean)) {
    return {
      valid: false,
      error: "Username must contain only lowercase letters, numbers, hyphens, and underscores, and cannot start or end with a hyphen or underscore.",
    };
  }

  if (RESERVED_USERNAMES.has(clean)) {
    return { valid: false, error: `The username "${clean}" is reserved and cannot be claimed.` };
  }

  return { valid: true, cleanUsername: clean };
}
