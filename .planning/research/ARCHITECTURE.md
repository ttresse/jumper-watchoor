# Architecture Patterns

**Domain:** Multi-chain wallet transaction scanner and points calculator
**Researched:** 2026-02-26
**Confidence:** MEDIUM (verified with official docs and multiple sources)

## Recommended Architecture

A **layered client-side architecture** with clear separation between data fetching, business logic, and presentation. Given the PROJECT.md constraint of "client-side only (no backend)", this is a React SPA with service layers that abstract external API complexity.

```
+-----------------------------------------------------------+
|                    PRESENTATION LAYER                      |
|  [Dashboard] [Points Display] [Recommendations] [Config]   |
+-----------------------------------------------------------+
                            |
+-----------------------------------------------------------+
|                    STATE MANAGEMENT                        |
|  [TanStack Query] - Caching, Parallel Fetches, Deduping   |
+-----------------------------------------------------------+
                            |
+-----------------------------------------------------------+
|                    SERVICE LAYER                           |
|  [TransactionService] [PriceService] [PointsCalculator]   |
+-----------------------------------------------------------+
                            |
+-----------------------------------------------------------+
|                    API ADAPTER LAYER                       |
|  [CovalentAdapter]  [DefiLlamaAdapter]  [ConfigAdapter]   |
+-----------------------------------------------------------+
                            |
                   External APIs
        [Covalent/GoldRush]  [DefiLlama]  [LocalStorage]
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **WalletInput** | Capture/validate wallet address | TransactionService |
| **Dashboard** | Orchestrate all data display | PointsDisplay, Recommendations, MonthlyBreakdown |
| **PointsDisplay** | Show XP totals per category | PointsCalculator (via state) |
| **MonthlyBreakdown** | Table of monthly XP by category | PointsCalculator (via state) |
| **Recommendations** | Show actions to reach next tier | PointsCalculator (via state) |
| **ConfigEditor** | Edit points tier configuration | ConfigAdapter |
| **TransactionService** | Fetch + classify transactions | CovalentAdapter |
| **PriceService** | Get historical token prices | DefiLlamaAdapter |
| **PointsCalculator** | Compute XP from classified transactions | TransactionService, PriceService, ConfigAdapter |
| **CovalentAdapter** | Abstract Covalent/GoldRush API | External API |
| **DefiLlamaAdapter** | Abstract DefiLlama price API | External API |
| **ConfigAdapter** | Persist/load points tier config | LocalStorage |

### Data Flow

```
User enters wallet address
         |
         v
[TransactionService] -----> Fetch transactions from 60+ chains (parallel)
         |                        |
         |                  [CovalentAdapter]
         |                        |
         v                        v
Filter by LiFi contract    Covalent GoldRush API
0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE
         |
         v
Classify: Bridge (cross-chain) vs Swap (same-chain)
         |
         v
[PriceService] -----> Get historical prices for each tx timestamp
         |                        |
         |                  [DefiLlamaAdapter]
         |                        v
         |            https://coins.llama.fi/prices/historical/{timestamp}/{chain}:{token}
         v
Calculate USD amounts at transaction time
         |
         v
[PointsCalculator] -----> Apply tier rules from config
         |                        |
         |                  [ConfigAdapter]
         |                        v
         |                  LocalStorage (or defaults)
         v
Aggregate by month:
  - TRANSACTOOR: count transactions per month
  - BRIDGOOR: sum bridge USD volume per month
  - SWAPOOR: sum swap USD volume per month
  - CHAINOOR: count unique chains per month
         |
         v
Apply tier thresholds -> XP per category per month
         |
         v
[Dashboard] displays results
[Recommendations] shows gap to next tier
```

## Patterns to Follow

### Pattern 1: Adapter Pattern for External APIs

**What:** Wrap external APIs in adapter classes that normalize responses into internal data structures.

**When:** Always when calling external APIs. Insulates business logic from API changes.

**Example:**
```typescript
// adapters/covalent.adapter.ts
interface Transaction {
  hash: string;
  timestamp: number;
  fromChain: string;
  toChain: string | null;  // null = same-chain swap
  tokenAddress: string;
  tokenAmount: bigint;
  tokenDecimals: number;
}

interface CovalentAdapter {
  getTransactionsForWallet(
    wallet: string,
    chains: string[]
  ): Promise<Transaction[]>;
}

// Implementation handles:
// - Parallel requests across chains
// - Rate limiting
// - Response normalization
// - Error handling per chain (don't fail all if one chain errors)
```

### Pattern 2: Parallel Chain Fetching with Concurrency Control

**What:** Fetch data from multiple chains simultaneously, but limit concurrency to avoid rate limits.

**When:** Scanning 60+ chains requires parallelism for <5s target, but unlimited concurrency hits rate limits.

**Example:**
```typescript
// services/transaction.service.ts
import pLimit from 'p-limit';

const CONCURRENCY_LIMIT = 10;  // Adjust based on API limits

async function fetchAllChains(
  wallet: string,
  chains: string[]
): Promise<Transaction[]> {
  const limit = pLimit(CONCURRENCY_LIMIT);

  const results = await Promise.allSettled(
    chains.map(chain =>
      limit(() => covalentAdapter.getTransactions(wallet, chain))
    )
  );

  // Aggregate successes, log failures
  return results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value);
}
```

### Pattern 3: Service Layer for Business Logic

**What:** Encapsulate business logic (classification, calculation) in stateless service functions, separate from UI and data fetching.

**When:** Any logic that isn't purely presentation or purely data access.

**Example:**
```typescript
// services/classifier.service.ts
function classifyTransaction(tx: Transaction): 'bridge' | 'swap' {
  // Bridge: source chain != destination chain
  // Swap: same chain
  return tx.toChain && tx.toChain !== tx.fromChain ? 'bridge' : 'swap';
}

// services/points.calculator.ts
interface MonthlyStats {
  month: string;  // "2026-02"
  transactionCount: number;
  bridgeVolumeUsd: number;
  swapVolumeUsd: number;
  uniqueChains: Set<string>;
}

function calculateXP(
  stats: MonthlyStats,
  config: TierConfig
): MonthlyXP {
  return {
    transactoor: getTierXP(stats.transactionCount, config.transactoor),
    bridgoor: getTierXP(stats.bridgeVolumeUsd, config.bridgoor),
    swapoor: getTierXP(stats.swapVolumeUsd, config.swapoor),
    chainoor: getTierXP(stats.uniqueChains.size, config.chainoor),
  };
}
```

### Pattern 4: TanStack Query for Data Fetching

**What:** Use TanStack Query (React Query) for all external data fetching. Provides caching, deduplication, parallel queries, and background refetching.

**When:** All API calls from React components.

**Example:**
```typescript
// hooks/useWalletTransactions.ts
import { useQueries } from '@tanstack/react-query';

function useWalletTransactions(wallet: string, chains: string[]) {
  return useQueries({
    queries: chains.map(chain => ({
      queryKey: ['transactions', wallet, chain],
      queryFn: () => transactionService.fetch(wallet, chain),
      staleTime: 5 * 60 * 1000,  // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
    })),
    combine: (results) => ({
      data: results.flatMap(r => r.data ?? []),
      isLoading: results.some(r => r.isLoading),
      errors: results.filter(r => r.error).map(r => r.error),
    }),
  });
}
```

### Pattern 5: Configuration as Data

**What:** Store points tier configuration as a JSON structure in LocalStorage, with sensible defaults. Allow runtime editing.

**When:** User requirement for configurable point rules.

**Example:**
```typescript
// config/points.config.ts
interface TierConfig {
  transactoor: TierThreshold[];
  bridgoor: TierThreshold[];
  swapoor: TierThreshold[];
  chainoor: TierThreshold[];
}

interface TierThreshold {
  min: number;
  max: number | null;  // null = unlimited
  xp: number;
}

const DEFAULT_CONFIG: TierConfig = {
  transactoor: [
    { min: 1, max: 5, xp: 10 },
    { min: 5, max: 10, xp: 18 },
    // ... from PROJECT.md
  ],
  // ...
};

// adapters/config.adapter.ts
function loadConfig(): TierConfig {
  const stored = localStorage.getItem('jumper-points-config');
  return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
}

function saveConfig(config: TierConfig): void {
  localStorage.setItem('jumper-points-config', JSON.stringify(config));
}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Fetching in Components Directly

**What:** Calling APIs directly from React components without a service/adapter layer.

**Why bad:** Makes testing impossible, tightly couples UI to API shape, no single place to add logging/error handling.

**Instead:** Use adapters for API calls, services for business logic, TanStack Query hooks for React integration.

### Anti-Pattern 2: Sequential Chain Fetching

**What:** Fetching chains one-by-one: `for (chain of chains) await fetch(chain)`.

**Why bad:** 60 chains * ~200ms each = 12 seconds. Violates <5s requirement.

**Instead:** Parallel fetching with concurrency control (Pattern 2).

### Anti-Pattern 3: Re-fetching Prices for Every Transaction

**What:** Making individual API calls for each transaction's historical price.

**Why bad:** 100 transactions = 100 API calls. Slow and likely to hit rate limits.

**Instead:** Batch price lookups by timestamp+token, deduplicate requests, cache aggressively.

### Anti-Pattern 4: Monolithic "Scanner" Component

**What:** One giant component that fetches, classifies, calculates, and displays.

**Why bad:** Untestable, unreusable, hard to modify.

**Instead:** Clear separation: Adapters -> Services -> Hooks -> Components.

### Anti-Pattern 5: Hardcoded Chain List

**What:** Array of 60+ chain identifiers embedded in code.

**Why bad:** Jumper adds chains frequently. Requires code change to support new chains.

**Instead:** Fetch supported chains from Covalent API or maintain as separate config file that can be updated without code changes.

## Key Architecture Decisions

### Decision 1: Client-Side Only

**Rationale:** PROJECT.md specifies no backend. Simplifies deployment (static hosting), eliminates server costs, reduces time-to-ship.

**Implication:** API keys must be handled carefully (Covalent key exposed to client). Consider Vercel serverless edge functions as a thin proxy if API key security becomes a concern.

### Decision 2: Covalent/GoldRush as Primary Data Source

**Rationale:** Only service covering 100+ chains with unified API. Transaction data normalized across chains.

**API Pattern:**
- Endpoint: `GET /v1/{chainName}/bulk/transactions/{walletAddress}/{timeBucket}/`
- Filter client-side by `to` address = LiFi Diamond contract
- Time bucket = Unix timestamp / 900 (15-minute buckets)

**Source:** [GoldRush API Documentation](https://goldrush.dev/docs/api-reference/foundational-api/transactions/get-time-bucket-transactions-for-address-v3)

### Decision 3: DefiLlama for Historical Prices

**Rationale:** Free, no auth required, supports historical timestamps.

**API Pattern:**
- Endpoint: `GET https://coins.llama.fi/prices/historical/{timestamp}/{coins}`
- Coins format: `{chain}:{address}` (comma-separated for batch)
- Returns price at specified Unix timestamp

**Source:** [DefiLlama Coin Prices API](https://docs.llama.fi/coin-prices-api)

### Decision 4: LiFi Contract Filtering

**Rationale:** All Jumper transactions route through the LiFi Diamond contract at `0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE` (same address on all chains).

**Classification Logic:**
- Parse transaction logs for bridge events (contains destination chain)
- If destination chain differs from source chain: **Bridge**
- If destination chain equals source chain or no destination: **Swap**

**Source:** [LiFi Documentation](https://docs.li.fi/) confirms multi-chain routing through single contract.

## Scalability Considerations

| Concern | Single Wallet (MVP) | Power User (100+ txs) | Future Multi-Wallet |
|---------|---------------------|----------------------|---------------------|
| **Chain Fetching** | Parallel with limit=10 | Same, results paginated | Deduplicate across wallets |
| **Price Lookups** | Batch by timestamp | Cache aggressively, batch larger | Share cache across wallets |
| **XP Calculation** | In-memory | Same | Same |
| **State Storage** | TanStack Query cache | Same + consider IndexedDB | IndexedDB required |
| **Load Time** | <5s target | May exceed, show progress | Background loading |

## Build Order (Dependencies)

Components should be built in this order based on dependencies:

```
Phase 1: Foundation
  [1] ConfigAdapter (no deps) - Points tier config storage
  [2] CovalentAdapter (no deps) - API abstraction
  [3] DefiLlamaAdapter (no deps) - Price API abstraction

Phase 2: Services
  [4] TransactionService (depends on: CovalentAdapter)
      - Fetch transactions across chains
      - Filter by LiFi contract
      - Classify bridge vs swap

  [5] PriceService (depends on: DefiLlamaAdapter)
      - Get historical prices
      - Batch requests
      - Cache results

Phase 3: Business Logic
  [6] PointsCalculator (depends on: TransactionService, PriceService, ConfigAdapter)
      - Aggregate by month
      - Apply tier rules
      - Generate XP totals

Phase 4: React Integration
  [7] TanStack Query hooks (depends on: Services)
      - useWalletTransactions
      - useHistoricalPrices
      - usePointsCalculation

  [8] ConfigEditor component (depends on: ConfigAdapter)

Phase 5: UI Components
  [9] WalletInput (depends on: hooks)
  [10] Dashboard (depends on: hooks)
  [11] PointsDisplay (depends on: Dashboard state)
  [12] MonthlyBreakdown (depends on: Dashboard state)
  [13] Recommendations (depends on: Dashboard state)
```

**Rationale for ordering:**
1. Adapters first - they have no dependencies and enable testing of services
2. Services second - encapsulate business logic, can be unit tested with mocked adapters
3. Calculator third - needs services to provide data
4. Hooks fourth - bridge services to React
5. UI last - depends on everything else

## Component Communication Diagram

```
                    +-----------------+
                    |   WalletInput   |
                    +--------+--------+
                             |
                             | wallet address
                             v
+-----------------------------------------------------------+
|                        Dashboard                           |
|  +-------------+  +----------------+  +-----------------+  |
|  |useWalletTxs |  |usePriceService |  |usePointsCalc    |  |
|  +------+------+  +-------+--------+  +--------+--------+  |
|         |                 |                    |           |
+---------|-----------------|--------------------|-----------+
          |                 |                    |
          v                 v                    v
   TransactionSvc      PriceSvc           PointsCalculator
          |                 |                    |
          v                 v                    |
   CovalentAdapter   DefiLlamaAdapter      ConfigAdapter
          |                 |                    |
          v                 v                    v
    Covalent API      DefiLlama API        LocalStorage
```

## Sources

- [GoldRush Transaction API](https://goldrush.dev/docs/api-reference/foundational-api/transactions/get-time-bucket-transactions-for-address-v3) - Transaction history endpoint (MEDIUM confidence)
- [Covalent Unified API](https://www.covalenthq.com/) - Multi-chain data architecture (HIGH confidence)
- [DefiLlama Coin Prices API](https://docs.llama.fi/coin-prices-api) - Historical price endpoint format (MEDIUM confidence)
- [LiFi Documentation](https://docs.li.fi/) - Bridge/swap routing through Diamond contract (HIGH confidence)
- [TanStack Query Parallel Queries](https://tanstack.com/query/latest/docs/framework/react/guides/parallel-queries) - Parallel fetching patterns (HIGH confidence)
- [Martin Fowler - Service Layer](https://martinfowler.com/eaaCatalog/serviceLayer.html) - Service layer pattern definition (HIGH confidence)
- [Frontend Architecture Patterns 2026](https://dev.to/sizan_mahmud0_e7c3fd0cb68/the-complete-guide-to-frontend-architecture-patterns-in-2026-3ioo) - Modern React patterns (MEDIUM confidence)
