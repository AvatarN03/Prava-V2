import { db } from "@/lib/db";

export interface TripContextResult {
  systemInstruction: string;
  tripTitle: string;
  destination: string | null;
}

/**
 * Builds fresh trip-scoped context from PostgreSQL.
 * Implements "the application remembers, the LLM does not".
 */
export async function buildTripContext(
  tripId: string,
  profileId: string
): Promise<TripContextResult | null> {
  const trip = await db.trip.findFirst({
    where: {
      id: tripId,
      profileId,
    },
    include: {
      itinerary: {
        orderBy: [{ dayNumber: "asc" }, { order: "asc" }, { createdAt: "asc" }],
      },
      accommodations: {
        orderBy: [{ checkIn: "asc" }, { createdAt: "asc" }],
      },
      expenses: {
        orderBy: [{ date: "desc" }],
      },
      notes: {
        orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
      },
      checklistItems: {
        orderBy: [{ isCompleted: "asc" }, { order: "asc" }],
      },
      links: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!trip) {
    return null;
  }

  const formatDate = (d?: Date | null) => (d ? new Date(d).toISOString().split("T")[0] : "Not set");

  const totalSpent = trip.expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const pendingTasks = trip.checklistItems.filter((i) => !i.isCompleted);
  const completedTasks = trip.checklistItems.filter((i) => i.isCompleted);

  const itinerarySummary =
    trip.itinerary.length > 0
      ? trip.itinerary
          .map(
            (item) =>
              `- [ID: ${item.id}] Day ${item.dayNumber || 1}${item.time ? ` (${item.time})` : ""}: ${item.title}${
                item.location ? ` @ ${item.location}` : ""
              } [${item.category}]${item.cost ? ` (Est. cost: $${item.cost})` : ""}${
                item.description ? ` - ${item.description}` : ""
              }`
          )
          .join("\n")
      : "No activities scheduled yet.";

  const accommodationsSummary =
    trip.accommodations.length > 0
      ? trip.accommodations
          .map(
            (acc) =>
              `- [ID: ${acc.id}] ${acc.name} (${acc.type || "Hotel"})${acc.address ? ` at ${acc.address}` : ""}, Check-in: ${formatDate(
                acc.checkIn
              )}, Check-out: ${formatDate(acc.checkOut)}${
                acc.confirmationCode ? `, Confirmation: #${acc.confirmationCode}` : ""
              }${acc.cost ? `, Cost: $${acc.cost} ${acc.currency}` : ""}`
          )
          .join("\n")
      : "No lodging added yet.";

  const expensesSummary =
    trip.expenses.length > 0
      ? `Total Spent: $${totalSpent.toFixed(2)}\n` +
        trip.expenses
          .slice(0, 10)
          .map(
            (exp) =>
              `- ${exp.title}: $${exp.amount.toFixed(2)} ${exp.currency} [${exp.category}] on ${formatDate(exp.date)}`
          )
          .join("\n")
      : "No expenses recorded yet.";

  const notesSummary =
    trip.notes.length > 0
      ? trip.notes
          .map((n) => `- [${n.isPinned ? "PINNED " : ""}${n.category || "Note"}] ${n.title}: ${n.content}`)
          .join("\n")
      : "No notes saved.";

  const checklistSummary =
    trip.checklistItems.length > 0
      ? `Pending (${pendingTasks.length}):\n` +
        (pendingTasks.map((t) => `  [ ] ${t.title} (${t.category})`).join("\n") || "  None") +
        `\nCompleted (${completedTasks.length}):\n` +
        (completedTasks.map((t) => `  [x] ${t.title}`).join("\n") || "  None")
      : "No checklist tasks created.";

  const linksSummary =
    trip.links.length > 0
      ? trip.links.map((l) => `- ${l.title} (${l.category}): ${l.url}`).join("\n")
      : "No bookmarks saved.";

  const systemInstruction = `You are Prava AI, an intelligent, calm, and structured Travel Assistant embedded directly into the user's personal travel workspace.

=== ACTIVE TRIP CONTEXT (SOURCE OF TRUTH) ===
Trip Title: "${trip.title}"
Destination: ${trip.destination || "Not specified"}
Dates: ${formatDate(trip.startDate)} to ${formatDate(trip.endDate)}
Trip Status: ${trip.status}
Description/Goal: ${trip.description || "None provided"}

=== SCHEDULED ITINERARY (WITH SYSTEM IDs) ===
${itinerarySummary}

=== ACCOMMODATIONS & LODGING (WITH SYSTEM IDs) ===
${accommodationsSummary}

=== EXPENSES & BUDGET ===
${expensesSummary}

=== USER NOTES & MEMOS ===
${notesSummary}

=== PREPARATION CHECKLIST ===
${checklistSummary}

=== SAVED BOOKMARKS & LINKS ===
${linksSummary}

=== OPERATIONAL MODES & GUIDELINES ===
1. CONVERSATIONAL MODE:
   - For travel questions, general advice, explanations, packing tips, or weather queries, provide structured, concise answers in markdown without proposal blocks.

2. WORKSPACE ACTION PROPOSAL MODE:
   - When the user asks to modify their trip (e.g. "Add a day in Kyoto", "Add breakfast at Cafe de Flore on Day 2", "Move temple visit to morning", "Replace my hotel", "Remove the museum on Day 3"), you must provide a helpful conversational summary AND append a structured proposal block in the following exact format:

\`\`\`json:proposal
{
  "summary": "Short 1-line description of proposed changes",
  "changes": [
    {
      "id": "c1",
      "domain": "itinerary",
      "action": "create",
      "data": {
        "title": "Visit Fushimi Inari Shrine",
        "dayNumber": 1,
        "time": "08:30",
        "location": "Kyoto",
        "category": "Sightseeing",
        "cost": 0,
        "description": "Early morning hike through the thousands of vermilion torii gates"
      }
    },
    {
      "id": "c2",
      "domain": "itinerary",
      "action": "update",
      "targetId": "EXISTING_ITEM_UUID_FROM_CONTEXT",
      "data": {
        "title": "Updated Item Title",
        "time": "14:00"
      }
    },
    {
      "id": "c3",
      "domain": "itinerary",
      "action": "delete",
      "targetId": "EXISTING_ITEM_UUID_FROM_CONTEXT",
      "data": {}
    },
    {
      "id": "c4",
      "domain": "accommodation",
      "action": "create",
      "data": {
        "name": "Ace Hotel Kyoto",
        "type": "Hotel",
        "address": "245-2 Kurumayacho, Nakagyo Ward, Kyoto",
        "checkIn": "2026-10-15",
        "checkOut": "2026-10-18",
        "cost": 650,
        "currency": "USD"
      }
    }
  ]
}
\`\`\`

3. CRITICAL PROPOSAL RULES:
   - For 'update' and 'delete' actions, you MUST use the exact existing [ID: <uuid>] from the context as 'targetId'.
   - For 'create' actions, 'targetId' is omitted.
   - For dates in accommodations, use 'YYYY-MM-DD' format.
   - Valid domains are 'itinerary' and 'accommodation'.
   - The user will review your proposal in the UI and click 'Accept' before any database change occurs.`;

  return {
    systemInstruction,
    tripTitle: trip.title,
    destination: trip.destination,
  };
}
