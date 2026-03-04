---
phase: 02-transaction-classification
plan: 01
subsystem: classification
tags: [classification, aggregation, react-hooks, pure-functions]

dependency_graph:
  requires: [Phase 01 LiFi API integration]
  provides: [Classification types, Pure classification functions, Classified data hook]
  affects: [Phase 03 XP calculation system]

tech_stack:
  added: []
  patterns: [Pure functions, React hooks, useMemo optimization]

key_files:
  created:
    - src/lib/classification-types.ts
    - src/lib/classification.ts
    - src/hooks/useClassifiedTransactions.ts
  modified: []

decisions:
  - Use UTC dates for month formatting (getUTCFullYear/getUTCMonth)
  - Track source chain only for uniqueChains (not destination)
  - Return null from hook until isComplete (no partial classification)
  - Use Set<number> for efficient chain deduplication
  - Provide both Map (fast lookup) and array (UI iteration) representations

metrics:
  duration_minutes: 2.2
  tasks_completed: 3
  files_created: 3
  commits: 3
  completed_date: 2026-03-04
---

# Phase 02 Plan 01: Classification Types & Functions Summary

**One-liner:** Pure classification functions and React hook for bridge/swap labeling with monthly aggregation using UTC dates and source chain tracking.

## Objective

Create pure classification functions and a derived React hook for transaction classification and monthly aggregation. Transform raw LiFi transfers into classified, monthly-aggregated data that Phase 3 uses for XP calculation.

## What Was Built

### Task 1: Classification Types (Commit 2ca5220)

Created `src/lib/classification-types.ts` with three core types:

- **TransactionType**: `'bridge' | 'swap'` union type
- **MonthlyAggregate**: Single month's data with transaction counts, bridge/swap breakdown, and `Set<number>` for unique source chains
- **ClassifiedData**: Complete structure with both `Map<string, MonthlyAggregate>` (fast lookup) and `MonthlyAggregate[]` (UI iteration)

**Key decisions:**
- Used `Set<number>` for `uniqueChains` (efficient deduplication)
- Provided dual representations (Map + array) for different use cases
- YYYY-MM format uses UTC dates per CONTEXT.md

### Task 2: Pure Classification Functions (Commit d3a887a)

Created `src/lib/classification.ts` with five exported functions:

1. **classifyTransfer**: Compare chainIds to determine bridge vs swap
2. **getMonthKey**: Convert Unix timestamp to YYYY-MM format (UTC)
3. **createEmptyMonth**: Factory for empty MonthlyAggregate (internal)
4. **aggregateByMonth**: Single-pass aggregation with source chain tracking
5. **fillMonthRange**: Generate 12-month array including empty months

**Implementation highlights:**
- UTC date handling: `getUTCFullYear()` and `getUTCMonth()` throughout
- Timestamp conversion: Multiply by 1000 (API returns seconds, JS Date expects milliseconds)
- Source chain only: `aggregate.uniqueChains.add(transfer.sending.chainId)` per CONTEXT.md
- Chronological sorting: fillMonthRange returns oldest to newest for UI display

### Task 3: useClassifiedTransactions Hook (Commit cdb85fd)

Created `src/hooks/useClassifiedTransactions.ts` - React hook deriving classified data from useLiFiTransfers.

**Architecture:**
- Wraps `useLiFiTransfers` hook from Phase 01
- Uses `useMemo` with `[transfers, isComplete]` dependencies
- Returns `null` until `isComplete` (no partial classification per CONTEXT.md)
- Passes through `cancel` and `retry` functions

**Data flow:**
1. Get transfers from useLiFiTransfers
2. Wait for isComplete
3. Run aggregateByMonth → fillMonthRange
4. Calculate totals from Map values
5. Return ClassifiedData with months, monthsArray, and totals

## Success Criteria

- [x] classification-types.ts exports TransactionType, MonthlyAggregate, ClassifiedData
- [x] classification.ts exports classifyTransfer, getMonthKey, aggregateByMonth, fillMonthRange
- [x] useClassifiedTransactions.ts exports hook that derives data from useLiFiTransfers
- [x] All files use UTC dates (getUTCMonth, getUTCFullYear)
- [x] uniqueChains tracks sending.chainId only (not receiving)
- [x] fillMonthRange returns 12 months including empty ones
- [x] npm run build passes

## Verification Results

**Type checking:** `npx tsc --noEmit` - ✓ PASSED
**Build:** `npm run build` - ✓ PASSED (1112.8ms compile, optimized production build)
**File existence:** All 3 files created and verified
**Commit verification:** All 3 commits exist in git history

## Deviations from Plan

None - plan executed exactly as written. All tasks completed without requiring fixes or modifications.

## Integration Points

**Consumes:**
- `src/lib/lifi-types.ts` (LiFiTransfer, LiFiTransactionDetails types)
- `src/hooks/useLiFiTransfers.ts` (fetches raw transfer data)

**Provides:**
- `src/lib/classification-types.ts` → Types for Phase 3 XP calculations
- `src/lib/classification.ts` → Pure functions for testing and reuse
- `src/hooks/useClassifiedTransactions.ts` → Ready-to-use hook for UI components

**Next phase will use:**
- `useClassifiedTransactions(wallet)` to get classified data
- `ClassifiedData.totalBridges` and `ClassifiedData.totalSwaps` for BRIDGEOOR/SWAPOOR
- `ClassifiedData.monthsArray[].uniqueChains.size` for CHAINOOR monthly tracking
- `ClassifiedData.totalTransactions` for TRANSACTOOR

## Technical Notes

### UTC Date Handling

All date operations use UTC methods to avoid timezone inconsistencies:
```typescript
const year = date.getUTCFullYear();
const month = String(date.getUTCMonth() + 1).padStart(2, '0');
```

### Source Chain Tracking

Per CONTEXT.md decision, only source chains count toward CHAINOOR:
```typescript
aggregate.uniqueChains.add(transfer.sending.chainId); // source only, not receiving
```

### Optimization Strategy

- **useMemo** prevents unnecessary recalculation on re-renders
- **Map** provides O(1) lookup for month data
- **Array** enables efficient UI iteration
- **Set** ensures automatic deduplication of chain IDs

### 12-Month Range Logic

Generates months going backwards from current UTC month:
```typescript
for (let i = 11; i >= 0; i--) {
  const targetMonth = currentMonth - i;
  const date = new Date(Date.UTC(currentYear, targetMonth, 1));
  // ... extract year-month and use existing data or create empty
}
```

## Self-Check: PASSED

**Files created:**
- FOUND: src/lib/classification-types.ts
- FOUND: src/lib/classification.ts
- FOUND: src/hooks/useClassifiedTransactions.ts

**Commits exist:**
- FOUND: 2ca5220 (Task 1 - classification types)
- FOUND: d3a887a (Task 2 - classification functions)
- FOUND: cdb85fd (Task 3 - useClassifiedTransactions hook)

**Build verification:**
- TypeScript compilation: PASSED
- Next.js production build: PASSED
- All type exports verified in full project context

---

**Phase 02 Plan 01 complete.** Classification system ready for Phase 3 XP calculation integration.
