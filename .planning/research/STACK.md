# Technology Stack

**Project:** Jumper Points Tracker
**Researched:** 2026-02-26
**Overall Confidence:** HIGH

## Executive Summary

This stack is optimized for a read-only, client-heavy application that scans 60+ blockchain networks for LiFi transactions. The architecture prioritizes parallel API calls, client-side caching, and fast time-to-market over complex backend infrastructure.

Key insight: Since all Jumper transactions go through the LiFi Diamond contract (`0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE`), we can use Covalent/GoldRush to fetch wallet transactions filtered by this contract address across all chains in parallel, then use historical pricing data to calculate dollar volumes.

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Next.js | 15.5+ | Full-stack framework | App Router with React Server Components for initial data fetch, Edge Runtime for API routes, built-in TypeScript support, Vercel deployment target | HIGH |
| TypeScript | 5.x | Type safety | Industry standard, catches errors at compile time, excellent DX with viem | HIGH |
| React | 19.x | UI library | Bundled with Next.js 15, Server Components reduce client bundle | HIGH |

**Rationale:** Next.js 15 with App Router is the 2025/2026 standard for React applications. Server Components allow initial transaction fetching to happen server-side (faster, no CORS issues), while client components handle interactivity. The typed routes feature catches invalid links at compile time.

### Data Fetching

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Covalent GoldRush SDK | ^2.x | Multi-chain transaction data | Only service covering 100+ chains with unified API, 25k free credits/month, 4 RPS free tier | HIGH |
| @tanstack/react-query | ^5.90 | Server state management | Caching, deduplication, parallel queries, background refetch, stale-while-revalidate | HIGH |
| DefiLlama API | REST | Historical token prices | Free, no auth required, covers most DeFi tokens | MEDIUM |

**Rationale:**
- **GoldRush** is the only practical choice for scanning 60+ chains. Alternatives like individual chain explorers (Etherscan, etc.) would require managing 60+ API keys and different response formats. GoldRush's free tier (25k credits/month, 4 RPS) is sufficient for MVP.
- **TanStack Query v5** handles the complexity of parallel chain queries with built-in caching. Each chain scan becomes a separate query that can be cached, deduplicated, and refreshed independently.
- **DefiLlama** provides free historical pricing without authentication. The `/coins/prices/historical` endpoint accepts timestamps and returns USD prices.

### Blockchain Utilities

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| viem | ^2.46 | Ethereum interactions | Modern, TypeScript-first, 35kB bundle (vs ethers.js 135kB), better tree-shaking, composable actions | HIGH |

**Rationale:** viem has become the standard Ethereum library in 2025/2026, replacing ethers.js for new projects. Key advantages:
- 4x smaller bundle size (35kB vs 135kB)
- First-class TypeScript with compile-time type checking for ABI interactions
- Modular architecture with tree-shaking
- `decodeFunctionData` for parsing LiFi transaction inputs
- Built-in chain definitions for all 67 LiFi-supported chains

### UI Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Tailwind CSS | ^4.0 | Styling | CSS-first config (no JS config), 5x faster builds, 100x faster incremental builds, built-in container queries | HIGH |
| shadcn/ui | latest | Component library | Copy-paste components (not npm dependency), full control, built on Radix primitives, works with Tailwind v4 | HIGH |

**Rationale:** Tailwind CSS v4 (released January 2025) is a significant upgrade with CSS-first configuration and dramatically improved build performance. shadcn/ui provides production-ready components without lock-in since you own the code.

### State Management

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| zustand | ^5.x | Client state | Minimal (1.16kB), no boilerplate, no providers, hook-based, works with React 19 | HIGH |

**Rationale:** For a read-mostly application, TanStack Query handles server state (transactions, prices). Zustand handles the remaining client state (UI state, user preferences, tier configuration). The combination of TanStack Query + Zustand is the 2025 standard pattern, replacing Redux for most use cases.

### Infrastructure

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Vercel | - | Hosting/deployment | Native Next.js support, Edge Functions for API routes, free tier sufficient for MVP | HIGH |
| Vercel KV (optional) | - | Caching layer | Redis-compatible, cache transaction data to reduce API calls | MEDIUM |

**Rationale:** Vercel is the natural deployment target for Next.js. Edge Functions provide 9x faster cold starts than traditional serverless. For MVP, caching can happen client-side with TanStack Query; Vercel KV becomes relevant if you need to reduce GoldRush API calls.

---

## API Integration Details

### Covalent GoldRush

**Endpoint for wallet transactions:**
```
GET /v1/{chainName}/address/{walletAddress}/transactions_v3/
```

**Filter by LiFi contract:**
- Query transactions where `to` = `0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE`
- This filters to only Jumper/LiFi transactions

**Historical token prices:**
```
GET /v1/pricing/historical_by_addresses_v2/{chainName}/{quoteCurrency}/{contractAddress}/
```

**Rate limits:**
- Free tier: 4 RPS, 25k credits/month
- Each transaction query: ~1 credit
- Each price query: ~1 credit

### DefiLlama Coins API

**Historical prices:**
```
GET https://coins.llama.fi/prices/historical/{timestamp}/{coins}
```

Where `coins` is comma-separated like `ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48,bsc:0x...`

**Current prices:**
```
GET https://coins.llama.fi/prices/current/{coins}
```

**Rate limits:** Generous free tier, no authentication required.

### LiFi API (Reference Only)

**Chains endpoint:**
```
GET https://li.quest/v1/chains
```

Returns all 67 supported chains with IDs. Use for building chain selector/filter.

---

## Installation

```bash
# Create Next.js 15 project with TypeScript and Tailwind v4
npx create-next-app@latest jumper-watcher --typescript --tailwind --eslint --app --turbopack

# Core dependencies
npm install @covalenthq/client-sdk @tanstack/react-query viem zustand

# UI components (shadcn/ui)
npx shadcn@latest init
npx shadcn@latest add button card input table badge progress skeleton

# Dev dependencies
npm install -D @tanstack/react-query-devtools
```

### Environment Variables

```env
# Required
COVALENT_API_KEY=your_goldrush_api_key

# Optional (for server-side caching)
KV_REST_API_URL=your_vercel_kv_url
KV_REST_API_TOKEN=your_vercel_kv_token
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Multi-chain data | Covalent GoldRush | Individual chain APIs (Etherscan, etc.) | 60+ different APIs, different formats, 60+ API keys to manage |
| Multi-chain data | Covalent GoldRush | Moralis | Higher pricing, less chain coverage |
| Multi-chain data | Covalent GoldRush | Alchemy | Excellent but focused on fewer chains, higher cost |
| Ethereum library | viem | ethers.js | 4x larger bundle, less TypeScript-native, older architecture |
| Ethereum library | viem | web3.js | Largest bundle, least modern, declining usage |
| State management | zustand + TanStack Query | Redux Toolkit | Overkill for read-heavy app, more boilerplate |
| State management | zustand + TanStack Query | Jotai | Good but zustand has larger ecosystem, more familiar API |
| CSS framework | Tailwind v4 | CSS Modules | Less productive, more boilerplate |
| CSS framework | Tailwind v4 | Tailwind v3 | v4 is faster and uses CSS-first config |
| Component library | shadcn/ui | Material UI | Heavier, more opinionated, harder to customize |
| Component library | shadcn/ui | Chakra UI | Similar trade-offs to MUI, larger bundle |
| Hosting | Vercel | Netlify | Less optimized for Next.js, fewer edge locations |
| Hosting | Vercel | AWS Amplify | More complex setup, less Next.js native support |

---

## What NOT to Use

| Technology | Why Avoid |
|------------|-----------|
| ethers.js | Legacy library, 4x larger than viem, less TypeScript-native |
| Redux | Overkill for this use case, TanStack Query + zustand is the 2025 pattern |
| Axios | fetch() is native and sufficient, viem handles web3 calls |
| Create React App | Deprecated, use Next.js or Vite |
| Tailwind CSS v3 | v4 is significantly faster and uses simpler CSS-first config |
| GraphQL | Overkill for REST APIs like GoldRush and DefiLlama |
| Custom backend indexer | Unnecessary complexity, GoldRush already indexes all chains |
| Individual chain APIs | Unmanageable with 60+ chains, use unified API instead |

---

## Architecture Notes

### Parallel Chain Scanning Strategy

```typescript
// Use TanStack Query's parallel queries
const chainQueries = useQueries({
  queries: SUPPORTED_CHAINS.map(chain => ({
    queryKey: ['transactions', walletAddress, chain.id],
    queryFn: () => fetchChainTransactions(walletAddress, chain.id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  }))
})
```

This pattern:
1. Fires all chain queries in parallel
2. Caches each chain independently
3. Shows progressive loading (results appear as chains complete)
4. Respects rate limits with query retry logic

### Transaction Classification

Bridge vs Swap is determined by decoding the LiFi transaction:
- **Bridge**: source chain !== destination chain
- **Swap**: source chain === destination chain

Use viem's `decodeFunctionData` with LiFi's ABI to extract route information.

### Historical Pricing

For each transaction:
1. Get transaction timestamp
2. Query DefiLlama `/prices/historical/{timestamp}/{token}`
3. Cache price lookups (same token + day = same price)

---

## Confidence Assessment

| Component | Confidence | Rationale |
|-----------|------------|-----------|
| Next.js 15 + App Router | HIGH | Official docs, stable release, Vercel support |
| viem | HIGH | npm downloads verified, official docs reviewed |
| Covalent GoldRush | HIGH | Official pricing page, API docs verified |
| TanStack Query v5 | HIGH | npm version verified (5.90.21), official docs |
| Tailwind CSS v4 | HIGH | Released Jan 2025, official blog post verified |
| shadcn/ui | HIGH | Official docs, Next.js 15 compatibility verified |
| zustand | HIGH | Multiple 2025 sources recommend this pattern |
| DefiLlama API | MEDIUM | Free tier confirmed, but limited official rate limit docs |
| Vercel Edge Functions | HIGH | Official Vercel docs, 2025 updates verified |

---

## Sources

### Verified with Official Documentation
- [Next.js 15.5 Release](https://nextjs.org/blog/next-15-5) - TypeScript improvements, App Router
- [Tailwind CSS v4.0](https://tailwindcss.com/blog/tailwindcss-v4) - Released January 2025
- [viem Documentation](https://viem.sh/) - Latest version 2.46.2
- [TanStack Query v5](https://tanstack.com/query/latest) - Latest version 5.90.21
- [shadcn/ui Next.js Installation](https://ui.shadcn.com/docs/installation/next)
- [GoldRush API](https://goldrush.dev/) - Multi-chain data APIs
- [GoldRush Pricing](https://goldrush.dev/pricing/) - Free tier: 25k credits/month, 4 RPS
- [LiFi Chains API](https://li.quest/v1/chains) - 67 supported chains verified

### Ecosystem Research
- [Viem vs Ethers.js Comparison](https://metamask.io/news/viem-vs-ethers-js-a-detailed-comparison-for-web3-developers)
- [React State Management 2025](https://www.developerway.com/posts/react-state-management-2025)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [LiFi SDK GitHub](https://github.com/lifinance/sdk) - v4.0.0-alpha.17
- [Jumper Exchange Chain Support](https://chainwire.org/2025/12/24/jumper-exchange-releases-insights-from-50-blockchain-networks/)
- [DefiLlama API Docs](https://api-docs.defillama.com/)
