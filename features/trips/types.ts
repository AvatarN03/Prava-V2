import { Trip as PrismaTrip, TripStatus as PrismaTripStatus } from "@prisma/client";

export type Trip = PrismaTrip;
export type TripStatus = PrismaTripStatus;

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}
