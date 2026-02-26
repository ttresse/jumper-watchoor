# Feature Landscape

**Domain:** Blockchain wallet scanner / protocol-specific points tracker
**Researched:** 2026-02-26
**Confidence:** MEDIUM (based on competitor analysis and ecosystem research)

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Wallet address input** | Core interaction - paste address, see results | Low | No wallet connection needed; read-only lookup |
| **Multi-chain scanning** | Users have assets across chains; single-chain is useless for cross-chain bridge tracker | Med | Jumper supports 60+ chains; must query all |
| **Transaction history display** | Users expect to see what the tool found | Low | List of transactions with basic details |
| **Points/XP calculation** | The core value proposition | Med | Apply tier rules to categorized transactions |
| **Category breakdown** | Jumper has TRANSACTOOR/BRIDGOOR/SWAPOOR/CHAINOOR - users expect to see each | Low | Visual breakdown by category |
| **Monthly aggregation** | Jumper resets monthly; users need month-by-month view | Low | Group by calendar month |
| **Loading state feedback** | Scanning 60+ chains takes time; users need progress indication | Low | "Scanning X of 60 chains..." |
| **USD value display** | Dollar amounts are how Jumper tiers work; must show historical USD | Med | Requires historical price lookup |
| **Mobile-responsive design** | 50%+ of crypto users are mobile | Low | Standard responsive CSS |
| **Fast results (<5 seconds)** | Users won't wait; competitors load in 2-3 seconds | Med | Requires parallel chain requests |

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Tier progress visualization** | "You're at Tier 3 BRIDGOOR, $2,000 more to reach Tier 4" - actionable | Low | Progress bars showing distance to next tier |
| **Recommendations engine** | "Bridge $500 more this month to reach next tier" - drives action | Med | Calculate optimal paths to maximize XP |
| **Configurable tier rules** | User requested; allows tracking even if Jumper changes rules | Med | JSON/form-based tier configuration |
| **Export functionality** | Let users save/share their XP data | Low | CSV/JSON export of results |
| **Chain-by-chain breakdown** | "Which chains am I using most?" insight | Low | Aggregate stats per chain |
| **Historical season tracking** | Jumper has seasons; show progress across seasons | Med | Requires date-range selection |
| **Transaction classification details** | "Why was this a bridge vs swap?" transparency | Low | Show source/dest chain, decision logic |
| **Share/embed results** | Social proof; users share XP achievements | Low | Generate shareable link or image |
| **Dark mode** | Standard expectation in crypto apps | Low | CSS variables or theme toggle |
| **ENS/domain resolution** | Type "vitalik.eth" instead of address | Med | Requires ENS resolution API; marked v1.1 in scope |

### High-Value Differentiators (Unique to this use case)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **"What If" calculator** | "If I bridge $X more, I'll earn Y XP" - planning tool | Med | Simulate additional transactions |
| **Optimal action suggestions** | "You're 3 txs from next TRANSACTOOR tier" - specific guidance | Med | Analyze gaps across all categories |
| **Missing XP alerts** | "You used 7 chains but CHAINOOR maxes at 9 - try 2 more!" | Low | Compare current state to max potential |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Wallet connection / signing** | Unnecessary security risk; read-only data needs no auth | Accept address as text input; no Connect Wallet button |
| **User accounts / login** | MVP is stateless; adds complexity without value | Client-side only; localStorage for preferences |
| **Push notifications** | Out of scope; requires backend, accounts | Link to official Jumper for notifications |
| **Multi-wallet dashboard** | Scope creep; v1 is single wallet | Focus on one wallet doing it well |
| **Transaction execution** | We show data, don't execute; avoid liability | Link to Jumper for actual bridging/swapping |
| **Price predictions / trading signals** | Off-topic; not our value prop | Stick to historical data and points |
| **NFT tracking** | Jumper XP is about bridges/swaps, not NFTs | Omit NFT-related features |
| **Full portfolio tracking** | Competitors (DeBank, Zapper, Zerion) do this; not our niche | Focus only on Jumper/LiFi transactions |
| **Backend database** | Adds hosting costs, complexity; client-side sufficient for MVP | Covalent API + client-side processing |
| **Real-time transaction streaming** | Overkill for monthly XP; users check occasionally | On-demand refresh is sufficient |
| **Complex filtering/search** | MVP shows all relevant data; filtering is premature optimization | Simple monthly view first |

## Feature Dependencies

```
Wallet input → Multi-chain scanning → Transaction history
                    ↓
Transaction classification (bridge vs swap) → USD value calculation
                    ↓
Points calculation → Category breakdown → Monthly aggregation
                    ↓
Tier progress visualization → Recommendations engine
```

Key dependency chains:
- **USD values require historical prices**: Can't calculate BRIDGOOR/SWAPOOR tiers without dollar amounts
- **Classification requires chain data**: Need to compare source vs destination chain
- **Recommendations require points calculation**: Must know current state before suggesting improvements
- **Progress visualization requires tier rules**: Need configurable rules to show progress

## MVP Recommendation

### Phase 1: Core (Table Stakes)

Prioritize:
1. Wallet address input + validation
2. Multi-chain transaction scanning (parallel for speed)
3. Transaction classification (bridge vs swap)
4. USD value calculation with historical prices
5. Points calculation using tier rules
6. Monthly breakdown display
7. Loading state with progress feedback

### Phase 2: Value-Add (Key Differentiators)

Prioritize:
1. Tier progress visualization (progress bars)
2. Basic recommendations ("X more to next tier")
3. Configurable tier rules
4. Export functionality

### Defer

- **ENS resolution**: v1.1 feature (already in PROJECT.md out of scope)
- **Historical season tracking**: Nice-to-have after core works
- **"What If" calculator**: Post-MVP optimization
- **Share/embed**: Social features after core utility proven

## Competitor Landscape Summary

| Competitor | Focus | Strengths | Gaps (Our Opportunity) |
|------------|-------|-----------|------------------------|
| **DeBank** | General portfolio | 35+ chains, DeFi positions, social features | No protocol-specific points tracking |
| **Zapper** | DeFi positions | Clean UI, "zap" transactions, yield tracking | No Jumper/LiFi specific insights |
| **Zerion** | Multi-chain wallet | 40+ chains, real-time updates, NFTs | General purpose, not points-focused |
| **Drops.bot** | Airdrop eligibility | 43+ protocols, eligibility alerts | Multi-protocol breadth, not depth |
| **CoinStats** | Full portfolio | 120 chains, 1000+ protocols, AI forecasts | Enterprise-scale, not niche tools |

**Our niche**: Protocol-specific depth. None of these competitors calculate Jumper XP or show tier progress. We're building a focused tool that does one thing extremely well.

## Sources

### Portfolio Trackers
- [DeBank Review 2026](https://cryptoadventure.com/debank-review-2026-defi-portfolio-tracking-wallet-research-and-web3-social-features/) - MEDIUM confidence
- [Best DeFi Portfolio Trackers 2026](https://blog.blockxs.com/defi-portfolio-trackers-2026/) - MEDIUM confidence
- [Zerion Crypto Wallet Tracker](https://zerion.io/crypto-wallet-tracker) - MEDIUM confidence
- [Zapper DeFi Dashboard](https://zapper.xyz/dashboard) - MEDIUM confidence

### Points Programs
- [LiFi Loyalty Pass](https://li.fi/knowledge-hub/the-loyalty-pass/) - HIGH confidence (official)
- [Drops.bot Points Checker](https://www.drops.bot/free-points-checker) - MEDIUM confidence
- [Points-Based Distribution Programs](https://defiprime.com/points-based-token-distribution-programs-web3) - MEDIUM confidence
- [CoinGecko Jumper Guide](https://www.coingecko.com/learn/what-is-jumper-potential-jumper-airdrop) - MEDIUM confidence

### UX Patterns
- [Blockchain UX Design Guide](https://avark.agency/learn/article/blockchain-ux-design-guide/) - MEDIUM confidence
- [Crypto Wallet User Pain Points](https://www.antiersolutions.com/blogs/how-crypto-wallets-address-users-pain-points/) - MEDIUM confidence

### Jumper/LiFi Specific
- [Jumper Exchange Official](https://jumper.exchange) - HIGH confidence
- [DappRadar Jumper](https://dappradar.com/dapp/jumper-exchange) - MEDIUM confidence
