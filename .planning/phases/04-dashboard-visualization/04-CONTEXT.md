# Phase 4: Dashboard & Visualization - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Display XP breakdown in a minimal, fast-loading dashboard with monthly history. Users see total XP, per-category breakdown with tier info, and can navigate between months. Progress bars and recommendations are Phase 5.

</domain>

<decisions>
## Implementation Decisions

### Dashboard Layout
- Stacked single column layout (not grid or sidebar)
- Total XP section at top: big number + "XP" label only (no extra decoration)
- Category sections below as compact rows: category name, XP value, tier badge, and distance to next tier
- Show USD totals alongside XP (e.g., "BRIDGOOR: 5,000 XP ($2,500 bridged)")

### Month Navigation
- Arrow buttons (< and >) to step through months
- Current month displayed between arrows
- Default view: current calendar month
- Monthly view only — no all-time cumulative option (that's Phase 5)
- Empty months show zeros for all categories (consistent UI)

### XP Breakdown Display
- All four categories always shown: TRANSACTOOR, BRIDGOOR, SWAPOOR, CHAINOOR
- Fixed order (not sorted by XP value)
- Numbers formatted with commas: "12,450 XP"
- Each row shows: category name, XP, tier badge, distance to next tier, USD volume

### Loading & Empty States
- Skeleton placeholders while loading (gray shapes where content will appear)
- Friendly empty state for wallets with no LiFi transactions: "No Jumper transactions found for this wallet"
- Inline error messages with retry button for fetch failures
- Refresh button to manually re-fetch transaction data

### Claude's Discretion
- Exact skeleton placeholder design
- Color scheme and typography details
- Animation/transition timing
- Mobile responsive breakpoints

</decisions>

<specifics>
## Specific Ideas

- Tier badge with "next tier" info: e.g., "BRIDGOOR: 5,000 XP • Tier 3 • $500 to Tier 4"
- Keep UI comprehensible within 5 seconds (success criteria)
- Results should load in under 5 seconds for typical wallets

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-dashboard-visualization*
*Context gathered: 2026-03-04*
