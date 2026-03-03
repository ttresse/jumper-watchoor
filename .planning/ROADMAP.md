# Roadmap: Jumper Points Tracker

## Overview

This roadmap transforms a wallet address into actionable Jumper points insights through five phases: Foundation establishes reliable multi-chain data fetching with rate limiting, Classification parses LiFi transactions into bridge/swap categories, Calculation applies configurable tier rules to derive XP, Dashboard presents results with progressive loading, and Value-Add delivers recommendations and tier progress visualization. Each phase delivers a coherent, verifiable capability that builds toward the core value: showing users exactly how many points they have and what to do next.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Data Layer** - API adapters with rate limiting, wallet input, multi-chain scanning infrastructure
- [ ] **Phase 2: Transaction Classification** - Bridge vs swap detection, transaction status verification, monthly aggregation
- [ ] **Phase 3: Points Calculation Engine** - Historical prices, USD values, configurable tier rules, XP calculation
- [ ] **Phase 4: Dashboard & Visualization** - Progressive loading UI, category breakdown, monthly history display
- [ ] **Phase 5: Value-Add Features** - Tier progress bars, recommendations engine, configuration editor

## Phase Details

### Phase 1: Foundation & Data Layer
**Goal**: Users can input a wallet address and see multi-chain scanning progress across 60+ chains
**Depends on**: Nothing (first phase)
**Requirements**: WALLET-01, WALLET-02, SCAN-01, SCAN-02, SCAN-03, SCAN-04
**Success Criteria** (what must be TRUE):
  1. User can enter an EVM wallet address and receive validation feedback
  2. App scans 60+ chains in parallel with visible progress indicator per chain
  3. Scanning completes without rate limit errors (4 RPS respected)
  4. Raw LiFi transactions are fetched and filtered correctly
**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md — Project setup, types, chains config, address validation
- [ ] 01-02-PLAN.md — Covalent adapter, Zustand store, useScanWallet hook
- [ ] 01-03-PLAN.md — UI components (wallet input, progress, results, errors) and page integration

### Phase 2: Transaction Classification
**Goal**: Users can see their LiFi transactions classified as bridges or swaps with monthly aggregation
**Depends on**: Phase 1
**Requirements**: CLASS-01, CLASS-02, CLASS-03
**Success Criteria** (what must be TRUE):
  1. Each transaction is correctly labeled as bridge (cross-chain) or swap (same-chain)
  2. Failed/reverted transactions are excluded from counts
  3. Transactions are grouped by month (YYYY-MM format)
  4. Unique chains used per month are tracked
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: Points Calculation Engine
**Goal**: Users can see their calculated XP per category using historical USD values
**Depends on**: Phase 2
**Requirements**: CLASS-04, POINTS-01, POINTS-02, POINTS-03, POINTS-04, POINTS-05, POINTS-06
**Success Criteria** (what must be TRUE):
  1. Transaction USD values are calculated using historical prices at transaction time
  2. TRANSACTOOR, BRIDGOOR, SWAPOOR, CHAINOOR XP are calculated per tier rules
  3. XP is bucketed by month with correct tier thresholds applied
  4. Tier rules can be modified without code changes (configurable JSON)
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Dashboard & Visualization
**Goal**: Users can view their complete XP breakdown in a minimal, fast-loading dashboard
**Depends on**: Phase 3
**Requirements**: SCAN-05, DASH-01, DASH-02, DASH-05, DASH-06
**Success Criteria** (what must be TRUE):
  1. Dashboard shows total XP and breakdown by category for current month
  2. User can view XP for any previous month (monthly history)
  3. Results load in under 5 seconds for typical wallets
  4. UI is comprehensible within 5 seconds (minimal, single-page)
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

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
| 1. Foundation & Data Layer | 0/3 | Planning complete | - |
| 2. Transaction Classification | 0/2 | Not started | - |
| 3. Points Calculation Engine | 0/2 | Not started | - |
| 4. Dashboard & Visualization | 0/2 | Not started | - |
| 5. Value-Add Features | 0/2 | Not started | - |

---
*Roadmap created: 2026-02-26*
*Coverage: 23/23 v1 requirements mapped (WALLET-03 deferred to v1.1)*
