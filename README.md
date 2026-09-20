<div align="center">

# Prava AI V2
### The AI-Augmented Travel Workspace

**Workspace First, AI Second.** A persistent, structured productivity workspace for modern travelers — combining Linear & Notion-grade trip organization with contextual Gemini 3.x intelligence.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_PostgreSQL-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-3.8_%2F_3.7_%2F_3.6_Flash-4285F4?style=flat&logo=google)](https://deepmind.google/technologies/gemini/)

</div>

---

## 🌟 Overview & Product Philosophy

Travel planning is notoriously fragmented across disconnected spreadsheets, note apps, booking confirmations, weather forecasts, and chat threads. General-purpose chatbots can spit out generic bullet points, but they cannot maintain persistent state, reconcile budgets, or act as an ongoing source of truth before, during, and after travel.

**Prava AI V2** rejects both conversational "AI slop" and monolithic 15-field creation forms. Instead, it provides a high-density, high-efficiency travel workspace modeled after **Linear, Notion, GitHub, and Stripe Dashboard**.

- **Workspace First**: Structured, durable, user-owned data is the core foundation. Every single workflow can be completed 100% manually with zero AI dependency.
- **AI Second**: The AI assistant (**Ichinose**) is an assistive accelerant layered on top of your persisted workspace data. It suggests, drafts, summarizes, and generates reviewable structured action proposals.
- **"The Application Remembers, The LLM Does Not"**: The LLM is stateless. Continuity, context assembly, and conversation histories are persisted in PostgreSQL via Prisma.

---

## ✨ Key Features & Architecture

### 🧳 1. Trip Workspace (7 Integrated Sub-Modules)
Every trip operates in its own dedicated workspace powered by router-driven, accessible `shadcn/ui` tabs:

1. **Overview**: High-level trip metrics, countdown timer, quick actions, and Unsplash tour-vibe destination cover photography.
2. **Itinerary & AI Kickstart**:
   - **Empty-State AI Kickstart**: When an itinerary has 0 activities, travelers can one-click kickstart a tailored multi-day draft. Ichinose calculates the trip duration from start/end dates and creates a structured proposal.
   - **Zero-AI Manual Entry**: "Plan Manually" modal trigger is always accessible for manual timeline scheduling.
   - Day-by-day tab filters, activity times, locations, and daily cost totals.
3. **Accommodations**: Stay bookings, check-in/out dates, addresses, confirmation codes, and provider contacts.
4. **Expense Tracker**: Real-time spending logs with category breakdown metrics (Lodging, Food, Transport, Activities, Shopping, Other) and preferred currency formatting.
5. **Notes**: Rich Markdown documentation with note pinning, category filtering, and instant search.
6. **Checklist**: Packing lists and pre-departure tasks with interactive completion toggles, due dates, categories, and inline editing.
7. **Links**: Reference bookmarks, reservation links, and travel inspiration with fast external routing.

---

### 🤖 2. Ichinose AI Assistant & Transactional Proposals

- **Gemini 3.x Multi-Tier Cascade**:
  - **Planning & Workspace Mutations**: Automatically cascades across `gemini-3.8-flash` → `gemini-3.7-flash` → `gemini-3.6-flash` → `gemini-2.5-flash` to gracefully withstand free-tier daily rate limits (20–500 RPD) or transient quota limits.
  - **Conversational Chat & Travel Essentials**: High-speed cascade via `gemini-3.1-flash-lite` and OpenRouter Free (Nemotron 3.5).
- **History-Aware Context Continuity**:
  - Intelligent intent classifier understands follow-ups (e.g., *"Try again"*, *"Retry"*, *"Redo"*, *"Add them"*), preserving context from previous planning turns without resetting to conversational greetings.
- **Transactional Proposal Engine (`AiProposal`)**:
  - Gemini outputs structured JSON payloads conforming to `aiProposalPayloadSchema`.
  - The traveler visually reviews proposed changes in `AiProposalCard` with field diffs, checkboxes, and overflow-proof actions (`Accept All`, `Apply Selected`, `Reject`).
  - On acceptance, an atomic Prisma `$transaction` commits validated records into PostgreSQL.
- **Expanded Productivity Drawer**:
  - Multi-session thread history (up to 15 messages per thread) with thread creation, inline renaming, and deletion.
  - Generous desktop drawer width (`440px` to `500px`) with theme synchronization across Light and Dark modes.
  - Dynamic user profile avatars in conversation bubbles.

---

### 🌍 3. Live Travel Essentials

- **Live Weather Forecast**: Powered by OpenWeather API with 5-day / 3-hour granular timelines, atmospheric matrix (humidity, wind speed, precipitation probability, pressure, UV index), and debounced city auto-suggestions.
- **Currency Exchange & Trend Analytics**: Live European Central Bank rates via the Frankfurter API, interactive multi-timeframe SVG performance line charts (7D, 1M, 3M, 1Y), and personal watchlists.
- **Country Guide**: Live country profiles for 250+ nations via REST Countries v3.1 (capitals, languages, currencies, flags, and timezones).
- **Interactive Maps**: OpenStreetMap & Leaflet integration with Nominatim geocoding.
- **Emergency & Language Essentials**: Verified international emergency telephone numbers and essential local vocabulary phrasebooks.

---

### 👥 4. Community Hub, Travel Stories & Creator Profiles

- **Curated Itineraries**: Handcrafted itineraries for world-class destinations (Japan, Amalfi Coast, Swiss Alps, Paris, Bali) with **1-Click Workspace Cloning**.
- **Travel Stories & Guides**: Long-form Markdown travel blog posts with linked trips and reading time estimates.
- **Discussion Forum**: Community discussion feed with route advice, gear recommendations, local tips, and voting.
- **Public Creator Profiles (`/u/[username]`)**: Showcases verified creators, bios, published itineraries, and travel stories under an immutable `@username` handle.

---

### ⚙️ 5. Account, Settings & Quota Governance

- **Consolidated Account Hub (`/profile`)**: All-in-one settings covering Profile Identity, General Preferences, AI Usage meters, and Security.
- **Tier Quota Governance (`/pricing`)**:
  - **Free Explorer**: Up to 10 trips, 30 AI planning credits/month.
  - **Pro Wanderer**: Up to 25 trips, 150 AI planning credits/month.
  - Real-time usage tracking meters and 6-month historical logs.
- **Safe Profile Sync (`syncUserProfile`)**:
  - Robust Supabase profile sync prevents `profiles_email_key` collisions when users switch auth providers or re-register.
- **Smart Username Generator**: Normalizes names, checks database uniqueness, and validates against reserved routes.
- **Client-Side Image Optimization**: HTML5 Canvas auto-downscales profile avatars to 512x512 WebP/JPEG before upload to minimize storage and bandwidth.
- **Offline Cache**: Client-side IndexedDB caching via `idb` with automatic background synchronization when online connectivity resumes.

---

## 🛠️ Technology Stack

| Domain | Technology | Key Details |
|---|---|---|
| **Framework** | [Next.js 16.3.3](https://nextjs.org/) | App Router, React Server Components, Server Actions, `proxy.ts` |
| **Runtime & UI** | [React 19.2.8](https://react.dev/) | Concurrent rendering, modern hooks, Suspense transitions |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | CSS-first configuration via `@tailwindcss/postcss`, Cerulean `#2D9BF0` |
| **UI Primitives** | [shadcn/ui](https://ui.shadcn.com/) & Radix | Dialog, Tabs, Select, Popover, Calendar, Switch, Accordion, Avatar |
| **Database** | [PostgreSQL (Supabase)](https://supabase.com/) | Relational database with PgBouncer connection pooling |
| **ORM** | [Prisma ORM 7.x](https://www.prisma.io/) | Type-safe queries using `@prisma/adapter-pg` driver |
| **Authentication** | [Supabase Auth](https://supabase.com/docs/guides/auth) | SSR authentication, server-side PKCE code exchange, Google OAuth |
| **Storage** | [Supabase Storage](https://supabase.com/docs/guides/storage) | User-scoped media bucket with client-side Canvas auto-downscaling |
| **AI Provider** | [Google Gemini 3.x](https://deepmind.google/technologies/gemini/) | `@google/genai` SDK (`gemini-3.8-flash`, `3.7`, `3.6`, `3.1-flash-lite`) |
| **Offline Sync** | [IndexedDB via `idb`](https://github.com/jakearchibald/idb) | Client-side offline cache and synchronization engine |
| **External APIs** | Unsplash, OpenWeather, Frankfurter FX, REST Countries | Live data integrations with graceful fallbacks |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Package Manager**: **`npm`** (always use `npm` to preserve `package-lock.json`)
- A [Supabase](https://supabase.com/) project (PostgreSQL database & Auth)
- A [Google AI Studio](https://aistudio.google.com/) API Key for Gemini

### 1. Clone the Repository
```bash
git clone https://github.com/AvatarN03/Prava-V2.git
cd Prava-V2
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your configuration keys:
```env
# 1. Supabase Auth & Project Keys
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-anon-key
SUPABASE_SECRET_KEY=your-supabase-secret-service-role-key

# 2. Database Connections (PostgreSQL via Supabase)
DATABASE_URL=postgresql://postgres.your-ref:your-password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.your-ref:your-password@aws-0-region.pooler.supabase.com:5432/postgres

# 3. AI Provider (Google Gemini)
GEMINI_API_KEY=your-google-gemini-api-key

# Optional Model Overrides
# GEMINI_TRIPS_MODEL=gemini-3.8-flash
# GEMINI_CONVERSATIONAL_MODEL=gemini-3.1-flash-lite

# 4. External Live APIs
UNSPLASH_ACCESS_KEY=your-unsplash-access-key
OPENWEATHER_API_KEY=your-openweather-api-key

# 5. Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Push Database Schema
Sync the Prisma schema to your PostgreSQL database:
```bash
npx prisma db push
npx prisma generate
```

### 5. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💳 Polar Subscription Billing (Sandbox Mode)

Prava integrates with **Polar** for recurring subscriptions (`Prava Pro`).

### Configuration
Configure your `.env` with:
```bash
POLAR_ACCESS_TOKEN=polar_oat_...
POLAR_PRODUCT_ID=...
POLAR_WEBHOOK_SECRET=polar_whsec_...
POLAR_SERVER=sandbox
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Webhook Tunneling (Local Development)
To test webhooks locally, install the Polar CLI and forward events to Prava:
```bash
polar login --sandbox
polar listen --sandbox http://localhost:3000/api/webhooks/polar
```
Copy the generated webhook signing secret into `POLAR_WEBHOOK_SECRET`.

For full documentation on testing checkouts, customer portals, and production deployment, see [docs/polar-subscription.md](docs/polar-subscription.md).

---

## 📁 Codebase Organization

```
prava_v2/
├── app/                              # Next.js App Router (pages, layouts, route handlers)
│   ├── (app)/                        # Protected workspace layout group
│   │   ├── dashboard/                # Cross-trip overview & metrics
│   │   ├── trips/                    # Trips list & [tripId] 7-tab workspace
│   │   ├── travel-essentials/        # Weather, FX, Maps, Guides, Emergency, Language
│   │   ├── community/                # Community hub & 1-click cloner
│   │   ├── forum/                    # Community discussion forum
│   │   ├── stories/                  # Travel stories & markdown creator
│   │   ├── profile/                  # Account & Settings hub
│   │   └── pricing/                  # Usage quotas & tier billing
│   ├── auth/                         # Sign In / Sign Up & PKCE callback handler
│   ├── stories/[slug]/               # Public story reader
│   ├── u/[username]/                 # Public creator showcase
│   └── page.tsx                      # Dynamic landing page
├── components/                       # Shared UI components
│   ├── app-shell/                    # Fixed Sidebar, TopBar, ConfirmDeleteDialog
│   ├── storage/                      # AvatarUpload, CoverImage, ImageUpload
│   └── ui/                           # shadcn/ui primitives (button, card, dialog, etc.)
├── features/                         # Feature-first domain modules
│   ├── blog/                         # Story editor, markdown renderer, actions
│   ├── community/                    # Itinerary cloner, forum feed, seed templates
│   ├── dashboard/                    # Metric queries & summary components
│   ├── pricing/                      # Tier configurations & quota actions
│   ├── profile/                      # Username generator & account preferences
│   ├── storage/                      # Supabase storage server actions
│   ├── travel-essentials/            # Live Weather, FX, Country, and Maps logic
│   ├── trip-workspace/               # 7 workspace tab views + AI proposal engine
│   └── trips/                        # Trips CRUD, Unsplash picker, DatePickers
├── lib/                              # Core singletons and utilities
│   ├── ai/                           # Gemini client initialization & model cascade
│   ├── auth/                         # Safe profile sync helper (syncUserProfile)
│   ├── db.ts                         # Prisma client with pg adapter
│   ├── offline/                      # IndexedDB offline store & synchronization
│   ├── storage/                      # Supabase Storage client
│   ├── supabase/                     # Supabase SSR client & proxy middleware
│   └── utils/                        # Canvas image resizer & string helpers
├── prisma/                           # schema.prisma & PostgreSQL migrations
├── services/                         # External integrations (trip-agent-graph, unsplash)
├── memory.md                         # Continuous task memory & completed phases log
└── AGENTS.md                         # Architecture rules & agent pair programming guidelines
```

---

## 📜 Key Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Starts local Next.js dev server on `http://localhost:3000` with Turbopack |
| `npm run build` | Compiles production bundle with strict TypeScript verification |
| `npm run start` | Runs the compiled production build |
| `npm run lint` | Runs ESLint 9 checks |
| `npx prisma db push` | Pushes schema changes directly to Supabase PostgreSQL |
| `npx prisma generate` | Regenerates Prisma TypeScript client |
| `npx prisma studio` | Opens interactive database browser |

---

## 🎨 Design System & UI Standards

Prava AI adheres to strict productivity design guidelines:
- **Calm & Minimal**: Focuses on whitespace, clear typography hierarchy, and content density over visual clutter.
- **Productivity First**: Modeled after tools like Notion, Linear, GitHub, and Stripe Dashboard.
- **No AI Slop**: Explicitly avoids chat-first chrome, floating bubbles, neumorphism, heavy gradients, or glowing neon animations.
- **Brand Palette**: Prava Cerulean Blue (`#2D9BF0` primary, `#F0F8FF` active accents, `#1E293B` slate text, `#F8FAFC` slate background).
- **Interactive Affordances**: All interactive surfaces, buttons, and links strictly render `cursor: pointer`.

---

## 📄 License

This project is private and proprietary. All rights reserved.
