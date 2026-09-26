# Prava AI — Design System & Visual Specification

## Metadata

| Field | Value |
|---|---|
| **Project Name** | Prava AI (v2.0 Workspace) |
| **Document** | Design System & Visual Specification |
| **Version** | 2.0 (Production Master) |
| **Status** | Active / Canonical |
| **Aligned With** | `docs/01-product-vision.md`, `docs/03-system-architecture.md`, `AGENTS.md` |
| **Last Updated** | 2026-09-26 |

---

## 1. Executive Design Philosophy

### Product Vision: "Workspace First, AI Second"
Prava AI is an **AI-augmented travel workspace** modeled after high-efficiency productivity tools (**Notion, Linear, GitHub, Stripe Dashboard**).

- **Workspace First**: Structured, persistent, user-owned data is the core product. Every workflow (itineraries, accommodations, expenses, checklists, notes, essentials) works 100% manually without AI involvement.
- **AI Second**: AI is an assistive accelerant (named **Ichinose**), not a conversational gatekeeper.
- **Explicitly Rejected Aesthetics**: The design system strictly forbids "AI slop", chat-first chrome, floating conversational bubbles, neumorphism, heavy gradients, or glowing neon animations.
- **Content-First**: Trip data is the visual subject. The UI frame recedes into calm, balanced typography and generous whitespace.

---

## 2. Canonical Typography System

Prava AI utilizes a distinct, three-tier typographic hierarchy defined in `app/layout.tsx` and mapped via Tailwind CSS v4 in `app/globals.css`:

```
┌────────────────────────────────────────────────────────────────────────┐
│  Tier 1: Brand Logotype & High-Prestige Identity                       │
│  Font: Cinzel (var(--font-brand) / font-brand)                         │
│  Usage: "PRAVA" wordmark, brand crests, high-prestige headlines        │
├────────────────────────────────────────────────────────────────────────┤
│  Tier 2: Primary UI Structure & Data Hierarchy                         │
│  Font: Sora (var(--font-sora) / font-sans)                             │
│  Usage: Headings, UI labels, buttons, navigation, metrics, tables      │
├────────────────────────────────────────────────────────────────────────┤
│  Tier 3: Editorial Warmth & Literary Travel Flourish                   │
│  Font: Newsreader (var(--font-newsreader) / font-serif italic)         │
│  Usage: Subtitles, traveler descriptions, destination highlights, dates│
└────────────────────────────────────────────────────────────────────────┘
```

### Font Roles & Tailwind Classes

| Typeface | Tailwind Utility | CSS Variable | Character & Usage |
|---|---|---|---|
| **Cinzel** | `font-brand` | `var(--font-brand)` | Classical chiselled serif. Reserved for brand marks, logotype (`tracking-[0.24em] uppercase`), and hero brand compositions. |
| **Sora** | `font-sans` | `var(--font-sora)` | Modern geometric sans-serif. Used for all core interface controls, page titles, section headers, tables, buttons, and numeric data. |
| **Newsreader** | `font-serif italic` | `var(--font-newsreader)` | High-end literary editorial serif. Used in italic normal weight (`font-serif italic font-normal`) for destination subtitles, personal notes, thesis quotes, and human touches. |

### Type Scale & Standard Usages

| Token | Class Pattern | Typical Application |
|---|---|---|
| **Display / Hero Title** | `font-sans text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight` | Hero headlines, major landing banners. Often pairs with `font-serif italic` inline emphasis. |
| **Page / Workspace Title** | `font-sans text-2xl sm:text-3xl font-semibold tracking-tight text-foreground` | Trip workspace titles, Dashboard greeting, Settings page titles. |
| **Section Heading** | `font-sans text-lg sm:text-xl font-semibold tracking-tight text-foreground` | Major card group titles, modal headers, list headers. |
| **Card / Widget Title** | `font-sans text-sm sm:text-base font-semibold tracking-tight text-foreground` | Recent trips card title, financial snapshot title, essentials widget header. |
| **Category Eyebrow / Kicker** | `font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] sm:tracking-[0.18em] text-slate-400 dark:text-slate-500` | Section kickers ("TRAVEL WORKSPACE", "WORKSPACE HUB", "UPCOMING TRIP"). |
| **Default Body Copy** | `font-sans text-xs sm:text-sm font-normal text-muted-foreground leading-relaxed` | General descriptions, helper text, explanations. |
| **Editorial Description** | `font-serif italic text-sm sm:text-base font-normal text-muted-foreground leading-relaxed` | Trip user descriptions, destination narratives, human travel reflections. |
| **UI Labels & Navigation** | `font-sans text-xs font-medium tracking-normal` | Sidebar links, tab triggers, dropdown menu items, input labels. |
| **Badges & Micro Data** | `font-sans text-[10px] font-semibold tracking-wide uppercase tabular-nums` | Status pills, countdown tags ("Happening now", "Starts today", "3 days left"). |
| **Financial / Numeric Data** | `font-sans text-lg sm:text-xl font-semibold tabular-nums text-foreground` | Total spend, budget allocations, remaining funds, currency figures. |

---

## 3. Color Architecture & Theme System

Prava enforces a dual-theme architecture (Light & Dark) powered by `@custom-variant dark (&:where(.dark, .dark *))` and standard CSS variables.

### Color Tokens

| Semantic Role | Light Mode Value | Dark Mode Value | Usage |
|---|---|---|---|
| **`--primary` (Prava Cerulean)** | `rgb(45, 155, 240)` (`#2D9BF0`) | `rgb(45, 155, 240)` (`#2D9BF0`) | Primary action buttons, active navigation indicators, brand accents. |
| **`--primary-foreground`** | `rgb(255, 255, 255)` | `rgb(255, 255, 255)` | Text on primary buttons. |
| **`--background`** | `rgb(250, 250, 249)` (`#FAFAF9`) | `rgb(10, 15, 29)` (`#0A0F1D`) | Root viewport background. |
| **`--card` / Surface** | `rgb(255, 255, 255)` (`#FFFFFF`) | `rgb(15, 23, 42)` (`#0F172A`) | Cards, panels, modal content surfaces. |
| **`--foreground`** | `rgb(17, 24, 39)` (slate-900) | `rgb(241, 245, 249)` (slate-100) | Primary text color. |
| **`--muted`** | `rgb(244, 247, 250)` | `rgb(30, 41, 59)` | Inactive pills, progress bar tracks, code blocks. |
| **`--muted-foreground`** | `rgb(100, 116, 139)` (slate-500) | `rgb(148, 163, 184)` (slate-400) | Secondary descriptions, timestamps, helper text. |
| **`--border`** | `rgb(226, 232, 240)` (slate-200) | `rgb(51, 65, 85)` (slate-700) | Card borders, dividers, inputs, structural rules. |
| **`--success`** | `rgb(22, 163, 74)` (green-600) | `rgb(74, 222, 128)` (green-400) | Completed tasks, synced state, positive balances. |
| **`--warning`** | `rgb(245, 158, 11)` (amber-500) | `rgb(251, 191, 36)` (amber-400) | Approaching budget limits, urgent deadlines. |
| **`--destructive`** | `rgb(220, 38, 38)` (red-600) | `rgb(248, 113, 113)` (red-400) | Destructive deletions, over-budget warnings, errors. |

### The Sidebar Opposite-Theme Pattern
The desktop navigation sidebar (`components/app-shell/sidebar.tsx`) uses a deliberate opposite-theme design to provide a sturdy architectural anchor:
- **Light Theme Workspace**: The desktop sidebar renders in deep navy slate (`#090E1A`) with soft white brand text and slate-300 navigation links.
- **Dark Theme Workspace**: The desktop sidebar renders with crisp, calibrated slate borders and subtle contrast matching the `#0A0F1D` app frame.

---

## 4. Component Standards & UI Primitives

All components use official `shadcn/ui` primitives located in `@/components/ui/`.

### 1. Cards
- **Geometry**: Rectangular with subtle softness: `rounded-md` or `rounded-sm`. Never pill-shaped; never sharp brutalist edges.
- **Surface**: `bg-card border border-border/80 shadow-xs`.
- **Header**: Compact padding (`p-4 pb-3 sm:p-5 sm:pb-3 border-b border-border/60`).
- **Separation**: Achieved primarily through spacing and crisp 1px borders, rather than heavy drop-shadows.

### 2. Buttons
- **Primary**: `bg-[#2D9BF0] hover:bg-[#2587D3] text-white font-sans text-xs font-semibold rounded-xs sm:rounded-sm shadow-xs active:scale-[0.99] cursor-pointer`.
- **Outline / Secondary**: `border-border/80 hover:border-primary/50 hover:bg-primary/5 text-foreground font-sans text-xs font-medium rounded-xs cursor-pointer`.
- **Ghost**: `hover:bg-accent/40 text-muted-foreground hover:text-foreground font-sans text-xs font-medium cursor-pointer`.

### 3. Badges & Status Pills
- **Status Indicators**: `font-sans text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-xs shadow-2xs`.
- **Numeric Badges**: Always specify `tabular-nums` for clean visual alignment across counters and currencies.

### 4. Inputs & Form Fields
- `border-border/80 bg-background focus-visible:ring-1 focus-visible:ring-primary font-sans text-xs rounded-xs h-8 sm:h-9`.

---

## 5. AI Assistant Integration: "Ichinose"

Prava rejects generic chat-first AI UI. AI in Prava is structured, disciplined, and branded:
- **Identity**: **Ichinose — Prava Travel Assistant**
- **Avatar Asset**: `/avatars/ichinose.png` (rendered in a crisp circle with `ring-1 ring-primary/40`).
- **Quota Meter**: Displays remaining monthly AI credits (`font-sans text-[10px] font-semibold tabular-nums`).
- **Action Mode**: Proposes structured mutations (`AiProposalCard`) with visual field diffs rather than unformatted chat output.
- **Zero Gating**: All workspace modules operate 100% manually even if AI credits are zero.

---

## 6. AI Agent Implementation Cheat Sheet

When implementing or modifying pages, agents must adhere to the following strict conventions:

### Quick Typography Reference

```tsx
// 1. Brand Heading / Wordmark
<span className="font-brand font-medium tracking-[0.24em] text-base uppercase text-white dark:text-slate-900">
  Prava
</span>

// 2. Page Header with Greeting & Editorial Flourish
<h1 className="font-sans text-2xl sm:text-3xl font-light tracking-tight text-foreground">
  Good morning, <span className="font-serif italic font-normal text-foreground">Aarav</span>
</h1>

// 3. Section Eyebrow / Kicker
<span className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 select-none">
  Upcoming Trip
</span>

// 4. Trip Title
<h2 className="font-sans text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
  Tokyo & Kyoto Expedition
</h2>

// 5. Travel Notes / Description
<p className="font-serif italic text-sm sm:text-base text-muted-foreground leading-relaxed">
  Exploring historic temples, bamboo groves, and neighborhood ramen shops.
</p>

// 6. Metrics & Financial Balances
<div className="font-sans text-xl font-semibold tabular-nums text-foreground">
  ₹84,200
</div>

// 7. Navigation Links & Items
<Link className="font-sans text-xs font-medium tracking-normal text-muted-foreground hover:text-foreground">
  Overview
</Link>

// 8. Countdown & Status Pills
<Badge className="font-sans text-[10px] font-semibold tabular-nums tracking-wide uppercase">
  Starts in 3 days
</Badge>
```

### 6-Tier Import Hierarchy Rule
Every file must strictly format imports into the 6 designated tiers separated by single blank lines:
1. Inbuilt packages (`react`, `node:*`)
2. Installed packages (`next/*`, `lucide-react`, `motion/*`, `sonner`, `@prisma/*`)
3. Components (`@/components/*`, `@/features/*/components/*`)
4. Contexts & Providers (`@/providers/*`, `@/features/*/context/*`)
5. Services, Lib & Utils (`@/lib/*`, `@/features/*/actions.ts`, `@/services/*`)
6. Constants, Types & Styles (`@/types/*`, `@/features/*/types.ts`, `./*.css`)

---

## 7. Change History

| Version | Date | Author | Description |
|---|---|---|---|
| 1.0 | 2026-08-06 | Prashanth Naidu | Initial design system draft. |
| 2.0 | 2026-09-26 | Antigravity AI | Canonical v2.0 update: Added Cinzel, Sora, and Newsreader three-tier typography hierarchy, dark theme specifications, Ichinose assistant integration, opposite-theme sidebar rules, and agent reference guidelines. |
