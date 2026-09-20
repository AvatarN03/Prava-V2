import { NextRequest, NextResponse } from "next/server";
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/polar
 *
 * Secure webhook receiver for Polar subscription lifecycle events.
 * Cryptographically verifies signatures using Standard Webhooks spec and POLAR_WEBHOOK_SECRET.
 * Enforces idempotency via WebhookEvent records in PostgreSQL.
 */
export async function POST(req: NextRequest) {
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[Polar Webhook] Missing POLAR_WEBHOOK_SECRET environment variable");
    return NextResponse.json(
      { error: "Webhook secret is unconfigured on the server" },
      { status: 500 }
    );
  }

  // 1. Extract raw request body and headers for verification
  const rawBody = await req.text();
  const headers = Object.fromEntries(req.headers.entries());

  let event: any;

  // 2. Verify signature before parsing or trusting any payload
  try {
    event = validateEvent(rawBody, headers, webhookSecret);
  } catch (err: unknown) {
    if (err instanceof WebhookVerificationError) {
      console.warn("[Polar Webhook] Signature verification failed:", err.message);
      return new Response("Invalid webhook signature", { status: 403 });
    }
    console.error("[Polar Webhook] Unexpected verification error:", err);
    return new Response("Signature verification error", { status: 400 });
  }

  // 3. Extract unique event identifier (Standard Webhook header or payload event ID)
  const eventId =
    (headers["webhook-id"] as string) ||
    event.id ||
    `${event.type}_${event.data?.id}_${event.timestamp || Date.now()}`;

  const client = db as any;

  // 4. Enforce idempotency: skip processing if already handled
  try {
    const existingEvent = await client.webhookEvent.findUnique({
      where: { id: eventId },
    });

    if (existingEvent) {
      console.info(`[Polar Webhook] Event ${eventId} already processed. Skipping duplicate.`);
      return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
    }
  } catch (err) {
    // If webhookEvent table is not yet migrated, continue with defensive fallback
    console.warn("[Polar Webhook] Idempotency table check skipped:", err);
  }

  console.info(`[Polar Webhook] Processing event type: ${event.type} (ID: ${eventId})`);

  // 5. Handle Subscription Lifecycle Events
  const subscriptionEvents = [
    "subscription.created",
    "subscription.updated",
    "subscription.active",
    "subscription.canceled",
    "subscription.revoked",
    "subscription.past_due",
    "subscription.paused",
    "subscription.resumed",
    "subscription.cycled",
  ];

  if (subscriptionEvents.includes(event.type)) {
    const subData = event.data;
    const polarSubscriptionId = subData.id;
    const polarCustomerId = subData.customer_id;
    const polarProductId = subData.product_id;
    const status = (subData.status || "active").toLowerCase();
    const currentPeriodStart = subData.current_period_start
      ? new Date(subData.current_period_start)
      : null;
    const currentPeriodEnd = subData.current_period_end
      ? new Date(subData.current_period_end)
      : null;
    const cancelAtPeriodEnd = Boolean(subData.cancel_at_period_end);

    // Resolve internal Prava userId
    let userId: string | null =
      subData.customer?.external_id ||
      subData.customer?.external_customer_id ||
      subData.metadata?.userId ||
      subData.customer_metadata?.userId ||
      null;

    // Fallback: lookup existing subscription record
    if (!userId) {
      try {
        const existingSub = await client.subscription.findUnique({
          where: { polarSubscriptionId },
          select: { userId: true },
        });
        if (existingSub?.userId) {
          userId = existingSub.userId;
        }
      } catch {
        // Continue fallback search
      }
    }

    // Fallback: match by customer email
    if (!userId && subData.customer?.email) {
      try {
        const profile = await db.profile.findUnique({
          where: { email: subData.customer.email },
          select: { id: true },
        });
        if (profile?.id) {
          userId = profile.id;
        }
      } catch {
        // Fallback search ended
      }
    }

    if (!userId) {
      console.warn(
        `[Polar Webhook] Could not resolve Prava userId for subscription ${polarSubscriptionId}. Customer email: ${subData.customer?.email}`
      );
      return NextResponse.json(
        { received: true, warning: "User not resolved" },
        { status: 200 }
      );
    }

    // 6. Upsert subscription state atomically in PostgreSQL
    try {
      await client.subscription.upsert({
        where: { polarSubscriptionId },
        create: {
          userId,
          polarSubscriptionId,
          polarCustomerId,
          polarProductId,
          status,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd,
        },
        update: {
          status,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd,
          polarCustomerId,
          polarProductId,
        },
      });

      console.info(
        `[Polar Webhook] Successfully synchronized subscription ${polarSubscriptionId} (Status: ${status}) for user ${userId}`
      );
    } catch (upsertError) {
      console.error("[Polar Webhook] Failed to upsert subscription:", upsertError);
      return NextResponse.json(
        { error: "Database synchronization failed" },
        { status: 500 }
      );
    }
  }

  // 7. Persist processed event ID to guarantee idempotency on retries
  try {
    await client.webhookEvent.create({
      data: {
        id: eventId,
        eventType: event.type,
      },
    });
  } catch (err) {
    // Non-critical if event ID already exists or table is migrating
    console.warn("[Polar Webhook] Could not persist webhookEvent idempotency key:", err);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
