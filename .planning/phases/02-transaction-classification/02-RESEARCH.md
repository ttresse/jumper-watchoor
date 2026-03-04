# Phase 2: Transaction Classification - Research

**Researched:** 2026-03-04
**Domain:** Transaction classification, monthly aggregation, TypeScript data transformation
**Confidence:** HIGH

## Summary

Phase 2 is dramatically simplified by the LiFi API migration completed in Phase 1. The API already provides `sending.chainId` and `receiving.chainId` directly on each transfer, making bridge vs swap classification trivial (single comparison). Monthly aggregation uses the `sending.timestamp` Unix timestamp with standard JavaScript Date APIs. No external libraries are needed.

The implementation pattern is straightforward: a pure function transforms `LiFiTransfer[]` into a classified monthly aggregation structure. This function has no side effects, making it easily testable. The React integration involves a single hook that derives classified data from the existing `useLiFiTransfers` hook.

**Primary recommendation:** Implement classification as pure transformation functions with a derived data hook, not store mutations.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

**NOTE:** The original CONTEXT.md was written for the Covalent approach. The API migration to LiFi renders several decisions obsolete or already satisfied. Below shows the original decisions with annotations on current applicability.

**Classification Logic:**
- Compare source chain ID to destination chain ID *(APPLICABLE: use `sending.chainId !== receiving.chainId`)*
- Different chain IDs = bridge, same chain ID = swap *(APPLICABLE)*
- If destination chain ID missing, treat as swap *(OBSOLETE: LiFi always provides both)*
- Decode LiFi contract event logs *(OBSOLETE: not needed, API provides chain IDs directly)*
- CHAINOOR tracking: count source chain only *(APPLICABLE: use `sending.chainId` only)*

**Status Verification:**
- Use Covalent's `tx_succeeded` field *(OBSOLETE: LiFi filters by `status=DONE` in API call)*
- Trust source transaction success only *(ALREADY SATISFIED: API returns only DONE status)*
- Exclude zero-value transactions *(REVIEW: May need to check `sending.amountUSD === "0"`)*
- Failed/reverted transactions do not count toward TRANSACTOOR *(ALREADY SATISFIED)*

**Monthly Boundaries:**
- Use UTC timezone for all transaction bucketing *(APPLICABLE)*
- Mark current (partial) month as "In Progress" *(APPLICABLE: UI concern for Phase 4)*
- Limit aggregation to last 12 months *(APPLICABLE)*
- Show all months in range including zero activity *(APPLICABLE)*

**Output Structure:**
- Store both raw and classified data *(APPLICABLE: raw in useLiFiTransfers, classified in new hook)*
- Map keyed by YYYY-MM format *(APPLICABLE)*
- Classification after all chains complete *(ALREADY SATISFIED: hook waits for isComplete)*
- Track classification errors *(REVIEW: may be unnecessary with LiFi's consistent format)*

### Claude's Discretion
- Exact parsing implementation *(APPLICABLE: simple property access now)*
- Error handling for malformed data *(APPLICABLE: validate chain IDs are numbers)*
- Memory optimization for large sets *(APPLICABLE: single pass aggregation)*
- Internal data structure *(APPLICABLE)*

### Deferred Ideas (OUT OF SCOPE)
None - discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CLASS-01 | App classifies transactions as bridge (cross-chain) or swap (same-chain) | Single comparison: `sending.chainId !== receiving.chainId`. LiFi API provides both chain IDs directly on every transfer. |
| CLASS-02 | App counts total LiFi transactions per month | Group by `YYYY-MM` derived from `sending.timestamp` (Unix seconds). Count array length per group. |
| CLASS-03 | App tracks unique chains used per month | Collect `sending.chainId` into a Set per month, track Set.size for count. |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | 5.x | Type-safe classification logic | Already in project, enables compile-time safety |
| Native Date | N/A | UTC month extraction from timestamp | No library needed, `new Date(timestamp * 1000)` handles Unix seconds |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React (useMemo) | 19.x | Derive classified data without re-renders | Wrap expensive aggregation in useMemo |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native Date | date-fns | overkill for YYYY-MM formatting, adds dependency |
| useMemo | Zustand computed | useMemo is simpler, data is derived not stored |
| Manual grouping | lodash groupBy | adds 70KB dependency for 10-line function |

**Installation:**
```bash
# No new packages needed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── lifi-types.ts          # Existing - LiFiTransfer type
│   ├── classification.ts      # NEW - pure classification functions
│   └── classification-types.ts # NEW - ClassifiedMonth, AggregatedData types
├── hooks/
│   ├── useLiFiTransfers.ts    # Existing - raw transfer data
│   └── useClassifiedData.ts   # NEW - derived classified hook
└── stores/
    └── scan.store.ts          # Existing - no changes needed
```

### Pattern 1: Pure Transformation Function
**What:** Classification logic as a pure function with no side effects
**When to use:** Always for data transformation
**Example:**
```typescript
// Source: Standard functional programming pattern
export function classifyTransfer(transfer: LiFiTransfer): TransactionType {
  return transfer.sending.chainId !== transfer.receiving.chainId
    ? 'bridge'
    : 'swap';
}
```

### Pattern 2: Single-Pass Aggregation
**What:** Process all transfers in one iteration to build monthly aggregates
**When to use:** When computing multiple derived values from same source
**Example:**
```typescript
// Source: Standard reduce pattern
export function aggregateByMonth(transfers: LiFiTransfer[]): Map<string, MonthlyAggregate> {
  const result = new Map<string, MonthlyAggregate>();

  for (const transfer of transfers) {
    const monthKey = getMonthKey(transfer.sending.timestamp);
    const existing = result.get(monthKey) ?? createEmptyMonth(monthKey);

    // Update counts
    existing.transactionCount++;
    existing.uniqueChains.add(transfer.sending.chainId);

    if (classifyTransfer(transfer) === 'bridge') {
      existing.bridgeCount++;
    } else {
      existing.swapCount++;
    }

    result.set(monthKey, existing);
  }

  return result;
}
```

### Pattern 3: Derived Hook with useMemo
**What:** Compute classified data as derived state from raw transfers
**When to use:** React components need classified data
**Example:**
```typescript
// Source: React best practices
export function useClassifiedData(wallet: string | null): ClassifiedDataResult {
  const { transfers, isComplete } = useLiFiTransfers(wallet);

  const aggregated = useMemo(() => {
    if (!isComplete) return null;
    return aggregateByMonth(transfers);
  }, [transfers, isComplete]);

  return { aggregated, isReady: isComplete };
}
```

### Anti-Patterns to Avoid
- **Storing derived data in Zustand:** Classification is computed from transfers, not separate state. Storing it creates sync bugs.
- **Multiple iterations:** Don't classify then group then count. Single pass handles all.
- **Local timezone dates:** Always use UTC to avoid cross-timezone inconsistencies.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| UTC date formatting | Custom parser | `toISOString().slice(0,7)` | Battle-tested, handles edge cases |
| Month filling | Manual loop | Generate 12-month range, merge with data | Clearer separation of concerns |

**Key insight:** The classification logic is genuinely simple with LiFi data. The complexity is in ensuring UTC consistency and filling empty months, both solved with standard JavaScript.

## Common Pitfalls

### Pitfall 1: Timezone Confusion
**What goes wrong:** Using `getMonth()` instead of `getUTCMonth()` causes transactions to appear in wrong months near month boundaries
**Why it happens:** Local timezone offset shifts midnight differently depending on user location
**How to avoid:** Always use UTC methods: `getUTCFullYear()`, `getUTCMonth()`
**Warning signs:** Same wallet shows different monthly counts in different timezones

### Pitfall 2: Forgetting to Multiply Timestamp
**What goes wrong:** `new Date(timestamp)` interprets Unix seconds as milliseconds, showing dates in 1970
**Why it happens:** JavaScript Date constructor expects milliseconds, LiFi provides seconds
**How to avoid:** Always multiply: `new Date(timestamp * 1000)`
**Warning signs:** All transactions appear in January 1970

### Pitfall 3: Empty Month Gaps
**What goes wrong:** UI shows only months with activity, confusing users about timeframe
**Why it happens:** Map only contains keys for months with transactions
**How to avoid:** Generate 12-month range first, fill with data or empty defaults
**Warning signs:** Sparse monthly display, can't see "zero activity" months

### Pitfall 4: Mutable Set in Aggregation
**What goes wrong:** Multiple months share same Set reference, corrupting uniqueChains counts
**Why it happens:** Reusing object reference instead of creating new Set per month
**How to avoid:** `createEmptyMonth()` must return new Set instance each call
**Warning signs:** uniqueChains count keeps growing incorrectly

## Code Examples

### Get Month Key from Unix Timestamp (UTC)
```typescript
// Source: JavaScript Date UTC methods
export function getMonthKey(unixSeconds: number): string {
  const date = new Date(unixSeconds * 1000);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
```

### Type Definitions
```typescript
// Source: Project-specific, derived from LiFi types
export type TransactionType = 'bridge' | 'swap';

export interface MonthlyAggregate {
  month: string;           // YYYY-MM format
  transactionCount: number;
  bridgeCount: number;
  swapCount: number;
  uniqueChains: Set<number>;
}

export interface ClassifiedData {
  months: Map<string, MonthlyAggregate>;
  totalTransactions: number;
  totalBridges: number;
  totalSwaps: number;
}
```

### Fill Empty Months
```typescript
// Source: Standard date iteration pattern
export function fillMonthRange(
  data: Map<string, MonthlyAggregate>,
  monthCount: number = 12
): MonthlyAggregate[] {
  const now = new Date();
  const result: MonthlyAggregate[] = [];

  for (let i = monthCount - 1; i >= 0; i--) {
    const date = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() - i,
      1
    ));
    const key = getMonthKey(Math.floor(date.getTime() / 1000));

    result.push(data.get(key) ?? {
      month: key,
      transactionCount: 0,
      bridgeCount: 0,
      swapCount: 0,
      uniqueChains: new Set(),
    });
  }

  return result;
}
```

### Complete Classification Hook
```typescript
// Source: React patterns + project structure
export function useClassifiedTransactions(wallet: string | null) {
  const { transfers, isComplete, isLoading, error } = useLiFiTransfers(wallet);

  const classifiedData = useMemo<ClassifiedData | null>(() => {
    if (!isComplete || transfers.length === 0) return null;

    const months = aggregateByMonth(transfers);

    let totalBridges = 0;
    let totalSwaps = 0;

    for (const month of months.values()) {
      totalBridges += month.bridgeCount;
      totalSwaps += month.swapCount;
    }

    return {
      months,
      totalTransactions: transfers.length,
      totalBridges,
      totalSwaps,
    };
  }, [transfers, isComplete]);

  return {
    classifiedData,
    isLoading,
    isComplete,
    error,
  };
}
```

## State of the Art

| Old Approach (Covalent) | Current Approach (LiFi API) | When Changed | Impact |
|-------------------------|------------------------------|--------------|--------|
| Decode event logs for chain IDs | Direct API field access | Phase 1 migration | No parsing needed |
| Query 60+ chains individually | Single API call with pagination | Phase 1 migration | Simpler, faster |
| Filter failed txs client-side | `status=DONE` filter in API | Phase 1 migration | No status checking needed |
| Look up historical USD prices | `amountUSD` provided by API | Phase 1 migration | Deferred to Phase 3, but trivial |

**Deprecated/outdated:**
- Event log decoding with viem: Not needed with LiFi API
- Multi-chain scanning logic: Replaced by single endpoint
- Covalent SDK: Completely removed in Phase 1

## Open Questions

1. **Zero-value transaction handling**
   - What we know: LiFi may return transactions with `sending.amountUSD === "0"`
   - What's unclear: Should these count toward transaction counts?
   - Recommendation: Include them for now (user initiated them), revisit if causes confusion

2. **Current month labeling**
   - What we know: CONTEXT.md says mark as "In Progress"
   - What's unclear: Is this classification responsibility or UI responsibility?
   - Recommendation: Classification outputs data only. UI (Phase 4) handles labeling.

## Sources

### Primary (HIGH confidence)
- LiFi API documentation - https://docs.li.fi/api-reference/get-a-paginated-list-of-filtered-transfers - verified response structure
- Project codebase - `src/lib/lifi-types.ts` - verified TypeScript types match API

### Secondary (MEDIUM confidence)
- JavaScript Date API - MDN documentation - UTC method behavior

### Tertiary (LOW confidence)
- None - all patterns verified against project code or official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new libraries needed, all native JavaScript/TypeScript
- Architecture: HIGH - Pure functions + useMemo is well-established React pattern
- Pitfalls: HIGH - Timezone and timestamp issues are well-documented JavaScript gotchas

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (30 days - stable domain, no external API changes expected)
