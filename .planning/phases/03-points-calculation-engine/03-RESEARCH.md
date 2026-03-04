# Phase 3: Points Calculation Engine - Research

**Researched:** 2026-03-04
**Domain:** XP calculation with configurable tier rules (pure computation)
**Confidence:** HIGH

## Summary

Phase 3 implements XP calculation for four categories (TRANSACTOOR, BRIDGOOR, SWAPOOR, CHAINOOR) using threshold-based tier rules. The calculation is pure computation over monthly aggregates from Phase 2, with USD values already provided by the LiFi API (`amountUSD` field). No historical price lookup is needed.

The architecture is straightforward: a JSON configuration file defines tier thresholds, pure functions calculate XP from monthly aggregates, and a derived React hook exposes the results. The key challenge is that exact Jumper tier thresholds are not publicly documented, requiring placeholder values that match the known structure (6 tiers: Novice, Power User, Chad, Ape, Degen, Grand Degen).

**Primary recommendation:** Create a simple tier configuration JSON with TypeScript validation, pure calculation functions, and a `usePoints()` hook that derives from `useClassifiedTransactions()`.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Tier rules structure:**
  - Threshold-based: reach a threshold = get that tier's fixed XP
  - Fixed XP per tier (not multipliers or linear scaling)
  - Customized per category - BRIDGOOR uses USD thresholds, CHAINOOR uses chain counts, etc.
  - Highest qualified tier only - no partial credit, no cumulative tier stacking

- **Config format:**
  - JSON file in repo (e.g., `src/config/tiers.json`)
  - Build-time validation with TypeScript type assertion
  - Ship with Jumper's actual tier values (research real thresholds)
  - Include category metadata: display names, descriptions, icons (for Phase 4)

- **Edge case handling:**
  - Zero activity: Show 0 XP explicitly for inactive categories
  - USD rounding: Truncate (floor) for tier matching - $999.99 stays $999.99
  - Missing timestamp: Skip transaction from calculations
  - Missing/zero amountUSD: Count as $0 volume (still counts for TRANSACTOOR transaction count)

- **Calculation outputs:**
  - Return XP per category + total XP for each month
  - Per-month data only - no cumulative totals (consumer calculates if needed)
  - Pure numbers only - no display metadata in results
  - Expose via derived hook: `usePoints()` derives from `useClassifiedTransactions()`

### Claude's Discretion

- Exact JSON schema structure
- TypeScript type naming conventions
- Internal calculation helpers
- Test data structure

### Deferred Ideas (OUT OF SCOPE)

None - discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CLASS-04 | App calculates USD value at transaction time using historical prices | LiFi API already provides `amountUSD` field - no historical lookup needed. Extend MonthlyAggregate to include `bridgeVolumeUSD` and `swapVolumeUSD`. |
| POINTS-01 | App calculates TRANSACTOOR XP based on transaction count tiers | Pure function: `calculateTransactoorXP(transactionCount, tierConfig)`. Use existing `MonthlyAggregate.transactionCount`. |
| POINTS-02 | App calculates BRIDGOOR XP based on USD volume bridged | Pure function: `calculateBridgoorXP(bridgeVolumeUSD, tierConfig)`. Requires new `bridgeVolumeUSD` field in MonthlyAggregate. |
| POINTS-03 | App calculates SWAPOOR XP based on USD volume swapped | Pure function: `calculateSwapoorXP(swapVolumeUSD, tierConfig)`. Requires new `swapVolumeUSD` field in MonthlyAggregate. |
| POINTS-04 | App calculates CHAINOOR XP based on unique chains used | Pure function: `calculateChainoorXP(uniqueChainCount, tierConfig)`. Use existing `MonthlyAggregate.uniqueChains.size`. |
| POINTS-05 | Points are bucketed by month (YYYY-MM) | Use existing monthly aggregation from Phase 2. Calculate XP per month using `monthsArray`. |
| POINTS-06 | Tier rules are configurable (not hardcoded) | JSON config file at `src/config/tiers.json` with TypeScript types and build-time validation. |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | 5.x | Type-safe configuration and calculation | Project standard, enables build-time validation |
| Jest | 30.x | Unit testing pure functions | Already configured in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None needed | - | Pure computation phase | No external dependencies required |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| JSON config | Zod schema | Zod adds runtime validation but project doesn't use it. TypeScript type assertion is sufficient for static JSON. |
| JSON config | TypeScript object | JSON is more discoverable/editable by non-developers. Project decision is JSON. |

**Installation:**
```bash
# No new dependencies needed
# Jest already installed for testing
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── config/
│   └── tiers.json           # Tier configuration (new)
├── lib/
│   ├── tiers-types.ts       # TypeScript types for tier config (new)
│   ├── tiers-config.ts      # Config loader with validation (new)
│   ├── points-types.ts      # XP calculation types (new)
│   ├── points.ts            # Pure XP calculation functions (new)
│   ├── classification-types.ts  # Extend with USD volumes
│   └── classification.ts        # Extend aggregation
└── hooks/
    └── usePoints.ts         # Derived hook (new)
```

### Pattern 1: Threshold-Based Tier Matching

**What:** Find highest tier where activity >= threshold, return that tier's fixed XP.
**When to use:** All four XP categories use this pattern.
**Example:**
```typescript
// Pattern: threshold-based tier matching
interface TierLevel {
  name: string;
  threshold: number;  // Minimum value to qualify
  xp: number;         // Fixed XP awarded for this tier
}

function findTier(value: number, tiers: TierLevel[]): TierLevel | null {
  // Tiers must be sorted by threshold descending
  // Find first tier where value >= threshold (highest qualifying)
  for (const tier of tiers) {
    if (value >= tier.threshold) {
      return tier;
    }
  }
  return null; // Below minimum tier
}

function calculateXP(value: number, tiers: TierLevel[]): number {
  const tier = findTier(value, tiers);
  return tier?.xp ?? 0; // 0 XP if no tier reached
}
```

### Pattern 2: Category-Specific Tier Configuration

**What:** Each category has its own tier levels with different thresholds and XP values.
**When to use:** BRIDGOOR uses USD, CHAINOOR uses chain count, etc.
**Example:**
```typescript
// Config structure per CONTEXT.md decisions
interface CategoryTierConfig {
  id: 'transactoor' | 'bridgoor' | 'swapoor' | 'chainoor';
  displayName: string;      // For Phase 4 UI
  description: string;      // For Phase 4 UI
  icon: string;             // Icon identifier for Phase 4
  unit: string;             // "transactions", "USD", "chains"
  tiers: TierLevel[];       // Sorted by threshold descending
}

interface TiersConfig {
  version: string;          // For future config migrations
  categories: CategoryTierConfig[];
}
```

### Pattern 3: Derived Hook Pattern

**What:** `usePoints()` computes XP from `useClassifiedTransactions()` output.
**When to use:** XP calculation that depends on classified data.
**Example:**
```typescript
// Derived hook pattern (existing project pattern)
export function usePoints(wallet: string | null): UsePointsResult {
  const { classifiedData, isLoading, isComplete, error, cancel, retry } =
    useClassifiedTransactions(wallet);

  const pointsData = useMemo<PointsData | null>(() => {
    if (!classifiedData) return null;
    return calculateAllPoints(classifiedData, tiersConfig);
  }, [classifiedData]);

  return { pointsData, isLoading, isComplete, error, cancel, retry };
}
```

### Anti-Patterns to Avoid

- **Cumulative tier stacking:** CONTEXT.md specifies "highest qualified tier only". Do NOT sum XP from all tiers the user qualifies for.
- **Linear scaling:** CONTEXT.md specifies "fixed XP per tier". Do NOT calculate XP as (value * multiplier).
- **Hardcoded thresholds:** CONTEXT.md requires configurable JSON. Keep all numbers in tiers.json.
- **USD decimals in comparison:** Truncate (floor) USD values per CONTEXT.md before tier matching.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| USD parsing | parseFloat with custom rounding | Math.floor() on amountUSD | amountUSD is already a numeric string from LiFi API |
| Date handling | Manual month extraction | Existing getMonthKey() from classification.ts | Already handles UTC correctly |
| Type validation | Runtime schema validation | TypeScript `as const` + type assertion | Build-time is sufficient for static JSON |

**Key insight:** This phase is pure computation over already-processed data. The complexity is in the configuration structure, not the calculation logic.

## Common Pitfalls

### Pitfall 1: Tier Array Order
**What goes wrong:** Tiers sorted ascending means first match is lowest tier, not highest.
**Why it happens:** Natural inclination to sort smallest-to-largest.
**How to avoid:** Sort tiers by threshold DESCENDING in config. First match = highest qualified.
**Warning signs:** Users always showing lowest tier despite high activity.

### Pitfall 2: USD String Comparison
**What goes wrong:** Comparing USD as strings ("1000" < "999" is true alphabetically).
**Why it happens:** LiFi API returns amountUSD as string.
**How to avoid:** Always parseFloat() before comparison, then Math.floor() per CONTEXT.md.
**Warning signs:** Tier matching behaves erratically for values crossing digit boundaries.

### Pitfall 3: Zero vs Null Confusion
**What goes wrong:** Returning null for no activity when 0 XP is expected.
**Why it happens:** Using nullish coalescing without thought.
**How to avoid:** CONTEXT.md specifies "Show 0 XP explicitly for inactive categories". Always return 0, never null.
**Warning signs:** UI shows "N/A" or "Loading" for inactive categories.

### Pitfall 4: Missing USD Volume Aggregation
**What goes wrong:** Current MonthlyAggregate doesn't track USD volumes, only counts.
**Why it happens:** Phase 2 didn't need USD for classification.
**How to avoid:** Extend classification.ts to sum amountUSD by transaction type during aggregation.
**Warning signs:** bridgeVolumeUSD/swapVolumeUSD undefined.

### Pitfall 5: Set Serialization in Tests
**What goes wrong:** Jest snapshot tests fail because Set() doesn't serialize cleanly.
**Why it happens:** MonthlyAggregate uses Set<number> for uniqueChains.
**How to avoid:** Convert Set to array or use .size for assertions. Don't snapshot Sets.
**Warning signs:** Failing tests with "[object Set]" in output.

## Code Examples

Verified patterns based on project conventions and CONTEXT.md decisions:

### Tier Configuration Schema
```typescript
// src/lib/tiers-types.ts
export interface TierLevel {
  /** Tier display name (e.g., "Grand Degen") */
  name: string;
  /** Minimum threshold to qualify for this tier */
  threshold: number;
  /** Fixed XP awarded for reaching this tier */
  xp: number;
}

export interface CategoryConfig {
  /** Category identifier */
  id: 'transactoor' | 'bridgoor' | 'swapoor' | 'chainoor';
  /** Display name for UI (Phase 4) */
  displayName: string;
  /** Category description for UI (Phase 4) */
  description: string;
  /** Icon identifier for UI (Phase 4) */
  icon: string;
  /** Unit of measurement (for display) */
  unit: string;
  /** Tier levels sorted by threshold DESCENDING */
  tiers: TierLevel[];
}

export interface TiersConfig {
  /** Config version for future migrations */
  version: string;
  /** All category configurations */
  categories: CategoryConfig[];
}
```

### Tier Matching Function
```typescript
// src/lib/points.ts
import type { TierLevel } from './tiers-types';

/**
 * Find the highest tier the value qualifies for.
 * Tiers must be sorted by threshold descending.
 */
export function findQualifyingTier(
  value: number,
  tiers: TierLevel[]
): TierLevel | null {
  for (const tier of tiers) {
    if (value >= tier.threshold) {
      return tier;
    }
  }
  return null;
}

/**
 * Calculate XP for a value given tier configuration.
 * Returns 0 if no tier is reached (per CONTEXT.md: explicit 0 XP).
 */
export function calculateTierXP(
  value: number,
  tiers: TierLevel[]
): number {
  const tier = findQualifyingTier(value, tiers);
  return tier?.xp ?? 0;
}
```

### Extended Monthly Aggregate
```typescript
// Extend existing MonthlyAggregate in classification-types.ts
export interface MonthlyAggregate {
  month: string;
  transactionCount: number;
  bridgeCount: number;
  swapCount: number;
  uniqueChains: Set<number>;
  // NEW: USD volume tracking for Phase 3
  bridgeVolumeUSD: number;  // Sum of amountUSD for bridge transactions
  swapVolumeUSD: number;    // Sum of amountUSD for swap transactions
}
```

### Points Data Structure
```typescript
// src/lib/points-types.ts
export interface CategoryPoints {
  /** Category identifier */
  categoryId: 'transactoor' | 'bridgoor' | 'swapoor' | 'chainoor';
  /** XP earned this month for this category */
  xp: number;
  /** Tier name achieved (null if no tier reached) */
  tierName: string | null;
}

export interface MonthlyPoints {
  /** Month identifier (YYYY-MM) */
  month: string;
  /** XP by category */
  categories: CategoryPoints[];
  /** Total XP for this month */
  totalXP: number;
}

export interface PointsData {
  /** Points by month (chronological) */
  months: MonthlyPoints[];
}
```

## Jumper Tier Values Research

### What We Know (HIGH confidence)
- **6 tier levels per category:** Novice, Power User, Chad, Ape, Degen, Grand Degen
- **4 XP categories:**
  - TRANSACTOOR (transaction count)
  - BRIDGOOR (USD volume bridged)
  - SWAPOOR (USD volume swapped)
  - CHAINOOR (unique chains used)
- **Monthly calculation:** PDAs issued at month's end based on previous month's activity
- **TRANSACTOOR max:** ~50 transactions per month mentioned as "max" target
- **Top 20% benchmark:** $10,000 volume + 25 transactions + multiple chains

### What's Unknown (needs validation)
- **Exact tier thresholds:** Not publicly documented. Community estimates range widely.
- **Exact XP values per tier:** Not disclosed by Jumper.
- **Minimum USD value per transaction:** Anti-farming threshold exists but value unknown.

### Recommended Placeholder Values
Based on community research and reasonable tier progression:

```json
{
  "version": "1.0.0",
  "categories": [
    {
      "id": "transactoor",
      "displayName": "Transactoor",
      "description": "Transaction count",
      "icon": "activity",
      "unit": "transactions",
      "tiers": [
        { "name": "Grand Degen", "threshold": 50, "xp": 500 },
        { "name": "Degen", "threshold": 30, "xp": 300 },
        { "name": "Ape", "threshold": 20, "xp": 200 },
        { "name": "Chad", "threshold": 10, "xp": 100 },
        { "name": "Power User", "threshold": 5, "xp": 50 },
        { "name": "Novice", "threshold": 1, "xp": 10 }
      ]
    },
    {
      "id": "bridgoor",
      "displayName": "Bridgoor",
      "description": "Bridge volume",
      "icon": "bridge",
      "unit": "USD",
      "tiers": [
        { "name": "Grand Degen", "threshold": 50000, "xp": 500 },
        { "name": "Degen", "threshold": 25000, "xp": 300 },
        { "name": "Ape", "threshold": 10000, "xp": 200 },
        { "name": "Chad", "threshold": 5000, "xp": 100 },
        { "name": "Power User", "threshold": 1000, "xp": 50 },
        { "name": "Novice", "threshold": 100, "xp": 10 }
      ]
    },
    {
      "id": "swapoor",
      "displayName": "Swapoor",
      "description": "Swap volume",
      "icon": "swap",
      "unit": "USD",
      "tiers": [
        { "name": "Grand Degen", "threshold": 50000, "xp": 500 },
        { "name": "Degen", "threshold": 25000, "xp": 300 },
        { "name": "Ape", "threshold": 10000, "xp": 200 },
        { "name": "Chad", "threshold": 5000, "xp": 100 },
        { "name": "Power User", "threshold": 1000, "xp": 50 },
        { "name": "Novice", "threshold": 100, "xp": 10 }
      ]
    },
    {
      "id": "chainoor",
      "displayName": "Chainoor",
      "description": "Unique chains used",
      "icon": "chains",
      "unit": "chains",
      "tiers": [
        { "name": "Grand Degen", "threshold": 15, "xp": 500 },
        { "name": "Degen", "threshold": 10, "xp": 300 },
        { "name": "Ape", "threshold": 7, "xp": 200 },
        { "name": "Chad", "threshold": 5, "xp": 100 },
        { "name": "Power User", "threshold": 3, "xp": 50 },
        { "name": "Novice", "threshold": 1, "xp": 10 }
      ]
    }
  ]
}
```

**Note:** These are placeholder values. Per CONTEXT.md, the JSON config allows updating without code changes once real thresholds are discovered.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Historical price lookup | API-provided amountUSD | LiFi migration (Phase 1-2) | No external price API needed |
| Hardcoded tier values | JSON configuration | This phase | Easy updates when real values known |

**Deprecated/outdated:**
- Covalent API: Replaced by LiFi Analytics API (already done in Phase 1-2)
- Historical price services: Not needed - LiFi provides USD values at transaction time

## Open Questions

1. **Exact Jumper tier thresholds**
   - What we know: 6 tiers exist, community estimates vary widely
   - What's unclear: Official threshold and XP values per category
   - Recommendation: Ship with placeholder values, document in config that values need validation. JSON config makes updates trivial.

2. **Anti-farming minimum USD threshold**
   - What we know: Jumper has a minimum USD value per transaction to count
   - What's unclear: Exact threshold (likely $1-5)
   - Recommendation: Can be added to config later if discovered. Current implementation counts all transactions.

## Sources

### Primary (HIGH confidence)
- Project codebase: `src/lib/lifi-types.ts` - amountUSD field available on all transfers
- Project codebase: `src/lib/classification-types.ts` - existing MonthlyAggregate structure
- Project codebase: `src/hooks/useClassifiedTransactions.ts` - derived hook pattern
- 03-CONTEXT.md - user decisions on tier structure and config format

### Secondary (MEDIUM confidence)
- [LI.FI Loyalty Pass Documentation](https://li.fi/knowledge-hub/the-loyalty-pass/) - tier names (Novice through Grand Degen), monthly calculation
- [Blocmates Jumper Overview](https://www.blocmates.com/articles/jumper-the-ultimate-bridge-and-swap-layer) - XP category names confirmed

### Tertiary (LOW confidence)
- X/Twitter community posts - TRANSACTOOR ~50 tx/month max, $10k volume benchmark
- Community farming guides - threshold estimates vary significantly

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new dependencies, pure TypeScript
- Architecture: HIGH - follows existing project patterns (derived hooks, pure functions)
- Tier values: LOW - exact Jumper thresholds not publicly documented

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (30 days - stable domain, but tier values may be discovered sooner)
