import { Polar } from "@polar-sh/sdk";

/**
 * Polar SDK Client Singleton
 *
 * Configured for Polar Sandbox by default.
 * Requires POLAR_ACCESS_TOKEN.
 * Never import or execute this on the client side.
 */
let polarInstance: Polar | null = null;

export function getPolarClient(): Polar {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error(
      "Missing POLAR_ACCESS_TOKEN environment variable. Please configure it in .env"
    );
  }

  const server = (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox";

  if (!polarInstance) {
    polarInstance = new Polar({
      accessToken,
      server,
    });
  }

  return polarInstance;
}
