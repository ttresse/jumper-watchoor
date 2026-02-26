# Project Research Summary

**Project:** Jumper Points Tracker
**Domain:** Multi-chain blockchain wallet scanner and protocol-specific points tracker
**Researched:** 2026-02-26
**Confidence:** MEDIUM-HIGH

## Executive Summary

This is a client-side multi-chain wallet scanner that calculates Jumper Exchange loyalty points by analyzing transaction history across 60+ blockchain networks. The product occupies a niche between general portfolio trackers (DeBank, Zapper) and protocol-specific depth: it does one thing exceptionally well rather than trying to cover everything.

The recommended approach is a **layered client-side architecture** built with Next.js 15 App Router, using Covalent GoldRush as the unified multi-chain data source and TanStack Query for orchestrating parallel chain scans. The technical insight that makes this tractable is that all Jumper transactions route through a single LiFi Diamond contract address (`0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE`) across all chains, enabling targeted filtering rather than scanning entire wallet histories. The architecture must prioritize progressive loading with rate-limited parallelism to hit the <5 second performance target while avoiding API rate limit cascade failures.

The critical risks are (1) rate limit cascade from naive parallel requests killing the entire scan, (2) transaction misclassification (failed/pending/reverted transactions counted incorrectly), and (3) historical price data unavailability for calculating dollar volumes. Mitigation requires rate limiting built into the data fetching layer from day one, explicit transaction receipt status checking, and fallback price sources with graceful degradation when prices aren't available.

## Key Findings

### Recommended Stack

The stack is optimized for a read-only, client-heavy application that scans 60+ blockchain networks for LiFi transactions. Key insight: unified multi-chain APIs (Covalent GoldRush) eliminate the complexity of managing 60+ different chain explorers with 60+ API keys. The architecture prioritizes parallel API calls with rate limiting, aggressive client-side caching, and fast time-to-market over complex backend infrastructure.

**Core technologies:**
- **Next.js 15 with App Router**: Full-stack React framework with Server Components for initial data fetch, Edge Runtime for API routes, native TypeScript support, and Vercel deployment target
- **Covalent GoldRush SDK**: Only practical option for unified multi-chain transaction data (100+ chains, single API, 25k free credits/month at 4 RPS)
- **TanStack Query v5**: Server state management handling parallel chain queries, caching, deduplication, and background refetch with stale-while-revalidate pattern
- **viem**: Modern TypeScript-first Ethereum library (4x smaller than ethers.js, first-class TypeScript, built-in chain definitions for all 67 LiFi-supported chains)
- **Tailwind CSS v4 + shadcn/ui**: CSS-first config, 5x faster builds, copy-paste component library (no lock-in)
- **zustand**: Minimal (1.16kB) client state management for UI state and tier configuration
- **DefiLlama API**: Free historical token prices without authentication

**Critical dependencies:**
- GoldRush free tier: 4 RPS, 25k credits/month (sufficient for MVP with caching)
- Historical pricing requires DefiLlama's `/prices/historical/{timestamp}/{coins}` endpoint
- Transaction classification uses viem's `decodeFunctionData` to parse LiFi transaction inputs

### Expected Features

Research shows this occupies a specific niche: none of the major portfolio trackers (DeBank, Zapper, Zerion) calculate protocol-specific points. Our competitive advantage is depth over breadth.

**Must have (table stakes):**
- Wallet address input with multi-chain scanning (60+ chains)
- Transaction history display with classification (bridge vs swap)
- Points/XP calculation applying tier rules to categorized transactions
- Category breakdown (TRANSACTOOR/BRIDGOOR/SWAPOOR/CHAINOOR)
- Monthly aggregation (Jumper resets monthly)
- USD value display using historical prices (required for tier calculations)
- Loading state feedback ("Scanning X of 60 chains...")
- Fast results (<5 seconds target)
- Mobile-responsive design

**Should have (competitive differentiators):**
- Tier progress visualization showing distance to next tier
- Recommendations engine ("Bridge $500 more this month to reach next tier")
- Configurable tier rules (user-requested, allows tracking even if Jumper changes rules)
- Export functionality (CSV/JSON)
- Chain-by-chain breakdown showing which chains are used most
- Transaction classification transparency (why bridge vs swap)
- Dark mode

**Defer (v2+):**
- ENS/domain resolution (already marked out-of-scope in PROJECT.md)
- Historical season tracking across multiple Jumper seasons
- "What If" calculator for simulating additional transactions
- Share/embed results for social proof

**Anti-features (explicitly avoid):**
- Wallet connection/signing (read-only needs no authentication)
- User accounts/login (stateless MVP, localStorage for preferences)
- Transaction execution (show data only, link to Jumper for actual bridging)
- Full portfolio tracking (DeBank/Zapper's territory, not our niche)
- Backend database (adds cost/complexity, client-side sufficient)

### Architecture Approach

A **layered client-side architecture** with clear separation between data fetching, business logic, and presentation. Given the no-backend constraint, this is a React SPA with service layers that abstract external API complexity.

**Layer structure:** Presentation (React components) → State Management (TanStack Query) → Service Layer (business logic) → API Adapter Layer (external API abstraction) → External APIs (Covalent, DefiLlama, LocalStorage).

**Major components:**
1. **CovalentAdapter** — Wraps GoldRush API, handles parallel chain requests with rate limiting, filters by LiFi contract address, normalizes responses across chains
2. **TransactionService** — Fetches and classifies transactions (bridge vs swap based on cross-chain routing), handles pagination and progressive loading
3. **PriceService** — Gets historical token prices from DefiLlama, batches requests by timestamp+token, caches aggressively to avoid rate limits
4. **PointsCalculator** — Applies configurable tier rules to classified transactions, aggregates by month, calculates XP per category
5. **Dashboard** — Orchestrates data display with progressive loading, shows results as chains complete rather than blocking on all

**Key architectural patterns:**
- **Adapter Pattern** for external APIs to insulate business logic from API changes
- **Parallel fetching with concurrency control** using p-limit (10 concurrent requests to avoid rate limit cascade)
- **Service Layer** for business logic (classification, calculation) separate from UI and data access
- **Configuration as Data** storing tier rules in LocalStorage JSON with runtime editing capability

### Critical Pitfalls

Research identified 13 domain-specific pitfalls across severity levels. Top 5 that could derail the project:

1. **Naive Parallel API Requests Causing Rate Limit Cascade** — Scanning 60+ chains without rate limiting hits Covalent's 4 RPS free tier limit, causes HTTP 429 errors, retry logic creates cascade failure. Prevention: implement request queue with configurable concurrency (start with 3-4 parallel), exponential backoff with jitter on 429s, respect Retry-After headers, cache aggressively. Must address in Phase 1 (Core Architecture).

2. **Failed Transaction Misclassification** — Counting failed/reverted transactions as successful inflates user points and destroys trust. Missing successful transactions due to internal call complexity. Prevention: always verify transaction receipt status before counting, handle LiFi's complex success/failure states, log ambiguous status for review. Must address in Phase 2 (Transaction Classification).

3. **Historical Price Data Unavailability** — DefiLlama returns no price for certain tokens at certain timestamps, causing dollar volume calculations to fail or return $0. BRIDGOOR/SWAPOOR tiers become impossible to calculate. Prevention: implement fallback price sources, use nearest available timestamp within acceptable window, track which tokens have reliable data, flag transactions for review when prices missing. Must address in Phase 3 (Points Calculation).

4. **Cross-Chain Bridge Tracking Gaps** — Bridge transactions create separate txs on source and destination chains, linking them is non-deterministic. Bridge volume gets systematically undercounted. Prevention: For MVP, detect bridge vs swap from source tx only using LiFi routing data, don't try to link source/destination initially, accept partial tracking with documented limitations. Must address in Phase 2.

5. **Token Identification Across Chains** — Same token (USDC) has different contract addresses per chain, treating as different tokens causes incorrect aggregation. Prevention: use DefiLlama's chain-prefixed token format (`ethereum:0x...`, `polygon:0x...`), maintain canonical token identifier mappings, use standard identifiers for native tokens. Must address in Phase 3.

**Additional moderate pitfalls:** Pagination exhaustion for power users, frontend performance death by RPC (10-30 second loads), blockchain reorg data inconsistency, contract ABI decoding failures.

## Implications for Roadmap

Based on research, suggested phase structure with 4-5 phases:

### Phase 1: Foundation & Data Layer
**Rationale:** Build the foundational infrastructure that enables everything else. Rate limiting and API abstraction must be correct from day one to avoid architectural rework. This phase establishes the data fetching patterns that all subsequent phases depend on.

**Delivers:**
- API adapters with rate limiting (CovalentAdapter, DefiLlamaAdapter)
- Configuration persistence layer (ConfigAdapter)
- Basic chain scanning capability with progress tracking
- Wallet address input and validation

**Addresses:**
- Table stakes: Wallet address input, multi-chain scanning, loading state feedback
- Architecture: Adapter Pattern, concurrency control

**Avoids:**
- Pitfall #1: Rate limit cascade (concurrency limiting built in)
- Pitfall #11: API key exposure (serverless proxy pattern)
- Pitfall #12: Hardcoded chain list (fetch from API)

**Research flag:** LOW — Well-documented patterns for API abstraction, TanStack Query, and rate limiting. Standard implementation.

---

### Phase 2: Transaction Classification
**Rationale:** Classification logic is the core domain complexity. Bridge vs swap determination, transaction status verification, and handling the LiFi contract's complexity must be robust before points calculation begins. Dependencies from Phase 1 (adapters, rate limiting) must be complete.

**Delivers:**
- Transaction fetching service with pagination handling
- Bridge vs swap classification logic
- Transaction status verification (failed/reverted handling)
- Transaction history display component

**Addresses:**
- Table stakes: Transaction history display, bridge/swap classification
- Architecture: TransactionService, classification business logic

**Avoids:**
- Pitfall #2: Failed transaction misclassification (explicit status checking)
- Pitfall #3: Bridge tracking gaps (source-chain-only classification)
- Pitfall #8: Blockchain reorg inconsistency (confirmation depth)
- Pitfall #9: ABI decoding failures (heuristic-based classification)

**Research flag:** MEDIUM — LiFi contract interaction patterns need validation. Bridge/swap classification heuristics may need iteration. Monitor for edge cases during implementation.

---

### Phase 3: Points Calculation Engine
**Rationale:** Points calculation depends on classified transactions (Phase 2) and requires historical price data. This is where the business value materializes. Configurable tier rules enable the product to adapt as Jumper changes their system.

**Delivers:**
- Historical price fetching with DefiLlama integration
- USD value calculation for transactions
- Configurable tier rules (JSON config with UI editor)
- Points calculator applying tier thresholds
- Monthly aggregation logic

**Addresses:**
- Table stakes: Points/XP calculation, category breakdown, monthly aggregation, USD value display
- Differentiators: Configurable tier rules
- Architecture: PriceService, PointsCalculator

**Avoids:**
- Pitfall #4: Historical price unavailability (fallback sources, graceful degradation)
- Pitfall #5: Token identification across chains (chain-prefixed format)
- Pitfall #10: Timezone inconsistency (UTC everywhere)
- Pitfall #13: Points configuration drift (external JSON config)

**Research flag:** MEDIUM — DefiLlama API reliability needs validation. Price fallback strategy may need iteration based on actual token coverage. Token identifier edge cases likely to emerge.

---

### Phase 4: Dashboard & Visualization
**Rationale:** With data fetching, classification, and calculation complete, focus shifts to presentation. Progressive loading patterns established in Phase 1 become critical here for hitting the <5 second performance target.

**Delivers:**
- Dashboard orchestrating all data display
- Points display by category (TRANSACTOOR/BRIDGOOR/SWAPOOR/CHAINOOR)
- Monthly breakdown table
- Chain-by-chain breakdown
- Progressive loading with per-chain results
- Mobile-responsive design
- Dark mode

**Addresses:**
- Table stakes: Fast results (<5 seconds), mobile-responsive design
- Differentiators: Chain-by-chain breakdown, transaction classification transparency
- Architecture: Dashboard component, progressive rendering

**Avoids:**
- Pitfall #7: Frontend performance death by RPC (progressive loading, caching)
- Pitfall #6: Pagination exhaustion (incremental fetching with progress indicators)

**Research flag:** LOW — Standard React patterns for progressive loading and responsive design. Performance optimization is well-documented.

---

### Phase 5: Value-Add Features
**Rationale:** Core utility is complete (Phases 1-4). This phase adds competitive differentiators that make the product sticky and actionable. Can be delivered incrementally.

**Delivers:**
- Tier progress visualization (progress bars showing distance to next tier)
- Recommendations engine ("Bridge $500 more this month to reach next tier")
- Export functionality (CSV/JSON)
- Configuration editor UI for tier rules

**Addresses:**
- Differentiators: Tier progress visualization, recommendations engine, export, configurable tier rules UI
- Architecture: Recommendation logic using PointsCalculator output

**Avoids:**
- No specific pitfalls, but builds on solid foundation from Phases 1-4

**Research flag:** LOW — Straightforward UI features on top of completed calculation engine.

---

### Phase Ordering Rationale

- **Phase 1 first:** Foundation must handle rate limiting correctly to avoid cascade failures. All other phases depend on reliable data fetching.
- **Phase 2 before 3:** Points calculation requires classified transactions. Can't calculate BRIDGOOR/SWAPOOR without knowing which transactions are bridges vs swaps.
- **Phase 3 before 4:** Dashboard displays calculated points. No value in showing UI before calculation logic works.
- **Phase 4 before 5:** Tier progress visualization and recommendations depend on seeing the dashboard structure.
- **Parallel opportunities:** Within Phase 4, UI components can be built in parallel once data structure is defined.

**Dependency chain:** Foundation (adapters, rate limiting) → Classification (bridge vs swap) → Calculation (USD values, XP) → Presentation (dashboard) → Value-add (recommendations)

**Architecture alignment:** Follows the layer structure (API Adapters → Services → Calculator → UI). Each phase completes one architectural layer before moving up the stack.

**Pitfall avoidance:** Phases ordered to address critical pitfalls early (rate limiting in Phase 1, classification errors in Phase 2, price issues in Phase 3).

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Transaction Classification):** LiFi contract behavior may have edge cases not covered in research. Bridge/swap classification heuristics need validation against actual transaction data. Consider `/gsd:research-phase` if classification logic proves more complex than anticipated.
- **Phase 3 (Points Calculation):** DefiLlama API reliability and token coverage needs validation. Price fallback strategy may need iteration. Consider lightweight research spike on historical pricing edge cases.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** API adapter pattern, TanStack Query, rate limiting are well-documented. Official docs sufficient.
- **Phase 4 (Dashboard):** Standard React progressive loading patterns, responsive design. Well-trodden territory.
- **Phase 5 (Value-Add):** Straightforward UI on top of calculation engine. No novel patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies verified with official docs, npm versions confirmed, clear rationale for each choice |
| Features | MEDIUM | Based on competitor analysis and ecosystem research, but no direct user research. Table stakes well-understood, differentiators are inferred from similar tools |
| Architecture | MEDIUM | Patterns are standard (adapter, service layer), but LiFi-specific implementation details need validation during Phase 2 |
| Pitfalls | MEDIUM | Based on cross-chain indexing literature and multi-chain app research, but specific to Jumper/LiFi edge cases will emerge during implementation |

**Overall confidence:** MEDIUM-HIGH

Stack decisions are solid (HIGH confidence in technology choices). Feature landscape is well-researched but could benefit from user validation (MEDIUM). Architecture patterns are standard but domain-specific complexity around LiFi contract interaction needs validation (MEDIUM). Pitfalls are well-identified but specific edge cases will emerge (MEDIUM).

### Gaps to Address

Research identified several areas needing attention during planning/execution:

- **LiFi contract classification edge cases:** Research covered the general pattern (filter by contract address, decode routing data), but specific function signatures and event patterns need validation against actual transaction data. Plan for iteration in Phase 2.

- **DefiLlama price coverage validation:** Research confirmed the API exists and is free, but didn't validate actual token coverage across all 60+ chains. Expect some tokens to lack historical price data. Build fallback strategy in Phase 3 and be prepared to add alternative price sources (CoinGecko, native chain oracles) if coverage is insufficient.

- **Cross-chain bridge destination tracking:** Research identified this as a known limitation (can't reliably link source and destination transactions). MVP approach is source-chain-only classification with documented limitations. Post-MVP may need specialized bridge-tracking service if users demand higher accuracy.

- **Covalent API pagination behavior for heavy wallets:** Research noted pagination as a pitfall but didn't validate actual behavior for wallets with 10,000+ transactions. Plan for incremental fetching with progress indicators and be prepared to add date-range filters if full history scanning proves impractical.

- **LiFi contract upgrade resilience:** LiFi uses a Diamond proxy pattern that can change function signatures. Research recommends heuristic-based classification over full ABI decoding, but monitor Jumper/LiFi announcements for contract changes. Consider versioned classification logic if contract behavior changes significantly.

## Sources

### Primary (HIGH confidence)
- [Next.js 15.5 Release](https://nextjs.org/blog/next-15-5) — TypeScript improvements, App Router stability
- [Tailwind CSS v4.0](https://tailwindcss.com/blog/tailwindcss-v4) — CSS-first config, performance improvements
- [viem Documentation](https://viem.sh/) — TypeScript-first Ethereum library
- [TanStack Query v5](https://tanstack.com/query/latest) — Parallel queries, caching patterns
- [GoldRush API](https://goldrush.dev/) — Multi-chain transaction data APIs
- [GoldRush Pricing](https://goldrush.dev/pricing/) — Free tier: 25k credits/month, 4 RPS
- [LiFi Documentation](https://docs.li.fi/) — Bridge/swap routing through Diamond contract
- [DefiLlama Coin Prices API](https://docs.llama.fi/coin-prices-api) — Historical price endpoints

### Secondary (MEDIUM confidence)
- [DeBank Review 2026](https://cryptoadventure.com/debank-review-2026-defi-portfolio-tracking-wallet-research-and-web3-social-features/) — Competitor landscape
- [LiFi Loyalty Pass](https://li.fi/knowledge-hub/the-loyalty-pass/) — Official points program documentation
- [Cross-Chain Bridge Tracing Demystified](https://www.anchain.ai/blog/cross-chain-bridge-tracing/) — Bridge tracking challenges
- [Covalent API Rate Limits](https://www.covalenthq.com/docs/api/guide/overview/) — 4 req/sec free tier
- [Real-time Blockchain Data Indexing Challenges](https://medium.com/@aannkkiittaa/real-time-blockchain-data-indexing-challenges-and-solutions-fcb1f8aa3911) — Parallelization and performance
- [Blockchain Reorg Handling](https://www.quicknode.com/docs/streams/reorg-handling) — Confirmation depth strategies
- [Frontend Performance Guide 2026](https://zenn.dev/gaku1234/articles/frontend-performance-guide-2026) — Progressive loading patterns

### Tertiary (LOW confidence)
- Various ecosystem blog posts and community discussions on wallet tracking, points programs, and multi-chain architecture — informed feature landscape and pitfall identification

---
*Research completed: 2026-02-26*
*Ready for roadmap: yes*
