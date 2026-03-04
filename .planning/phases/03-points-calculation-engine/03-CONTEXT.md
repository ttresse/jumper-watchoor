# Phase 3: Points Calculation Engine - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Calculate XP for four categories (TRANSACTOOR, BRIDGOOR, SWAPOOR, CHAINOOR) using configurable tier rules. USD values come from LiFi API (amountUSD). Points bucketed by month. Dashboard display and tier progress visualization are Phase 4 and 5.

</domain>

<decisions>
## Implementation Decisions

### Tier rules structure
- Threshold-based: reach a threshold = get that tier's fixed XP
- Fixed XP per tier (not multipliers or linear scaling)
- Customized per category — BRIDGOOR uses USD thresholds, CHAINOOR uses chain counts, etc.
- Highest qualified tier only — no partial credit, no cumulative tier stacking

### Config format
- JSON file in repo (e.g., `src/config/tiers.json`)
- Build-time validation with TypeScript type assertion
- Ship with Jumper's actual tier values (research real thresholds)
- Include category metadata: display names, descriptions, icons (for Phase 4)

### Edge case handling
- Zero activity: Show 0 XP explicitly for inactive categories
- USD rounding: Truncate (floor) for tier matching — $999.99 stays $999.99
- Missing timestamp: Skip transaction from calculations
- Missing/zero amountUSD: Count as $0 volume (still counts for TRANSACTOOR transaction count)

### Calculation outputs
- Return XP per category + total XP for each month
- Per-month data only — no cumulative totals (consumer calculates if needed)
- Pure numbers only — no display metadata in results
- Expose via derived hook: `usePoints()` derives from `useClassifiedTransactions()`

### Claude's Discretion
- Exact JSON schema structure
- TypeScript type naming conventions
- Internal calculation helpers
- Test data structure

</decisions>

<specifics>
## Specific Ideas

No specific references — open to standard approaches for tier configuration and XP calculation.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-points-calculation-engine*
*Context gathered: 2026-03-04*
