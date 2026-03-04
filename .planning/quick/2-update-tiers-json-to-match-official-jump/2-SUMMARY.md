---
phase: quick
plan: 2
subsystem: config
tags: [tiers, xp, jumper, points]

# Dependency graph
requires:
  - phase: 03-points-calculation-engine
    provides: tier configuration and XP calculation
provides:
  - Official Jumper tier thresholds and XP values
  - Simplified types without tierName
affects: [dashboard, points-display]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Tier configuration without display names (official Jumper style)"

key-files:
  created: []
  modified:
    - src/config/tiers.json
    - src/lib/tiers-types.ts
    - src/lib/points-types.ts
    - src/lib/points.ts
    - src/lib/next-tier.ts
    - src/components/dashboard/category-row.tsx

key-decisions:
  - "Removed tier names - official Jumper system no longer uses them"
  - "Chainoor has only 2 tiers (2 chains = 10xp, 9 chains = 30xp)"
  - "Next tier display shows 'to next tier' instead of tier name"

patterns-established:
  - "Tier lookup by threshold only (no name matching)"

requirements-completed: [QUICK-2]

# Metrics
duration: 2.1min
completed: 2026-03-04
---

# Quick Task 2: Update Tiers JSON to Match Official Jumper Summary

**Official Jumper tier thresholds and XP values applied, tier names removed from all types and UI**

## Performance

- **Duration:** 2.1 min
- **Started:** 2026-03-04T20:52:10Z
- **Completed:** 2026-03-04T20:54:16Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- Updated tiers.json with official Jumper values (thresholds and XP)
- Removed tier name fields from all types (TierLevel, CategoryPoints, NextTierInfo)
- Updated UI to display "to next tier" instead of tier names
- Chainoor reduced to 2 tiers only (official spec)

## Task Commits

Each task was committed atomically:

1. **Task 1: Update tiers.json with official values** - `b188219` (fix)
2. **Task 2: Update types and logic to remove tierName** - `1db7f76` (refactor)
3. **Task 3: Update UI to remove tier badge display** - `c8d36e3` (refactor)

## Files Created/Modified
- `src/config/tiers.json` - Official Jumper tier thresholds and XP values
- `src/lib/tiers-types.ts` - Removed name field from TierLevel interface
- `src/lib/points-types.ts` - Removed tierName field from CategoryPoints
- `src/lib/points.ts` - Updated calculateTierXP and calculateCategoryXP
- `src/lib/next-tier.ts` - Removed tierName from NextTierInfo
- `src/components/dashboard/category-row.tsx` - Removed Badge display, updated text

## Decisions Made
- Removed tier names (e.g., "Grand Degen", "Novice") - official Jumper system no longer uses them
- Chainoor has exactly 2 tiers per official spec (not 6 like other categories)
- "to next tier" text chosen for simplicity since no tier names exist

## Deviations from Plan

None - plan executed exactly as written

## Issues Encountered
None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Tier configuration now matches official Jumper points system
- Dashboard will display accurate XP calculations
- Ready to continue with Phase 04-02 (dashboard components)

## Self-Check: PASSED

All files verified present:
- src/config/tiers.json
- src/lib/tiers-types.ts
- src/lib/points-types.ts
- src/lib/points.ts
- src/lib/next-tier.ts
- src/components/dashboard/category-row.tsx

All commits verified present:
- b188219
- 1db7f76
- c8d36e3

---
*Quick Task: 2-update-tiers-json-to-match-official-jump*
*Completed: 2026-03-04*
