---
name: format-imports-and-clean
description: >-
  Refactors and standardizes file imports into a clean 6-tier hierarchy (inbuilt, installed packages,
  components, contexts/providers, services/lib/utils, constants/types), strips unused imported components
  or variables, and formats the file into a readable, production-grade layout. Use whenever the user asks
  to organize, format, sort, or clean imports, remove unused components or imports, or improve code readability in Next.js/React/TypeScript files.
---

# Format Imports & Code Cleaner Skill

This skill defines the authoritative procedure for refactoring imports, stripping dead/unused components and symbols, and formatting source code (TSX, TS, JSX, JS, and CSS) into a clean, highly readable, production-grade structure.

---

## 1. The 6-Tier Import Hierarchy

All module imports must be categorized into the following strict **6 tiers**, with **exactly one blank line** between tiers. If a tier has no imports in a file, omit that tier without leaving redundant blank lines.

```typescript
// 1. INBUILT IMPORTS (React, Next.js core, Node built-ins)
import Image from "next/image";
import Link from "next/link";
import { type NextRequest, NextResponse } from "next/server";
import { useEffect, useState } from "react";

// 2. INSTALLED PACKAGES IMPORTS (Third-party npm libraries)
import { ArrowRight, Check, MapPin, Sparkles } from "lucide-react";
import { z } from "zod";

// 3. COMPONENTS IMPORTS (UI primitives, app shell, feature components)
import { AnimatedNav } from "@/components/app-shell/nav-Items";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { TripCard } from "@/features/trips/components/trip-card";

// 4. CONTEXT & PROVIDERS IMPORTS (React contexts, theme/sync providers)
import { ThemeProvider } from "@/provider/ThemeProvider";
import { OfflineSyncProvider } from "@/lib/offline/offline-sync-provider";

// 5. SERVICE, LIBRARY & UTILS IMPORTS (Data fetching, DB, Supabase, helpers)
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { fetchTripWeather } from "@/services/weather";

// 6. CONSTANTS, TYPES & STYLES IMPORTS (Shared types, schemas, CSS files)
import type { TripWithRelations } from "@/features/trips/types";
import { tripFormSchema } from "@/features/trips/schema";
import "./globals.css";
```

### Detailed Tier Breakdown

| Tier | Category | Package / Path Patterns | Examples |
|---|---|---|---|
| **Tier 1** | **Inbuilt Imports** | `react`, `react-dom`, `next`, `next/*`, `node:*` | `next/link`, `next/image`, `next/navigation`, `next/font/google`, `react` |
| **Tier 2** | **Installed Packages** | Third-party npm dependencies from `node_modules` | `lucide-react`, `@supabase/ssr`, `@radix-ui/*`, `zod`, `clsx`, `idb`, `sonner`, `tailwind-merge` |
| **Tier 3** | **Components** | UI primitives and feature component trees | `@/components/ui/*`, `@/components/app-shell/*`, `@/features/*/components/*` |
| **Tier 4** | **Context & Providers** | Application context providers and state wrappers | `@/provider/*`, `ThemeProvider`, auth/sync context providers |
| **Tier 5** | **Services, Lib & Utils**| Database clients, storage, API callers, utility functions | `@/lib/db`, `@/lib/supabase/*`, `@/lib/storage/*`, `@/services/*`, `@/lib/utils` |
| **Tier 6** | **Constants, Types & CSS**| Type definitions, Zod schemas, constants, stylesheets | `@/types/*`, `@/features/*/types`, `@/features/*/schema`, `./*.css` |

---

## 2. Unused Import & Dead Component Removal

Before writing or reordering imports, perform an audit of every imported symbol:

1. **Verify Usage**: Search for each imported identifier in the body of the file.
2. **Strip Unreferenced Imports**: If an icon (e.g., `BookOpen`, `Zap`), component, hook, or utility is imported but never rendered or called in the file, **delete it** from the import statement.
3. **Clean Up Empty Imports**: If an import clause becomes empty after stripping unused symbols, remove the entire `import` line.
4. **Preserve Side-Effect Imports**: Do not remove CSS imports (e.g. `import "./globals.css"`) or explicit polyfill imports that have no named bindings.

---

## 3. Code Formatting & Layout Hygiene

After ordering imports and eliminating dead references, format the file body for maximum readability:

1. **Fix JSX Syntax Glitches**:
   - Ensure no whitespace exists between the opening bracket and tag name (e.g. replace `< main ...>` with `<main ...>`, `< div>` with `<div>`, `</header >` with `</header>`).
2. **HTML Entity Escaping**:
   - In TSX/JSX text, replace raw quotes with escaped entities:
     - `"` → `&quot;`
     - `'` → `&apos;`
3. **Function & Component Signatures**:
   - Format props interfaces and function parameters cleanly with explicit types.
   - For components with complex props, break props onto multiple lines with 2-space indentation.
4. **Spacing & Line Breaks**:
   - Exactly **one blank line** between imports and module-level constants/types.
   - Exactly **one blank line** between component definitions or helper functions.
   - Exactly **one blank line** between distinct JSX sections (e.g. `<header>`, `<main>`, `<footer>`).
   - Eliminate triple or double blank lines throughout the file.
5. **Indentation**:
   - Use standard **2-space indentation** across all TypeScript, TSX, and CSS files.

---

## 4. Step-by-Step Execution Workflow

When tasked with formatting imports and cleaning a file:

1. **Read the Target File**: Inspect the full file using `view_file` to capture all imports and component code.
2. **Catalog Imports**:
   - List every imported symbol.
   - Cross-check against the file body to identify unused symbols.
3. **Partition into the 6 Tiers**:
   - Sort into Tier 1 through Tier 6.
   - Alphabetize named imports inside `{ ... }` for clean scanning.
4. **Inspect & Polish the Component Body**:
   - Check for and fix tag-name spacing bugs.
   - Check for unescaped characters.
   - Align indentation and clean up excess whitespace.
5. **Write the Cleaned File**:
   - Write the formatted content using `write_to_file` or `replace_file_content`.
6. **Verify Compilation**:
   - Run type checks or inspect for syntax regressions.
