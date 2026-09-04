# Prava AI V2 Implementation Roadmap

> **Access note before you read this:** I was not able to open `docs/01-product-vision.md`, `docs/02-design-system.md`, or `docs/03-system-architecture.md` directly — no repository or files were uploaded to this session, only the task brief itself. The brief you provided is unusually thorough (it restates the architecture, module list, AI philosophy, and design intent in detail), so I've treated **that brief as the working source of truth** for this roadmap. Wherever the actual `.md` files likely contain more granular detail than the brief (exact schema fields, exact color/spacing tokens, Community module scope, etc.), I've flagged it explicitly as an **Open Decision** rather than inventing it. If you share the three docs, I can tighten Sections 3–6 against their exact wording in a follow-up pass.

---

## 1. Current State Assessment

**Confirmed from the provided `package.json` and tree:**

- Next.js `16.3.0`, React `19.2.8` / `react-dom 19.2.8` — App Router (an `app/` directory already exists).
- TypeScript `5.x`, `@types/node`, `@types/react`, `@types/react-dom` present — project is TS-first already.
- Tailwind CSS `4.x` via `@tailwindcss/postcss` — this is the CSS-first Tailwind v4 configuration model, **not** the legacy `tailwind.config.js` JS model. This matters for Phase 1: shadcn/ui's CLI and docs must be treated as Tailwind-v4-aware, and theme tokens will live in CSS (`@theme` blocks in `globals.css`), not a JS config file.
- ESLint `9.x` with `eslint.config.mjs` — flat config, not `.eslintrc`.
- `package-lock.json` exists → the project was initialized with **npm**, not pnpm.
- No UI library, ORM, auth client, query library, state library, validation library, image library, map library, or AI SDK installed yet. This is a genuinely blank slate above the Next.js/React/Tailwind/ESLint baseline.
- No test framework installed yet.
- No `.env` / `.env.example` present in the described tree.
- `AGENTS.md` and `CLAUDE.md` contain Next.js-generated default agent guidance. Per your instruction, these are preserved as-is and only **appended to**, never overwritten, as the roadmap introduces new conventions (folder structure, Server Action patterns, etc.).
- `docs/` exists with the three source-of-truth files — their exact contents are the one piece of "current state" I could not verify directly in this session (see access note above).

**Discrepancy to resolve, not silently fix:**

- The architecture document specifies **pnpm**. The repository currently contains **`package-lock.json`**, meaning it was bootstrapped with npm (or at least npm has been run once). These two facts conflict. See **Open Decision #1** and **Phase 0**.

**Next.js 16 / React 19 implication:** Because this is Next.js 16 (a fairly new major version relative to most training data and public tutorials) and `AGENTS.md`/`CLAUDE.md` already instruct agents to consult the installed Next.js docs before writing code, every phase below that touches routing, caching, Server Actions, or streaming should begin with a quick check of the **installed** Next.js 16 docs rather than assumed Next.js 13/14 patterns (e.g. caching defaults, `fetch` behavior, and async `params`/`searchParams` have changed across versions). I call this out again explicitly in the phases where it matters most (App Shell, Data layer, AI streaming).

---

## 2. Approved Decisions

These come directly from your brief and are treated as locked unless you say otherwise:

- **Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui, Server Actions, Route Handlers, PostgreSQL via Supabase, Prisma, Supabase Auth, TanStack Query, Zustand, React Context, Zod, Cloudinary, React Leaflet/OpenStreetMap, Gemini 2.5 Flash (OpenRouter deferred), Vercel, pnpm.
- **Principles:** feature-first, modular, server-first, separation of concerns, context-aware AI, single responsibility, reusable components, maintainability, progressive enhancement, free-tier optimization.
- **Explicitly excluded, permanently unless revisited by you:** microservices, CQRS, event sourcing, a separate backend service, unnecessary infrastructure, premature abstraction.
- **Modules:** Dashboard, Trips, Trip Workspace (Overview, Itinerary, Accommodation, Expenses, Notes, Checklist, Links, Trip Workspace AI), Community, Travel Essentials (Weather, Currency, Maps, Country Guide, Emergency, Language Essentials), Profile (Overview, Preferences, Activity, Insights), Settings.
- **AI is cross-cutting**, not a standalone module — it lives inside Dashboard and Trip Workspace only.
- **AI philosophy:** "the application remembers, the LLM does not." Durable data lives in Postgres; prompts are constructed from application-owned context; conversation history (if retained) is stored by the app, not relied on from the provider; AI must never gate a non-AI workflow.
- **Design direction:** professional, minimal, calm, structured, readable, focused, intentional, content-first, whitespace-driven — closer to Notion/Linear/GitHub/Raycast/Stripe Dashboard, explicitly not ChatGPT-style chat-first, no gradients, no glassmorphism, no decorative animation, no bubble UI. Lucide icons. Desktop-first but responsive. Accessibility is a default, not a phase.

---

## 3. Open Decisions / TODOs

These are things the brief doesn't fully pin down, or that only the actual doc files can resolve. Each has a recommended checkpoint rather than a guess.

| # | Open item | Why it's open | Resolve by |
|---|---|---|---|
| 1 | **Package manager: npm vs pnpm** | Architecture doc says pnpm; repo has `package-lock.json` | Phase 0, before any new dependency is installed |
| 2 | **Exact design tokens** (color scale, spacing scale, type scale, radius, elevation, dark mode y/n) | Brief gives qualitative direction only ("calm", "Notion-like"); `docs/02-design-system.md` likely has exact values I couldn't read | Phase 1, before shadcn/ui theming is finalized |
| 3 | **Workspace entity schema details** (Itinerary item shape, Expense categories/currency handling, Checklist item shape, Link metadata) | Brief names the tabs but not their data model; `docs/03` likely specifies this | Phase 4, before `schema.prisma` is finalized — treat any schema I sketch below as a **draft for review**, not a final decision |
| 4 | **User table strategy**: mirrored `public.profiles` table 1:1 with Supabase `auth.users`, vs. referencing `auth.users` directly from Prisma | Common Supabase+Prisma pattern is a mirrored profile table, but this is an architectural choice your docs may already make | Phase 4 |
| 5 | **Auth methods**: email/password only, magic link, OAuth providers? | Not specified in brief | Phase 3 |
| 6 | **Trip Workspace AI conversation persistence model**: per-trip single thread vs. multiple threads, retention/pruning policy | "Conversation history, when retained, belongs to the application" — the *when* and *how long* aren't specified | Before Phase 8 (AI infra) |
| 7 | **Dashboard AI scope**: brief says AI is used "within Dashboard and Trip Workspace" — what does Dashboard AI actually do? | Not detailed | Before Phase 8 |
| 8 | **Travel Essentials data providers** (weather API, currency/FX API, emergency-number source, country-guide content source) | Not named | Phase 9, per sub-module |
| 9 | **Community module scope** | Named only as a module, no data model or interaction model given | Dedicated scoping pass before Phase 10 — do not start building against a guess |
| 10 | **Settings module scope** | Not detailed beyond the name | Before Phase 12 |
| 11 | **Image upload flow**: client-direct-to-Cloudinary (unsigned/signed upload widget) vs. server-mediated upload | Not specified | Cloudinary integration step inside Phase 6 (Accommodation/Notes likely use images) |
| 12 | **Testing framework choice** (Vitest vs. Jest; Playwright vs. Cypress; none of these are installed yet) | Not specified | Phase 0 or Phase 4 at the latest, so tests can start accumulating early rather than being bolted on in Phase 13 |
| 13 | **Gemini SDK package name/version at implementation time** | AI SDK package names for Gemini have shifted (`@google/generative-ai` vs newer `@google/genai`); should be verified against current docs at the moment Phase 8 actually starts, not assumed now | Start of Phase 8 |

None of these block starting the roadmap — most don't need answers until their listed phase. Items 1 and 12 are the only two worth deciding early because they affect tooling from day one.

---

## 4. Dependency Strategy

The guiding rule: **install a dependency in the phase that first needs it, not before.** No "just in case" installs. This keeps `package.json` an honest reflection of what's actually implemented at any point, which matters for a solo dev auditing progress.

| Phase | New dependencies | Reason to introduce now |
|---|---|---|
| 0 — Baseline | none (or pnpm tooling if the package-manager decision goes that way) | Tooling alignment only |
| 1 — Design System | shadcn/ui CLI-managed packages (`class-variance-authority`, `clsx`, `tailwind-merge`, per-component Radix packages as shadcn adds them), `lucide-react` | UI primitives needed before any screen exists |
| 2 — App Shell | none expected | Pure composition of Phase 1 primitives |
| 3 — Auth | `@supabase/supabase-js`, `@supabase/ssr` | First phase that needs a real backend session |
| 4 — Data layer | `prisma`, `@prisma/client` | First phase that needs durable storage |
| 5 — Trips (first vertical slice) | `zod`; likely `react-hook-form` + `@hookform/resolvers` if forms go beyond trivial | First real mutation with user input |
| 6 — Workspace tabs | `@tanstack/react-query` (+ devtools), `zustand`; possibly `date-fns` (or similar) once itinerary/date logic appears | First screens needing client-side interactive/optimistic state |
| 7 — Dashboard | none expected | Server-side aggregation only |
| 8 — AI infra | Gemini SDK (verify exact package at implementation time — see Open Decision #13) | First AI feature |
| 9 — Travel Essentials | `react-leaflet`, `leaflet`, `@types/leaflet`; weather/FX API client or plain `fetch` | First mapping/external-data screens |
| 6 (Accommodation/Notes) or 9 | `next-cloudinary` or `cloudinary` server SDK | First image-upload screen |
| 0 or 4 (recommend early) | Vitest or chosen test runner, Testing Library, Playwright | Earlier is better than Phase 13 |
| Not in this roadmap | OpenRouter SDK | No concrete multi-provider need yet — see Section 8 |

---

## 5. Project Structure

Folders are introduced **when they have a first real occupant**, not upfront. Target shape, with rationale per folder:

- **`app/`** — routing only. Route segments, layouts, `page.tsx`, `loading.tsx`, `error.tsx`, and Route Handlers (`route.ts`) that genuinely need URL-addressable HTTP semantics (webhooks, streaming AI endpoint, image upload signing endpoint). Route files should be thin — they import from `features/`, not contain business logic themselves.
- **`components/`** — truly shared, feature-agnostic UI. This is where the shadcn/ui-generated primitives (`components/ui/*`) live, plus hand-built shared pieces used by ≥2 features (app shell/sidebar, empty-state component, page-header component). If a component is only ever used inside one feature, it belongs in that feature's folder, not here.
- **`features/`** — one folder per product module (`features/trips/`, `features/trip-workspace/`, `features/dashboard/`, `features/travel-essentials/`, `features/profile/`, `features/settings/`, `features/community/`), each internally holding its own `components/`, `actions.ts` (Server Actions), `queries.ts` or `data.ts` (read paths), `schema.ts` (Zod), `types.ts`. This is the feature-first core of the architecture — most day-to-day work happens here, not in `app/`.
- **`lib/`** — cross-cutting **infrastructure clients**, singletons, and framework glue: `lib/supabase/client.ts` + `lib/supabase/server.ts`, `lib/db.ts` (Prisma client singleton), `lib/cloudinary.ts`, `lib/ai/gemini-client.ts`. Anything here is "how we talk to an external system," not "what we do with the answer."
- **`services/`** — server-side **business-logic-bearing integrations** that sit above `lib/` clients: e.g. `services/ai/context-builder.ts` (assembles trip-scoped context from Prisma before calling the Gemini client), `services/weather/`, `services/currency/`. The distinction from `lib/`: `lib/` is a dumb client wrapper; `services/` contains the app-specific logic that uses that client. If this distinction ever feels forced for a given integration, it's fine to fold `services/` into the owning `features/` folder instead — don't force a top-level `services/` folder to exist before it has ≥2 genuinely cross-feature occupants.
- **`hooks/`** — only truly shared client hooks (e.g. `useMediaQuery`, `useDebouncedValue`). Feature-specific hooks (e.g. a TanStack Query hook for expenses) live inside that feature's folder.
- **`actions/`** — most Server Actions should be colocated inside their owning `features/<module>/actions.ts`. A top-level `actions/` folder is only justified if a mutation is genuinely shared across ≥2 unrelated features (rare). Don't create this folder speculatively.
- **`types/`** — genuinely global types only (e.g. a shared `Result<T>` type, shared enums that span features). Feature-specific types live with the feature.
- **`utils/`** — pure, stateless helper functions with no framework/infra dependency (formatters, string/date helpers not tied to a specific library choice).
- **`constants/`** — static config/enums used across features (supported currencies list, module route paths, nav config).
- **`prisma/`** — `schema.prisma`, `migrations/`, optional `seed.ts`. Introduced at Phase 4.
- **`public/`** — static assets, already exists.

**Rule of thumb for the whole tree:** if you can't name the first file that will live in a folder, don't create the folder yet.

---

## 6. Implementation Phases

Each phase is sized for a solo developer to execute (or delegate to a coding agent) as one controlled, reviewable unit of work.

### Phase 0 — Baseline Alignment & Tooling Decision

**Purpose:** Resolve the package-manager discrepancy and lock in a couple of early tooling choices before any feature code exists, so nothing has to be redone later.

**Prerequisites:** Repository as currently described.

**Changes:** A recorded decision (in `README.md` or `AGENTS.md`) on npm vs. pnpm — either migrate to pnpm (delete `node_modules` + `package-lock.json`, run `pnpm install`, commit `pnpm-lock.yaml`) or explicitly override the architecture doc's pnpm preference and note why. Add `.env.example` listing every env var this roadmap will eventually need (Supabase, Prisma `DATABASE_URL`/`DIRECT_URL`, Cloudinary, Gemini) with placeholder values only — this doubles as living documentation of what infrastructure will be needed. Decide the test framework (Open Decision #12) even if tests aren't written yet.

**Dependencies:** None, unless the pnpm migration path is chosen.

**Architecture:** Supports "free-tier optimization" and "maintainability" by preventing lockfile drift and undocumented env vars later.

**Validation:** `dev`/`build`/`lint` scripts run cleanly under the chosen package manager.

**Manual verification:** Developer runs the dev server, confirms Tailwind v4 output renders, confirms no console errors.

**Exit criteria:** Package manager decision is explicit and committed (not silently left ambiguous); `.env.example` exists; test framework named.

---

### Phase 1 — Design System & shadcn/ui Foundation

**Purpose:** Establish the actual visual foundation (tokens, typography, base primitives) before any product screen is built, so every later screen inherits it rather than each one improvising.

**Prerequisites:** Phase 0 complete; ideally `docs/02-design-system.md`'s exact tokens in hand (Open Decision #2) — if unavailable, proceed with the qualitative direction from the brief and flag the token values as provisional.

**Changes:** Initialize shadcn/ui (`components.json`), define color/spacing/typography tokens in `app/globals.css` using Tailwind v4's `@theme` syntax, add Lucide, generate the base primitive set the App Shell will need first (Button, Input, Card, Separator, Sheet/Sidebar primitive, DropdownMenu, Avatar, Tabs, Table, Dialog, Tooltip, Skeleton). Build a temporary, dev-only "style guide" route to visually sanity-check tokens before deleting it or gating it behind a dev flag.

**Dependencies:** shadcn/ui-managed packages, `lucide-react`.

**Architecture:** Most shadcn primitives are client components at the leaf level but are composed into otherwise server-first pages — this phase doesn't compromise the server-first principle, it just supplies the leaf-level interactive pieces.

**Validation:** Rendered primitives visually match the "calm, structured, Notion/Linear-like" direction — no default-shadcn-blue, no unintentional heavy shadows/gradients.

**Manual verification:** Developer inspects the style-guide route at desktop and mobile widths, checks color contrast for accessibility.

**Exit criteria:** Themed primitive set exists and is visually approved; dark mode included-or-explicitly-deferred as a conscious decision (not accidental).

---

### Phase 2 — Application Shell / Navigation

**Purpose:** Build the persistent layout — sidebar, top bar, and routing skeleton for all seven top-level modules — before any module has real content, so every module page starts from the same shell.

**Prerequisites:** Phase 1.

**Changes:** `app/(app)/layout.tsx` shell containing sidebar + top bar; `components/app-shell/` for the shared shell pieces; placeholder route segments and empty-state pages for Dashboard, Trips, Community, Travel Essentials, Profile, Settings (Trip Workspace's nested routes come later, in Phase 6, since they depend on a real trip existing). No auth gating yet — that's Phase 3.

**Dependencies:** None new.

**Architecture:** Server Components by default for the shell frame; the sidebar's interactive bits (collapse/expand, active-route highlighting) are isolated into small client components rather than making the whole shell a client component.

**Validation:** All nav links route correctly; layout is desktop-first but doesn't break at mobile widths (collapses/adapts per design direction).

**Manual verification:** Click through every nav item, resize the browser window through common breakpoints, confirm no layout shift or overflow.

**Exit criteria:** Full navigation skeleton exists with placeholder content in every module; still publicly accessible (no auth wall yet).

---

### Phase 3 — Supabase Auth Integration

**Purpose:** Add real authentication and put the app shell behind it, establishing the session/ownership model everything after this depends on.

**Prerequisites:** Phase 2; a Supabase project created (manual, outside this roadmap — you'll need to do this yourself before this phase starts); Open Decision #5 (auth methods) resolved at least provisionally.

**Changes:** `lib/supabase/client.ts` (browser client), `lib/supabase/server.ts` (server client for Server Components/Actions), `middleware.ts` for session refresh, public `login`/`signup` routes outside the `(app)` group, protection for the `(app)` route group, a sign-out Server Action.

**Dependencies:** `@supabase/supabase-js`, `@supabase/ssr`; env vars `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and a server-only `SUPABASE_SERVICE_ROLE_KEY` (only if/when it's actually needed — don't add the service-role key to the client bundle or to any code path that could leak it).

**Architecture:** Server-first session checks (middleware + Server Component checks) rather than client-side-only gating; all secrets stay server-only per the Security Checklist in Section 10.

**Validation:** Unauthenticated visitors are redirected away from `(app)` routes; authenticated sessions persist across reloads; sign-out actually clears the session.

**Manual verification:** Manually sign up, log in, refresh the page, log out, and attempt to directly hit a protected URL while logged out.

**Exit criteria:** Full auth boundary works end-to-end. No product data model exists yet — this phase is authentication only.

---

### Phase 4 — Database Layer: Prisma + Schema Design

**Purpose:** Define the durable schema for the entities Trips and the Workspace tabs need, and stand up Prisma as the single ORM boundary to Postgres.

**Prerequisites:** Phase 3 (ownership needs a real user id to key off of); Supabase Postgres connection strings; Open Decision #4 (profile-table strategy) and #3 (entity field-level shapes — treat anything drafted here as provisional pending `docs/03`) at least provisionally resolved.

**Changes:** `prisma/schema.prisma` with an initial model set — `Profile` (mirrors `auth.users`, holds app-specific profile fields), `Trip`, and stub models for `ItineraryItem`, `Accommodation`, `Expense`, `Note`, `ChecklistItem`, `Link` (fields kept minimal/draft until Open Decision #3 is resolved against the real docs); first migration; `lib/db.ts` with the standard Next.js-safe Prisma client singleton pattern (to avoid exhausting connections in dev's hot-reload); optional `prisma/seed.ts`.

**Dependencies:** `prisma`, `@prisma/client`; env vars `DATABASE_URL` (pooled, for the app) and `DIRECT_URL` (direct, for migrations) — Supabase provides both connection strings.

**Architecture:** Single Postgres database via Supabase, no additional data stores; ownership modeled via a `userId`/`profileId` foreign key on every owned table, enforced later at the Server Action layer (Section 10).

**Validation:** `prisma migrate dev` runs cleanly; Prisma Studio shows the expected tables; a scratch script can insert and read a row.

**Manual verification:** Developer opens Prisma Studio and manually inserts/inspects a row per table.

**Exit criteria:** Schema exists and is migrated; **no UI is wired to it yet** — that starts in Phase 5.

---

### Phase 5 — Trips Module (List, Create, Core CRUD)

**Purpose:** The first true end-to-end vertical slice, and the phase that proves "every core workflow is usable without AI." Trips is chosen first because every other module (Workspace, Dashboard) hangs off of it.

**Prerequisites:** Phase 4.

**Changes:** `features/trips/` with `actions.ts` (create/update/delete Trip via Server Actions), `schema.ts` (Zod), `components/` (trip list, trip card, create-trip form), `app/(app)/trips/page.tsx` and `app/(app)/trips/[tripId]/page.tsx` as the entry point into what will become the Workspace in Phase 6.

**Dependencies:** `zod`; `react-hook-form` + `@hookform/resolvers` if the create-trip form is non-trivial (multiple fields, date pickers).

**Architecture:** Server Actions for all mutations, validated server-side with Zod even though the form also validates client-side (defense in depth); Server Components render the list from a direct Prisma query; ownership is enforced in the Server Action itself (query is always scoped to the current session's user id, never trusts a client-supplied id).

**Validation:** Create/list/delete works and persists; a trip created by user A is invisible and inaccessible to user B, including via direct URL manipulation of a trip id.

**Manual verification:** Create a trip, refresh, confirm it's in the Supabase table editor; log in as a second test account and confirm the first trip isn't visible and its direct URL 403s/404s.

**Exit criteria:** Trips module is fully functional with zero AI involvement.

---

### Phase 6 — Trip Workspace Tabs

**Purpose:** Build the seven Workspace tabs as independent feature slices under a shared per-trip layout. This is the largest phase in the roadmap — treat each row below as its own sub-phase (6a–6g), executed and validated one at a time, not as one big-bang change.

**Prerequisites:** Phase 5. Open Decision #3 (entity field shapes) should be at least drafted before starting, and #11 (image upload flow) resolved before Accommodation/Notes if those tabs carry images.

**Shared changes across all sub-phases:** a nested `app/(app)/trips/[tripId]/layout.tsx` with tab navigation; `features/trip-workspace/` holding shared workspace chrome; each tab gets its own `features/trip-workspace/<tab>/` slice (`actions.ts`, `queries.ts`, `components/`, `schema.ts`).

**Recommended build order and what each introduces:**

| Sub-phase | Tab | Notes |
|---|---|---|
| 6a | **Overview** | Read-mostly summary of the trip; build this first since it's the landing view and mostly reads data the other tabs will produce — expect it to be lightly re-touched once Itinerary/Expenses exist. |
| 6b | **Itinerary** | Core scheduling data; other tabs (Expenses) may reference itinerary items, so building this before Expenses avoids rework — confirm this dependency against `docs/03` since the brief doesn't state it explicitly. |
| 6c | **Accommodation** | May carry images — first place Cloudinary is actually needed if Open Decision #11 resolves to "yes, images here." |
| 6d | **Expenses** | First place currency handling matters — coordinate with the Currency sub-module in Phase 9, or stub a simple currency field here and revisit once Currency exists. |
| 6e | **Notes** | Straightforward CRUD; may also carry images. |
| 6f | **Checklist** | Good first candidate for TanStack Query + optimistic updates (toggle-item-done is a classic optimistic-UI case) and for introducing Zustand for local UI state (e.g. "show completed" toggle) if that state doesn't belong in the URL or server. |
| 6g | **Links** | Simplest tab; good one to build last as a low-risk finishing touch. |

**Dependencies introduced here:** `@tanstack/react-query` (+ devtools) for the interactive tabs (Checklist, Expenses) where optimistic updates or client-side refetching genuinely help; `zustand` for ephemeral client-only UI state that doesn't belong on the server (active sub-tab, unsaved-edit flags, filter toggles) — **not** for caching server data, that's TanStack Query's job; `date-fns` or similar once Itinerary needs real date math.

**Architecture:** Server Components fetch each tab's initial data; client components + TanStack Query own interactive mutation/refetch loops; Zustand is scoped to genuinely local, non-persisted UI state; React Context is reserved for things like "current trip id" being passed down the workspace tree without prop drilling, not for server data.

**Validation (per sub-phase):** That tab's CRUD works in isolation and is correctly scoped to the trip and its owner.

**Manual verification (per sub-phase):** Exercise create/edit/delete manually; for the optimistic-UI tabs, simulate a failed mutation (e.g. temporarily throw in the Server Action) and confirm the UI rolls back instead of showing stale success.

**Exit criteria for Phase 6 overall:** All seven tabs functional with zero AI involvement — this is the second (larger) proof point for "every core workflow usable without AI."

---

### Phase 7 — Dashboard Module (Non-AI)

**Purpose:** Build the cross-trip aggregate view now that there's real trip data to aggregate — deliberately sequenced after Trips/Workspace, not before, since an aggregate view is meaningless without underlying data.

**Prerequisites:** Phase 6.

**Changes:** `features/dashboard/` with server-side aggregation queries (upcoming trips, quick stats, recent activity); `app/(app)/dashboard/page.tsx`.

**Dependencies:** None new.

**Architecture:** Pure Server Components with direct Prisma aggregation queries; no client state needed yet since nothing here is interactive.

**Validation:** Numbers/lists shown match the underlying trip data exactly.

**Manual verification:** Cross-check dashboard figures against the Trips/Workspace data manually.

**Exit criteria:** Dashboard functional, still zero AI involvement.

---

### Phase 8 — AI Infrastructure (Gemini, Trip-Scoped)

**Purpose:** Introduce AI as the cross-cutting capability it's meant to be — deliberately the *last* thing built among the core-data phases, so it has real, persistent, app-owned data to be "second" to.

**Prerequisites:** Phases 5–7 (needs real trip data); Open Decisions #6 and #7 (conversation persistence model, Dashboard AI scope) at least provisionally resolved; verify the current Gemini SDK package name against up-to-date docs at the moment this phase starts (Open Decision #13) — don't assume a package name from memory.

**Changes:** `lib/ai/gemini-client.ts` — a server-only thin wrapper around the Gemini SDK, never imported into any client component. `services/ai/context-builder.ts` — assembles a trip-scoped context object from Prisma (trip details, itinerary, expenses, etc.) fresh on each request; this is the literal implementation of "the application remembers, the LLM does not." Prisma schema additions for conversation persistence (e.g. `AiConversation`, `AiMessage`, both foreign-keyed to `Trip` and `Profile`). An endpoint for the AI request — evaluate whether a Route Handler (better fit for streaming responses) or a Server Action is more appropriate given Next.js 16's current streaming support; check the installed Next.js docs at this point rather than assuming prior-version behavior. A minimal AI surface inside the Trip Workspace — an assistant **panel**, consistent with the "not chat-first" design direction, not a floating chat-bubble widget.

**Dependencies:** The Gemini SDK; `GEMINI_API_KEY` as a server-only env var, never exposed to the client bundle.

**Architecture:** Strictly trip-scoped context — only the current trip's data is ever injected into a prompt, never cross-trip or cross-user data. Conversation history is persisted in Postgres and reloaded into context on each turn rather than relying on any provider-side memory/session concept. AI failures (timeouts, quota errors, network errors) must degrade gracefully — the rest of the app, including the rest of that same Workspace tab, must keep working.

**Validation:** AI responses are demonstrably grounded in real trip data (ask about something only in that trip's itinerary and get an accurate, trip-specific answer); conversation history persists across a reload; a simulated AI provider outage doesn't break any non-AI workflow.

**Manual verification:** Temporarily block the Gemini API call (e.g. bad API key) and confirm the rest of the app — including the rest of that Workspace tab — is unaffected; confirm conversation history survives a page reload.

**Exit criteria:** Trip Workspace AI works end-to-end; non-AI workflows are provably unaffected by AI errors.

---

### Phase 9 — Travel Essentials Module

**Purpose:** Build the six utility sub-modules. These are largely independent of Trips/Workspace/AI and **could** be parallelized earlier if you prefer — they're sequenced here to match the product module list's ordering, not because of a hard technical dependency.

**Prerequisites:** Core shell + auth (Phase 3) is the only hard prerequisite; Open Decision #8 (data providers) resolved per sub-module before that sub-module starts.

| Sub-module | Notes |
|---|---|
| **Weather** | Server-side fetch wrapper in `services/weather/`, hides the API key; use Next.js fetch caching/revalidation to stay inside free-tier rate limits rather than building a custom cache. |
| **Currency** | Server-side FX-rate fetch, similarly cached; this is also what Expenses (Phase 6d) may eventually consume — consider building this before or alongside 6d if currency conversion in Expenses is a hard requirement. |
| **Maps** | React Leaflet is client-only — load it via `dynamic(() => import(...), { ssr: false })` to avoid SSR/hydration issues with Leaflet's DOM/window dependencies. |
| **Country Guide** | Content source undefined (Open Decision #8) — likely static/curated content initially rather than a live API, to stay within free-tier constraints; confirm against `docs/03`. |
| **Emergency** | Needs a per-country emergency-number data source — likely a small static/curated dataset rather than a live API. |
| **Language Essentials** | Likely static curated content per country/region; confirm scope against `docs/03`. |

**Dependencies:** `react-leaflet`, `leaflet`, `@types/leaflet`; provider-specific clients or plain `fetch` for Weather/Currency, decided per Open Decision #8.

**Architecture:** Server-side fetch + Next.js caching/revalidation for anything hitting a rate-limited free-tier API; Leaflet map isolated as a client-only dynamic import.

**Validation:** Each sub-module renders real data for a test location/country; the map renders correctly with no SSR errors.

**Manual verification:** Load the map on a fresh page load (not just client navigation) to confirm no SSR/hydration warnings; spot-check weather/currency values against a real source.

**Exit criteria:** All six sub-modules functional.

---

### Phase 10 — Community Module

**Purpose:** Deliberately the least-specified module in your brief — this phase starts with **scoping, not coding**.

**Prerequisites:** Core modules stable; a scoping decision (data model, interaction model — public trip sharing? forum? trip collaborators?) recorded before any implementation begins.

**Changes:** None until scope is defined. Once scoped, follow the same feature-first pattern as other modules.

**Exit criteria:** A recorded scope decision exists. Do not let this phase become "guess and build" — of every open item in this roadmap, this is the one most likely to require real product-design work before engineering starts.

---

### Phase 11 — Profile Module (Overview, Preferences, Activity, Insights)

**Purpose:** User-centric views, sequenced after there's enough usage data (trips, expenses) for Activity/Insights to be meaningful, and after Preferences exist to be referenced by other modules (e.g. a default currency preference feeding Expenses).

**Prerequisites:** Auth (Phase 3); enough real usage data for Insights to be non-trivial (practically, after Phase 6).

**Changes:** `features/profile/{overview,preferences,activity,insights}`; Preferences uses a Server Action + Zod, same pattern as Trips.

**Dependencies:** None new expected; Insights likely reuses the same aggregation approach as Dashboard.

**Architecture:** Server Components by default; Preferences changes should visibly propagate to the modules that consume them (e.g. default currency shown in Expenses).

**Validation:** Changing a preference actually changes behavior elsewhere in the app.

**Manual verification:** Change a preference, confirm the downstream effect.

**Exit criteria:** Profile functional.

---

### Phase 12 — Settings Module

**Purpose:** Account-level settings — scope is underspecified in the brief (Open Decision #10), likely account management, notification preferences, data export/delete, connected auth methods.

**Prerequisites:** Auth.

**Changes:** `features/settings/`, scoped once confirmed.

**Exit criteria:** Settings functional per confirmed scope.

---

### Phase 13 — Hardening

**Purpose:** A dedicated cross-cutting pass once every module exists functionally — accessibility audit, error/loading state audit, security audit, responsive audit, test-coverage gap-fill. This is a gap-fill pass, not the first time tests are written — tests should have been accumulating incrementally since Phase 4/5.

**Prerequisites:** All functional modules built (Phases 1–12, minus Community if still unscoped).

**Changes:** Add missing `error.tsx`/`loading.tsx` per route segment; ARIA/keyboard-navigation audit against the primitives from Phase 1; a full pass of the Security Checklist (Section 10) against every Server Action and Route Handler, specifically re-verifying ownership checks; close test-coverage gaps identified during the audit.

**Exit criteria:** Security checklist fully satisfied; accessibility basics verified (keyboard nav, contrast, focus states); no known perf regressions from the Performance Strategy (Section 11).

---

### Phase 14 — Deployment Preparation

**Purpose:** Prepare for a Vercel deployment without actually deploying to production yet.

**Prerequisites:** Phase 13.

**Changes:** Production env var documentation (Supabase prod project, Cloudinary prod config, Gemini prod key); confirm the package manager decision from Phase 0 matches what the Vercel build will use; a final `next build` run locally to confirm a clean production build.

**Exit criteria:** Local production build succeeds; deployment checklist is complete. The actual production deploy and go-live remain your manual action, outside this roadmap's scope.

---

## 7. Recommended Implementation Order

1. Phase 0 — Baseline Alignment & Tooling Decision
2. Phase 1 — Design System & shadcn/ui Foundation
3. Phase 2 — Application Shell / Navigation
4. Phase 3 — Supabase Auth Integration
5. Phase 4 — Database Layer: Prisma + Schema Design
6. Phase 5 — Trips Module
7. Phase 6 — Trip Workspace Tabs (6a→6g: Overview, Itinerary, Accommodation, Expenses, Notes, Checklist, Links)
8. Phase 7 — Dashboard (non-AI)
9. Phase 8 — AI Infrastructure
10. Phase 9 — Travel Essentials (can be parallelized with 5–8 if you prefer; sequenced here per the module list)
11. Phase 10 — Community (scoping first)
12. Phase 11 — Profile
13. Phase 12 — Settings
14. Phase 13 — Hardening
15. Phase 14 — Deployment Preparation

---

## 8. AI Implementation Strategy

- **Provider service:** a single server-only client wrapper (`lib/ai/gemini-client.ts`) is the only code in the entire app allowed to import the Gemini SDK. Nothing calls Gemini directly from a feature or a client component.
- **Context loading:** a dedicated `services/ai/context-builder.ts` queries Prisma fresh (or from a short-lived cache) for the current trip's data on every AI request, and assembles it into the prompt. This is the concrete mechanism behind "the application remembers, the LLM does not" — the model is handed exactly the facts it needs each time, rather than being trusted to recall them.
- **Conversation persistence:** stored in Postgres (`AiConversation`/`AiMessage` models), foreign-keyed to `Trip` and `Profile`. Reloaded into the prompt/context on each turn rather than depending on any provider-side session or memory feature.
- **Trip-scoped context:** the context builder only ever pulls data for the trip the request is scoped to — never another trip, never another user's data, even implicitly.
- **Prompt construction boundary:** all prompt assembly happens server-side inside `services/ai/`; the client only ever sends a user message and a trip id, never a raw prompt.
- **Error handling / graceful degradation:** AI calls are wrapped so that timeouts, quota errors, or malformed responses surface as a normal in-panel error state — they must never throw uncaught into a page-level error boundary, and they must never block a non-AI action on the same page from working.
- **Future OpenRouter abstraction:** **not implemented now.** There's no concrete second-provider need yet, and introducing an abstraction layer before there's a real requirement to swap providers would be exactly the kind of premature abstraction the architecture explicitly excludes. When (if) a second provider becomes a real requirement, the `lib/ai/gemini-client.ts` boundary already gives you a clean seam to introduce an OpenRouter-backed alternative behind the same interface — but that's a future phase, not this one.

---

## 9. Testing Strategy

- **Unit level:** pure functions in `utils/` and `services/` (context builders, formatters, validators) — fast, no I/O, easiest to keep green continuously.
- **Validation:** every Zod schema gets at least a couple of cases (valid input, one representative invalid input) to catch schema drift as fields are added.
- **Business logic:** anything in `services/` (AI context assembly, currency/weather transforms) tested independent of the framework layer around it.
- **Server Actions:** test the action function directly where feasible (mocking Prisma/Supabase), specifically covering the ownership-check path — a request for another user's resource must be rejected, and this is worth a dedicated test per action, not just happy-path coverage.
- **Route Handlers:** same ownership/validation coverage as Server Actions, plus response-shape/status-code checks.
- **Database operations:** a small set of integration tests against a real (test/dev) Postgres instance for the core Trip/Workspace CRUD paths, since Prisma query correctness is hard to fully verify with mocks alone.
- **Authentication:** cover the redirect-when-unauthenticated path and the session-persists-across-reload path; these are exactly the two things that are easy to silently break during later refactors.
- **Critical user workflows:** at least one end-to-end test (Playwright, once chosen per Open Decision #12) covering "sign up → create trip → add an itinerary item → see it on Dashboard" — this is the single test that proves the whole non-AI spine works.
- **AI integration:** test the context-builder's output shape against known trip fixtures (does it include what it should, exclude what it shouldn't) more than testing the model's actual output, since model output isn't deterministic — and a specific test that a simulated AI failure doesn't break the rest of the page.

---

## 10. Security Checklist

- **Authentication:** every `(app)` route protected via middleware/session check; no route relies on client-side-only gating.
- **Authorization / ownership checks:** every Server Action and Route Handler that reads or mutates a `Trip` or any Workspace entity re-derives the owner from the server-side session — never trusts a client-supplied `userId`/`profileId`. This is worth re-auditing explicitly in Phase 13, not just assumed correct from Phase 5 onward.
- **Zod validation:** every Server Action and Route Handler validates its input server-side with Zod, even when the same shape is also validated client-side — client validation is a UX nicety, not a security boundary.
- **Server-only secrets:** `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `GEMINI_API_KEY`, and any Cloudinary API secret never appear in client components, never get a `NEXT_PUBLIC_` prefix, and are only imported by server-only modules (`lib/*server*`, `services/*`, Server Actions, Route Handlers).
- **Environment variables:** `.env` is git-ignored (verify this explicitly, it's an easy thing to get wrong once); `.env.example` documents every var without real values; production values live only in Vercel's environment configuration.
- **Cloudinary handling:** decide (Open Decision #11) between signed server-mediated uploads and a signed client-direct upload — either way, the Cloudinary API secret itself stays server-only; only a short-lived signed upload token/preset is ever exposed to the client if the direct-upload path is chosen.
- **AI API key protection:** `GEMINI_API_KEY` used only inside `lib/ai/gemini-client.ts`, never sent to or readable by the client, never logged in a way that could leak it.
- **Database access:** Prisma is the only path to Postgres; no feature code constructs raw SQL against user input without parameterization; connection strings differentiate pooled (`DATABASE_URL`, app runtime) vs. direct (`DIRECT_URL`, migrations only).

---

## 11. Performance Strategy

- **Server Components by default** — client components only where interactivity genuinely requires them (forms, optimistic-update lists, the map, the AI panel).
- **Minimal client JavaScript** — resist reaching for a client component just to avoid a small prop-drilling inconvenience; prefer composing Server Components with client "islands."
- **Streaming where useful** — particularly the AI response (Phase 8) and any slower Dashboard/Insights aggregation queries, using Next.js 16's current streaming/Suspense patterns (verify against the installed docs rather than an assumed prior-version API).
- **Lazy loading** — the Leaflet map (Phase 9) is the clearest case, loaded via dynamic import with SSR disabled; apply the same pattern to any other genuinely heavy, below-the-fold client component as they appear.
- **Next.js caching/revalidation** — used directly for the free-tier-constrained external APIs (Weather, Currency) instead of introducing any separate caching system (Redis, etc.), which the architecture explicitly excludes as unnecessary infrastructure at this scale.
- **Pagination** — applied to any list that can grow unbounded (Trips list once a user has many, Expenses within a long trip, Activity feed) — decide the pagination approach (cursor vs. offset) when each specific list is built, not upfront.
- **Route-based code splitting** — falls out naturally from the App Router's per-segment structure as long as feature code stays colocated under its route segment rather than being imported eagerly from a shared root bundle.

---

## 12. Deployment Strategy

The eventual path, described but **not configured yet**:

- **Supabase:** a production project separate from the dev project, with its own connection strings and its own Auth configuration (redirect URLs, email templates) set once Phase 3's auth methods are finalized.
- **Cloudinary:** a production environment/preset, with upload folder structure mirroring the dev setup once Open Decision #11 is resolved.
- **Gemini:** a production API key with its own quota/billing awareness, kept separate from any dev/test key used during Phase 8 development.
- **Vercel:** project connected to the repository, environment variables mirrored from `.env.example` into Vercel's project settings (production and preview environments configured separately), build command matching whichever package manager Phase 0 settled on.

Actually wiring these up is Phase 14's exit criteria, and going live is a manual step you take after this roadmap's phases are complete — not something this roadmap executes.

---

## 13. First 10 Implementation Tasks

**Task 1**
Goal: Resolve the package-manager discrepancy.
Files likely affected: `package-lock.json` or new `pnpm-lock.yaml`, `README.md`.
Dependencies: None (or pnpm itself, if migrating).
Expected result: One package manager is in explicit, documented use.
Validation: Clean install + `dev`/`build`/`lint` all succeed under the chosen manager.
What must NOT be changed: No dependency versions altered as part of this task — it's a tooling decision only, not an upgrade.

**Task 2**
Goal: Add `.env.example` documenting every env var the roadmap will eventually need.
Files likely affected: `.env.example`, `.gitignore` (verify `.env` is already ignored).
Dependencies: None.
Expected result: A single file listing Supabase/Prisma/Cloudinary/Gemini var names with placeholder values.
Validation: File exists with no real secrets in it; `.env` confirmed git-ignored.
What must NOT be changed: No real secret values committed anywhere.

**Task 3**
Goal: Initialize shadcn/ui and Tailwind v4 theme tokens.
Files likely affected: `components.json`, `app/globals.css`, `components/ui/*` (Button, Card as a first pair).
Dependencies: shadcn/ui CLI packages, `lucide-react`.
Expected result: A themed `Button` and `Card` render correctly on a temporary test page.
Validation: Visual check in the dev server against the qualitative design direction.
What must NOT be changed: Don't remove or restructure the existing `app/` starter content beyond what's needed to add the test page.

**Task 4**
Goal: Build the base App Shell (sidebar + top bar skeleton, no auth yet).
Files likely affected: `app/(app)/layout.tsx`, `components/app-shell/*`.
Dependencies: None new beyond Task 3's primitives.
Expected result: A persistent shell renders around a placeholder page.
Validation: Manual click-through, responsive check.
What must NOT be changed: No route protection added yet — that's a later task.

**Task 5**
Goal: Add placeholder routes for the seven top-level modules.
Files likely affected: `app/(app)/{dashboard,trips,community,travel-essentials,profile,settings}/page.tsx`.
Dependencies: None new.
Expected result: Every nav item routes to a real (empty-state) page instead of 404ing.
Validation: Click every nav link.
What must NOT be changed: No real feature logic yet — these are placeholders.

**Task 6**
Goal: Create the Supabase project and wire base client setup.
Files likely affected: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `.env.example` update, actual `.env.local`.
Dependencies: `@supabase/supabase-js`, `@supabase/ssr`.
Expected result: The app can obtain a Supabase client on both server and client without errors.
Validation: A temporary test call (e.g. `supabase.auth.getSession()`) resolves without throwing.
What must NOT be changed: No route protection yet — this task is client setup only.

**Task 7**
Goal: Implement session-refresh middleware and protect the `(app)` route group.
Files likely affected: `middleware.ts`, `app/(app)/layout.tsx` (add session check), new `app/login/page.tsx`.
Dependencies: Task 6's clients.
Expected result: Unauthenticated users are redirected to `/login`; authenticated users reach the shell.
Validation: Manual sign-up/log-in/log-out/reload walkthrough.
What must NOT be changed: No product data model exists yet — this task is auth-only.

**Task 8**
Goal: Author a draft `prisma/schema.prisma` with `Profile` and `Trip` models only (Workspace entities come later, once Open Decision #3 is resolved).
Files likely affected: `prisma/schema.prisma`.
Dependencies: `prisma`, `@prisma/client`.
Expected result: A valid schema file for the two core models.
Validation: `prisma validate` / `prisma format` succeed.
What must NOT be changed: Don't add Workspace-tab models yet — keep this minimal and reviewable.

**Task 9**
Goal: Run the first migration against the Supabase dev database and stand up `lib/db.ts`.
Files likely affected: `prisma/migrations/*`, `lib/db.ts`.
Dependencies: `DATABASE_URL`/`DIRECT_URL` env vars set.
Expected result: Tables exist in Supabase; a Prisma client singleton is importable app-wide.
Validation: Prisma Studio shows the new tables; a scratch script performs a successful insert/read.
What must NOT be changed: No feature code wired to it yet.

**Task 10**
Goal: Implement the first vertical slice — Trips list + create, end to end.
Files likely affected: `features/trips/*`, `app/(app)/trips/page.tsx`.
Dependencies: `zod`, (optionally) `react-hook-form` + `@hookform/resolvers`.
Expected result: A logged-in user can create a trip and see it in their list, scoped to their own account.
Validation: Manual creation + a two-account check that trips aren't cross-visible.
What must NOT be changed: No Workspace tabs, no AI, no other modules touched in this task.

---

## 14. Things We Should Explicitly NOT Do Yet

- Don't implement the OpenRouter abstraction — no concrete multi-provider need exists yet.
- Don't start building the Community module against a guessed scope — scope it first.
- Don't introduce microservices, CQRS, event sourcing, or a separate backend service, now or later, per the architecture doc's explicit exclusions.
- Don't add a separate caching layer (Redis, etc.) — Next.js's built-in caching/revalidation covers the free-tier-constrained external API calls this app needs.
- Don't build any AI feature before Trips/Workspace/Dashboard have real, persistent data — AI has nothing to be "second" to otherwise.
- Don't create the full target folder tree (`features/`, `services/`, `actions/`, `types/`, etc.) upfront — introduce each folder at the phase that gives it a real first occupant.
- Don't finalize OAuth providers or auth methods beyond what's actually decided (Open Decision #5).
- Don't over-provision for scale beyond free-tier practicality — no premature indexing/sharding/queueing decisions.
- Don't configure production deployment (Phase 14) until Phase 13's hardening pass is complete.
- Don't leave the package-manager question ambiguous — it's the one Phase 0 decision that's cheap now and expensive to unwind later.
- Don't let this roadmap, or its execution, quietly redesign anything already approved in your documents — where something is approved, it's preserved as-is; where something is unresolved, it stays flagged rather than guessed.
