<div align="center">

# Prava AI V2
### The AI-Augmented Travel Workspace

**Workspace First, AI Second.** A persistent, structured productivity workspace for modern travelers — combining Notion-grade trip organization with contextual Gemini intelligence.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_PostgreSQL-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=flat&logo=google)](https://deepmind.google/technologies/gemini/)

</div>

---

## 🌟 Overview

Travel planning is notoriously fragmented across disconnected spreadsheets, note apps, booking emails, weather forecasts, and chat threads. General-purpose AI chatbots can suggest an itinerary, but they cannot maintain persistent state, reconcile budgets, or provide an ongoing source of truth before, during, and after travel.

**Prava AI** solves this by unifying trip planning, logistics, financial tracking, travel reference utilities, and community discovery into a single durable workspace. Every workflow is 100% usable manually without AI, while Google Gemini 2.5 Flash acts as a powerful accelerant layered on top of your persisted trip data.

---

## ✨ Core Features

### 🧳 1. Trip Workspace (7 Integrated Modules)
Each trip operates in its own dedicated, high-performance workspace driven by accessible `shadcn/ui` tabs:
- **Overview**: High-level trip summary, countdown, key statistics, quick-action cards, and Unsplash destination cover photography.
- **Itinerary**: Day-by-day activity timelines, scheduled hours, locations, cost tracking, and drag-ready ordering.
- **Accommodations**: Stay bookings, check-in/check-out dates, addresses, confirmation codes, and provider contacts.
- **Expense Tracker**: Real-time spending tracker with category breakdown analytics (Lodging, Food, Transport, Activities, Shopping, Other) and currency formatting.
- **Notes**: Rich Markdown travel notes with pinning, categories, and fast full-text searching.
- **Checklist**: Packing lists and pre-departure tasks with interactive completion toggles, due dates, categories, and edit dialogs.
- **Links**: Reference bookmarks, reservation links, and travel inspiration with instant external redirection.

### 🤖 2. Context-Aware AI Assistant & Structured Action Proposals
- **"The Application Remembers, The LLM Does Not"**: The server dynamically assembles active trip context (itinerary items, stays, expenses, and notes) and feeds it to Gemini 2.5 Flash.
- **Multi-Session History**: Create multiple chat threads per trip, revisit historical discussions, or initiate fresh conversations anytime.
- **Interactive Proposal Cards (`AiProposal`)**: When asked to suggest additions or schedule changes, Gemini outputs structured JSON proposals. You review visual diffs in `AiProposalCard`, select individual items, and accept changes. Prava then executes an atomic Prisma `$transaction` that modifies real database records.

### 🌍 3. Travel Essentials (Real-Time Live Data)
- **Weather Forecast**: Powered by OpenWeather API with 5-day / 3-hour granular timelines, atmospheric matrix (humidity, wind, precipitation probability, pressure, UV index), and debounced city auto-suggestions.
- **Currency Exchange & Trends**: Real-time European Central Bank rates via the Frankfurter API, interactive multi-timeframe SVG performance line charts (7D, 1M, 3M, 1Y), and personal exchange rate watchlists.
- **Country Guide**: Live profiles for 250+ nations via REST Countries v3.1 (capitals, languages, currencies, flags, and timezones).
- **Interactive Maps**: OpenStreetMap & Leaflet mapping with Nominatim geocoding.
- **Emergency & Language**: Verified international emergency service numbers and essential local travel vocabulary phrases.

### 👥 4. Community Discovery & Creator Hub
- **Curated Itineraries**: Discover itineraries crafted for world-class destinations (Japan, Amalfi Coast, Swiss Alps, Paris, Bali) with **1-Click Cloning** into your private workspace.
- **Travel Stories & Guides**: Long-form Markdown travel blog posts written by the community with linked trips and reading time estimates.
- **Community Forum**: Interactive discussion feed with route advice, gear recommendations, local tips, and community upvoting.
- **Public Creator Profiles (`/u/[username]`)**: Showcasing verified creators, bios, published itineraries, and travel stories under an immutable `@username` handle.

### ⚙️ 5. Account, Settings & Quota Management
- **GitHub-Style Settings Hub (`/profile`)**: Modular vertical navigation covering Profile Overview, General Preferences, AI Usage, and Security.
- **Instant Auto-Save**: Currency preferences, date format styling, AI auto-proposal switches, and notification toggles persist instantly with real-time toast feedback.
- **Subscription & Quota Tracking (`/pricing`)**: Visual meters tracking workspace trip limits and monthly AI credit quotas (Free Explorer: 10 trips / 30 credits; Pro Wanderer: 25 trips / 150 credits) with historical monthly logs.
- **Offline Sync**: Client-side IndexedDB caching via `idb` with automatic background synchronization when internet connectivity resumes.

---

## 🛠️ Technology Stack

| Domain | Technology | Description |
|---|---|---|
| **Framework** | [Next.js 16.3.3](https://nextjs.org/) | App Router, React Server Components, Server Actions, `proxy.ts` |
| **Frontend UI** | [React 19.2.8](https://react.dev/) | Concurrent rendering, modern hooks, Transitions |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | CSS-first configuration, Prava Cerulean `#2D9BF0` design tokens |
| **UI Primitives** | [shadcn/ui](https://ui.shadcn.com/) / Radix | Accessible Dialog, Tabs, Select, Popover, Calendar, Switch, Accordion |
| **Database** | [PostgreSQL (Supabase)](https://supabase.com/) | Relational database with connection pooling |
| **ORM** | [Prisma ORM 7.x](https://www.prisma.io/) | Type-safe queries with `@prisma/adapter-pg` driver |
| **Authentication** | [Supabase Auth](https://supabase.com/docs/guides/auth) | SSR authentication, server-side PKCE code exchange, Google OAuth |
| **Storage** | [Supabase Storage](https://supabase.com/docs/guides/storage) | Media bucket with client-side HTML5 Canvas auto-downscaling |
| **AI Integration** | [Google Gemini 2.5 Flash](https://deepmind.google/technologies/gemini/) | `@google/genai` SDK with structured proposal schemas |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, consistent vector icons |
| **Validation** | [Zod](https://zod.dev/) | Server-side validation for all Server Actions and AI responses |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Package Manager**: **`npm`** (do not use `pnpm` or `yarn`)
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
Copy the `.env.example` template to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in the required configuration keys:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-anon-key
SUPABASE_SECRET_KEY=your-supabase-secret-service-role-key

# Database Connections (Postgres via Supabase)
DATABASE_URL=postgresql://postgres.your-ref:your-password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.your-ref:your-password@aws-0-region.pooler.supabase.com:5432/postgres

# AI Provider (Google Gemini)
GEMINI_API_KEY=your-google-gemini-api-key

# External APIs
UNSPLASH_ACCESS_KEY=your-unsplash-access-key
OPENWEATHER_API_KEY=your-openweather-api-key

# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Push Database Schema
Apply the Prisma schema directly to your Supabase PostgreSQL instance:
```bash
npx prisma db push
npx prisma generate
```

### 5. Launch Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
prava_v2/
├── app/                              # Next.js App Router (pages, layouts, route handlers)
│   ├── (app)/                        # Protected workspace layout group
│   │   ├── dashboard/                # Main user dashboard
│   │   ├── trips/                    # Trips list & [tripId] workspace tabs
│   │   ├── travel-essentials/        # Weather, FX, Maps, Guides, Emergency, Language
│   │   ├── community/                # Community hub & forum
│   │   ├── stories/                  # Travel stories & creator guides
│   │   ├── profile/                  # Account settings hub
│   │   └── pricing/                  # Usage quotas & tier billing
│   ├── auth/                         # Sign In / Sign Up & PKCE callback handler
│   ├── stories/[slug]/               # Public story reader
│   ├── u/[username]/                 # Public creator profile
│   └── page.tsx                      # Public landing page
├── components/                       # Shared UI components
│   ├── app-shell/                    # Fixed Sidebar, TopBar, ConfirmDeleteDialog
│   ├── storage/                      # ImageUpload, CoverImage, AvatarUpload
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
│   ├── ai/                           # Gemini client initialization
│   ├── auth/                         # Safe profile sync helper (profiles_email_key fix)
│   ├── db.ts                         # Prisma client with pg adapter
│   ├── offline/                      # IndexedDB offline store & synchronization
│   ├── storage/                      # Supabase Storage client
│   ├── supabase/                     # Supabase SSR client & middleware
│   └── utils/                        # Canvas image resizer & string helpers
├── prisma/                           # schema.prisma & PostgreSQL migrations
├── services/                         # External integrations (context-builder.ts, unsplash.ts)
├── docs/                             # Architecture, design system & product vision
├── memory.md                         # Detailed project memory & completed task log
└── AGENTS.md                         # Comprehensive AI / LLM development guide
```

---

## 📜 Key Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Starts local Next.js dev server on `http://localhost:3000` with Turbopack |
| `npm run build` | Compiles production bundle with strict TypeScript verification |
| `npm run start` | Runs the compiled production server |
| `npm run lint` | Checks codebase with ESLint 9 |
| `npx prisma db push` | Syncs schema changes directly to Supabase PostgreSQL |
| `npx prisma generate` | Regenerates the Prisma TypeScript client |
| `npx prisma studio` | Opens interactive web GUI to view and edit database rows |

---

## 🎨 Design Philosophy

Prava AI adheres to strict visual and functional guidelines:
- **Calm & Minimal**: Prioritizes white space, clean lines, and neutral typography (Inter / Geist) over visual noise.
- **Productivity-First**: Modeled after Notion, Linear, GitHub, and Stripe Dashboard.
- **No AI Slop**: Explicitly forbids bubble chat interfaces, glassmorphism, heavy gradients, or glowing neon animations.
- **Vibrant Accent**: Powered by Prava Cerulean `#2D9BF0` with gentle `#F0F8FF` active highlights.
- **Accessible & Responsive**: Fully responsive layout with a fixed desktop sidebar, mobile drawer, and strict `cursor: pointer` interactive affordances.

---

## 📚 Documentation & References

- [Product Vision](docs/01-product-vision.md) — Product philosophy, problem statement, and user personas.
- [Design System](docs/02-design-system.md) — Visual language, color tokens, typography, and component behavior.
- [System Architecture](docs/03-system-architecture.md) — Request flow, modular design, and storage strategy.
- [Implementation Roadmap](docs/implementation-roadmap.md) — Step-by-step rollout plan and decision log.
- [Development Memory](memory.md) — Continuous log of all completed phases, architectural changes, and bug fixes.
- [Agent Guide](AGENTS.md) — Architectural rules and guidelines for AI coding assistants.

---

## 📄 License

This project is private and proprietary. All rights reserved.
