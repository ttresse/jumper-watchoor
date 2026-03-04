# Requirements: Jumper Points Tracker

**Defined:** 2026-02-26
**Core Value:** Show users exactly how many Jumper points they have and what actions will earn them more.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Wallet Input

- [x] **WALLET-01**: User can input an EVM wallet address (0x format)
- [x] **WALLET-02**: App validates address format before scanning

### Chain Scanning

- [x] **SCAN-01**: App scans all Jumper-supported chains (60+) for wallet transactions
- [x] **SCAN-02**: App filters transactions by LiFi Diamond contract (0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE)
- [x] **SCAN-03**: App fetches chains in parallel with rate limiting (max 4 req/s)
- [x] **SCAN-04**: UI shows progressive loading as each chain completes
- [ ] **SCAN-05**: Results load in under 5 seconds for typical wallets

### Transaction Classification

- [x] **CLASS-01**: App classifies transactions as bridge (cross-chain) or swap (same-chain)
- [x] **CLASS-02**: App counts total LiFi transactions per month
- [x] **CLASS-03**: App tracks unique chains used per month
- [ ] **CLASS-04**: App calculates USD value at transaction time using historical prices

### Points Calculation

- [ ] **POINTS-01**: App calculates TRANSACTOOR XP based on transaction count tiers
- [ ] **POINTS-02**: App calculates BRIDGOOR XP based on USD volume bridged
- [ ] **POINTS-03**: App calculates SWAPOOR XP based on USD volume swapped
- [ ] **POINTS-04**: App calculates CHAINOOR XP based on unique chains used
- [ ] **POINTS-05**: Points are bucketed by month (YYYY-MM)
- [ ] **POINTS-06**: Tier rules are configurable (not hardcoded)

### Dashboard

- [ ] **DASH-01**: Dashboard shows total XP for current month
- [ ] **DASH-02**: Dashboard shows XP breakdown by category (TRANSACTOOR, BRIDGOOR, SWAPOOR, CHAINOOR)
- [ ] **DASH-03**: Dashboard shows tier progress bars for each category
- [ ] **DASH-04**: Dashboard shows recommendations to reach next tier
- [ ] **DASH-05**: User can view XP for previous months (monthly history)
- [ ] **DASH-06**: UI is minimal, single-page, comprehensible in <5 seconds

## v1.1 Requirements

Deferred from v1. Will be addressed in next milestone.

### Wallet Input (v1.1)

- **WALLET-03**: User can input an ENS name and app resolves it to address

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Export

- **EXPORT-01**: User can share results via URL with wallet pre-filled
- **EXPORT-02**: User can export transaction data as CSV

### Multi-Wallet

- **MULTI-01**: User can track multiple wallets in a session
- **MULTI-02**: User can compare XP across wallets

### Persistence

- **PERSIST-01**: App saves wallet history locally
- **PERSIST-02**: App caches scan results for faster repeat visits

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| User authentication | Read-only tool, no user accounts needed |
| Backend database | Client-side only for MVP simplicity |
| Wallet connection | Read-only scanning, no signing required |
| Notifications | No alerts or emails for v1 |
| Custom backend indexer | Use existing APIs (Covalent, DefiLlama) |
| Non-Jumper transactions | Focus on LiFi/Jumper only |
| Real-time updates | On-demand scanning is sufficient |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| WALLET-01 | Phase 1 | Complete |
| WALLET-02 | Phase 1 | Complete |
| SCAN-01 | Phase 1 | Complete |
| SCAN-02 | Phase 1 | Complete |
| SCAN-03 | Phase 1 | Complete |
| SCAN-04 | Phase 1 | Complete |
| SCAN-05 | Phase 4 | Pending |
| CLASS-01 | Phase 2 | Complete |
| CLASS-02 | Phase 2 | Complete |
| CLASS-03 | Phase 2 | Complete |
| CLASS-04 | Phase 3 | Pending |
| POINTS-01 | Phase 3 | Pending |
| POINTS-02 | Phase 3 | Pending |
| POINTS-03 | Phase 3 | Pending |
| POINTS-04 | Phase 3 | Pending |
| POINTS-05 | Phase 3 | Pending |
| POINTS-06 | Phase 3 | Pending |
| DASH-01 | Phase 4 | Pending |
| DASH-02 | Phase 4 | Pending |
| DASH-03 | Phase 5 | Pending |
| DASH-04 | Phase 5 | Pending |
| DASH-05 | Phase 4 | Pending |
| DASH-06 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 23 total (WALLET-03 moved to v1.1)
- Mapped to phases: 23
- Unmapped: 0

---
*Requirements defined: 2026-02-26*
*Last updated: 2026-03-03 after plan 01-01 completion*
