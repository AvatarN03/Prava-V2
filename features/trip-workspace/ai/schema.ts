import { z } from "zod";

export const aiProposalChangeSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  domain: z.enum(["itinerary", "accommodation"]),
  action: z.enum(["create", "update", "delete"]),
  targetId: z.string().optional(),
  data: z.object({
    // Itinerary fields
    title: z.string().optional(),
    dayNumber: z.number().int().positive().nullable().optional(),
    time: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    cost: z.number().nullable().optional(),
    description: z.string().nullable().optional(),

    // Accommodation fields
    name: z.string().optional(),
    type: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    checkIn: z.string().nullable().optional(),
    checkOut: z.string().nullable().optional(),
    confirmationCode: z.string().nullable().optional(),
    contactPhone: z.string().nullable().optional(),
    currency: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  }).default({}),
});

export const aiProposalPayloadSchema = z.object({
  summary: z.string().min(1, "Summary is required"),
  explanation: z.string().optional(),
  changes: z.array(aiProposalChangeSchema).min(1, "At least one change required in proposal"),
});

export type AiProposalChange = z.infer<typeof aiProposalChangeSchema>;
export type AiProposalPayload = z.infer<typeof aiProposalPayloadSchema>;

export interface AiProposalDTO {
  id: string;
  tripId: string;
  conversationId: string;
  messageId: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "PARTIAL";
  summary: string;
  payload: AiProposalPayload;
  createdAt: string;
  resolvedAt: string | null;
}
