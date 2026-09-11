# Prava AI V2 - Development Memory

## Current Project Phase
- **Phase 0: Baseline Alignment & Tooling Decision** (Complete)
- **Phase 1: Design System & shadcn/ui Foundation** (Complete)
- **Phase 2: Application Shell / Navigation** (Complete)
- **Phase 3: Supabase Auth Integration** (Complete)
- **Phase 4: Database Layer: Prisma & Schema Design** (Complete)
- **Phase 5: Trips Module (List, Create, Core CRUD)** (Complete)
- **Phase 6: Trip Workspace Tabs** (Complete)
- **Phase 7: Dashboard Module (Non-AI Aggregation)** (Complete)
- **Phase 8: AI Infrastructure (Gemini Flash, Trip-Scoped)** (Complete)
- **Phase 9: Travel Essentials Module (Weather, Currency, Maps, Country Guide, Emergency, Language)** (Complete)
- **Phase 10: Community Module (Public Discovery & 1-Click Itinerary Cloning)** (Complete)
- **Phase 11: Production Polish, Security Review & Deployment Readiness** (Complete)
- **Phase 12: AI Structured Action & Itinerary Proposals (Roadmap 2)** (Complete)
- **Phase 13: Supabase Storage & Image Foundation (Roadmap 2)** (Complete)
- **Phase 14: Public Profile & Creator Identity (Roadmap 2)** (Complete)
- **Phase 15: Community Publishing & Creator Ownership (Roadmap 2)** (Complete)
- **Phase 16: Blog / Travel Stories (Roadmap 2)** (Complete)
- **Phase 17: Community Discovery Consolidation (Roadmap 2)** (Complete)
- **Phase 18: Richer Trip & Community Imagery (Roadmap 2)** (Complete)
- **Phase 19: Security, Integration & Production Verification (Roadmap 2)** (Complete)

## Current Task
- **Roadmap 2 Complete**: All 19 phases across Foundation and Roadmap 2 are fully implemented and integrated. Community Discovery Hub is consolidated with tabs for All Content, Curated Itineraries & Templates, Travel Stories & Guides, and Verified Creators, backed by unified search, region/style/tag filters, 1-click cloning, and public creator profiles (`/u/[username]`). Responsive image fallbacks and gradients are integrated across all cards. Authorization boundaries, ownership verification, and public/private scoping are strictly enforced.

## Completed Work
- Inspected repository state and validated Next.js 16.3.0, React 19.2.8, Tailwind CSS v4, and ESLint 9 configuration.
- Read and synthesized core source-of-truth documents (`01-product-vision.md`, `02-design-system.md`, `03-system-architecture.md`, `implementation-roadmap.md`).
- Audited repository files (`AGENTS.md`, `CLAUDE.md`, `package.json`).
- Initialized Development Memory (`memory.md` as sole source of truth).
- **Task 1**: Explicitly resolved package manager decision to use `npm` (retaining `package-lock.json`).
- **Task 2**: Created `.env.example` with placeholder keys for Supabase, Prisma, Gemini, Cloudinary, and App URL. Updated `.gitignore`.
- **Task 3**: Initialized `components.json`, configured `app/globals.css` with HSL CSS design tokens (`--primary`: sky blue `#0284c7`), installed `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`, `@radix-ui/react-slot`, built `components/ui/button.tsx` & `components/ui/card.tsx`.
- **Task 4**: Created persistent App Shell with desktop left sidebar, responsive mobile menu drawer, contextual top bar, and route context wrapping.
- **Task 5**: Created placeholder route pages for `/dashboard`, `/trips`, `/travel-essentials`, `/community`, `/profile`, and `/settings`. Updated root `/` to redirect to `/dashboard`.
- **Task 6**: Integrated modern Supabase SSR clients using `@supabase/supabase-js` and `@supabase/ssr` (`lib/supabase/client.ts` and `lib/supabase/server.ts`), utilizing `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and server-only `SUPABASE_SECRET_KEY`.
- **Task 7**: Built session refresh logic (`lib/supabase/middleware.ts`), Next.js 16 `proxy.ts` request proxying and route protection, `/login` sign-in/sign-up page, and sign-out action in top bar.
- **Task 8**: Configured Prisma 7 ORM with `prisma.config.ts`, authored `Profile` & `Trip` models in `prisma/schema.prisma`, created singleton `lib/db.ts` with `@prisma/adapter-pg`, and validated schema.
- **Task 9**: Executed initial migration (`20260816150457_init`) applying `profiles` and `trips` tables to Supabase Postgres database.
- **Task 10**: Implemented Trips vertical slice (`schema.ts`, `actions.ts`, `components/`, server-rendered `/trips` and `/trips/[tripId]` routes).
- **Task 11**: Implemented full Trip Workspace Tabs (`6a: Overview`, `6b: Itinerary`, `6c: Accommodation`, `6d: Expenses`, `6e: Notes`, `6f: Checklist`, `6g: Links`) with Postgres migration `20260816151853_workspace_entities`.
- **Task 12**: Implemented Dashboard Module with cross-trip aggregation queries (`features/dashboard/queries.ts`) and metrics UI (`dashboard-metrics.tsx`, `upcoming-trip-card.tsx`, `recent-trips-list.tsx`, `urgent-checklist.tsx`).
- **Task 13**: Implemented AI Infrastructure (Gemini Flash) with Postgres conversation persistence, dynamic context assembly, and interactive Workspace AI Assistant.
- **Task 14**: Implemented Travel Essentials Module (6 sub-modules: Weather, Currency, Maps, Country Guide, Emergency, Language).
- **Task 15 (Phase 10)**: Implemented Community Module:
  - Added `isPublic` and `isTemplate` to `Trip` in `prisma/schema.prisma` and applied migration `20260816162157_community_sharing`.
  - Built `features/community/data/seed-templates.ts` with curated itineraries for Japan, Amalfi Coast/Rome, Paris, Swiss Alps, and Bali.
  - Built `features/community/actions.ts` (`getCommunityTrips`, `cloneTripTemplate`, `toggleTripPublishStatus`).
  - Built `features/community/components/` (`community-trip-card.tsx`, `trip-preview-dialog.tsx`, `community-view.tsx`).
  - Updated `features/trip-workspace/common/workspace-header.tsx` with publish toggle and `app/(app)/community/page.tsx`.
- **Task 16 (Landing Page & Auth Refinement)**:
  - Made root landing page (`/`) and auth pages (`/login`, `/signup`) public in `lib/supabase/middleware.ts` while keeping `/dashboard`, `/trips`, `/travel-essentials`, `/community`, `/profile`, and `/settings` protected.
  - Built high-fidelity public Landing Page (`app/page.tsx`) with Hero section, dynamic session detection ("Go to Workspace" vs "Get Started"), simulated interactive workspace mockup with AI proposal cards, feature highlights, and 3-step workflow.
  - Refactored `app/login/page.tsx` with dual-column desktop split, Sign In / Create Account tab switcher, URL tab parameter support (`?tab=signup`), password reveal toggle, and clear error/success messaging. Added `/signup` route redirect (`app/signup/page.tsx`).
- **Task 17 (Phase 12: AI Structured Action & Itinerary Proposals)**:
  - Added `AiProposal` model (`id`, `tripId`, `conversationId`, `messageId`, `status`, `summary`, `payload`, `createdAt`, `resolvedAt`) and `ProposalStatus` enum (`PENDING`, `ACCEPTED`, `REJECTED`, `PARTIAL`) to `prisma/schema.prisma`.
  - Created and applied Postgres migration `20260822145304_ai_proposals` to Supabase database.
  - Built Zod validation schemas (`aiProposalChangeSchema`, `aiProposalPayloadSchema`) in `features/trip-workspace/ai/schema.ts`.
  - Updated `services/ai/context-builder.ts` with entity IDs (`[ID: ...]`) and two operational modes: Conversational vs. Structured Action Proposals (`json:proposal`).
  - Built `acceptAiProposal` (Prisma transaction mutation execution for Itinerary and Accommodation records) and `rejectAiProposal` in `features/trip-workspace/ai/actions.ts`.
  - Built `AiProposalCard` component (`features/trip-workspace/ai/components/ai-proposal-card.tsx`) with multi-item selection checkboxes, color-coded domain badges (`ADD`, `UPDATE`, `REMOVE`), field change breakdowns, and Accept/Reject buttons.
  - Embedded proposal cards into `WorkspaceAiPanel` (`features/trip-workspace/ai/components/workspace-ai-panel.tsx`).
- **Task 18 (Phase 13: Supabase Storage & Image Foundation)**:
  - Added `coverImageUrl` field to `Trip` model in `prisma/schema.prisma` and applied migration `20260822150212_trip_cover_image`.
  - Built `lib/storage/supabase-storage.ts` with file type validation (JPEG, PNG, WebP, GIF, AVIF), 5MB size limits, user-folder scoping (`${folder}/${userId}/${filename}`), and public URL generation.
  - Built `features/storage/actions.ts` (`uploadImageAction`, `updateTripCoverImage`, `updateProfileAvatar`).
  - Built `components/storage/image-upload.tsx` (drag & drop upload zone with progress/error handling), `components/storage/cover-image.tsx` (responsive trip cover banner with modal upload/change/remove support), and `components/storage/avatar-upload.tsx`.
  - Integrated `CoverImage` into `WorkspaceHeader` and added thumbnail cover image display to `TripCard`.
- **Task 19 (Phase 14: Public Profile & Creator Identity)**:
  - Extended `Profile` model with `username` (unique, lowercase), `bio`, and `isPublic` in `prisma/schema.prisma` and applied migration `20260822150725_profile_creator_identity`.
  - Created `features/profile/reserved-usernames.ts` to enforce system-reserved route keywords and alphanumeric syntax.
  - Built Server Actions (`getCurrentProfile`, `updateProfile`, `checkUsernameAvailability`, `getPublicCreatorProfile` in `features/profile/actions.ts`).
  - Built `ProfileEditor` component (`features/profile/components/profile-editor.tsx`) and updated `app/(app)/profile/page.tsx`.
  - Built public creator page route `app/u/[username]/page.tsx` with creator bio, avatar, published itineraries showcase, and 1-click clone integration (`clone-trip-button.tsx`).
  - Validated with clean Next.js 16 production build (`npm run build`).
- **Task 20 (Phase 15: Community Publishing & Creator Ownership)**:
  - Extended `CommunityTripItem` type in `features/community/types.ts` with `authorUsername`, `authorAvatarUrl`, `authorBio`, `isCreatorPublic`, and `coverImageUrl`.
  - Updated `getCommunityTrips()` in `features/community/actions.ts` to join `Profile` fields (`username`, `avatarUrl`, `bio`, `isPublic`) and map `coverImageUrl` from `Trip`.
  - Rebuilt `CommunityTripCard` (`features/community/components/community-trip-card.tsx`) with cover image thumbnail, author avatar circle, clickable `@username` links to `/u/[username]`, and public creator globe badge.
  - Rebuilt `TripPreviewDialog` (`features/community/components/trip-preview-dialog.tsx`) with cover image banner, author attribution row with avatar, `@username` link, and "Public Creator" badge.
  - Validated with clean Next.js 16 production build.
- **Task 21 (Phase 16: Blog / Travel Stories)**:
  - Added `BlogPost` model and `BlogPostStatus` enum to `prisma/schema.prisma` with foreign key relations to `Profile` and `Trip` (linked trip), and applied database migration `20260822151600_blog_posts`.
  - Built Zod schema validation and URL slug generator (`features/blog/schema.ts`).
  - Authored comprehensive Server Actions (`createBlogPost`, `updateBlogPost`, `deleteBlogPost`, `getMyBlogPosts`, `getBlogPostForEdit`, `getPublishedStory`, `getAllPublishedStories` in `features/blog/actions.ts`).
  - Created interactive `BlogEditor` component (`features/blog/components/blog-editor.tsx`) supporting Markdown content, cover image URLs, custom tags, auto-slug generation, and trip linking.
  - Created `StoryCard` component (`features/blog/components/story-card.tsx`) with reading time estimates, author badges, tags, and cover images.
  - Built safe, lightweight `MarkdownRenderer` (`features/blog/components/markdown-renderer.tsx`) supporting headings, bold/italics, quotes, lists, images, and links.
  - Built discovery feed (`app/(app)/stories/page.tsx`), story creation (`app/(app)/stories/new/page.tsx`), story management (`app/(app)/stories/manage/page.tsx`), story editor (`app/(app)/stories/[slug]/edit/page.tsx`), and public reader page (`app/stories/[slug]/page.tsx`) with linked trip 1-click clone integration.
  - Aligned all dynamic `/stories` subpaths to use matching `[slug]` parameters to ensure Next.js App Router route consistency.
  - Updated public creator profiles (`app/u/[username]/page.tsx`) to showcase creator's published stories alongside itineraries.
  - Added "Stories" to app shell navigation config (`components/app-shell/nav-config.ts` and `components/app-shell/top-bar.tsx`).
  - Validated with clean Next.js 16 production build.

- **Task 22 (Phases 17, 18 & 19: Community Consolidation, Rich Imagery & Security Verification)**:
  - Extended `CommunityCreatorItem` and `CommunityTabFilter` types in `features/community/types.ts`.
  - Built `getCommunityCreators()` Server Action in `features/community/actions.ts` to query public creator profiles with trip, story, and top destination aggregations.
  - Built `CommunityCreatorCard` component (`features/community/components/community-creator-card.tsx`) featuring avatar, `@username`, bio preview, destination tags, stats, and direct links to `/u/[username]`.
  - Upgraded `CommunityView` (`features/community/components/community-view.tsx`) into a multi-tab Discovery Hub supporting **All Content**, **Itineraries & Templates**, **Travel Stories**, and **Creators**, complete with live search, region/style/tag filtering, and preview modals.
  - Updated `app/(app)/community/page.tsx` with concurrent data fetching via `Promise.all([getCommunityTrips(), getAllPublishedStories(), getCommunityCreators()])`.
  - Enhanced `CommunityTripCard` with elegant gradient fallback banners and icons when cover images are unset (Phase 18).
- **Task 23 (UIColors Tailwind Blue Theme & Sidebar Overhaul)**:
  - Aligned global CSS design tokens in `app/globals.css` with the curated UIColors Tailwind Blue palette (`#2563eb` primary, `#1d4ed8` hover, `#eff6ff` accent, `#dbeafe` secondary, `#172554` deep text).
  - Redesigned persistent App Shell Sidebar (`components/app-shell/sidebar.tsx`):
    - **Positioning**: Fixed from top to bottom (`fixed top-0 bottom-0 left-0 w-64 z-40`), paired with `md:pl-64` on right content container so the sidebar never scrolls away while the right pane and pages scroll smoothly.
    - **Grouping**:
      - **Workspace**: Dashboard, Trips, Travel Essentials.
      - **Others**: Stories, Community.
      - **Account (Bottom Fixed)**: Profile, Settings.
    - **Aesthetics & Animations**: Glowing blue brand emblem with pulse dot and rotate hover, smooth hover translations (`translate-x-1`), active blue border-l indicators with glow drop-shadows, and a live AI Connected beacon card.
  - Enhanced TopBar (`components/app-shell/top-bar.tsx`) with sticky positioning, backdrop blur, user profile link with blue ring, and smooth hover interactions.

- **Task 24 (Pricing Section & Tier Usage Limits)**:
  - Created `features/pricing/pricing-config.ts` defining Free Explorer (10 trips limit, 30 AI messages/thread) and Pro Wanderer ($12/mo or $99/yr unlimited).
  - Built dedicated `/pricing` page (`app/(app)/pricing/page.tsx`) with monthly/annual billing switcher, feature matrix table, and FAQ accordion.
  - Enforced 10-trip limit in `createTrip` Server Action (`features/trips/actions.ts`).
  - Built reusable `UpgradeDialog` modal (`features/pricing/components/upgrade-dialog.tsx`) with Pro benefits and instant upgrade trigger.
  - Added Pricing item with "Pro" badge to sidebar navigation (`components/app-shell/nav-config.ts`).

- **Task 25 (Workspace AI Conversation History & Multi-Session Switcher)**:
  - Added multi-session conversation queries in `features/trip-workspace/ai/actions.ts` (`getTripConversationThreads`, `createTripConversationThread`, `deleteTripConversationThread`).
  - Added Free tier 30-message quota verification with upgrade nudge.
  - Upgraded `WorkspaceAiPanel` (`features/trip-workspace/ai/components/workspace-ai-panel.tsx`) with:
    - "History" toggle drawer displaying all past conversation sessions with message counts.
    - "+ New Chat" button to start a fresh thread anytime while preserving historical conversations.
    - Real-time message count badge and upgrade dialog trigger on limit threshold.

- **Task 26 (Travel Essentials Real-Data Live APIs)**:
  - Integrated REST Countries v3.1 API in `country-service.ts` for dynamic live lookup of 250+ countries worldwide (flag, official name, currencies, languages, population, timezones, maps).
  - Upgraded `CountryGuideView` (`features/travel-essentials/country-guide/country-guide-view.tsx`) with live search form, quick pick pills, and real-time country intelligence.
  - Open-Meteo Weather API, Frankfurter ECB FX rate calculations, and Nominatim OpenStreetMap geocoding live and verified.

- **Task 28 (Travel Essentials Refactor & OpenWeather Integration)**:
  - Redesigned Travel Essentials shell with minimalistic, gentle, and vibrant header and description.
  - Replaced manual tab buttons with Shadcn `<Tabs>`, `<TabsList>`, `<TabsTrigger>`, and `<TabsContent>` components.
  - Integrated OpenWeather API in `features/travel-essentials/weather/weather-service.ts` with dual support (OpenWeather API key + graceful fallback).
  - Built interactive date selector supporting future date forecast inspections.
  - Added 24-hour and 3-hour granular timeline breakdowns for each selected day with temperatures, rain probabilities, and wind.
  - Added dynamic atmospheric matrix (Wind, Humidity, Rain chance, UV Index with health ratings, Air Pressure, and Sunrise/Sunset times).
  - Added temperature unit switcher (°C / °F), quick destination pills, and packing/travel advisories.
  - Implemented OpenWeather city name auto-suggestions (with fallback to Open-Meteo geocoding) featuring 300ms debounce, minimum 3-character threshold, and an interactive popover dropdown with state/country labels.

- **Task 29 (Travel Essentials - Currency Exchange & Trends with Frankfurter API)**:
  - Base currency default derived strictly from user profile preference (`defaultCurrency`).
  - Integrated Frankfurter open FX API (`/latest` and `/{startDate}..{endDate}`) with server-side caching and graceful fallback.
  - Built **Trip Currency Ratings** table comparing worldwide currencies with direct/inverse rates and 24h change indicators.
  - Built **Exchange Rate Watchlist** with `localStorage` persistence and 1-click pin/unpin controls.
  - Built **Currency Performance** interactive SVG line chart with timeframe ranges (**7D, 1M, 3M, 1Y**), gradient area fill, and interactive hover tooltips.
  - Built **“Is My Currency Getting Stronger?”** analytical section with factual purchasing power comparison and non-advisory compliance disclaimer.
- **Task 30 (Full Name Auth, Smart Username Generation, Locked Username, Real-time Quotas & Account Consolidation)**:
  - **Auth & Smart Username**: Added `Full Name` field to the Sign Up form in `app/login/page.tsx`. Built `features/profile/username-generator.ts` with a smart decision algorithm to normalize, validate against reserved keywords, check database uniqueness, and assign unique immutable usernames (e.g., `maya_lin_42`).
  - **Immutable Username**: Locked the `@username` field as a permanent, read-only unique identifier across profile management and mutations (`features/profile/actions.ts` & `features/profile/components/profile-editor.tsx`).
  - **Tier Quota Governance**: Free Explorer tier updated to **10 trips** limit and **30 AI credits/month**; Pro Wanderer tier updated to **25 trips** limit and **150 AI credits/month** (`features/pricing/pricing-config.ts` and `features/trips/actions.ts`).
  - **Billing & Subscription Dashboard**: Replaced the landing-page marketing template on `/pricing` with a dedicated **Account Subscription & Usage Hub** (`features/pricing/components/account-usage-view.tsx` & `features/pricing/actions.ts`), displaying active tier, real-time trip slots and AI credit meters, current month summary, and a 6-month historical tracking log table.
  - **Settings Consolidation into Account**: Removed the standalone `/settings` page in favor of an all-in-one **Account & Settings Hub** (`/profile`) containing Profile Identity, AI Credits & Usage Tracking, Workspace Defaults & Automation preferences, and Security controls. Updated sidebar, topbar, and navigation config (`components/app-shell/nav-config.ts`, `sidebar.tsx`, `top-bar.tsx`).
  - Successfully verified with clean Next.js 16 production build (`npm run build`).
- **Task 31 (Authentication Audit & Fix, PKCE Callback, Google OAuth & Calendar-Ready Architecture)**:
  - **PKCE & Email Callback Handler**: Built `app/auth/callback/route.ts` using `@supabase/ssr` server client to exchange authorization codes (`exchangeCodeForSession(code)`) and OTP tokens (`verifyOtp({ token_hash, type })`) for session cookies directly on the server, with open-redirect protection and relative path enforcement for `next` query targets.
  - **Safety Interception in Proxy**: Updated `lib/supabase/middleware.ts` to automatically intercept any incoming requests containing `code` or `token_hash` landing on non-callback routes (e.g. root `/` or `/auth`) and forward them cleanly to `/auth/callback`, establishing session cookies without requiring multiple page reloads.
  - **Google OAuth Integration**: Added "Continue with Google" OAuth provider button to `app/auth/page.tsx` with official Google branding, loading indicators, disabled states to prevent double submission, and redirect target passing. Configured `emailRedirectTo: `${origin}/auth/callback`` on email sign-up.
  - **Profile & Identity Sync**: Updated `getCurrentProfile` and `auth-check.ts` to map Google profile avatar (`avatar_url` / `picture`) and full name on first login.
  - **Route & Redirect Hardening**: Fixed all legacy `/login` and `/workspace` links across `app/page.tsx`, `app/u/[username]/page.tsx`, `app/auth/page.tsx`, and `features/profile/components/profile-editor.tsx` to use canonical `/auth` and `/dashboard` routes.
  - **Future Calendar Ready**: Structured Google Auth strictly as an Identity Provider through Supabase Auth, completely decoupling identity sessions from future service-level Google Calendar integrations.
  - **Form State Reset**: Configured full state clearing (`fullName`, `email`, `password`, `showPassword`) and automatic transition to the "Sign In" tab upon successful email confirmation dispatch, preventing stale credentials from lingering in form inputs.
  - Successfully verified with clean Next.js 16 production build (`npm run build`).
- **Task 32 (Trip Creation Dialog Upgrade & Unsplash Tour-Vibe Imagery)**:
  - **Component Upgrade**: Upgraded `features/trips/components/create-trip-dialog.tsx` to use official `shadcn/ui` primitives: Radix `Select` for initial trip status (`PLANNING`, `ACTIVE`, `COMPLETED`, `ARCHIVED`), `Input`, `Label`, `Textarea`, `Button`, `Skeleton`, and responsive `Dialog` with custom Cerulean icon badge header.
  - **Unsplash Tour-Vibe Service**: Built `services/unsplash.ts` querying Unsplash Search API server-side with `UNSPLASH_ACCESS_KEY`, matching destination and tour-vibe themes (`wanderlust landscape`, `travel scenic adventure`, `vacation destination aesthetic`), with randomized query offsets for fresh results on refresh and robust curated high-res fallbacks for unconfigured/rate-limited environments.
  - **6-Image Interactive Cover Picker**: Integrated responsive 3x2 image grid with loading skeletons, active `#2D9BF0` border ring + checkmark badge, optional toggle selection, and a "Refresh Images" button with rotating spinner. Configured image search to trigger exclusively on `onBlur` (when focus leaves the destination field or on Enter key) with change-detection and 350ms debouncing, preventing extraneous API calls during keystrokes or scrolling.
  - **Database Persistence**: Extended `createTripSchema` and `createTrip` Server Action in `features/trips/` to persist `coverImageUrl` in PostgreSQL `Trip` record.
  - **Environment Documentation**: Added `UNSPLASH_ACCESS_KEY` placeholder in `.env.example`.
  - Successfully verified with clean Next.js 16 production build (`npm run build`).
- **Task 33 (shadcn DatePicker Component & Trip Dialog Integration)**:
  - **Calendar Component**: Built `components/ui/calendar.tsx` providing month/year navigation, day grid, disabled date boundaries (`minDate`, `maxDate`), today indicators, and Cerulean `#2D9BF0` active highlights.
  - **DatePicker Component**: Built `components/ui/date-picker.tsx` based on official shadcn/ui pattern (`Popover`, `PopoverTrigger`, `PopoverContent`, `Button`, `Calendar`), formatting dates cleanly (`MMM d, yyyy`), with quick-clear and accessible keyboard support.
  - **Trip Dialogs Integration**: Replaced standard date inputs in both `CreateTripDialog` and `EditTripDialog` with `DatePicker`, establishing linked date bounds (`minDate={startDate}` on End Date, `maxDate={endDate}` on Start Date) to prevent invalid date ranges.
  - Successfully verified with clean Next.js 16 production build (`npm run build`).

- **Task 34 (Profile Email Unique Constraint Fix — `profiles_email_key`)**:
  - **Root Cause**: `db.profile.upsert({ where: { id: user.id } })` was used in 3 places. When a Supabase user re-registers or switches auth providers (e.g. email → Google), the Supabase `user.id` UUID changes but the old `profiles` row with that email still exists under the previous UUID. The `upsert` attempt tries to `INSERT`, which collides with the `@unique` constraint on `Profile.email`, producing `profiles_email_key`.
  - **Fix — Safe Profile Sync Helper**: Created `lib/auth/sync-profile.ts` exporting `syncUserProfile(user)`:
    1. **Check by `user.id`** (PK) — update if found (fast path).
    2. **Check by `email`** if no ID match — detects orphaned/stale row; temporarily renames old email to prevent collision, creates new profile with current `user.id`, relinks all `Trip`, `AiConversation`, and `BlogPost` FK rows via `updateMany`, then deletes the stale profile row.
    3. **Fresh create** — if no row exists by either ID or email.
  - **Also generates unique username** via `generateSmartUniqueUsername` for new profiles, matching the existing registration flow.
  - **Updated all 3 call sites**: `features/trips/actions.ts` (`getAuthenticatedUser`), `features/trip-workspace/common/auth-check.ts` (`verifyTripOwnership`), and `features/community/actions.ts` (`cloneItinerary`).
  - **Schema unchanged** — `@unique` on `Profile.email` retained; fix is purely at the application query layer.
  - Successfully verified with clean production build (`npm run build`).

- **Task 35 (Trip Workspace Nav — shadcn Tabs Component)**:
  - **Replaced** the custom `<Link>`-based `WorkspaceNav` (`features/trip-workspace/common/workspace-nav.tsx`) with a **router-driven shadcn `Tabs`** implementation.
  - Uses `TabsList` + `TabsTrigger` from `@/components/ui/tabs` (Radix `@radix-ui/react-tabs` under the hood).
  - **Active tab** is derived from `usePathname()` by matching against each tab's route segment — works on direct URL visits and page refreshes.
  - **Navigation** triggers `router.push()` on `onValueChange` — keeps URL routing, SSR pages, and `revalidatePath` all working exactly as before.
  - **Styling**: Flat underline-style strip (`rounded-none border-b-2 border-transparent`) with active Cerulean `border-primary` underline; overrides Radix `data-[state=active]` defaults cleanly.
  - **Accessibility**: Proper `role="tablist"` / `role="tab"` ARIA semantics via Radix, keyboard navigation, and focus management built-in.
  - **Unchanged**: layout, all 7 sub-route pages, `WorkspaceHeader`, `verifyTripOwnership`, all server actions.
  - Successfully verified with TypeScript type check (exit code 0).

- **Task 36 (Notes, Links & Checklist — Dialog Upgrade & Delete Confirmation)**:
  - **Audit finding**: Notes, Links, and Checklist Add/Edit dialogs already used `@/components/ui/dialog` (shadcn). The only issues were:
    - `note-card.tsx` and `link-card.tsx` used native browser `confirm()` for delete.
    - `task-item.tsx` had a silent direct-delete trash icon with **zero confirmation**.
    - Checklist had **no edit dialog** — only add existed.
  - **New Shared Component**: Created `components/app-shell/confirm-delete-dialog.tsx` — a reusable destructive confirmation `Dialog` with an `AlertTriangle` icon header, customizable title + description, loading state with `Loader2` spinner, and disabled buttons during submission.
  - **New Checklist Edit Dialog**: Created `features/trip-workspace/checklist/components/edit-task-dialog.tsx` matching the Notes/Links edit dialog pattern — title, category `<select>`, due date `Input`, populated from existing `ChecklistItem` via `useEffect`, calling `updateChecklistItem` Server Action.
  - **Updated `note-card.tsx`**: Removed `confirm()` and stale `isDeleting` transition; replaced with `ConfirmDeleteDialog` that shows the note title in the message. Added `toast.success/error` feedback.
  - **Updated `link-card.tsx`**: Removed `confirm()` and stale `isDeleting` transition; replaced with `ConfirmDeleteDialog`. Added `toast.success/error` feedback.
  - **Updated `task-item.tsx`**: Added hover-revealed Edit (`Pencil`) + Delete (`Trash2`) icon buttons; Delete opens `ConfirmDeleteDialog`; Edit opens `EditTaskDialog`. **Checkbox toggle remains an instant optimistic action — no dialog.**
  - **Backend unchanged**: All Server Actions (`createNote`, `updateNote`, `deleteNote`, `togglePinNote`, `createLink`, `updateLink`, `deleteLink`, `createChecklistItem`, `updateChecklistItem`, `deleteChecklistItem`, `toggleChecklistItem`), all Zod schemas, all DB models, and all authorization checks preserved exactly.
  - Successfully verified with clean production build (`npm run build`, exit code 0, 0 TypeScript errors).

- **Task 37 (Expenses Dialogs & Professional Card Architecture Across Workspace)**:
  - **Expense Dialogs Upgrade**:
    - Upgraded `AddExpenseDialog` (`features/trip-workspace/expenses/components/add-expense-dialog.tsx`) and `EditExpenseDialog` (`features/trip-workspace/expenses/components/edit-expense-dialog.tsx`) to utilize official shadcn `Select` components (`SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`) for category and currency fields, alongside `Input`, `Label`, `Textarea`, and `Dialog`.
    - Integrated `ConfirmDeleteDialog` for expense deletions in `ExpenseTracker` (`features/trip-workspace/expenses/components/expense-tracker.tsx`), eliminating browser `confirm()` popups.
  - **Professional Workspace Card System**:
    - Replaced bubbly, rounded-2xl AI slop styles and custom borders with crisp shadcn `Card`, `CardHeader`, `CardTitle`, `CardDescription`, and `CardContent` components with `rounded-sm` / `rounded-md` styling and semantic `border-border bg-card` tokens.
    - **Expense Tracker**: Upgraded metric cards (Total Spent, Top Spending Category, Active Categories), Category Breakdown visualization card, and the Expenses Table card to clean linear workspace cards.
    - **Trips Listing**: Refined `TripCard` (`features/trips/components/trip-card.tsx`) and `TripList` (`features/trips/components/trip-list.tsx`) with data-dense padding, crisp image banners, and professional layout.
    - **Overview Dashboard**: Validated and aligned 4-stat metric cards and nested workspace module cards (Itinerary, Stays, Checklist, Notes) to match the professional workspace aesthetic.
    - **Notes Card**: Upgraded `NoteCard` (`features/trip-workspace/notes/components/note-card.tsx`) from rounded-2xl gradients to crisp `rounded-sm border border-border bg-card`.
  - **Verification**: Verified with clean Next.js 16 production build (`npm run build`, exit code 0, 0 TypeScript errors).

- **Task 38 (Profile / Account Settings Redesign — GitHub Settings Navigation & Mobile Continuous Layout)**:
  - **Desktop / Tablet Layout**:
    - Replaced horizontal tabs with a GitHub Settings-style vertical navigation sidebar on the left (`features/profile/components/profile-editor.tsx`).
    - Organized navigation items: **Overview** (`User` icon), **AI Usage** (`Sparkles` icon), and **Settings** (`Settings` icon).
    - Active navigation item features clean semantic styling (`bg-secondary text-secondary-foreground font-semibold rounded-sm`), accessible focus rings, and URL search param synchronization (`?tab=overview|usage|settings`).
    - Right content area dynamically renders only the selected section without page reloads.
  - **Mobile Layout (Consolidated Continuous Experience)**:
    - Completely removed the vertical sidebar on mobile (`< md`).
    - Stacks all three sections sequentially (**Overview** → **AI Usage** → **Settings**) inside one continuous account page with clean section dividers and descriptive headers.
  - **Modular Architecture**:
    - Extracted clean single-source-of-truth section components:
      - `OverviewSection` (`features/profile/components/overview-section.tsx`) — Identity, avatar upload, full name, locked username, bio, creator toggle, trip stats.
      - `AiUsageSection` (`features/profile/components/ai-usage-section.tsx`) — Tier banner, workspace trip quota meter, AI credits meter.
      - `SettingsSection` (`features/profile/components/settings-section.tsx`) — Regional formatting defaults, AI feature switches, notifications, security & session sign out.
    - Wrapped `ProfileEditor` in `Suspense` in `app/(app)/profile/page.tsx` for optimal App Router search params handling.
  - **Verification**: Verified with clean Next.js 16 production build (`npm run build`, exit code 0, 0 TypeScript errors).

- **Task 39 (Overview Page — Column-Based Profile Image & Personal Details Layout)**:
  - Refactored `OverviewSection` (`features/profile/components/overview-section.tsx`) from a 2-column side-by-side grid (`grid-cols-1 md:grid-cols-12`) to a vertically stacked, column-based workspace layout (`flex flex-col space-y-6 max-w-3xl`).
  - **Top Card**: Profile Picture & Public Identity (Avatar upload, name, locked `@username`, public/private badge, and trip statistics).
  - **Bottom Card**: Personal Details Form (Full name, locked username, email, bio/philosophy textarea, public creator switch, and Save button).
  - **Verification**: Verified with clean Next.js 16 production build (`npm run build`, exit code 0, 0 TypeScript errors).

- **Task 40 (Profile Image Upload — Moderate Resolution Resizing & Supabase Storage Fix)**:
  - **Client-Side Image Resizer**: Created `lib/utils/image-resize.ts` exporting `resizeImageToBlob(file, options)`. Automatically downsizes high-resolution or 4K photos down to a moderate avatar resolution (512x512 square crop, ~40-80KB WebP/JPEG) using HTML Canvas and high-quality smoothing before sending to the server.
  - **Supabase Storage Upload Fix**:
    - Enhanced `lib/storage/supabase-storage.ts` with `getStorageClient()` (supporting `SUPABASE_SECRET_KEY` when configured) and `ensureBucketExists()` to automatically verify/create public buckets or resolve fallback buckets without throwing RLS or missing bucket errors.
    - Updated `AvatarUpload` (`components/storage/avatar-upload.tsx`) with instant upload spinner, image optimization pipeline, input value reset, and `toast.success` / `toast.error` user feedback.
- **Task 42 (Profile Navigation — New General Tab for Region, Currency, AI Features & Notifications)**:
  - **Created GeneralSection**: Created `features/profile/components/general-section.tsx` grouping:
    - **Region & Currency Defaults**: Default currency selector (`USD`, `EUR`, `GBP`, `JPY`, `AUD`, `CAD`, `INR`, `CHF`, `SGD`) and Date display format selector.
    - **AI Assistant Features**: Structured AI proposal cards switch and offline travel cache switch.
    - **Notifications & Alerts**: Trip departure and milestone reminder switches with save preferences button.
  - **Updated SettingsSection**: Refactored `features/profile/components/settings-section.tsx` to serve as the dedicated **Security & Session** view (verified account email badge, Supabase Auth v2 authentication provider info, and active session sign-out).
  - **Updated Navigation Hierarchy**:
    - Updated `NAV_ITEMS` in `features/profile/components/profile-editor.tsx` to 4 clean sections: **Overview** (`User`), **General** (`SlidersHorizontal`), **AI Usage** (`Sparkles`), and **Security** (`Shield`).
    - Handled URL query param synchronization (`?tab=overview|general|usage|security` with legacy `?tab=settings` alias support).
    - Updated mobile continuous view to render all 4 sections in order.
  - **Verification**: Verified with clean Next.js 16 production build (`npm run build`, exit code 0, 0 TypeScript errors).

- **Task 43 (General Preferences Full Database Persistence & AI Personalization)**:
  - **Schema & Database Sync**: Added `defaultCurrency`, `dateFormat`, `aiAutoPropose`, `emailNotifications`, `offlineMode`, and `travelPreferences` columns to the `Profile` model in `prisma/schema.prisma`. Successfully executed `npx prisma db push` and `npx prisma generate`.
  - **Server Actions & Validation**:
    - Added `updateGeneralPreferencesSchema` in `features/profile/schema.ts`.
    - Created `updateGeneralPreferences` Server Action in `features/profile/actions.ts` with Supabase authentication, schema validation, and cache revalidation.
    - Updated `getCurrentProfile()` to hydrate saved preference values from PostgreSQL into `ProfileWithStats`.
  - **UI Integration**:
    - Updated `GeneralSection` (`features/profile/components/general-section.tsx`) with an AI Travel Style & Dietary Guidance textarea and loading spinner state.
    - Connected `ProfileEditor` (`features/profile/components/profile-editor.tsx`) state to real database persistence with toast alerts.
  - **Verification**: Verified with clean Next.js 16 production build (`npm run build`, exit code 0, 0 TypeScript errors).

- **Task 44 (General Section — Instant Auto-Save Toasts & Clean Date Format Labels)**:
  - **Instant DB Auto-Save & Toasts**:
    - Created `handleUpdatePreference` callback in `features/profile/components/profile-editor.tsx` and wired to all controls in `features/profile/components/general-section.tsx`.
    - Every option change (currency select, date format select, AI proposal switch, offline cache switch, departure notifications switch) immediately saves to PostgreSQL and fires a descriptive Sonner toast (e.g. `"Default currency updated to EUR in database."`, `"Structured AI proposals enabled in database."`).
  - **Simplified Date Format Select**: Removed confusing `MMM D, YYYY` prefix syntax in favor of clean real-world date examples (`Oct 14, 2026`, `14/10/2026`, `2026-10-14`, `10/14/2026`).
- **Task 45 (Agent & Repository Documentation — AGENTS.md & README.md Comprehensive Guide)**:
  - **AGENTS.md Overhaul**: Preserved Next.js breaking changes agent rule block and authored a comprehensive guide for LLMs/AI assistants working on Prava AI. Documented the core philosophy ("Workspace First, AI Second", "The application remembers, the LLM does not"), complete routing architecture, full technology stack, feature-first codebase organization, Prisma database conventions (`syncUserProfile`, UUID PKs, cascade deletes), Supabase SSR & PKCE authentication, Gemini 2.5 Flash structured action proposals, calm productivity design standards (Cerulean `#2D9BF0`, shadcn/ui, no AI slop/glassmorphism), external API services, and strict developer/agent rules of engagement.
  - **README.md Overhaul**: Replaced the default `create-next-app` boilerplate with a comprehensive project README featuring badges, executive overview, feature breakdown across all 5 key modules, technology stack matrix, step-by-step setup and environment configuration guide, project structure, scripts, design philosophy, and documentation links.

## Current Architecture State
- **Framework**: Next.js 16.3.3 (App Router with Turbopack)
- **UI & React**: React 19.2.8 / `react-dom` 19.2.8
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 with Prava `#2D9BF0` Radiant Cerulean theme tokens (`#2D9BF0` primary, `#F0F8FF` accent)
- **UI Component Foundation**: Official `shadcn/ui` primitives (Button, Card, Dialog, Dropdown, Input, Label, Textarea, Avatar, Tabs, Tooltip, Select, Accordion, Switch, Separator, Skeleton, Sonner, Popover) with Lucide React icons
- **App Shell**: Desktop persistent fixed sidebar + sticky top bar with logged-in user profile pill
- **Backend / Auth Integration**: Supabase SSR clients ready (`@supabase/supabase-js`, `@supabase/ssr`), PKCE callback handler (`/auth/callback`), Google OAuth, Next.js 16 `proxy.ts` session refresh & route protection
- **Database & ORM**: PostgreSQL via Supabase, Prisma 7 ORM with `prisma.config.ts` and `@prisma/adapter-pg`
- **Image Storage**: Supabase Storage (`prava-media` bucket) with user-scoped paths and Server Action validation
- **Creator Identity**: Public creator profiles (`/u/[username]`) with reserved username blocking, published trip showcases, published stories showcase, and locked immutable unique handles
- **Community Forum**: Real forum feed with route advice, gear, recommendations, live reports, threads, upvoting, and trip cloning
- **AI Integration**: Gemini Flash with server-side context assembly, Postgres conversation & proposal persistence (`ai_conversations`, `ai_messages`, `ai_proposals`), multi-session conversation history switcher, and transactional proposal execution
- **Pricing & Tier Limits**: Free Explorer (10 trips limit, 30 AI messages/mo) vs. Pro Wanderer (25 trips limit, 150 AI messages/mo), real-time usage meters, monthly tracking history, and `UpgradeDialog`
- **Modules Implemented**: Dashboard, Trips CRUD, full Trip Workspace (7 sub-modules + Workspace AI Assistant with proposal mutations, multi-session history + Cover Imagery), Travel Essentials with live APIs (Weather, FX, REST Countries, OSM Maps, Emergency, Language), Community Forum (`/community`), Travel Stories & Guides Blog (`/stories`, `/stories/new`, `/stories/manage`, `/stories/[slug]`), Landing Page & Modern Auth (Email/Password + Google OAuth), Public Creator Profiles (`/u/[username]`), Account & Settings (`/profile`), Subscription & Usage (`/pricing`)
- **Package Manager**: `npm` (`package-lock.json` present)

## Important Implementation Decisions
- **Brand Palette (#2D9BF0)**: The interface uses the vibrant `#2D9BF0` Cerulean blue gradient with subtle ambient glows and smooth interactive pill highlights matching the official cross-road logo in `public/logo.png`.
- **Global Button Pointer**: All button and interactive elements carry explicit `cursor: pointer` behavior across the app.
- **shadcn/ui Standards**: Standardized on official `shadcn/ui` components from `ui.shadcn.com` rather than custom hand-crafted UI utilities.
- **Locked Username Identifier**: Usernames are assigned dynamically on registration with smart collision detection and locked permanently in the Account page as the unique creator handle (`@username`).
- **Consolidated Account Hub**: Settings and workspace preferences reside directly inside the Account page tabs (`/profile`), removing navigation clutter.
- **Subscription & Usage Hub**: The workspace `/pricing` page serves as an active billing, quota monitoring, and monthly credit usage tracking dashboard.
- **Authentication & Callback**: Server-side PKCE code exchange in `/auth/callback/route.ts` ensures immediate session cookie persistence without client-side race conditions or reload loops.

## Next Steps
- Automated testing harness with Vitest / Playwright.






