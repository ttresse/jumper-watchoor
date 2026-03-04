# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-26)

**Core value:** Show users exactly how many Jumper points they have and what actions will earn them more.
**Current focus:** Phase 6 - Lazy Loading API (In Progress)

## Current Position

Phase: 6 of 6 (Lazy Loading API)
Plan: 2 of 3 in current phase - COMPLETE
Status: Phase 6 plan 02 complete, continuing to plan 03
Last activity: 2026-03-04 - Completed 06-02-PLAN.md (React Query hooks)

Progress: [############________] 67% (2/3 plans complete)

## API Migration Notice (2026-03-04)

**Change:** Covalent multi-chain scanning -> LiFi Analytics API (`li.quest/v2/analytics/transfers`)

**Impact:**
- Phase 1: Needs complete replan (single API vs 60+ chain scans)
- Phase 2: Needs replan (data structure changed, simpler classification)
- Phase 3: Simplified (USD values provided by API, no historical price lookup)

**Next step:** Run `/gsd:plan-phase 1` to create new plans

## Performance Metrics

**Velocity:**
- Total plans completed: 9
- Average duration: 4.1 min
- Total execution time: 37.1 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-data-layer | 3 | 9 min | 3.0 min |
| 02-transaction-classification | 1 | 2.2 min | 2.2 min |
| 03-points-calculation-engine | 2 | 3.9 min | 2.0 min |

**Recent Trend:**
- Last 5 plans: 01-03 (4 min), 02-01 (2.2 min), 03-01 (2.1 min), 03-02 (1.8 min)
- Trend: Clean execution, Phase 03 complete

| Phase 01-foundation-data-layer P01 | 2 min | 3 tasks | 3 files |
| Phase 01-foundation-data-layer P02 | 3 min | 3 tasks | 4 files |
| Phase 01-foundation-data-layer P03 | 4 min | 3 tasks | 15 files |

*Updated after each plan completion*
| Phase 02 P01 | 2.2 | 3 tasks | 3 files |
| Phase 03 P01 | 2.1 min | 3 tasks | 5 files |
| Phase 03 P02 | 1.8 min | 3 tasks | 3 files |
| Phase 04 P01 | 1.9 | 3 tasks | 4 files |
| Phase 04 P02 | 3 | 3 tasks | 6 files |
| Phase 06 P01 | 2 | 3 tasks | 3 files |
| Phase 06 P02 | 3 | 3 tasks | 3 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: WALLET-03 (ENS resolution) deferred to v1.1 per PROJECT.md out-of-scope
- [01-01]: Used p-throttle strict mode for guaranteed 4 RPS compliance
- [01-01]: Set React Query retry: false - track failed chains separately
- [01-01]: Address validation accepts lowercase (strict: false) for user convenience
- [01-02]: Used GoldRushClient (SDK v3 export) instead of CovalentClient
- [01-02]: Filter by LIFI_DIAMOND to_address for transaction detection
- [01-02]: Zustand partialize to persist only lastWallet to localStorage
- [01-03]: Pre-filled addresses require Enter key to scan (no auto-scan on page load)
- [01-03]: ErrorBanner has two variants: warning (collapsible) and error (full screen)
- [01-04]: Cancel hides scan UI but preserves wallet in input for easy retry
- [01-04]: Retry resets progress counter to 0/N and invalidates queries before refetching
- [01-04]: Progress counter resets on both new wallet scan and retry
- [02-01]: Default to swap when no LiFi events found (conservative approach)
- [02-01]: Use viem decodeEventLog with strict: false for resilient parsing
- [02-02]: UTC dates for month formatting to avoid timezone inconsistencies
- [02-02]: Fill all 12 months including empty ones for consistent UI rendering
- [02-02]: Count source chain only for uniqueChains (per CONTEXT.md)
- [Phase 01-01]: Added deprecated stubs for old useScanWallet hook compatibility until Plan 02 replaces it
- [Phase 01-02]: Used useQuery (not useInfiniteQuery) per RESEARCH.md - fetch all before display
- [Phase 01-02]: Removed all auto-scan triggers per user decision - explicit Scan button only
- [Phase 01-02]: Progress shows transaction count not chain count
- [Phase 01-03]: Deleted all orphaned files that depended on removed Covalent code
- [Phase 01-03]: Removed types.ts entirely as all types were Covalent-specific
- [Phase 02-01]: Use UTC dates for month formatting (getUTCFullYear/getUTCMonth)
- [Phase 02-01]: Track source chain only for uniqueChains (per CONTEXT.md)
- [Phase 02-01]: Return null from useClassifiedTransactions until isComplete (no partial classification)
- [Quick-1]: Added fromTimestamp parameter filtering LiFi API requests to last 12 months (365 days)
- [Phase 03-01]: USD volumes aggregated from sending.amountUSD with parseFloat || 0 fallback
- [Phase 03-01]: Tiers sorted descending by threshold for first-match-wins lookup
- [Phase 03-01]: Placeholder tier values (replaced by Quick-2 with official values)
- [Phase 03-01]: Type assertion import for build-time JSON validation
- [Phase 03-02]: USD values floored (Math.floor) before tier comparison
- [Phase 03-02]: Tier lookup uses first-match-wins with descending threshold sort
- [Phase 03-02]: usePoints derives from useClassifiedTransactions with useMemo
- [Phase 03-02]: 0 XP returned explicitly when below minimum tier (not null)
- [Phase 04-01]: Use Intl API for locale-aware formatting (no external deps)
- [Phase 04-01]: Module-level formatter instances for performance (not created per call)
- [Phase 04-01]: UTC timezone for month parsing to avoid timezone issues
- [Quick-2]: Removed tier names - official Jumper system no longer uses them
- [Quick-2]: Chainoor has only 2 tiers (2 chains = 10xp, 9 chains = 30xp)
- [Quick-2]: Next tier display shows "to next tier" instead of tier name
- [Quick-3]: Past months use opacity-60 muted styling (frozen historical data)
- [Quick-3]: isCurrentMonth prop defaults true for backwards compatibility
- [Quick-3]: Only current month (index 11) shows "X to next tier" info
- [Quick-4]: Use flex-col sm:flex-row for mobile-first vertical stacking in CategoryRow
- [Quick-4]: Increase gap and padding for better mobile breathing room
- [Quick-5]: Static page (no 'use client') for better performance
- [Quick-5]: Import tiers.json directly for accurate tier values
- [Phase 04-02]: Month index defaults to 11 (current month) and resets on wallet change
- [Phase 04-02]: Category rows always show all four in fixed order: transactoor, bridgoor, swapoor, chainoor
- [Phase 04-02]: Skeleton dimensions match actual content to prevent layout shift
- [Phase 04-02]: Empty state shows friendly message instead of blank dashboard
- [Quick-6]: Use formatUSD() for USD unit distances, toLocaleString() for count-based units
- [Quick-7]: Use HTML entity &larr; for left arrow (consistent with web standards)
- [Quick-7]: Keep bottom link for scroll-down users (two navigation points)
- [Quick-8]: Use flex min-h-screen for footer positioning at page bottom
- [Quick-8]: Border-top separator for visual distinction from content
- [Quick-9]: Current value uses text-base font-semibold text-foreground (prominent)
- [Quick-9]: Next tier info uses text-xs text-muted-foreground (discrete)
- [Quick-9]: Vertical stacking on all screen sizes for value section
- [Quick-10]: 100ms delayDuration for quick tooltip response (not default 300ms)
- [Quick-10]: cursor-help and dotted underline for visual affordance
- [Quick-10]: TooltipProvider per tooltip (not global) for simplicity
- [Phase 06-01]: All month utilities use UTC to match classification.ts patterns
- [Phase 06-01]: Timestamps in seconds (not milliseconds) for LiFi API compatibility
- [Phase 06-01]: Month keys use YYYY-MM format for consistency
- [Phase 06-01]: getAllAvailableMonthKeys starts from Jan 2022 (LiFi launch)
- [Phase 06-02]: Past months use staleTime: Infinity (immutable per CONTEXT.md)
- [Phase 06-02]: Current month uses 5 minute staleTime
- [Phase 06-02]: Prefetch batches of 3 months in parallel after initial 4 complete
- [Phase 06-02]: prioritizeMonth uses ensureQueryData for immediate user navigation
- [Phase 06-02]: Background prefetch continues even when priority request made
- [Phase 06-02]: useClassifiedTransactions marked @deprecated - useMonthClassification is new pattern

### Pending Todos

None yet.

### Roadmap Evolution

- Phase 6 added: Lazy loading API - fetch current month only, prefetch 3 previous months, load on navigation, disable refresh for past months

### Blockers/Concerns

None yet.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 1 | Add fromTimestamp parameter to LiFi API call to search last 12 months by default | 2026-03-04 | 96a3563 | [1-add-fromtimestamp-parameter-to-lifi-api-](./quick/1-add-fromtimestamp-parameter-to-lifi-api-/) |
| 2 | Update tiers.json to match official Jumper points table | 2026-03-04 | c8d36e3 | [2-update-tiers-json-to-match-official-jump](./quick/2-update-tiers-json-to-match-official-jump/) |
| 3 | Hide next tier info and add muted styling for past months | 2026-03-04 | 3e250d5 | [3-sur-les-mois-pass-s-masquer-next-tier-in](./quick/3-sur-les-mois-pass-s-masquer-next-tier-in/) |
| 4 | Improve CategoryRow mobile layout with vertical stacking | 2026-03-04 | cfa0901 | [4-am-liorer-layout-mobile-des-category-row](./quick/4-am-liorer-layout-mobile-des-category-row/) |
| 5 | Add How It Works page explaining XP calculation | 2026-03-04 | 49935bf | [5-ajoute-une-page-permettant-d-expliquer-l](./quick/5-ajoute-une-page-permettant-d-expliquer-l/) |
| 6 | Harmonize dollar display using $ prefix | 2026-03-04 | cba86df | [6-harmoniser-affichage-dollar-utiliser-par](./quick/6-harmoniser-affichage-dollar-utiliser-par/) |
| 7 | Detailed XP descriptions and top back button | 2026-03-04 | 3f0bdb7 | [7-d-taille-crit-res-xp-et-ajoute-bouton-re](./quick/7-d-taille-crit-res-xp-et-ajoute-bouton-re/) |
| 8 | Add footer with LiFi API and unofficial app disclaimers | 2026-03-04 | e52b0f9 | [8-ajouter-footer-disclaimer-donn-es-lifi-a](./quick/8-ajouter-footer-disclaimer-donn-es-lifi-a/) |
| 9 | Refonte layout CategoryRow - emphasize current value | 2026-03-04 | a870d2a | [9-refonte-layout-categoryrow-current-value](./quick/9-refonte-layout-categoryrow-current-value/) |
| 10 | Add explanatory tooltips on category names | 2026-03-04 | 06fbef4 | [10-ajouter-tooltips-explicatifs-sur-les-4-c](./quick/10-ajouter-tooltips-explicatifs-sur-les-4-c/) |

## Session Continuity

Last session: 2026-03-04
Stopped at: Completed 06-02-PLAN.md (React Query hooks)
Resume file: N/A - continuing to Plan 03

---
*Phase 06 in progress. React Query hooks complete.*
*Next: 06-03-PLAN.md (UI integration and final wiring)*
