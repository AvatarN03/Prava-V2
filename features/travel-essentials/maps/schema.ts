import { z } from "zod";

export const nearbyEssentialsQuerySchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  category: z.enum(["all", "hotel", "pharmacy", "transit", "atm", "supermarket"]).default("all"),
  radiusMeters: z.number().min(300).max(10000).default(2000),
});

export type NearbyEssentialsQueryParams = z.infer<typeof nearbyEssentialsQuerySchema>;
