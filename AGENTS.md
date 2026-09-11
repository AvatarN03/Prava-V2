<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Prava AI V2 — Agent & LLM Development Guide

Welcome to the **Prava AI V2** codebase. This document serves as the primary technical and architectural reference for AI assistants, LLMs, and software engineers modifying or extending this application.

Always consult this document alongside `memory.md` (which logs the active task state and all 44+ completed implementation phases) and the foundational specifications in `docs/`.

---

## 1. Executive Summary & Core Philosophy

### Product Vision: "Workspace First, AI Second"
Prava AI is an **AI-augmented travel workspace**. It is the single system of record where a traveler plans, organizes, and manages every aspect of their trips — itineraries, accommodations, expenses, notes, checklists, and reference links — alongside live contextual tools (weather forecasts, currency conversion, maps, country guides, emergency contacts, language essentials) and a community discovery feed.

- **Workspace First**: The primary value lies in structured, persistent, user-owned data. Every core workflow can be completed 100% manually, with zero AI involvement.
- **AI Second**: AI is an assistive accelerant, not a gatekeeper. It suggests, drafts, summarizes, and answers context-specific questions on top of persisted workspace data.
- **"The Application Remembers, The LLM Does Not"**: The LLM is stateless. Continuity, context assembly, and conversation histories are persisted in PostgreSQL via Prisma.
- **Design Philosophy**: Prava AI is modeled after high-efficiency productivity tools (**Notion, Linear, GitHub, Stripe Dashboard**), explicitly rejecting "AI slop", chat-first chrome, floating conversational bubbles, neumorphism, heavy gradients, or glowing neon animations.

---

## 2. Technology Stack & Environment

| Layer | Technology | Key Details & Version |
|---|---|---|
| **Framework** | Next.js 16.3.x (App Router) | Turbopack dev/build, Server Components & Server Actions, `proxy.ts` (Next 16 proxy pattern) |
| **Runtime & UI** | React 19.2.x | Modern React hooks, Server Actions, Suspense boundaries |
| **Language** | TypeScript 5.x | Strict mode, explicit schemas, typed server actions |
| **Package Manager** | **`npm`** | **Strict Rule**: Always use `npm` (retaining `package-lock.json`). Do NOT use `pnpm` or `yarn`. |
| **Styling** | Tailwind CSS v4 | CSS-first configuration via `@tailwindcss/postcss`, theme variables defined in `app/globals.css` |
| **Component Library** | shadcn/ui & Radix Primitives | Radix Dialog, Select, Tabs, Popover, Tooltip, Accordion, Dropdown Menu, Switch, Avatar, Separator |
| **Iconography** | Lucide React | Clean, minimalist icon set |
| **Database & ORM** | PostgreSQL (Supabase) + Prisma 7.x | `@prisma/client`, `@prisma/adapter-pg`, `pg`, managed via `prisma.config.ts` |
| **Authentication** | Supabase Auth SSR | `@supabase/ssr`, `@supabase/supabase-js`, server-side PKCE code exchange in `/auth/callback` |
| **Image Storage** | Supabase Storage | `prava-media` bucket, user-scoped paths (`${folder}/${userId}/${filename}`) |
| **AI Provider** | Google Gemini 2.5 Flash | `@google/genai`, server-side prompt and context assembler in `services/ai/` |
| **Offline Cache** | IndexedDB via `idb` | Client-side offline cache & synchronization in `lib/offline/` |
| **External APIs** | Unsplash, OpenWeather, Frankfurter FX, REST Countries v3.1, Leaflet/OSM | Real-time live data integrations with graceful fallbacks |

---

## 3. Project Scope & Complete Route Architecture

```
app/
├── page.tsx                           # Public Landing Page (dynamic auth state detection)
├── auth/
│   ├── page.tsx                       # Auth Hub: Email/Password & Google OAuth (tab=signin|signup)
│   └── callback/route.ts              # Server-side PKCE & OTP token exchange endpoint
├── (app)/                             # Protected Application Route Group
│   ├── layout.tsx                     # App Shell layout (Fixed Sidebar + Sticky TopBar)
│   ├── dashboard/page.tsx             # Overview: Cross-trip metrics, upcoming trips, urgent checklists
│   ├── trips/
│   │   ├── page.tsx                   # Trips list & management (filter by status)
│   │   └── [tripId]/                  # Trip Workspace Root (Persistent Header + Tab Router)
│   │       ├── page.tsx               # Tab 1: Overview
│   │       ├── itinerary/page.tsx     # Tab 2: Daily Itinerary
│   │       ├── accommodation/page.tsx # Tab 3: Stays & Bookings
│   │       ├── expenses/page.tsx      # Tab 4: Expense Tracker & Category Breakdowns
│   │       ├── notes/page.tsx         # Tab 5: Notes & Markdown Docs
│   │       ├── checklist/page.tsx     # Tab 6: Packing & Todo Checklist
│   │       └── links/page.tsx         # Tab 7: Reference Links & Bookmarks
│   ├── travel-essentials/page.tsx     # Travel Essentials: Weather, FX, Country Guide, Maps, Emergency, Language
│   ├── community/page.tsx             # Community Hub: Curated Itineraries, 1-Click Clone, Discussion Forum
│   ├── stories/                       # Travel Stories & Creator Guides (Internal Views)
│   │   ├── page.tsx                   # Stories Discovery Feed
│   │   ├── new/page.tsx               # Markdown Story Creator
│   │   └── manage/page.tsx            # Personal Story Manager
│   ├── profile/page.tsx               # Account & Settings Hub: Overview, General, AI Usage, Security
│   └── pricing/page.tsx               # Subscription & Quotas: Free vs Pro tier meters & billing history
├── stories/[slug]/                    # Public Travel Story Reader
│   ├── page.tsx                       # Public Reader with linked trip 1-click clone
│   └── edit/page.tsx                  # Story Editor (Protected)
└── u/[username]/page.tsx              # Public Creator Profile (Published itineraries & stories showcase)
```

---

## 4. Codebase Organization & Feature-First Directory Structure

The repository enforces a **feature-first** modular architecture:

```
├── app/                  # Next.js App Router routes, layouts, and route handlers ONLY
├── components/           # Shared, feature-agnostic UI primitives
│   ├── app-shell/        # Sidebar, TopBar, NavConfig, ConfirmDeleteDialog
│   ├── storage/          # AvatarUpload, CoverImage, ImageUpload
│   └── ui/               # shadcn/ui primitives (button, card, dialog, select, tabs, etc.)
├── features/             # Business domains (self-contained components, actions, schemas, types)
│   ├── blog/             # Travel Stories, Markdown renderer, Story editor
│   ├── community/        # Public itineraries, 1-click cloner, forum feeds & upvoting
│   ├── dashboard/        # Cross-trip summary aggregations, metrics queries
│   ├── pricing/          # Tier quotas (Free: 10 trips/30 credits; Pro: 25 trips/150 credits), usage history
│   ├── profile/          # Account hub, username generator, reserved usernames, general preferences
│   ├── storage/          # Supabase storage server actions & upload handlers
│   ├── travel-essentials/# Weather, Currency (FX), Country Guide, Leaflet Maps, Emergency, Language
│   ├── trip-workspace/   # 7 workspace sub-modules + Workspace AI assistant with proposal mutation engine
│   └── trips/            # Trips CRUD, Unsplash Tour-Vibe cover picker, shadcn DatePickers
├── lib/                  # Shared infrastructure clients & utilities
│   ├── ai/               # Gemini client initialization
│   ├── auth/             # syncUserProfile helper (safe profile creation & email collision prevention)
│   ├── db.ts             # Prisma ORM singleton client with pg adapter
│   ├── offline/          # IndexedDB offline store and synchronization engine
│   ├── storage/          # Supabase Storage client & bucket resolution
│   ├── supabase/         # SSR Supabase client (client.ts, server.ts, middleware.ts)
│   └── utils/            # Client-side image resizing (HTML5 Canvas), string helpers, cn()
├── prisma/               # schema.prisma & PostgreSQL migration history
├── services/             # Cross-cutting server-side integrations (context-builder.ts, unsplash.ts)
└── memory.md             # Continuous project memory and execution log (Always read first!)
```

---

## 5. Database & Prisma Conventions

All database operations run through **Prisma 7** against Supabase PostgreSQL:
- **Client Singleton**: Always import `db` from `@/lib/db`.
- **Primary Keys**: UUIDs are standard (`@id @default(uuid()) @db.Uuid` or mapped to Supabase auth user UUIDs).
- **Snake Case Mapping**: PostgreSQL column names use snake_case via `@map("column_name")`, while Prisma models use camelCase.
- **Relational Integrity**: Use `onDelete: Cascade` where child records (itinerary, expenses, checklist, notes) belong to a `Trip` or `Profile`.
- **Safe Profile Sync (`syncUserProfile`)**:
  When authenticating users, **NEVER** perform a raw `db.profile.upsert({ where: { id: user.id } })`. If a user switches auth providers or re-registers, Supabase changes the UUID while the email remains the same, throwing a `profiles_email_key` unique constraint violation.
  **Always use `syncUserProfile(user)`** from `@/lib/auth/sync-profile.ts`, which safely checks by ID, resolves stale email collisions, relinks foreign keys, and generates an immutable `@username`.

### Running Prisma Commands
- Schema pushes: `npx prisma db push`
- Client generation: `npx prisma generate`
- Migrations: `npx prisma migrate dev --name <migration_name>`

---

## 6. Authentication & Security Architecture

1. **Supabase SSR**: Session verification runs via `@supabase/ssr` in Server Components and Server Actions.
2. **Proxy / Middleware (`proxy.ts` -> `lib/supabase/middleware.ts`)**:
   - Intercepts incoming requests containing `code` or `token_hash` landing on non-callback routes and forwards them to `/auth/callback`.
   - Protects private routes (`/dashboard`, `/trips`, `/travel-essentials`, `/community`, `/profile`, `/settings`, `/stories/new`, `/stories/manage`).
   - Redirects logged-in users away from `/auth` to `/dashboard`.
3. **Server-Side PKCE Callback (`app/auth/callback/route.ts`)**:
   - Exchanges auth codes (`exchangeCodeForSession`) and OTP hashes (`verifyOtp`) for session cookies directly on the server, preventing client-side auth race conditions.
4. **Ownership Scoping (CRITICAL)**:
   - **Never trust client-supplied user IDs.** Always extract the active user via `getAuthenticatedUser()` or `supabase.auth.getUser()`.
   - Before any Trip Workspace read or mutation, call `verifyTripOwnership(tripId)` (`features/trip-workspace/common/auth-check.ts`).
   - Public entities (`isPublic: true`) are read-only for non-owners.

---

## 7. AI Subsystem Architecture (Gemini 2.5 Flash)

AI in Prava AI operates under strict structured contracts:
1. **Model**: Google Gemini 2.5 Flash via `@google/genai` (`lib/ai/gemini-client.ts`).
2. **Context Assembly (`services/ai/context-builder.ts`)**:
   - Dynamically pulls trip details, itinerary items with `[ID: uuid]`, accommodations, expenses, and notes.
   - Operates in two distinct modes:
     - **Conversational Mode**: Direct answers, travel advice, packing tips, or destination questions.
     - **Structured Action Mode (`json:proposal`)**: Output structured JSON conforming to `aiProposalPayloadSchema` for adding, modifying, or removing itinerary items or accommodations.
3. **Transactional Proposal Execution (`AiProposal`)**:
   - Proposals are stored in the database with status: `PENDING`, `ACCEPTED`, `REJECTED`, `PARTIAL`.
   - The user reviews changes visually inside `AiProposalCard` with field diffs and item checkboxes.
   - On "Accept", `acceptAiProposal` executes an atomic Prisma `$transaction` that creates, updates, or deletes real workspace entities and marks the proposal `ACCEPTED`.
4. **Quota Governance**:
   - **Free Explorer**: 10 trips limit, 30 AI credits per month.
   - **Pro Wanderer**: 25 trips limit, 150 AI credits per month.
   - AI panel displays remaining monthly credits and opens `UpgradeDialog` when depleted.

---

## 8. Design System & UI Standards

- **Palette**: Prava Cerulean Blue (`#2D9BF0` primary, `#F0F8FF` accent, `#1E293B` slate text, `#F8FAFC` slate background).
- **Component Primitives**: Always use official `shadcn/ui` components located in `@/components/ui/` (`Button`, `Card`, `Dialog`, `Select`, `Tabs`, `Input`, `Label`, `Textarea`, `Popover`, `Calendar`, `Switch`, `Accordion`, `Avatar`, `Separator`, `Skeleton`).
- **Interactive Affordance**: All buttons, links, and clickable surfaces must explicitly render `cursor: pointer`.
- **Styling Philosophy**:
  - Crisp, data-dense, content-first cards (`rounded-sm` or `rounded-md` with `border-border bg-card`).
  - No decorative gradients across cards.
  - No glassmorphism, blur gimmicks, or neumorphic drop-shadows.
  - Generous whitespace, clear typographical hierarchy, and calm contrast.

---

## 9. Key Integrations & Third-Party APIs

1. **Unsplash Tour-Vibe Imagery (`services/unsplash.ts`)**:
   - Server-side search API with destination and travel aesthetic query variations.
   - Debounced on blur in `CreateTripDialog` with a 6-image interactive picker and high-res fallbacks.
2. **OpenWeather API (`features/travel-essentials/weather/`)**:
   - 5-day / 3-hour forecast, UV index, atmospheric matrix, and city auto-suggestions.
3. **Frankfurter FX API (`features/travel-essentials/currency/`)**:
   - Open European Central Bank exchange rates, interactive SVG historical trend charts, and personal currency watchlists.
4. **REST Countries v3.1 (`features/travel-essentials/country-guide/`)**:
   - Live country profiles, languages, currencies, flags, and emergency numbers.
5. **Supabase Storage & Canvas Downscaling (`lib/utils/image-resize.ts`)**:
   - User avatars are client-side downscaled to 512x512 square crop WebP/JPEG via HTML5 Canvas before upload to minimize bandwidth and storage.

---

## 10. Developer & Agent Rules of Engagement

1. **Always Consult `memory.md` First**: Before implementing any feature or modification, inspect `memory.md` to understand past decisions and active tasks. After completing significant work, document your changes in `memory.md`.
2. **Preserve Next.js Agent Block**: Never delete the `<!-- BEGIN:nextjs-agent-rules -->` block at the top of this file.
3. **Server-First by Default**: Use Server Components for all data fetching. Use Client Components (`"use client"`) only when local state, browser APIs, or event handlers are strictly necessary.
4. **Colocate Server Actions**: Place Server Actions inside `features/<module>/actions.ts`. Validate all payloads using Zod schemas (`features/<module>/schema.ts`).
5. **No AI Gating**: Ensure that any feature touching trips, itinerary, expenses, notes, checklists, or essentials works seamlessly through manual user input, regardless of AI availability.
6. **Strict Verification**: After code modifications, always verify compilation by running:
   ```bash
   npm run build
   ```
   Ensure zero TypeScript errors and zero unhandled lint regressions.
