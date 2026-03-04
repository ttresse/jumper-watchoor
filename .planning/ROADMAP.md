# Roadmap: Jumper Points Tracker

## Overview

This roadmap transforms a wallet address into actionable Jumper points insights through five phases: Foundation fetches transaction history via LiFi Analytics API, Classification parses transactions into bridge/swap categories, Calculation applies configurable tier rules to derive XP, Dashboard presents results with category breakdown, and Value-Add delivers recommendations and tier progress visualization. Each phase delivers a coherent, verifiable capability that builds toward the core value: showing users exactly how many points they have and what to do next.

**API Migration (2026-03-04):** Switched from Covalent multi-chain scanning to LiFi Analytics API (`li.quest/v2/analytics/transfers`). This simplifies data fetching significantly - single endpoint provides complete transaction history with USD values pre-calculated.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Data Layer** - LiFi Analytics API integration, wallet input, transaction fetching
- [x] **Phase 2: Transaction Classification** - Bridge vs swap detection using chainId comparison, monthly aggregation
- [x] **Phase 3: Points Calculation Engine** - Configurable tier rules, XP calculation (USD values from API)
- [ ] **Phase 4: Dashboard & Visualization** - Category breakdown, monthly history display
- [ ] **Phase 5: Value-Add Features** - Tier progress bars, recommendations engine, configuration editor

## Phase Details

### Phase 1: Foundation & Data Layer
**Goal**: Users can input a wallet address and fetch their LiFi transaction history
**Depends on**: Nothing (first phase)
**Requirements**: WALLET-01, WALLET-02, SCAN-01, SCAN-02
**Success Criteria** (what must be TRUE):
  1. User can enter an EVM wallet address and receive validation feedback
  2. App fetches all LiFi transactions via Analytics API with visible progress counter
  3. Pagination handled correctly for wallets with many transactions
  4. Transaction data includes chainIds, USD values, and status for downstream processing
**Plans**: 3 plans (gap closure mode)

Plans:
- [x] 01-01-PLAN.md — Core data layer (LiFi types, adapter, store)
- [x] 01-02-PLAN.md — Hook and UI integration
- [x] 01-03-PLAN.md — Cleanup deprecated Covalent code

### Phase 2: Transaction Classification
**Goal**: Users can see their LiFi transactions classified as bridges or swaps with monthly aggregation
**Depends on**: Phase 1
**Requirements**: CLASS-01, CLASS-02, CLASS-03
**Success Criteria** (what must be TRUE):
  1. Each transaction labeled as bridge (sending.chainId != receiving.chainId) or swap (same chainId)
  2. Failed/reverted transactions (status != DONE) excluded from counts (handled by API filter in Phase 1)
  3. Transactions grouped by month (YYYY-MM format) using sending.timestamp
  4. Unique chains used per month are tracked
**Plans**: 1 plan

Plans:
- [x] 02-01-PLAN.md — Classification types, pure functions, and derived hook

### Phase 3: Points Calculation Engine
**Goal**: Users can see their calculated XP per category
**Depends on**: Phase 2
**Requirements**: CLASS-04, POINTS-01, POINTS-02, POINTS-03, POINTS-04, POINTS-05, POINTS-06
**Success Criteria** (what must be TRUE):
  1. USD values from API (amountUSD) used directly - no historical price lookup needed
  2. TRANSACTOOR, BRIDGOOR, SWAPOOR, CHAINOOR XP calculated per tier rules
  3. XP bucketed by month with correct tier thresholds applied
  4. Tier rules can be modified without code changes (configurable JSON)
**Plans**: 2 plans

Plans:
- [x] 03-01-PLAN.md — Extend classification with USD volumes, create tier configuration
- [x] 03-02-PLAN.md — XP calculation functions and usePoints hook

### Phase 4: Dashboard & Visualization
**Goal**: Users can view their complete XP breakdown in a minimal, fast-loading dashboard
**Depends on**: Phase 3
**Requirements**: SCAN-05, DASH-01, DASH-02, DASH-05, DASH-06
**Success Criteria** (what must be TRUE):
  1. Dashboard shows total XP and breakdown by category for current month
  2. User can view XP for any previous month (monthly history)
  3. Results load in under 5 seconds for typical wallets
  4. UI is comprehensible within 5 seconds (minimal, single-page)
**Plans**: 2 plans

Plans:
- [ ] 04-01-PLAN.md — Foundation utilities (format, next-tier, shadcn components)
- [ ] 04-02-PLAN.md — Dashboard components and page integration

### Phase 5: Value-Add Features
**Goal**: Users can see tier progress and receive actionable recommendations
**Depends on**: Phase 4
**Requirements**: DASH-03, DASH-04
**Success Criteria** (what must be TRUE):
  1. Progress bars show distance to next tier for each category
  2. Recommendations tell user specific actions to reach next tier (e.g., "Bridge $500 more")
  3. Tier configuration can be edited through the UI
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Data Layer | 3/3 | Complete | 2026-03-04 |
| 2. Transaction Classification | 1/1 | Complete | 2026-03-04 |
| 3. Points Calculation Engine | 2/2 | Complete | 2026-03-04 |
| 4. Dashboard & Visualization | 0/2 | Ready | - |
| 5. Value-Add Features | 0/2 | Not started | - |

---
*Roadmap created: 2026-02-26*
*API Migration: 2026-03-04 (Covalent -> LiFi Analytics)*
*Phase 1 Replanned: 2026-03-04*
*Phase 2 Replanned: 2026-03-04*
*Phase 3 Planned: 2026-03-04*
*Phase 4 Planned: 2026-03-04*
*Coverage: 23/23 v1 requirements mapped (WALLET-03 deferred to v1.1)*
