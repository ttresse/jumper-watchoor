---
phase: 01-foundation-data-layer
plan: 03
subsystem: infra
tags: [cleanup, migration, npm, covalent]

# Dependency graph
requires:
  - phase: 01-02
    provides: LiFi implementation complete (adapter, hook, UI integration)
provides:
  - Clean codebase with only LiFi implementation
  - Reduced bundle size (169 packages removed)
  - No deprecated Covalent code or types
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - src/stores/scan.store.ts (removed deprecated stubs)
    - package.json (removed Covalent dependencies)

key-decisions:
  - "Deleted all orphaned files that depended on removed Covalent code"
  - "Removed types.ts entirely as all types were Covalent-specific"

patterns-established: []

requirements-completed: []

# Metrics
duration: 4min
completed: 2026-03-04
---

# Phase 01-03: Cleanup deprecated Covalent code Summary

**Complete removal of Covalent implementation: 14 files deleted, 169 npm packages removed, zero references remaining**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-04T12:06:34Z
- **Completed:** 2026-03-04T12:10:43Z
- **Tasks:** 3
- **Files modified:** 15 files deleted, 3 modified

## Accomplishments
- Deleted deprecated covalent.adapter.ts and useScanWallet.ts
- Removed all Covalent-specific types from types.ts (file deleted)
- Uninstalled @covalenthq/client-sdk and p-throttle dependencies
- Cleaned up orphaned files that depended on deleted code
- Removed deprecated stubs from scan.store.ts

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove deprecated adapter and hook files** - `ad3f971` (chore)
2. **Task 2: Clean up types.ts and orphaned files** - `11827f4` (chore)
3. **Task 2b: Remove deprecated stubs from store** - `803dce5` (chore)
4. **Task 3: Remove unused npm dependencies** - `f9b077e` (chore)

## Files Deleted

- `src/adapters/covalent.adapter.ts` - Old Covalent API adapter
- `src/hooks/useScanWallet.ts` - Old hook using Covalent
- `src/hooks/useClassifiedTransactions.ts` - Depended on useScanWallet
- `src/lib/types.ts` - All Covalent-specific types
- `src/lib/chains.ts` - Covalent chain names (unused by LiFi)
- `src/lib/aggregation.ts` - Depended on Covalent types
- `src/lib/lifi-abi.ts` - Used for log decoding (LiFi API provides data)
- `src/lib/throttle.ts` - Used p-throttle for Covalent rate limiting
- `src/classifiers/transaction.classifier.ts` - LiFi API handles classification
- `src/components/chain-results.tsx` - Old chain-by-chain results
- `src/__tests__/progressive-loading.test.tsx` - Tested useScanWallet
- `scripts/validate-chains.ts` - Covalent chain validation script

## Files Modified

- `src/stores/scan.store.ts` - Removed deprecated updateChainResult/resumeScan stubs
- `package.json` - Removed @covalenthq/client-sdk and p-throttle
- `package-lock.json` - Updated after uninstall

## Decisions Made
- Deleted types.ts entirely rather than keeping empty file (no reusable types)
- Removed all orphaned files that caused TypeScript errors after primary deletions
- Cleaned up deprecated stubs in scan.store.ts that were kept for backward compatibility

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed orphaned files causing TypeScript errors**
- **Found during:** Task 2 (Clean up types.ts)
- **Issue:** After deleting covalent.adapter.ts and useScanWallet.ts, multiple files had broken imports causing TypeScript compilation failure
- **Fix:** Deleted all orphaned files: useClassifiedTransactions.ts, transaction.classifier.ts, chain-results.tsx, progressive-loading.test.tsx, validate-chains.ts, chains.ts, aggregation.ts, lifi-abi.ts, throttle.ts
- **Files deleted:** 10 additional files
- **Verification:** TypeScript compiles successfully
- **Committed in:** 11827f4 (Task 2), f9b077e (Task 3)

**2. [Rule 1 - Bug] Removed deprecated stubs from scan.store.ts**
- **Found during:** Final verification
- **Issue:** scan.store.ts still contained deprecated updateChainResult and resumeScan stubs with useScanWallet references in comments
- **Fix:** Removed deprecated stubs and associated comments
- **Files modified:** src/stores/scan.store.ts
- **Verification:** grep -i "useScanWallet" returns no matches
- **Committed in:** 803dce5

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both auto-fixes necessary for completing the cleanup. Plan objective achieved: no Covalent code remains.

## Issues Encountered
None - deletions proceeded cleanly after identifying all orphaned dependencies.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 01 complete: LiFi API integration finished, all deprecated code removed
- Codebase is clean and ready for Phase 02 (transaction classification using LiFi data)
- Build succeeds, TypeScript compiles, no deprecated references remain

---
*Phase: 01-foundation-data-layer*
*Completed: 2026-03-04*
