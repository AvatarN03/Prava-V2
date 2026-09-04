# Prava AI

## System Architecture

### Metadata

| Field | Value |
|---|---|
| Project Name | Prava AI |
| Document | System Architecture |
| Version | 1.1 |
| Status | Draft |
| Owner | Prashanth Naidu |
| Current Planning Phase | Architecture Finalization |
| Last Updated | 2026-08-06 |

---

## Purpose

This document defines the technical architecture of Prava AI. It describes the approved technology stack, the structural organization of the codebase, and the architectural principles governing how the system is built and how it is expected to evolve.

This document assumes familiarity with `docs/01-product-vision.md`, which defines product philosophy, AI philosophy, product goals, core principles, module scope, and constraints. Those topics are not repeated here. This document addresses **how** the system is built, not **what** it does or **why** it exists.

---

## Architecture Overview

Prava AI is a server-first, monolithic Next.js application backed by a single relational database, with AI integrated as a cross-cutting capability rather than a core dependency or a separate system within the application.

The architecture is deliberately scoped for a solo developer operating on free-tier infrastructure, in accordance with the constraints defined in the Product Vision. It favors a small number of well-understood technologies over a larger number of specialized ones, and favors server-side logic over distributed or multi-service designs.

The system is organized around three structural layers:

1. **Presentation layer** — Next.js (App Router) with React Server Components and Client Components, styled with Tailwind CSS and shadcn/ui.
2. **Application layer** — Server Actions and Route Handlers implementing business logic in TypeScript.
3. **Data layer** — PostgreSQL (hosted on Supabase), accessed through Prisma ORM.

AI (Gemini 2.5 Flash) is a capability invoked by the application layer against data already persisted in the data layer, surfaced within the Dashboard and Trip Workspace modules. It is not a separate system of record and does not sit in the primary request path for non-AI features. Consistent with the Product Vision's Workspace First, AI Second philosophy, the workspace and its persisted data remain the architectural core; AI is layered on top of it.

---

## Technology Stack

The following stack is approved and current. It is not to be substituted or extended without a corresponding architecture decision.

| Layer | Technology | Version |
|---|---|---|
| Frontend Framework | Next.js (App Router) | 16.x |
| UI Library | React | 19.x |
| Language | TypeScript | — |
| Styling | Tailwind CSS | 4.x |
| Component Library | shadcn/ui | — |
| Backend | Next.js Server Actions, Route Handlers | (bundled with Next.js 16.x) |
| Database | PostgreSQL (Supabase) | — |
| ORM | Prisma ORM | 7.x |
| Authentication | Supabase Auth | — |
| Server State | TanStack Query | — |
| Client State | Zustand, React Context | — |
| Validation | Zod | — |
| File Storage | Cloudinary | — |
| Maps | React Leaflet, OpenStreetMap | — |
| AI Model | Gemini 2.5 Flash | — |
| Future AI Abstraction | OpenRouter | — |
| Deployment | Vercel | — |
| Package Manager | pnpm | — |

> Version references reflect the latest stable major releases as of this revision (August 2026) for technologies with an explicit update in scope (Next.js, React, Prisma ORM, Tailwind CSS) and should be validated against `package.json` at implementation time. No technology in this stack has been replaced or added.

> **Note:** Any migration path away from a listed technology is documented under [Future Extensibility](#future-extensibility) or [Architecture Decisions](#architecture-decisions), not implied elsewhere in this document.

---

## Architectural Principles

| Principle | Rationale |
|---|---|
| **Feature-first architecture** | Code is organized around product features (e.g., trip workspace, expenses) rather than technical type (e.g., "controllers," "models"), so a feature's logic stays co-located and easy to reason about. |
| **Modular design** | Modules (Dashboard, Trips, Trip Workspace, Community, Travel Essentials, Profile, Settings) are structurally separated so each can evolve independently without cross-module coupling. |
| **Server-first approach** | Logic defaults to Server Components, Server Actions, and Route Handlers. This reduces client bundle size, keeps sensitive logic off the client, and aligns with the Next.js App Router model. |
| **Separation of concerns** | Presentation, business logic, and data access are kept in distinct layers so each can be modified, tested, or replaced independently. |
| **Context-aware AI** | AI features — the Dashboard AI travel assistant and Trip Workspace AI — operate on data the application already persists, rather than maintaining independent state, consistent with the "application remembers, LLM does not" principle from the Product Vision. AI is applied within existing modules rather than existing as a module of its own; see [AI Architecture](#ai-architecture) for detail. |
| **Single responsibility** | Functions, modules, and components are scoped to one clear responsibility, reducing the surface area of any single change. |
| **Reusable components** | Shared UI and logic are extracted into common locations to avoid duplication across modules. |
| **Maintainability** | Architectural decisions favor code that a single developer can understand and modify over time, over designs optimized for large teams. |
| **Progressive enhancement** | Core workflows function with server rendering and standard form/action submission; client-side interactivity is added where it materially improves the experience. |
| **Scalability** | The architecture can absorb growth in users and data without structural rewrites, by scaling the existing stack (e.g., database tier, caching) rather than re-architecting. |
| **Free-tier optimization** | Technology and architectural choices are made to remain operable within free-tier limits of Vercel and Supabase for as long as realistically possible. |

---

## High-Level Architecture

The system follows a linear, server-mediated request flow:

```
Browser
  ↓
Next.js (App Router)
  ↓
Server Actions / Route Handlers
  ↓
Business Logic
  ↓
Prisma
  ↓
Supabase PostgreSQL
```

- The **Browser** renders the UI delivered by Next.js and initiates user interactions.
- **Next.js** serves both Server Components (rendered on the server) and Client Components (hydrated in the browser), routed through the App Router.
- **Server Actions and Route Handlers** form the application's server-side entry points, invoked either directly from Server Components/forms (Server Actions) or from client-side data-fetching (Route Handlers, via TanStack Query).
- **Business Logic** encapsulates validation, authorization, and domain rules independent of the transport mechanism (Server Action vs. Route Handler) that invoked it.
- **Prisma** provides typed data access and query construction against the database.
- **Supabase PostgreSQL** is the system's single source of truth for structured data.

Authentication (Supabase Auth) and file storage (Cloudinary) sit alongside this flow as supporting services, invoked from the application layer where relevant, rather than as part of the primary data path described above.

AI-assisted functionality — the Dashboard AI travel assistant and Trip Workspace AI (AI suggestions, AI itinerary generation) — is invoked from within Business Logic as an additional step against already-loaded application data. It does not sit between the browser and the database for standard, non-AI operations, and no module depends on AI to function.

---

## Application Modules

This section describes the responsibility, interaction pattern, and dependencies of each module at an architectural level. API-level detail is intentionally excluded.

AI is not a standalone module. It is a cross-cutting capability surfaced within the Dashboard (as an AI travel assistant) and within Trip Workspace (as Trip Workspace AI: AI suggestions, AI itinerary generation, and a trip-scoped AI travel assistant). Its underlying architecture — context loading, conversation management, and provider integration — is described in [AI Architecture](#ai-architecture); the descriptions below cover only where AI-assisted functionality is exposed within each module.

### Dashboard

- **Purpose:** Present the user with an overview of their trips and workspace activity, and serve as the entry point to the AI travel assistant.
- **Responsibilities:** Aggregate and display summary data sourced from the Trips and Trip Workspace modules; surface the AI travel assistant for user-initiated, AI-assisted actions.
- **Interactions:** Reads from Trips and Trip Workspace; invokes AI capability (see AI Architecture) when the user initiates an AI-assisted action. Does not own trip data itself.
- **Dependencies:** Trips module, authentication state, AI capability.

### Trips

- **Purpose:** List and manage the set of trips belonging to a user.
- **Responsibilities:** Create, list, update, and archive/delete trips; serve as the entry point into an individual Trip Workspace.
- **Interactions:** Provides the trip context consumed by the Trip Workspace and Dashboard modules.
- **Dependencies:** Authentication, database (trip records).

### Trip Workspace

- **Purpose:** Serve as the primary working environment for a single trip, encompassing Overview, Itinerary, Accommodation, Expenses, Notes, Checklist, and Links, enhanced throughout by Trip Workspace AI.
- **Responsibilities:** Own and manage all trip-specific data across its sub-modules; provide the structured context that Trip Workspace AI (AI suggestions, AI itinerary generation, and the trip-scoped AI travel assistant) draws on to assist the user within this trip.
- **Interactions:** Each sub-module operates on data scoped to a single trip ID. Trip Workspace AI reads from this data to provide context-aware assistance; it does not alter workspace data outside explicit user action. See AI Architecture for how this context is loaded and used.
- **Dependencies:** Trips module (trip identity), database, AI capability.

### Community

- **Purpose:** Host travel stories and inspiration shared between users, as defined in the Product Vision (explicitly not a social networking feature set).
- **Responsibilities:** Store and present user-authored travel content independent of any specific trip.
- **Interactions:** Reads and writes community content; does not interact with Trip Workspace data.
- **Dependencies:** Authentication, database, file storage (for associated media).

### Travel Essentials

- **Purpose:** Provide reference tools — Weather, Currency, Maps, Country Guide, Emergency, Language Essentials — relevant to active or upcoming travel.
- **Responsibilities:** Present location- or trip-relevant reference information.
- **Interactions:** May be invoked in a trip-scoped context (e.g., weather for a trip's destination) or independently.
- **Dependencies:** Maps sub-module (React Leaflet / OpenStreetMap) for location-based tools; external reference data sources.

> **TODO:** Specific external data providers for Weather, Currency, and Country Guide have not been finalized.

### Profile

- **Purpose:** Store and present user identity, preferences, and travel activity, including insights derived from that activity.
- **Responsibilities:** Manage the Profile experience as a single module comprising four subsections — Overview, Preferences, Activity, and Insights. Insights aggregates data across the Trips and Trip Workspace modules to surface derived, user-level insights as part of the Profile experience rather than as an independent module.
- **Interactions:** Overview, Preferences, and Activity read and write user-level and account-level data. Insights reads across multiple trips without owning that data.
- **Dependencies:** Authentication (Supabase Auth), Trips module, Trip Workspace module, database.

### Settings

- **Purpose:** Provide application and account configuration.
- **Responsibilities:** Manage user-configurable preferences and account settings.
- **Interactions:** Reads and writes user-level configuration; interacts with Supabase Auth for account-level settings.
- **Dependencies:** Authentication, database.

---

## Folder Organization

The folder structure follows a feature-first philosophy layered on top of the Next.js App Router's conventions. The intent is that a developer can locate all code relevant to a feature without navigating unrelated technical layers.

| Folder | Purpose |
|---|---|
| `app/` | Next.js App Router routes, layouts, Server Components, and Route Handlers. Defines the application's URL structure and top-level page composition. |
| `components/` | Shared, reusable UI components not specific to a single feature (e.g., primitives built on shadcn/ui). |
| `features/` | Feature-scoped code (e.g., trip-workspace, expenses, community), each containing the components, logic, and types specific to that feature. This is the primary home for feature-first organization. |
| `lib/` | Shared, low-level utilities and integrations that are not feature-specific (e.g., Prisma client instantiation, Supabase client setup). |
| `hooks/` | Shared React hooks reused across features (e.g., hooks wrapping common TanStack Query or Zustand patterns). |
| `services/` | Encapsulated integrations with external systems (e.g., Cloudinary, Gemini, Supabase Auth), isolating third-party API surfaces from business logic. |
| `actions/` | Server Actions, organized to align with the feature they serve. |
| `types/` | Shared TypeScript types and interfaces used across multiple features or layers. |
| `utils/` | Small, stateless helper functions with no external dependencies. |
| `constants/` | Shared constant values and configuration used across the application. |
| `prisma/` | Prisma schema definition and migration history. |
| `public/` | Static assets served directly by Next.js. |

This structure exists to keep feature ownership clear (`features/`), separate integration concerns from business logic (`services/` vs. `actions/`), and prevent shared, low-level code (`lib/`, `utils/`, `types/`, `constants/`) from being duplicated across features.

---

## State Management

Prava AI uses a deliberate split between server state, client state, and rendering strategy, rather than a single unified state management approach.

| Tool | Used For | When |
|---|---|---|
| **Server Components** | Data that can be fetched and rendered on the server with no client interactivity required | Default choice for displaying data (e.g., trip lists, trip workspace content on initial load) |
| **Client Components** | Interactive UI requiring browser-side state or event handling | Forms, interactive widgets, and any UI requiring immediate client-side responsiveness |
| **TanStack Query** | Server state that must be fetched, cached, and synchronized from the client (e.g., after mutations, polling, or client-triggered refetches) | Client-side data fetching from Route Handlers where Server Component rendering alone is insufficient |
| **Zustand** | Client-only UI state that needs to persist across components without prop drilling (e.g., UI panel state, multi-step form state) | Cross-component client state that is not server data |
| **React Context** | Narrowly-scoped shared state within a bounded component tree (e.g., theme, feature-local configuration) | Local sharing within a feature, where Zustand's broader scope is unnecessary |

The general default is Server Components for data display, Server Actions for mutations, and TanStack Query only where client-side reactivity to server state is genuinely required. Zustand and React Context are reserved for state that has no server counterpart.

---

## Data Flow

The standard data flow for a request follows the layer sequence described in [High-Level Architecture](#high-level-architecture), viewed here from a request/response perspective:

```
Client
  ↓
Server
  ↓
Business Logic
  ↓
Database
  ↓
Response
```

**Reads:** Server Components fetch data directly on the server at render time where possible, minimizing client-side round trips. Where client-side reactivity is required (e.g., data that must update after a client-triggered mutation), TanStack Query manages fetching through Route Handlers.

**Writes:** Mutations are handled through Server Actions, which validate input (via Zod), apply business logic, and persist changes through Prisma. Server Actions are the default mutation path given the server-first principle; Route Handlers are used where a mutation must be triggered from a context Server Actions do not cover (e.g., certain client-driven or external-facing flows).

**Caching and Revalidation:** Next.js's built-in caching and revalidation mechanisms (path- and tag-based revalidation) are used to keep server-rendered data consistent after mutations, rather than introducing a separate caching layer. This is the primary caching mechanism referenced throughout this document, including in [Performance](#performance).

**Optimistic Updates:** Where client-side responsiveness benefits from it, TanStack Query's optimistic update capabilities are used for client-driven mutations, with reconciliation against the authoritative server response.

> **TODO:** Specific revalidation strategy (tag-based vs. path-based) per module has not been finalized.

---

## AI Architecture

AI is a cross-cutting capability layered on top of application data, not a standalone module or an independent system of record, per the AI Philosophy defined in the Product Vision. It is surfaced as the AI travel assistant on the Dashboard and as Trip Workspace AI (AI suggestions, AI itinerary generation, and a trip-scoped AI travel assistant) within Trip Workspace.

**Application Memory:** All durable trip and user data is persisted by the application through Prisma/PostgreSQL. The AI layer does not retain state between invocations; any continuity across interactions is achieved by the application supplying relevant stored context on each request.

**Context Loading:** Before invoking the AI provider, the application layer assembles relevant context from the requesting scope — for example, trip data from Trip Workspace when Trip Workspace AI is invoked, or user-level data when the Dashboard AI travel assistant is invoked.

**Conversation Management:** Conversational history, where retained, is persisted by the application rather than assumed to exist within the AI provider. This ensures conversations remain available and consistent regardless of the underlying AI provider.

**Trip-Aware AI:** Trip Workspace AI operates specifically against the data of the trip it is invoked within (Itinerary, Accommodation, Expenses, Notes, Checklist, Links), rather than as a general-purpose assistant with no bound context.

**Prompt Generation:** The application layer is responsible for constructing requests to the AI provider using the loaded context. Prompt content and structure are implementation detail outside the scope of this document.

**Gemini Integration:** Gemini 2.5 Flash is the current, direct AI provider integration.

**Future OpenRouter Abstraction:** OpenRouter is the planned future abstraction layer to allow provider flexibility (e.g., swapping or adding models) without restructuring the application's context-loading and prompt-construction logic. Consistent with Folder Organization, this abstraction will be implemented within `services/`, alongside the existing provider integrations.

> **TODO:** The specific interface contract for the future OpenRouter abstraction has not been finalized.

---

## Storage Strategy

| Data Type | Storage Location |
|---|---|
| Structured application data (users, trips, workspace content, community content) | PostgreSQL (Supabase) |
| Authentication data (credentials, sessions) | Supabase Auth |
| Images and media (uploaded photos, community media) | Cloudinary |
| Temporary uploads | Cloudinary (pending finalization of intermediate handling) |
| Generated files (if any) | TODO |
| Caching | Next.js built-in caching (see [Data Flow](#data-flow) and [Performance](#performance)) |

> **TODO:** Handling of temporary uploads prior to confirmation (e.g., whether an intermediate/staging step exists before final Cloudinary storage) has not been finalized.
>
> **TODO:** Whether the application will generate downloadable files (e.g., exports) and, if so, where they will be stored, has not been finalized.

---

## Security

Security is addressed architecturally; implementation-level detail (e.g., specific middleware code) is out of scope for this document.

- **Authentication:** Handled by Supabase Auth. All authenticated routes and Server Actions rely on Supabase Auth as the single source of identity truth.
- **Authorization:** Access to trip, workspace, and profile data is scoped to the owning user at the business logic layer; no data access bypasses this scoping.
- **Input Validation:** All external input (form submissions, Server Action arguments, Route Handler payloads) is validated with Zod before being passed to business logic.
- **Secure File Uploads:** File uploads are routed through Cloudinary rather than handled by application-managed storage, limiting the application's direct exposure to unvalidated file content.
- **Least Privilege:** Database and third-party service credentials are scoped to only the access required by the application; no component is granted broader privileges than its function requires.
- **Environment Variables:** All secrets (database credentials, API keys, service tokens) are stored in environment variables and are never committed to source control.
- **Server-Only Logic:** Business logic, credentials, and provider integrations execute exclusively on the server (Server Actions, Route Handlers); no secret-bearing logic is shipped to the client.
- **Secret Exposure:** No API keys, service credentials, or internal identifiers are exposed to client-side code or client-visible network requests.

---

## Performance

- **Server Components:** Used by default to minimize client-side JavaScript and move rendering work to the server.
- **Streaming:** Next.js streaming is used where applicable to reduce perceived load time for data-heavy views.
- **Lazy Loading:** Non-critical Client Components and assets are loaded lazily to reduce initial bundle size.
- **Caching and Revalidation:** Handled through Next.js's built-in mechanisms as described in [Data Flow](#data-flow); no separate caching layer is introduced.
- **Image Optimization:** Images are served and optimized through Cloudinary and/or Next.js image handling.
- **Pagination:** List-heavy views (e.g., trips, community content) are paginated rather than fully loaded, to bound query and rendering cost.
- **Code Splitting:** Next.js's route-based code splitting is relied upon rather than manual bundle configuration.
- **Scalable Architecture:** The architecture avoids patterns (e.g., unbounded queries, unpaginated aggregation) that would degrade disproportionately as data volume grows, while remaining within the scope of a single-database, free-tier-friendly design.

---

## Error Handling

The architecture distinguishes between categories of error and defines how each is expected to be surfaced, without prescribing implementation.

- **Validation Errors:** Raised when input fails Zod validation, before business logic executes. These are returned to the client as structured, user-actionable feedback.
- **Business Errors:** Raised when input is valid but violates a business rule (e.g., an operation not permitted in the current state). These are distinguished from validation errors and unexpected errors so the client can respond appropriately.
- **Unexpected Errors:** Errors not anticipated by validation or business logic (e.g., downstream service failures). These are handled defensively to avoid exposing internal detail to the client.
- **Logging:** Errors are logged server-side to support debugging and monitoring.

> **TODO:** Specific logging/monitoring provider has not been finalized.

- **User Feedback:** Errors surfaced to the user are translated into clear, non-technical messaging appropriate to the failure category.
- **Graceful Degradation:** Where a non-critical dependency fails (e.g., an AI request or a Travel Essentials data source), the surrounding workflow remains usable, consistent with the principle that AI and supplementary features never block core manual workflows.

---

## Future Extensibility

The architecture is intended to accommodate the following without requiring a structural redesign:

| Extension | Architectural Accommodation |
|---|---|
| **OpenRouter** | The AI capability's context-loading and prompt-construction logic is separated from the specific provider integration, allowing the provider layer — and the AI models it exposes — to be swapped or extended without restructuring Dashboard or Trip Workspace AI. |
| **Notifications** | Can be introduced as an additional service integration invoked from existing business logic, without changing the core data or module structure. |
| **Offline Support** | Would build on the existing client/server separation; specific approach is not yet defined. |
| **Mobile Application** | The server-first business logic (Server Actions/Route Handlers) is structured so that a future mobile client could consume equivalent server-side logic via Route Handlers. |

> **TODO:** Offline support and mobile application architecture are directional considerations only; neither has a finalized technical approach at this stage.

---

## Architecture Decisions

| Decision | Status |
|---|---|
| Next.js App Router as the sole frontend/backend framework (no separate backend service) | Approved |
| PostgreSQL via Supabase as the single database | Approved |
| Prisma as the sole ORM | Approved |
| Supabase Auth as the sole authentication provider | Approved |
| Gemini 2.5 Flash as the current AI provider, with OpenRouter as a future abstraction | Approved |
| Cloudinary as the sole file storage provider | Approved |
| No dedicated caching service beyond Next.js built-in caching at current scale | Approved |
| AI implemented as a cross-cutting capability within Dashboard and Trip Workspace, not a standalone module | Approved |
| No microservices or service-oriented decomposition | Approved (see Non-Goals) |

> **TODO:** Formal architecture decision records (ADRs) with full context and alternatives considered have not yet been written for the above decisions. This table reflects current approved status only.

---

## Non-Goals

This architecture explicitly avoids:

- Microservices
- Event sourcing
- CQRS
- Enterprise-grade infrastructure complexity (e.g., multi-region deployment, dedicated message queues)
- Premature optimization not justified by current or near-term scale
- Unnecessary abstractions introduced ahead of demonstrated need

These are avoided in accordance with the "simple architecture over unnecessary complexity" principle and the solo-developer, free-tier constraints defined in the Product Vision.

---

## Future Revisions

| Version | Date | Author | Description |
|---|---|---|---|
| 1.0 | 2026-08-06 | Prashanth Naidu | Initial draft of the System Architecture document |
| 1.1 | 2026-08-06 | Prashanth Naidu | Repositioned AI as a cross-cutting capability rather than a standalone module; consolidated Profile Insights as a subsection of Profile; updated Next.js, React, Prisma ORM, and Tailwind CSS version references; reviewed and narrowed open TODOs; reduced duplication between Data Flow, Performance, and Storage Strategy; scoped Future Extensibility to OpenRouter, Notifications, Mobile Application, and Offline Support |

---

## Related Documents

- `docs/01-product-vision.md` — Product Vision
- `docs/03-system-architecture.md` — This document

> **TODO:** Additional related documents (e.g., data model / schema documentation, AI integration specification, deployment runbook) are anticipated but not yet finalized.
