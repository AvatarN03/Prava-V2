import { z } from "zod";

export const tripStatusEnum = z.enum(["PLANNING", "ACTIVE", "COMPLETED", "ARCHIVED"]);

export const createTripSchema = z
  .object({
    title: z.string().trim().min(1, "Trip title is required").max(100, "Trip title cannot exceed 100 characters"),
    destination: z.string().trim().max(100, "Destination cannot exceed 100 characters").optional().nullable(),
    description: z.string().trim().max(500, "Description cannot exceed 500 characters").optional().nullable(),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
    status: tripStatusEnum.default("PLANNING"),
    coverImageUrl: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: "End date must be after or on the start date",
      path: ["endDate"],
    }
  );

export const updateTripSchema = z
  .object({
    id: z.string().uuid("Invalid trip ID"),
    title: z.string().trim().min(1, "Trip title is required").max(100, "Trip title cannot exceed 100 characters"),
    destination: z.string().trim().max(100, "Destination cannot exceed 100 characters").optional().nullable(),
    description: z.string().trim().max(500, "Description cannot exceed 500 characters").optional().nullable(),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
    status: tripStatusEnum,
    coverImageUrl: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: "End date must be after or on the start date",
      path: ["endDate"],
    }
  );

export const deleteTripSchema = z.object({
  id: z.string().uuid("Invalid trip ID"),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
export type DeleteTripInput = z.infer<typeof deleteTripSchema>;
export type TripStatus = z.infer<typeof tripStatusEnum>;
