# Phase 4: Dashboard & Visualization - Research

**Researched:** 2026-03-04
**Domain:** React Dashboard UI with shadcn/ui components
**Confidence:** HIGH

## Summary

This phase builds the XP dashboard UI on top of the existing `usePoints` hook and tier configuration. The technical foundation is solid: Phase 3 provides `PointsData` with monthly XP breakdowns for all four categories (TRANSACTOOR, BRIDGOOR, SWAPOOR, CHAINOOR), and the tier configuration includes display names, icons, and thresholds for computing "distance to next tier."

The implementation requires minimal new dependencies. shadcn/ui Skeleton and Badge components need to be added for loading states and tier badges. Number formatting uses native `Intl.NumberFormat`. Month navigation is simple state management with the existing 12-month array from `fillMonthRange()`.

**Primary recommendation:** Use shadcn/ui components (Skeleton, Badge, Card) with existing hooks. Add a `formatXP()` utility for consistent number display. Implement month navigation as local state indexing into `pointsData.months[]`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Dashboard Layout:**
- Stacked single column layout (not grid or sidebar)
- Total XP section at top: big number + "XP" label only (no extra decoration)
- Category sections below as compact rows: category name, XP value, tier badge, and distance to next tier
- Show USD totals alongside XP (e.g., "BRIDGOOR: 5,000 XP ($2,500 bridged)")

**Month Navigation:**
- Arrow buttons (< and >) to step through months
- Current month displayed between arrows
- Default view: current calendar month
- Monthly view only — no all-time cumulative option (that's Phase 5)
- Empty months show zeros for all categories (consistent UI)

**XP Breakdown Display:**
- All four categories always shown: TRANSACTOOR, BRIDGOOR, SWAPOOR, CHAINOOR
- Fixed order (not sorted by XP value)
- Numbers formatted with commas: "12,450 XP"
- Each row shows: category name, XP, tier badge, distance to next tier, USD volume

**Loading & Empty States:**
- Skeleton placeholders while loading (gray shapes where content will appear)
- Friendly empty state for wallets with no LiFi transactions: "No Jumper transactions found for this wallet"
- Inline error messages with retry button for fetch failures
- Refresh button to manually re-fetch transaction data

### Claude's Discretion
- Exact skeleton placeholder design
- Color scheme and typography details
- Animation/transition timing
- Mobile responsive breakpoints

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SCAN-05 | Results load in under 5 seconds for typical wallets | Already implemented in Phase 1 LiFi API. Dashboard adds no new fetches. |
| DASH-01 | Dashboard shows total XP for current month | `usePoints().pointsData.months[index].totalXP` - direct data access |
| DASH-02 | Dashboard shows XP breakdown by category | `MonthlyPoints.categories[]` provides all 4 categories per month |
| DASH-05 | User can view XP for previous months | Month navigation with index into `pointsData.months[]` array |
| DASH-06 | UI is minimal, single-page, comprehensible in <5 seconds | Stacked layout, shadcn/ui components, consistent skeleton loading |

</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.3 | UI framework | Project foundation |
| Next.js | 16.1.6 | App framework | Project foundation |
| Tailwind CSS | 4 | Styling | Project standard |
| shadcn/ui | 3.8.5 (CLI) | Component library | Project standard |
| lucide-react | 0.576.0 | Icons | Project standard |

### Components to Add
| Component | Installation | Purpose |
|-----------|--------------|---------|
| Skeleton | `npx shadcn@latest add skeleton` | Loading placeholder states |
| Badge | `npx shadcn@latest add badge` | Tier name badges |

### Already Available (No Install Needed)
| Component | Status | Used For |
|-----------|--------|----------|
| Card | Installed | Category row containers |
| Button | Installed | Refresh, retry, month navigation |
| Alert | Installed | Error messages |

**Installation:**
```bash
npx shadcn@latest add skeleton badge
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── ui/              # shadcn components (existing)
│   ├── dashboard/       # NEW: Dashboard-specific components
│   │   ├── xp-total.tsx         # Total XP hero section
│   │   ├── category-row.tsx     # Single category display row
│   │   ├── month-nav.tsx        # Month navigation arrows
│   │   └── dashboard-skeleton.tsx  # Loading state
│   ├── wallet-input.tsx # Existing
│   └── scan-progress.tsx # Existing
├── hooks/
│   └── usePoints.ts     # Existing - primary data source
└── lib/
    ├── points-types.ts  # Existing - PointsData types
    ├── tiers-config.ts  # Existing - tier thresholds
    └── format.ts        # NEW: Number formatting utilities
```

### Pattern 1: Month Navigation State
**What:** Use local React state to track current month index
**When to use:** Navigating between months in `pointsData.months[]` array
**Example:**
```typescript
// Source: React useState pattern
function Dashboard() {
  const { pointsData } = usePoints(wallet);
  // Default to current month (last in array, index 11)
  const [monthIndex, setMonthIndex] = useState(11);

  const currentMonth = pointsData?.months[monthIndex];

  const goToPrevMonth = () => setMonthIndex(i => Math.max(0, i - 1));
  const goToNextMonth = () => setMonthIndex(i => Math.min(11, i + 1));

  const canGoPrev = monthIndex > 0;
  const canGoNext = monthIndex < 11;
}
```

### Pattern 2: Derive "Distance to Next Tier" from Config
**What:** Calculate how much more is needed to reach the next tier
**When to use:** Displaying "X more to Tier Y" in category rows
**Example:**
```typescript
// Source: Existing tiers-config.ts + custom logic
import { getCategoryConfig } from '@/lib/tiers-config';

function getNextTierInfo(categoryId: CategoryId, currentValue: number) {
  const config = getCategoryConfig(categoryId);
  if (!config) return null;

  // Tiers are sorted descending by threshold
  // Find first tier where threshold > currentValue
  const nextTier = [...config.tiers]
    .reverse() // Now ascending
    .find(tier => tier.threshold > currentValue);

  if (!nextTier) return null; // Already at max tier

  return {
    tierName: nextTier.name,
    distance: nextTier.threshold - currentValue,
    unit: config.unit,
  };
}
```

### Pattern 3: Skeleton Matching Content Layout
**What:** Skeleton shapes that match final content dimensions
**When to use:** Loading states before data arrives
**Example:**
```typescript
// Source: shadcn/ui skeleton component
import { Skeleton } from "@/components/ui/skeleton";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Total XP skeleton */}
      <div className="text-center">
        <Skeleton className="h-12 w-48 mx-auto" />
        <Skeleton className="h-6 w-24 mx-auto mt-2" />
      </div>

      {/* Category rows skeleton */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Fetching data in dashboard components:** Dashboard consumes `usePoints()`, does NOT fetch. All fetching is done by existing hooks.
- **Sorting categories by XP:** Per CONTEXT.md, fixed order always (TRANSACTOOR, BRIDGOOR, SWAPOOR, CHAINOOR).
- **Using `toLocaleString()` without locale:** Use `Intl.NumberFormat('en-US')` for consistent comma formatting.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Number formatting | Custom regex/string manipulation | `Intl.NumberFormat` | Handles edge cases, locale-aware |
| Loading skeletons | CSS animations from scratch | shadcn/ui Skeleton | Consistent pulse animation, accessible |
| Tier badges | Custom styled spans | shadcn/ui Badge | Consistent variants, accessibility |
| Month display | Date string parsing | `Intl.DateTimeFormat` | Correct month names, locale-aware |

**Key insight:** The browser's `Intl` API handles all formatting needs. No external libraries required.

## Common Pitfalls

### Pitfall 1: Month Array Index Off-by-One
**What goes wrong:** Assuming `months[0]` is current month when it's actually oldest month
**Why it happens:** `fillMonthRange()` returns chronologically sorted (oldest to newest)
**How to avoid:** Default `monthIndex` to `months.length - 1` (index 11) for current month
**Warning signs:** Dashboard shows wrong month on initial load

### Pitfall 2: Missing USD Volume Data
**What goes wrong:** Trying to show USD for TRANSACTOOR or CHAINOOR
**Why it happens:** Only BRIDGOOR and SWAPOOR track USD volume
**How to avoid:** Check `categoryId` before showing USD; transaction count and chain count have no USD
**Warning signs:** `$NaN` or `$undefined` in UI

### Pitfall 3: Layout Shift on Data Load
**What goes wrong:** Page jumps when skeleton is replaced with content
**Why it happens:** Skeleton dimensions don't match final content
**How to avoid:** Use same height/width classes for skeleton and content; wrap in fixed-height containers
**Warning signs:** Jerky transitions, content pushing other elements around

### Pitfall 4: Stale Month Index After Data Refresh
**What goes wrong:** After retry/refresh, monthIndex points to wrong month
**Why it happens:** New data might have different month range
**How to avoid:** Reset monthIndex to 11 (current month) on data refresh/wallet change
**Warning signs:** Empty month displayed when data exists

### Pitfall 5: Inconsistent Number Formatting
**What goes wrong:** "12450 XP" in one place, "12,450 XP" in another
**Why it happens:** Using different formatting approaches in different components
**How to avoid:** Create single `formatXP()` utility, use everywhere
**Warning signs:** Visual inconsistency in number displays

## Code Examples

Verified patterns from project and official sources:

### Number Formatting Utility
```typescript
// Source: MDN Intl.NumberFormat
// File: src/lib/format.ts

const xpFormatter = new Intl.NumberFormat('en-US');
const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatXP(value: number): string {
  return `${xpFormatter.format(value)} XP`;
}

export function formatUSD(value: number): string {
  return usdFormatter.format(value);
}

export function formatMonthLabel(monthKey: string): string {
  // monthKey is "YYYY-MM" format
  const [year, month] = monthKey.split('-');
  const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1));
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
}
```

### Category Row Component Pattern
```typescript
// Source: Project patterns + shadcn/ui
// File: src/components/dashboard/category-row.tsx

import { Badge } from "@/components/ui/badge";
import { formatXP, formatUSD } from "@/lib/format";
import type { CategoryPoints } from "@/lib/points-types";

interface CategoryRowProps {
  category: CategoryPoints;
  volume?: number; // USD volume for bridgoor/swapoor
  nextTierInfo: { tierName: string; distance: number; unit: string } | null;
}

export function CategoryRow({ category, volume, nextTierInfo }: CategoryRowProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <span className="font-medium uppercase">{category.categoryId}</span>
        <span className="text-lg font-bold">{formatXP(category.xp)}</span>
        {category.tierName && (
          <Badge variant="secondary">{category.tierName}</Badge>
        )}
      </div>
      <div className="text-sm text-muted-foreground">
        {volume !== undefined && formatUSD(volume)}
        {nextTierInfo && (
          <span className="ml-2">
            {nextTierInfo.distance} {nextTierInfo.unit} to {nextTierInfo.tierName}
          </span>
        )}
      </div>
    </div>
  );
}
```

### Month Navigation Component Pattern
```typescript
// Source: lucide-react icons
// File: src/components/dashboard/month-nav.tsx

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMonthLabel } from "@/lib/format";

interface MonthNavProps {
  monthKey: string;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function MonthNav({ monthKey, canGoPrev, canGoNext, onPrev, onNext }: MonthNavProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrev}
        disabled={!canGoPrev}
        aria-label="Previous month"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <span className="min-w-[150px] text-center font-medium">
        {formatMonthLabel(monthKey)}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={!canGoNext}
        aria-label="Next month"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| moment.js for dates | Native Intl.DateTimeFormat | 2020+ | No dependency needed |
| numeral.js for numbers | Native Intl.NumberFormat | 2020+ | No dependency needed |
| Custom skeleton CSS | shadcn/ui Skeleton | shadcn v1+ | Consistent, accessible |

**Deprecated/outdated:**
- moment.js: Intl APIs handle all date formatting needs
- numeral.js: Intl.NumberFormat is sufficient and built-in

## Open Questions

1. **Tier badge colors**
   - What we know: Badge component has variants (default, secondary, outline, destructive)
   - What's unclear: Should different tiers have different colors? (e.g., gold for "Grand Degen")
   - Recommendation: Start with `secondary` variant for all, enhance in Phase 5 if needed

2. **USD display for non-volume categories**
   - What we know: TRANSACTOOR shows transaction count, CHAINOOR shows chain count
   - What's unclear: Should we show anything in the USD column for these?
   - Recommendation: Show count with unit (e.g., "15 transactions", "7 chains") per CONTEXT.md

## Sources

### Primary (HIGH confidence)
- [shadcn/ui Skeleton docs](https://ui.shadcn.com/docs/components/radix/skeleton) - Installation and usage patterns
- [shadcn/ui Badge docs](https://ui.shadcn.com/docs/components/radix/badge) - Variants and styling
- [MDN Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) - Number formatting API
- [lucide-react ChevronLeft/ChevronRight](https://lucide.dev/icons/chevron-left) - Icon components

### Secondary (MEDIUM confidence)
- [React Loading Skeleton best practices](https://blog.logrocket.com/handling-react-loading-states-react-loading-skeleton/) - Skeleton design patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing project dependencies, only adding 2 shadcn components
- Architecture: HIGH - Simple state management, existing hooks provide all data
- Pitfalls: HIGH - Based on codebase analysis and common React patterns

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (30 days - stable patterns, no fast-moving dependencies)
