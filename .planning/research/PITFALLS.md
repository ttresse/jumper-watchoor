# Domain Pitfalls

**Domain:** Multi-chain wallet scanner and points tracker
**Researched:** 2026-02-26
**Confidence:** MEDIUM (based on WebSearch findings verified across multiple sources)

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Naive Parallel API Requests Causing Rate Limit Cascade

**What goes wrong:** Scanning 60+ chains in parallel without rate limiting causes API rate limit errors (HTTP 429). When one request fails, retry logic hammers the API harder, creating a cascade failure where the entire scan becomes unusable.

**Why it happens:** Developers assume parallel requests = faster results. Covalent's free tier limits to 4 requests/second, paid tier to 50/second. With 60+ chains, naive parallelization exceeds this instantly.

**Consequences:**
- Users see partial or no results
- API key gets temporarily blocked
- 5-second performance target becomes impossible
- Retry storms consume all available credits

**Prevention:**
- Implement request queue with configurable concurrency (start with 3-4 parallel requests)
- Use exponential backoff with jitter on 429 responses
- Respect `Retry-After` header when present
- Pre-calculate total requests and pace accordingly
- Cache results aggressively to avoid repeat requests

**Detection:**
- Monitor 429 error rate in development
- Track actual request timing vs expected
- Alert if average request time exceeds baseline by 3x

**Phase to address:** Phase 1 (Core Architecture) - Build rate limiting into the data fetching layer from day one.

---

### Pitfall 2: Failed Transaction Misclassification

**What goes wrong:** Counting failed/reverted transactions as successful bridges or swaps, inflating user points. Also: missing successful transactions that look failed due to internal call complexity.

**Why it happens:**
- Not checking `status` field in transaction receipts (0 = failed, 1 = success)
- Internal transactions through the LiFi Diamond contract may have complex success/failure states
- Some chains have different receipt formats or delayed finality

**Consequences:**
- Users get incorrect point totals
- Trust in the tracker evaporates
- Potential for gaming the system

**Prevention:**
- Always verify transaction receipt status before counting
- For LiFi transactions, verify the operation completed on destination chain (for bridges)
- Handle the case where source chain tx succeeded but destination chain tx failed
- Log and flag transactions with ambiguous status for manual review

**Detection:**
- Compare point totals with official Jumper dashboard (if available)
- Monitor for unusually high transaction counts from single addresses
- Track ratio of failed vs successful transactions per chain

**Phase to address:** Phase 2 (Transaction Classification) - This is core to the classification logic.

---

### Pitfall 3: Cross-Chain Bridge Tracking Gaps

**What goes wrong:** Bridge transactions show on source chain but destination chain tx is missing or unlinked. User's bridge volume is undercounted.

**Why it happens:**
- Bridge transactions create separate transactions on source and destination chains
- Linking them requires matching by amount, time window, and token - not deterministic
- Destination chain data may lag behind source chain
- Different bridges use different mechanisms (wrap-and-mint, liquidity pools, message passing)

**Consequences:**
- Bridge volume systematically undercounted
- BRIDGOOR tier calculations wrong
- Users see discrepancies between their actual activity and reported points

**Prevention:**
- For MVP: Detect bridge vs swap by checking if LiFi contract call has cross-chain routing data
- Don't try to link source/destination transactions initially - just classify intent from source tx
- Use LiFi's transaction metadata if available in the logs to identify destination chain
- Accept that some bridge transactions will be partially tracked

**Detection:**
- Compare detected bridges against user-reported discrepancies
- Track ratio of "bridge detected" vs "bridge confirmed on both chains"
- Monitor for chains with consistently missing destination data

**Phase to address:** Phase 2 (Transaction Classification) - Core classification logic with known limitations documented.

---

### Pitfall 4: Historical Price Data Unavailability

**What goes wrong:** DefiLlama returns no price data for certain tokens at certain timestamps, causing dollar volume calculations to fail or return $0.

**Why it happens:**
- Not all tokens have historical price data, especially newer or low-liquidity tokens
- Some chains have limited price oracle coverage
- Timestamp precision issues (DefiLlama may not have data for exact block timestamp)
- Native tokens vs wrapped tokens may have different price availability

**Consequences:**
- Dollar volume calculations fail silently or return $0
- BRIDGOOR/SWAPOOR tiers wrong or impossible to calculate
- Users with legitimate activity see 0 points

**Prevention:**
- Implement fallback price sources (CoinGecko, native chain oracles)
- Use nearest available timestamp within acceptable window (e.g., +/- 1 hour)
- Track which tokens have reliable price data and which don't
- For tokens without price data: log warning, use $0 but flag transaction for review
- Consider showing "estimated" vs "confirmed" volumes

**Detection:**
- Monitor rate of price lookup failures per chain and token
- Alert when >10% of transactions have missing prices
- Track which tokens consistently fail price lookups

**Phase to address:** Phase 3 (Points Calculation) - After transaction classification is solid, handle price edge cases.

---

### Pitfall 5: Token Identification Across Chains

**What goes wrong:** Same token (e.g., USDC) has different contract addresses on different chains. Treating them as different tokens causes incorrect volume aggregation.

**Why it happens:**
- EVM tokens have chain-specific contract addresses
- Token name and symbol alone aren't unique identifiers
- Some tokens are bridged versions (which may have different addresses than canonical)
- Native tokens (ETH, MATIC, etc.) have no contract address but wrapped versions do

**Consequences:**
- Volume aggregated incorrectly across chains
- Price lookups fail when using wrong token identifier
- Users see fragmented data that doesn't make sense

**Prevention:**
- Use DefiLlama's chain-prefixed token format (e.g., `ethereum:0x...`, `polygon:0x...`)
- Maintain mapping of canonical token identifiers to chain-specific addresses
- For native tokens, use standard identifiers (e.g., `coingecko:ethereum`)
- When displaying, show token symbol but store chain-specific address

**Detection:**
- Flag when same transaction appears to involve different USD values for same token amount
- Monitor for unusual token distributions in aggregated stats
- Compare token addresses against known canonical addresses

**Phase to address:** Phase 3 (Points Calculation) - Needed for accurate USD conversion.

---

## Moderate Pitfalls

### Pitfall 6: Pagination Exhaustion

**What goes wrong:** Active wallets have thousands of transactions. Pagination loops time out, hit memory limits, or miss transactions when page sizes change.

**Why it happens:**
- Covalent returns 100 items per page by default
- Heavy users may have 10,000+ transactions
- API response time increases with page depth
- No cursor stability guarantee across requests

**Prevention:**
- Implement incremental fetching with progress indicators
- Use date range filters to limit initial query scope (last 12 months for points)
- Store last-fetched checkpoint for resume capability
- Set maximum page limit with user warning for truncated results

**Phase to address:** Phase 1 (Core Architecture) - Part of data fetching layer design.

---

### Pitfall 7: Web3 Frontend Performance Death by RPC

**What goes wrong:** Initial page load takes 10-30 seconds as the app makes 50+ API calls synchronously or with poor batching.

**Why it happens:**
- Loading all chain data at once instead of progressively
- No caching layer between user sessions
- Each component making independent API calls
- Blocking on non-critical data before showing any results

**Consequences:**
- Users abandon before seeing results
- 5-second target missed badly
- High API credit consumption for repeated visits

**Prevention:**
- Progressive loading: show chains as they complete, not all at once
- Client-side caching (localStorage/IndexedDB) for repeat visits
- Prioritize high-volume chains first (Ethereum, Polygon, Arbitrum, Optimism)
- Show loading skeleton with progress indicator per chain
- Lazy load historical data after current totals displayed

**Detection:**
- Measure Time to First Meaningful Paint (first chain result)
- Track total load time to completion
- Monitor API request count per session

**Phase to address:** Phase 4 (Dashboard UI) - But architecture decisions in Phase 1 enable this.

---

### Pitfall 8: Blockchain Reorg Data Inconsistency

**What goes wrong:** Transaction data fetched during a chain reorganization becomes invalid. Points calculated from reorged blocks are wrong.

**Why it happens:**
- Some chains (especially L2s) have frequent short reorgs
- Covalent may return data from blocks that later get reorged
- No automatic detection/correction of reorged data

**Consequences:**
- Phantom transactions counted or real transactions missed
- Inconsistent results between page refreshes
- User confusion when points change unexpectedly

**Prevention:**
- Wait for sufficient confirmations before treating data as final (6+ blocks for most chains)
- For real-time display: show "pending" state for recent transactions
- Add "last updated" timestamp to results
- Accept that very recent transactions may shift slightly

**Detection:**
- Compare results for same wallet at different times
- Monitor for transactions that appear then disappear
- Track chains with high reorg frequency

**Phase to address:** Phase 2 (Transaction Classification) - Consider confirmation depth when fetching.

---

### Pitfall 9: Contract ABI Decoding Failures

**What goes wrong:** Unable to decode LiFi contract calls, resulting in transactions being classified as "unknown" instead of bridge/swap.

**Why it happens:**
- LiFi Diamond contract uses proxy pattern with dynamic facets
- ABI may change with contract upgrades
- Not all function signatures are public
- Internal transactions through multiple contracts

**Consequences:**
- Transactions missed or misclassified
- Unable to extract amount, token, destination chain
- Points undercounted

**Prevention:**
- Don't rely on full ABI decoding for classification
- Use heuristics: check for known function selectors (first 4 bytes)
- For MVP: Filter by contract address, classify based on transaction value and logs
- Monitor Jumper/LiFi announcements for contract changes

**Detection:**
- Track percentage of transactions with "unknown" classification
- Alert when unknown rate exceeds 10%
- Compare total tx count vs classified tx count

**Phase to address:** Phase 2 (Transaction Classification) - Core but can start with heuristics.

---

## Minor Pitfalls

### Pitfall 10: Timezone Inconsistency in Monthly Aggregation

**What goes wrong:** Points are calculated per month, but timezone handling causes transactions to appear in wrong month for some users.

**Prevention:**
- Use UTC consistently for all date calculations
- Store block timestamps, not local times
- Display dates in user's timezone but calculate in UTC
- Clearly label "Month (UTC)" in UI

**Phase to address:** Phase 3 (Points Calculation)

---

### Pitfall 11: API Key Exposure in Client-Side Code

**What goes wrong:** Covalent API key exposed in browser, allowing abuse or theft.

**Prevention:**
- Use serverless function (Vercel Edge) to proxy API calls
- Never include API key in client-side bundle
- Implement request signing or session tokens

**Phase to address:** Phase 1 (Core Architecture)

---

### Pitfall 12: Hardcoded Chain List Staleness

**What goes wrong:** Jumper adds new chains, but the tracker's chain list is hardcoded and misses them.

**Prevention:**
- Fetch supported chains from Covalent API at startup
- Filter to chains where LiFi contract is deployed
- Have config file that's easy to update
- Add "unknown chain" handling for unrecognized chain IDs in historical data

**Phase to address:** Phase 1 (Core Architecture)

---

### Pitfall 13: Points Configuration Drift

**What goes wrong:** Jumper changes their points tiers, but the tracker uses old values.

**Prevention:**
- Make tier configuration easily editable (JSON config, not code)
- Add "last updated" date to configuration
- Document where official tier values come from
- Consider scraping official source periodically

**Phase to address:** Phase 3 (Points Calculation) - Configurable by requirement.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Core Architecture | Rate limit cascade, API key exposure, chain list staleness | Build rate limiter and caching from day 1, use serverless proxy |
| Transaction Fetching | Pagination exhaustion, reorg inconsistency | Progressive loading with checkpoints, confirmation depth |
| Transaction Classification | Failed tx misclassification, bridge tracking gaps, ABI decoding | Check receipt status, use heuristics over full decoding |
| Points Calculation | Price unavailability, token identification, timezone | Fallback price sources, chain-prefixed tokens, UTC everywhere |
| Dashboard UI | Performance death spiral | Progressive rendering, aggressive caching, lazy loading |
| Configuration | Points tier drift, chain list staleness | External config files, easy updates |

## Sources

### Rate Limiting and API Management
- [Covalent API Rate Limits](https://www.covalenthq.com/docs/api/guide/overview/) - 4 req/sec free, 50 req/sec paid
- [API Rate Limiting Best Practices](https://tyk.io/learning-center/api-rate-limiting-explained-from-basics-to-best-practices/)
- [OpenAI Rate Limit Handling](https://cookbook.openai.com/examples/how_to_handle_rate_limits) - Exponential backoff patterns

### Cross-Chain Transaction Tracking
- [Cross-Chain Bridge Tracing Demystified](https://www.anchain.ai/blog/cross-chain-bridge-tracing/) - Architectural differences across bridges
- [Introduction to Cross-Chain Bridges - Chainalysis](https://www.chainalysis.com/blog/introduction-to-cross-chain-bridges/)
- [Track and Trace Cross-chain Transactions](https://arxiv.org/html/2504.01822v1) - Academic analysis

### Blockchain Indexing Challenges
- [Real-time Blockchain Data Indexing Challenges](https://medium.com/@aannkkiittaa/real-time-blockchain-data-indexing-challenges-and-solutions-fcb1f8aa3911)
- [The Challenges of Block Chain Indexing](https://blog.lopp.net/the-challenges-of-block-chain-indexing/) - Parallelization and performance

### Transaction Decoding
- [Transaction Log Events Decoding](https://dev.to/nazhmudin/transactions-data-decoding-and-human-readable-visualisation-elj)
- [Decoding Ethereum Smart Contract Data](https://towardsdatascience.com/decoding-ethereum-smart-contract-data-eed513a65f76/)

### Blockchain Reorgs
- [Reorg Handling - Quicknode](https://www.quicknode.com/docs/streams/reorg-handling)
- [Understanding Blockchain Reorgs](https://medium.com/@vladyslav.semenchuk9/understanding-blockchain-reorgs-and-how-to-manage-them-e9f02c70ba38)

### Web3 Frontend Performance
- [Why Your Web3 App Feels Slow](https://www.5hz.io/blog/why-web3-app-feels-slow-modern-architecture-2025) - Modern architecture patterns
- [Frontend Performance Guide 2026](https://zenn.dev/gaku1234/articles/frontend-performance-guide-2026)

### Price Data
- [DefiLlama Coin Prices API](https://docs.llama.fi/coin-prices-api) - Confidence scoring, redirect limitations
