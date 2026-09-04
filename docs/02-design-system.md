# Prava AI

## Design System

### Metadata

| Field | Value |
|---|---|
| Project Name | Prava AI |
| Document | Design System |
| Version | 1.0 |
| Status | Draft |
| Owner | Prashanth Naidu |
| Aligned With | `docs/01-product-vision.md`, `docs/03-system-architecture.md` |
| Last Updated | 2026-08-06 |

---

## Purpose

This document defines the visual language of Prava AI: color, typography, spacing, layout, component behavior, and interaction philosophy. It is the single source of truth for visual decisions across the application.

This document assumes familiarity with `docs/01-product-vision.md` (product philosophy, design philosophy, AI philosophy) and `docs/03-system-architecture.md` (technology stack, including Tailwind CSS and shadcn/ui as the styling and component foundation). Product rationale and technical implementation are not repeated here — this document addresses **how the product looks and behaves visually**, not why it exists or how it is built.

---

## Design Philosophy

Prava AI's visual language exists to support the product's core philosophy: **Workspace First, AI Second**. Every visual decision is evaluated against whether it helps the user's travel information stay legible and organized, or whether it draws attention to the interface itself.

The interface is:

| Quality | Meaning |
|---|---|
| **Professional** | The interface reads as a serious productivity tool, not a consumer novelty or a demo. |
| **Minimal** | Every visual element must justify its presence. Decoration without function is removed. |
| **Calm** | No visual element competes for attention. Color, motion, and contrast are used sparingly and deliberately. |
| **Structured** | Layout communicates hierarchy and relationships through consistent structure, not visual flourish. |
| **Readable** | Typography, spacing, and contrast are optimized for extended reading and scanning of trip data. |
| **Focused** | The interface supports one task at a time; it does not compete with the user's attention. |
| **Intentional** | Every color, spacing value, and motion choice is a deliberate decision documented in this system, not an ad hoc one. |
| **Content-first** | The user's trip data is the visual subject. The UI frame recedes. |
| **Whitespace-driven** | Separation and hierarchy are achieved primarily through space, not borders, shadows, or color. |

These qualities are not aesthetic preferences in isolation — they exist to keep AI positioned as a supporting capability rather than the visual centerpiece of the product, consistent with the AI Philosophy defined in the Product Vision.

---

## Visual Language

### Reference Direction

Prava AI's visual language is directionally aligned with **Notion, Linear, GitHub, Raycast, and Stripe Dashboard** — products defined by structured, calm, content-first interfaces built for daily, repeated use.

It explicitly diverges from **ChatGPT, Lovable, V0-generated landing pages, and generic modern SaaS templates** — interfaces defined by conversational chrome, marketing-driven visual energy, or decorative flourish intended to impress on first viewing rather than support sustained use.

### Overall Style

The approved visual style is:

- Clean
- Minimal
- Professional
- Soft
- Subtle
- Elegant
- Flat

### Explicitly Avoided

The following are not part of Prava AI's visual language, in any module:

- Glassmorphism
- Neumorphism
- Heavy gradients
- Colorful cards
- Glow effects
- Overly playful illustrations
- Over-animated interfaces
- AI startup aesthetics (chat-first visual chrome, gradient branding, orb/sparkle motifs)
- Rounded "bubble" interfaces (pill-shaped buttons, fully rounded containers)

### Theme Scope

**Light theme is the primary and only design target for the current version.** All tokens, contrast ratios, and component specifications in this document describe the light theme.

> Dark theme is a planned future enhancement. It is not in current scope and is not specified by this document.

---

## Color System

The color system is intentionally restrained. Backgrounds remain predominantly white with subtle gray surfaces; color is reserved for meaning — actions, state, and selection — rather than decoration.

### Palette Philosophy

- **Neutral-dominant:** The interface is built primarily from white, off-white, and gray-scale surfaces. Color is the exception, not the default.
- **Single primary accent:** Sky blue / soft blue is the only brand accent color, used consistently for primary actions, focus states, links, selection, and highlights. Prava AI does not use a secondary accent color.
- **Restrained semantic palette:** Success, warning, and danger colors exist only to communicate state (e.g., a completed checklist item, a validation error) and are never used decoratively or to add visual variety to otherwise neutral UI.
- **Consistency over expression:** The same token is used for the same meaning everywhere in the product. A color is never repurposed situationally.

### Color Tokens

| Token | Role | Usage |
|---|---|---|
| `color-primary` | Brand accent (sky blue / soft blue) | Primary buttons, active navigation state, key highlights |
| `color-primary-hover` | Primary accent, hover/active state | Hover and pressed states for primary actions |
| `color-background` | Base application background | Page background beneath all content |
| `color-surface` | Primary content surface | Cards, panels, and workspace containers resting on the background |
| `color-surface-secondary` | Subtle secondary surface | Nested or lower-emphasis containers (e.g., sidebar background, table header) |
| `color-border` | Structural border | Dividers, input borders, card outlines, table rules |
| `color-text-primary` | Primary text | Headings, body copy, primary labels |
| `color-text-secondary` | Secondary text | Supporting text, descriptions, secondary labels |
| `color-muted` | De-emphasized text and icons | Placeholder text, disabled state, timestamps, metadata |
| `color-success` | Positive state | Completed actions, confirmations, positive status indicators |
| `color-warning` | Cautionary state | Non-blocking issues, approaching limits, attention-needed states |
| `color-danger` | Negative/error state | Validation errors, destructive actions, failed states |
| `color-focus-ring` | Focus indicator | Visible keyboard focus outline on interactive elements (uses the primary accent) |
| `color-selection` | Selected state | Selected list items, active tabs, selected table rows |

> Exact hex or HSL values are intentionally not specified in this document. Token values are defined and maintained in the Tailwind CSS theme configuration described in `docs/03-system-architecture.md`, not duplicated here.

### Usage Rules

- `color-primary` is reserved for the single most important action or state on a given screen. A screen with multiple simultaneous uses of `color-primary` should be reconsidered rather than accepted as normal.
- Semantic colors (`color-success`, `color-warning`, `color-danger`) are applied to small, targeted elements — icons, borders, badges, text — not as large fill backgrounds, to avoid the interface reading as colorful or alert-heavy by default.
- Gray surfaces (`color-surface`, `color-surface-secondary`) are differentiated by subtle value shifts, not by introducing additional hues.

---

## Typography

### Philosophy

Typography is the primary structural tool in Prava AI's interface, ahead of color, borders, or shadows. Hierarchy is established through size, weight, and spacing — not decoration.

### Primary Typeface

> **TODO:** The specific primary font family has not been finalized. Until finalized, the typeface must be a neutral, highly legible UI sans-serif in the character of the typefaces used by Notion, Linear, GitHub, and Stripe Dashboard — not a display, decorative, or characterful typeface. Selection of the specific family is tracked as an open decision.

### Monospace Typeface

> **TODO:** The specific monospace family has not been finalized. A monospace face is required for numeric and code-like content (see Monospace Usage below).

### Type Scale

| Token | Typical Use |
|---|---|
| `text-3xl` | Page-level titles (e.g., a trip name on its Overview screen) |
| `text-2xl` | Section headings within a page |
| `text-xl` | Subsection headings, dialog titles |
| `text-lg` | Card titles, emphasized labels |
| `text-base` | Default body text, form labels, table content |
| `text-sm` | Secondary text, supporting descriptions, dense table content |
| `text-xs` | Metadata, timestamps, captions, helper text |

### Font Weights

| Weight | Use |
|---|---|
| Regular | Default body text and most UI copy |
| Medium | Labels, table headers, emphasized inline text, active navigation items |
| Semibold | Headings and titles only |

Bold weight is avoided as a general-purpose emphasis tool. Emphasis is achieved through Medium or Semibold weight, not through bold or italic styling, to keep the interface visually quiet.

### Line Height and Letter Spacing

- **Body text** uses a relaxed line height to support extended reading of trip notes, itineraries, and descriptions.
- **Headings** use a tighter line height, appropriate to their larger size.
- **Letter spacing** remains at the default (neutral) tracking for all body and heading text. Slightly increased tracking is reserved only for small, uppercase labels (e.g., section eyebrows, table column headers), and is never applied to body copy.

### Text Hierarchy

Hierarchy is established through a consistent combination of size and weight, applied identically across modules:

1. Page title — `text-3xl`, Semibold
2. Section heading — `text-2xl` or `text-xl`, Semibold
3. Card/subsection title — `text-lg`, Medium or Semibold
4. Body content — `text-base`, Regular
5. Supporting text — `text-sm`, Regular, `color-text-secondary`
6. Metadata — `text-xs`, Regular, `color-muted`

### Monospace Usage

Monospace typography is reserved for content where character alignment communicates meaning:

- Currency and numeric values in Expenses
- Structured reference data in Travel Essentials (e.g., currency conversion figures)
- Any code-like or identifier-style content

Monospace is not used for general body text, labels, or headings.

---

## Spacing

### Philosophy

Spacing is the primary mechanism for establishing hierarchy and separation in Prava AI. Whitespace is treated as a structural element, not empty space to be filled.

A single spacing scale is used consistently across the application. Deviating from the scale to achieve a specific visual effect is not permitted — inconsistent spacing is treated as a defect, not a stylistic choice.

### Spacing Scale

| Token | Typical Use |
|---|---|
| `space-1` | Tightest spacing — icon-to-label gaps, inline element spacing |
| `space-2` | Compact spacing within a component (e.g., form field internal padding) |
| `space-3` | Default spacing between closely related elements |
| `space-4` | Standard spacing between components within a card or panel |
| `space-6` | Spacing between distinct components on a page |
| `space-8` | Spacing between grouped sections within a page |
| `space-12` | Spacing between major page sections |
| `space-16` | Spacing separating top-level page regions (e.g., page header from content) |

### Application

- **Component spacing** (`space-2`–`space-4`): Internal padding of buttons, inputs, cards, and list items.
- **Card spacing** (`space-4`–`space-6`): Padding within cards; spacing between cards in a grid or list.
- **Section spacing** (`space-8`–`space-12`): Separation between distinct functional groupings on a page (e.g., between an Overview summary and an Itinerary preview).
- **Grid spacing** (`space-4`–`space-6`): Gutters between grid or list items (e.g., trip cards on the Dashboard).
- **Vertical rhythm:** Within any single content column, consistent vertical spacing between stacked elements is maintained using the scale above rather than ad hoc values, so that scanning down a page feels uniform.

---

## Radius

The interface intentionally avoids highly rounded components. The overall appearance is **rectangular with subtle softness** — never pill-shaped, and never sharply square.

### Radius Scale

| Token | Value Role | Applied To |
|---|---|---|
| `radius-sm` | Small radius | Inputs, buttons, badges, checkboxes, small controls |
| `radius-md` | Medium radius | Cards, panels, dropdown menus, tables |
| `radius-lg` | Larger radius | Dialogs, modals, large surface containers |

### Rules

- No component uses a fully rounded (`radius-full`) treatment except small, genuinely circular elements where circularity is functionally meaningful (e.g., a user avatar, a status dot). Buttons, inputs, cards, and dialogs are never pill-shaped or fully rounded.
- Radius increases modestly with surface size (inputs and buttons use the smallest radius; dialogs use the largest), but the largest radius in the system remains subtle — never large enough to read as "rounded" as a defining characteristic.
- Radius is applied consistently by component type. The same component never appears with different radius values in different modules.

---

## Elevation

Elevation is minimal and purposeful. Shadows exist only to establish which elements are temporarily above the base layer (overlays, transient UI) — not to add visual depth to static content.

### Elevation Scale

| Token | Use |
|---|---|
| `elevation-0` | Default — the base workspace, most cards and panels sit flush with no shadow |
| `elevation-1` | Subtle lift — used sparingly for static surfaces that need light separation from a busy background (e.g., a sticky table header) |
| `elevation-2` | Overlay elevation — dropdown menus, popovers, tooltips |
| `elevation-3` | Modal elevation — dialogs and modals, the highest elevation in the system |

### Rules

- Static, persistent UI (cards, panels, sidebars) defaults to `elevation-0`. Shadows are not used to make ordinary content feel "elevated" or "premium."
- Elevation increases only for **transient, temporary UI** — content that appears above the workspace and will be dismissed (dropdowns, dialogs, tooltips, toasts).
- Shadow values at every level remain subtle. None of the elevation tokens produce a pronounced or dramatic shadow. The interface never uses shadow for decorative depth.

---

## Layout

### Layout Model

Prava AI follows a **persistent sidebar plus content area** layout, consistent with the reference direction (Notion, Linear, Raycast):

- **Sidebar:** Persistent primary navigation across Dashboard, Trips, Community, Travel Essentials, Profile, and Settings. Remains visible on desktop; collapses to an overlay or bottom navigation pattern on smaller viewports.
- **Top bar:** Contextual to the current view — page title, breadcrumb context, and primary page-level actions. Does not duplicate sidebar navigation.
- **Content area:** The primary workspace region. Constrained to a maximum readable width for text-heavy views (notes, itinerary detail) and allowed to use full available width for data-dense views (tables, dashboards).

### Container and Content Widths

| Token | Use |
|---|---|
| `content-width-reading` | Maximum width for text-heavy content (notes, descriptions) — keeps line length readable |
| `content-width-standard` | Default width for most workspace views (forms, cards, lists) |
| `content-width-wide` | Full-width layouts for data-dense views (tables, dashboards, calendars) |

### Grid System

A standard responsive grid (aligned to Tailwind CSS's default breakpoint and column conventions, per `docs/03-system-architecture.md`) is used for card and list layouts (e.g., trip cards on the Dashboard, community stories). Grid gutters follow the spacing scale (`space-4`–`space-6`).

### Responsive Philosophy

Prava AI is a **desktop-first workspace application.** The primary design target is a desktop or laptop viewport, consistent with its positioning as a workspace tool rather than a mobile-first consumer app.

| Breakpoint | Behavior |
|---|---|
| Desktop (primary) | Full sidebar, multi-column layouts where applicable, maximum information density |
| Tablet | Sidebar collapses to a compact or toggleable state; content reflows to fewer columns |
| Mobile | Sidebar becomes a navigation overlay or bottom navigation; layouts become single-column; no core workflow is hidden or removed, only reflowed |

See [Responsive Design](#responsive-design) for further detail.

---

## Iconography

### Icon System

**Lucide Icons** is the official and only icon system used across Prava AI.

### Style Rules

- **Stroke style:** Lucide's default outline/stroke style is used exclusively. Filled icon variants are not used, to maintain a consistent, light visual weight.
- **Stroke width:** A single, consistent stroke width is used across all icon instances and sizes. Icons are never mixed with a different stroke weight for emphasis.
- **Sizing:** Icons are used at a small set of consistent sizes (e.g., a compact size for inline/label use and a larger size for standalone or empty-state use), matched to the surrounding text scale rather than sized arbitrarily.

### Usage Rules

- Icons pair with text labels in primary navigation and in any action whose meaning is not universally unambiguous. Icon-only controls are reserved for a small set of universally understood actions (e.g., close, search, more options).
- Icons communicate function (navigation, actions, status), not decoration. An icon with no functional or labeling purpose is not added.
- Illustrations are avoided as a general pattern. Where an illustration might otherwise be used (e.g., an empty state), a restrained icon plus clear text is preferred over a decorative illustration, consistent with the product's avoidance of playful visual language.
- The rare exception where a light illustrative treatment may be acceptable is a first-run or fully empty application state (e.g., no trips created yet) — and even there, the treatment must remain minimal, flat, and consistent with the rest of the visual language, not a distinct "marketing" illustration style.

---

## Motion

### Philosophy

Motion in Prava AI exists to communicate **state, hierarchy, and feedback** — never to decorate. Every animation must answer: what is this movement telling the user? If there is no answer, the animation is removed.

### Duration Philosophy

| Category | Duration Character | Use |
|---|---|---|
| Fast | Short | Hover states, focus ring appearance, button press feedback |
| Standard | Moderate | Dropdown open/close, tab switching, tooltip appearance |
| Deliberate | Slightly longer, still brief | Dialog and modal open/close, panel expand/collapse |

No animation in the system is long enough to feel like a designed "moment" — durations stay short and functional throughout.

### Easing

Entrances use an ease-out curve (quick start, gentle finish) to feel responsive. Exits use an ease-in curve (gentle start, quick finish) to feel unobtrusive. Motion is never bouncy, elastic, or springy — these read as playful and conflict with the product's professional tone.

### Applied Motion

- **Hover:** Subtle state change only (e.g., background or border shift). No scale, lift, or shadow-based hover effects.
- **Focus:** Immediate appearance of the focus ring — no animated delay, since focus is an accessibility-critical state.
- **Loading:** Skeleton states (see Component Philosophy) or a restrained spinner; no elaborate loading animation.
- **Page transitions:** Minimal to none. Navigating between views is treated as an instant context change, not a transition to choreograph.
- **Dialogs:** A brief fade and/or subtle scale on open/close, matching the Deliberate duration category.
- **Dropdowns:** A brief fade and position settle, matching the Standard duration category.

### Reduced Motion

All motion respects the user's reduced-motion preference. When reduced motion is requested, transitions are replaced with immediate state changes rather than being merely shortened.

---

## Components

This section describes intended visual behavior. Implementation is out of scope for this document.

### Buttons

Rectangular with `radius-sm`. A clear primary/secondary/tertiary hierarchy: one primary button (using `color-primary`) per view for the principal action; secondary buttons use a neutral border and surface; tertiary/ghost buttons use text-only styling for lower-emphasis actions. No pill-shaped buttons. No gradient fills.

### Inputs, Textarea, Select

White surface, visible `color-border` outline, `radius-sm`, generous internal padding. On focus, the border is replaced or accompanied by `color-focus-ring`. No heavy inset/embossed styling. See [Forms](#forms) for full detail.

### Cards

`color-surface` background, `radius-md`, `elevation-0` by default, separated from surrounding content by spacing rather than shadow. A card's border (`color-border`) is subtle and may be used instead of, not in addition to, a shadow.

### Dialogs and Modals

`radius-lg`, `elevation-3`, centered over a dimmed backdrop. Content within a dialog follows the same spacing and typography rules as the rest of the application — a dialog is not a separate visual context.

### Tables

See [Tables](#tables).

### Tabs

Text-based tab labels with a simple underline or `color-primary` indicator for the active tab. No pill-shaped or heavily boxed tab styling.

### Badges

Small, `radius-sm`, used to convey short status or category labels (e.g., trip status, checklist category). Semantic color badges use restrained fill or outline treatment — never a large, saturated block of color.

### Alerts

Used to surface important, persistent information (e.g., a validation summary, a system notice). Left-border or icon-led treatment using the relevant semantic color token (`color-success`, `color-warning`, `color-danger`), on a neutral or lightly tinted background — never a fully saturated colored block.

### Navigation and Sidebar

Persistent, text-and-icon based, with a clear active-state indicator (`color-selection` or `color-primary` accent). Flat background using `color-surface-secondary`, no heavy borders or shadows separating it from content.

### Breadcrumbs

Text-based, `color-text-secondary` for inactive segments and `color-text-primary` for the current segment, separated by a simple divider character or small icon. Used only where navigational depth genuinely benefits from it (e.g., within a Trip Workspace), not added to every screen by default.

### Dropdowns

`elevation-2`, `radius-md`, appears anchored to its trigger. Options use consistent spacing and typography with the rest of the interface; no custom styling per dropdown instance.

### Empty States

Short, direct text explaining what belongs in this space and, where applicable, a single primary action to fill it. A restrained icon may accompany the text (see Iconography). Empty states are informative, not decorative.

### Loading States and Skeletons

Skeleton placeholders (flat, `color-surface-secondary` blocks matching the shape of the eventual content) are preferred over spinners for content-heavy views, to preserve layout stability. Spinners are reserved for short, indeterminate actions (e.g., a button submitting a form). Skeleton shimmer, if used, is subtle and respects reduced-motion preferences.

---

## Forms

Forms are a primary interaction surface in Prava AI (trip creation, expense entry, notes, settings) and follow a single, consistent visual pattern throughout the application.

### Field Appearance

- White rectangular fields (`color-surface` background, `color-border` outline, `radius-sm`).
- Generous internal padding — fields are never visually cramped.
- Field width matches the expected content (e.g., a currency field is not full-width by default).

### Labels

- Positioned above the field, `text-sm`, Medium weight, `color-text-primary`.
- Always present — placeholder text is never used as a substitute for a label.

### Placeholder Philosophy

Placeholder text illustrates an example value or format, not instructions. Placeholder text is never the only guidance for a field — required context belongs in the label or helper text, since placeholder text disappears on input and is not a reliable accessibility cue.

### Helper Text

`text-xs`, `color-text-secondary`, positioned directly below the field. Used to clarify format or constraints before an error occurs.

### Validation and Errors

- Invalid fields are indicated with `color-danger` applied to the field border and an adjacent error message in `color-danger`, `text-xs`.
- Error messages state what is wrong and, where possible, how to correct it, in plain language.
- Validation styling is scoped to the specific field in error — the entire form is not visually flagged for a single field's error.

### Focus States

A visible `color-focus-ring` is applied to the active field, consistent with the Accessibility requirements below. Focus is never indicated by color change alone.

### Disabled States

Reduced contrast (`color-muted` text and border) with an unambiguous non-interactive appearance. Disabled fields retain their layout position and are never hidden.

### Spacing

Fields within a form follow the standard spacing scale: `space-4` between related fields, `space-6`–`space-8` between distinct field groups, consistent with [Spacing](#spacing).

---

## Tables

Tables in Prava AI (e.g., expenses, community listings, structured trip data) follow a professional, dense-information-friendly pattern:

- **Minimal borders:** Horizontal row dividers (`color-border`) only; vertical column borders are avoided unless required for dense numeric data.
- **Header treatment:** `color-surface-secondary` background, Medium weight text, `text-sm`, to distinguish headers from data rows without heavy styling.
- **Alternating row backgrounds** are used only when row scanning genuinely benefits from it in dense, high-row-count tables — not applied as a default pattern to every table.
- **Density:** Tables default to a compact vertical rhythm (`space-2`–`space-3` row padding) to support scanning larger datasets, while remaining readable.
- **Alignment:** Numeric and monospace content is right-aligned; text content is left-aligned.

---

## Dashboard

The Dashboard (and dashboard-like views elsewhere in the product, such as Profile Insights) prioritize information hierarchy over visual variety:

1. **Trip summaries** and **quick actions** are given the most prominent placement, since they represent the most frequent user intent (returning to an active or upcoming trip).
2. **Statistics and widgets** (e.g., counts, aggregates) use compact, text-forward presentation — large numeric values with a small label — rather than illustrated or heavily styled stat cards.
3. **Recent activity** is presented as a scannable list, prioritizing clarity over visual richness.
4. **Charts**, where used, follow the restrained color palette (primary accent plus neutral grays; semantic colors only where the chart communicates state). Charts are informational, not decorative — a chart is not added unless it communicates something a number or list could not.

Decorative content (illustration, marketing-style imagery, promotional banners) is not part of the Dashboard.

---

## Accessibility

Accessibility is a default requirement, not an enhancement layered on afterward.

- **Keyboard navigation:** Every interactive element is reachable and operable via keyboard alone, in a logical tab order matching visual layout.
- **Screen readers:** Semantic HTML and appropriate ARIA attributes are used so that structure and state (e.g., selected, expanded, disabled) are announced correctly.
- **Focus visibility:** The `color-focus-ring` token is always visible on keyboard focus and is never suppressed for aesthetic reasons.
- **Contrast:** Text and meaningful UI elements meet accepted contrast standards against their background at every token combination defined in this document.
- **Touch targets:** Interactive elements meet a minimum comfortable touch target size on tablet and mobile viewports, regardless of their visual size on desktop.
- **Reduced motion:** All motion respects the user's reduced-motion system preference, per [Motion](#motion).
- **Semantic HTML:** Structural markup (headings, lists, landmarks, form labels) reflects actual content structure, not just visual appearance.

---

## Responsive Design

Prava AI is designed **desktop-first**, reflecting its identity as a workspace tool rather than a mobile-first consumer app, while remaining fully usable on smaller viewports.

- **Desktop** is the primary target: full sidebar navigation, maximum content density, multi-column layouts where they aid comprehension (e.g., Trip Workspace with a persistent sub-navigation alongside content).
- **Tablet** adapts layout density: the sidebar may collapse into a compact or toggleable form, and multi-column layouts reduce to fewer columns.
- **Mobile** simplifies rather than removes: navigation moves to an overlay or bottom pattern, layouts become single-column, and information density is reduced — but every core workflow defined in the Product Vision (Trip Workspace, Travel Essentials, Community, Profile, Settings) remains fully accessible. No workflow is desktop-only.

---

## Design Tokens

The design system is expressed as a set of token categories, implemented as the Tailwind CSS theme referenced in `docs/03-system-architecture.md`. This document defines the categories and their intent; literal token values and implementation are maintained in code, not duplicated here.

| Category | Governs |
|---|---|
| **Colors** | Semantic color roles (see [Color System](#color-system)) |
| **Typography** | Font families, type scale, weights, line height, letter spacing (see [Typography](#typography)) |
| **Spacing** | The spacing scale used for padding, margin, and gaps (see [Spacing](#spacing)) |
| **Radius** | Corner radius values by component category (see [Radius](#radius)) |
| **Elevation** | Shadow levels by UI layer (see [Elevation](#elevation)) |
| **Animation** | Duration and easing categories (see [Motion](#motion)) |
| **Breakpoints** | Responsive breakpoint definitions (see [Layout](#layout)) |
| **Opacity** | Opacity values for disabled, muted, and backdrop states |
| **Z-index** | Stacking order for layered UI (dropdowns, dialogs, toasts, backdrops) |

> **TODO:** Explicit opacity and z-index scales have not been finalized. Category ownership is established here; specific values are tracked as an open implementation detail.

---

## Core Design Principles

1. **Content over decoration.** Every visual element serves the user's travel information; nothing is added purely for visual interest.
2. **Consistency over creativity.** The same token, spacing value, and component pattern is used for the same purpose everywhere. Novel one-off treatments are not introduced for individual screens.
3. **Whitespace creates clarity.** Separation and hierarchy are achieved through space before they are achieved through borders, color, or shadow.
4. **Professional over playful.** The interface reads as a serious productivity tool at every screen, including empty states and error states.
5. **Function before aesthetics.** A design choice is evaluated first on whether it clarifies the task, then on how it looks.
6. **Accessibility is default.** Accessible behavior (contrast, focus, keyboard support) is part of the initial design, not a follow-up pass.
7. **Minimal motion.** Motion is used only to communicate state or feedback, never for decorative effect.
8. **Workspace first, AI second.** AI-related UI (Dashboard AI travel assistant, Trip Workspace AI) uses the same visual language as the rest of the product. It is never styled to visually announce itself as "the AI part" of the interface.

---

## Non-Goals

This design system explicitly avoids:

- Heavy gradients
- Rounded "bubble" UI (pill-shaped buttons and containers)
- Excessive or decorative shadows
- Animated dashboards
- Glassmorphism
- Visual clutter
- Inconsistent spacing
- Arbitrary or one-off colors outside the defined token set
- Overuse of icons in place of clear text labels
- Decorative illustrations

---

## Future Revisions

| Version | Date | Author | Description |
|---|---|---|---|
| 1.0 | 2026-08-06 | Prashanth Naidu | Initial draft of the Design System document |

---

## Related Documents

- `docs/01-product-vision.md` — Product Vision
- `docs/03-system-architecture.md` — System Architecture
- `docs/02-design-system.md` — This document

> **TODO:** A dedicated component-level specification (e.g., a Storybook reference or component API document) is anticipated but not yet finalized.
