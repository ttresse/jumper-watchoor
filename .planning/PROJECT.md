# Jumper Points Tracker

## What This Is

A web application that calculates and displays Jumper Exchange reward points by scanning wallet transactions across all chains supported by Jumper. Users input a wallet address and instantly see their monthly XP breakdown with recommendations to reach the next tier.

## Core Value

**Show users exactly how many Jumper points they have and what actions will earn them more.**

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can input an EVM wallet address and see their Jumper points
- [ ] App scans all Jumper-supported chains (60+) for LiFi transactions
- [ ] Transactions are classified as bridge (cross-chain) or swap (same-chain)
- [ ] Points calculated per month using configurable tier system
- [ ] Dollar amounts calculated using historical prices at transaction time
- [ ] Dashboard shows monthly XP breakdown by category
- [ ] Recommendations show actions to reach next tier
- [ ] Results load in under 5 seconds
- [ ] Points configuration is editable (not hardcoded)

### Out of Scope

- Authentication — read-only, no user accounts needed
- Persistent database — client-side only for MVP
- Multi-wallet dashboards — single wallet per session
- Notifications — no alerts or emails
- Custom backend indexer — use existing APIs
- ENS support — v1.1 feature

## Context

**Jumper Exchange** is a cross-chain bridge/swap aggregator built on LiFi protocol. They have a points system (XP) that rewards users for:
- **TRANSACTOOR**: Number of transactions
- **BRIDGOOR**: Dollar volume bridged (cross-chain)
- **SWAPOOR**: Dollar volume swapped (same-chain)
- **CHAINOOR**: Number of unique chains used

All Jumper transactions go through the **LiFi Diamond contract**: `0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE` (same address on all chains).

**Points tiers** (configurable):
| Category | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Tier 5 | Tier 6 |
|----------|--------|--------|--------|--------|--------|--------|
| TRANSACTOOR | 1-5 txs: 10xp | 5-10: 18xp | 10-20: 25xp | 20-35: 33xp | 35-50: 40xp | 50+: 50xp |
| BRIDGOOR | $100-1k: 10xp | $1k-10k: 18xp | $10k-50k: 25xp | $50k-100k: 33xp | $100k-500k: 44xp | $500k+: 50xp |
| SWAPOOR | Same as BRIDGOOR |
| CHAINOOR | 2 chains: 10xp | ... | 9 chains: 30xp max |

## Constraints

- **Data source**: Covalent API (100+ chains, unified endpoint) — requires API key
- **Price data**: DefiLlama API (free, no auth required)
- **LiFi contract**: Filter transactions by `to` = `0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE`
- **Classification**: Bridge if source chain ≠ destination chain, Swap otherwise
- **Performance**: <5 seconds for results, parallel chain requests
- **Deployment**: Vercel (serverless)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Covalent for transaction indexing | Only service covering 100+ chains with unified API | — Pending |
| DefiLlama for historical prices | Free, no rate limits, no auth | — Pending |
| Filter by LiFi contract address | All Jumper txs go through same contract on all chains | — Pending |
| Client-side only (no backend) | Simpler architecture, faster to ship | — Pending |
| Configurable points tiers | User requested ability to modify point rules | — Pending |

---
*Last updated: 2026-02-26 after initialization*
