# Requirements: Jumper Points Tracker

**Defined:** 2026-02-26
**Core Value:** Show users exactly how many Jumper points they have and what actions will earn them more.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Wallet Input

- [ ] **WALLET-01**: User can input an EVM wallet address (0x format)
- [ ] **WALLET-02**: App validates address format before scanning
- [ ] **WALLET-03**: User can input an ENS name and app resolves it to address

### Chain Scanning

- [ ] **SCAN-01**: App scans all Jumper-supported chains (60+) for wallet transactions
- [ ] **SCAN-02**: App filters transactions by LiFi Diamond contract (0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE)
- [ ] **SCAN-03**: App fetches chains in parallel with rate limiting (max 4 req/s)
- [ ] **SCAN-04**: UI shows progressive loading as each chain completes
- [ ] **SCAN-05**: Results load in under 5 seconds for typical wallets

### Transaction Classification

- [ ] **CLASS-01**: App classifies transactions as bridge (cross-chain) or swap (same-chain)
- [ ] **CLASS-02**: App counts total LiFi transactions per month
- [ ] **CLASS-03**: App tracks unique chains used per month
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
| WALLET-01 | TBD | Pending |
| WALLET-02 | TBD | Pending |
| WALLET-03 | TBD | Pending |
| SCAN-01 | TBD | Pending |
| SCAN-02 | TBD | Pending |
| SCAN-03 | TBD | Pending |
| SCAN-04 | TBD | Pending |
| SCAN-05 | TBD | Pending |
| CLASS-01 | TBD | Pending |
| CLASS-02 | TBD | Pending |
| CLASS-03 | TBD | Pending |
| CLASS-04 | TBD | Pending |
| POINTS-01 | TBD | Pending |
| POINTS-02 | TBD | Pending |
| POINTS-03 | TBD | Pending |
| POINTS-04 | TBD | Pending |
| POINTS-05 | TBD | Pending |
| POINTS-06 | TBD | Pending |
| DASH-01 | TBD | Pending |
| DASH-02 | TBD | Pending |
| DASH-03 | TBD | Pending |
| DASH-04 | TBD | Pending |
| DASH-05 | TBD | Pending |
| DASH-06 | TBD | Pending |

**Coverage:**
- v1 requirements: 24 total
- Mapped to phases: 0
- Unmapped: 24 ⚠️

---
*Requirements defined: 2026-02-26*
*Last updated: 2026-02-26 after initial definition*
