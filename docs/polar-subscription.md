# Polar Sandbox Subscription Billing Guide — Prava AI V2

This document details the architecture, setup, testing workflows, and production deployment checklist for Polar recurring subscriptions in the Prava AI Workspace.

---

## 1. Overview & Architecture

Prava integrates with **Polar** as its Merchant of Record (MoR) for subscription billing.
Key architectural principles:
- **Sandbox-First**: Tested and verified in Polar Sandbox (`POLAR_SERVER=sandbox`).
- **Server Authority**: Entitlement to Pro privileges (`hasActiveProSubscription(userId)`) is determined exclusively by PostgreSQL database records (`Subscription` model), never by client parameters or success redirect URLs.
- **Cryptographic Verification**: Webhooks are verified with `@polar-sh/sdk/webhooks` (`validateEvent`) before processing.
- **Idempotency**: Webhook deliveries are deduplicated via the `WebhookEvent` table to prevent duplicate subscriptions or state corruption.
- **Customer Portal**: Customers manage and cancel their subscriptions directly in Polar's hosted Customer Portal via `polar.customerSessions.create`.

---

## 2. Required Environment Variables

Add the following variables to `.env` (server-side only, never prefix secrets with `NEXT_PUBLIC_`):

```bash
# ------------------------------------------------------------------------------
# Polar Subscription Billing (Sandbox Environment)
# ------------------------------------------------------------------------------
# 1. Polar Sandbox Organization Access Token (OAT)
POLAR_ACCESS_TOKEN=polar_oat_your_sandbox_access_token

# 2. Polar Recurring Product ID for "Prava Pro"
POLAR_PRODUCT_ID=your_polar_product_id

# 3. Polar Webhook Secret for signature validation
POLAR_WEBHOOK_SECRET=polar_whsec_your_webhook_secret

# 4. Polar Server Environment ("sandbox" or "production")
POLAR_SERVER=sandbox

# 5. Application URL for redirects
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 3. Configuring the Polar Sandbox Product

1. Log into your [Polar Sandbox Dashboard](https://sandbox.polar.sh).
2. Go to **Products** > **New Product**.
3. Set the product details:
   - **Name**: `Prava Pro` (or `Pro Wanderer`)
   - **Description**: `25 Workspace trips, 150 AI credits/mo, deep workspace mutations, and creator perks.`
   - **Pricing Model**: `Recurring / Subscription`
   - **Billing Interval**: Monthly or Annual (e.g. ₹200/mo or $5/mo)
4. Save the product and copy its **Product ID** (e.g. `9a4c80fd-...`).
5. Set `POLAR_PRODUCT_ID=<your_product_id>` in `.env`.

---

## 4. Configuring Webhooks for Local & Remote Testing

### Local Development (Using Polar CLI)
Polar provides a CLI tool that securely forwards webhooks to your local dev server:

1. Install Polar CLI:
   ```bash
   npm install -g @polar-sh/cli
   # or binary install: curl -fsSL https://polar.sh/install.sh | sh
   ```
2. Log in to Polar Sandbox:
   ```bash
   polar login --sandbox
   ```
3. Start the webhook tunnel:
   ```bash
   polar listen --sandbox http://localhost:3000/api/webhooks/polar
   ```
4. The CLI will output a webhook secret (e.g., `polar_whsec_...`). Copy this value to your `.env` as `POLAR_WEBHOOK_SECRET`.

### Staging / Production Deployment (e.g., Vercel)
1. Go to **Settings** > **Webhooks** in the Polar Dashboard.
2. Click **Add Endpoint**:
   - **URL**: `https://your-domain.com/api/webhooks/polar`
   - **Events to subscribe**:
     - `subscription.created`
     - `subscription.updated`
     - `subscription.active`
     - `subscription.canceled`
     - `subscription.revoked`
     - `subscription.past_due`
     - `subscription.paused`
     - `subscription.resumed`
     - `subscription.cycled`
3. Copy the endpoint's **Signing Secret** into `POLAR_WEBHOOK_SECRET`.

---

## 5. How to Test the Checkout Flow Locally

1. Start the Prava dev server:
   ```bash
   npm run dev
   ```
2. Ensure you are signed in, then navigate to `/subscription` (or `/pricing`).
3. Click **Upgrade with Polar**.
4. You will be redirected to the Polar Sandbox checkout page:
   - Your email and Prava user ID are automatically attached.
   - Use any test card provided in Polar Sandbox documentation.
5. Upon payment completion, you are redirected back to:
   ```
   http://localhost:3000/subscription?checkout=success&checkout_id=...
   ```
6. Observe the confirmation banner:
   - Prava does **not** grant Pro privileges merely because of `?checkout=success`.
   - Once the Polar webhook is received and verified by `/api/webhooks/polar`, the database status updates to `active`.
   - Refreshing the page (or clicking "Refresh Status") displays **Pro Active** with quota limits expanded (25 trips, 150 AI credits).

---

## 6. How to Test Subscription Management & Cancellation

1. While subscribed as a Pro user, navigate to `/subscription`.
2. Click **Manage Subscription**.
3. Prava generates a short-lived authenticated customer portal session via `polar.customerSessions.create` and redirects you to the Polar Customer Portal.
4. From the portal, you can:
   - Cancel subscription (at period end or immediately)
   - Update payment methods
   - View invoices and receipts
5. When a subscription is canceled in the portal:
   - Polar dispatches a `subscription.updated` or `subscription.canceled` event.
   - Prava updates `cancelAtPeriodEnd: true` or `status: 'canceled'`.
   - If canceled at period end, the user retains Pro access until `currentPeriodEnd`.

---

## 7. Production Migration Checklist

When switching from Polar Sandbox to live production payments:

1. [ ] Create your live product in [Polar Production Dashboard](https://polar.sh).
2. [ ] Generate a live Organization Access Token in production Settings.
3. [ ] Register the live webhook endpoint (`https://<production-domain>/api/webhooks/polar`).
4. [ ] In production hosting (e.g. Vercel environment variables):
   - Change `POLAR_SERVER=production`
   - Set `POLAR_ACCESS_TOKEN=<live_token>`
   - Set `POLAR_PRODUCT_ID=<live_product_id>`
   - Set `POLAR_WEBHOOK_SECRET=<live_webhook_secret>`
   - Ensure `NEXT_PUBLIC_APP_URL=https://<production-domain>`
5. [ ] Perform a live test transaction with a small denomination or promo code.
