# Phase 6: Lazy Loading API - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Optimize data fetching to reduce initial load time. Fetch current month plus 3 previous months first, prefetch remaining history in background, enable month-by-month navigation with on-demand loading, and treat past months as immutable (no refresh). Cache within session only - fresh fetch on each new visit.

</domain>

<decisions>
## Implementation Decisions

### Initial Load Strategy
- Load current month + 3 most recent months immediately on wallet input
- Show skeleton placeholders for months still loading
- Display partial total XP with indicator (e.g., "12,450 XP+") while history loads
- No explicit progress counter - skeletons imply loading

### Prefetch Behavior
- Begin prefetch immediately after initial 4 months complete
- Fetch 3 months in parallel (balance speed vs API load)
- Fetch all available history (not capped at 12 or 24 months)
- Silent retry on failures (2-3 attempts), show error state only if persistent

### Navigation Triggers
- Prev/Next arrows to step through months one at a time
- When navigating to unloaded month: show skeleton, fetch immediately, display when ready
- User requests jump the prefetch queue (if user clicks month 8 while prefetching month 5, fetch 8 first)
- Disable/hide arrows beyond data availability boundaries

### Cache & Staleness
- Past months are immutable - never refetch completed months
- Current month refreshed only via manual refresh button (no auto-refresh)
- Cache persists within session only (memory/session storage)
- Fresh fetch on each new site visit - no localStorage persistence across sessions

### Claude's Discretion
- Exact skeleton animation and styling
- Retry timing and backoff strategy
- How to handle edge case of user navigating during initial load
- Cache implementation details (zustand persist vs session storage)

</decisions>

<specifics>
## Specific Ideas

- User explicitly wants fresh data on each visit - returning to the site should trigger a new fetch, not serve stale cached data
- Navigation via arrows matches the existing UI pattern of stepping through time periods

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-lazy-loading-api*
*Context gathered: 2026-03-04*
