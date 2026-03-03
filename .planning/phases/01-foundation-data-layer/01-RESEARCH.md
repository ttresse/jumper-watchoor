# Phase 1: Foundation & Data Layer - Research

**Researched:** 2026-03-03
**Domain:** Multi-chain wallet scanning with rate limiting, EVM address validation, progressive loading UI
**Confidence:** HIGH

## Summary

Phase 1 establishes the foundation for scanning 60+ blockchain networks for LiFi transactions. The core challenge is fetching wallet transactions from multiple chains in parallel while respecting Covalent GoldRush's 4 RPS rate limit, providing real-time progress feedback as chains complete.

The architecture uses Covalent GoldRush SDK for multi-chain transaction data (only service covering 100+ chains with unified API), viem for address validation (lightweight, TypeScript-first), p-throttle for request rate limiting (queue-based, no discarded calls), and TanStack Query v5 for parallel queries with result combination. This stack is well-documented, production-proven, and specifically designed for the parallel API fetching pattern required.

**Primary recommendation:** Use p-throttle with `{ limit: 4, interval: 1000 }` to enforce the 4 RPS rate limit, fire all chain queries through TanStack Query's `useQueries` hook with the `combine` option to aggregate results and loading states, and show progressive results as each chain completes.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Wallet Input UX
- Single input field that accepts paste or typed address
- Auto-validate when input reaches 42 characters (full EVM address length)
- Inline validation feedback displayed below the input field
- Scan starts automatically when address is valid — no button click required
- Remember last scanned wallet in localStorage, pre-fill on return visits
- Pre-filled address requires user action (click/enter) to start scan — no auto-scan on page load

#### Progress Display
- Single progress bar with counter: "Scanning... 24/60 chains"
- As chains with transactions are found, show per-chain results below progress bar: "Arbitrum: 3 txns", "Optimism: 7 txns"
- Cancel button available during scan — user can abort and see partial results or start over

#### Error Handling
- Silent skip failed chains during scan, continue with remaining chains
- Show collapsible warning banner at end: "3 chains failed" with expand to see which chains + retry button
- Partial results are usable — user can view what was fetched and retry failed chains separately
- If ALL chains fail (network down, API issue): full-screen error with clear explanation + prominent retry button

#### Initial State
- Minimal design: input field + brief tagline "Enter wallet to see your Jumper points"
- No demo/example wallets — require user's own address
- App name "Jumper Points Tracker" as text only — no heavy branding or logo

### Claude's Discretion
- Exact progress bar styling and animation
- Tagline wording refinement
- Color palette and typography
- Spacing and layout details

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| WALLET-01 | User can input an EVM wallet address (0x format) | viem `isAddress()` and `getAddress()` for validation |
| WALLET-02 | App validates address format before scanning | viem strict checksum validation, 42-char length check |
| SCAN-01 | App scans all Jumper-supported chains (60+) for wallet transactions | Covalent GoldRush SDK `TransactionService.getAllTransactionsForAddress()` |
| SCAN-02 | App filters transactions by LiFi Diamond contract | Filter by `to` address = `0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE` |
| SCAN-03 | App fetches chains in parallel with rate limiting (max 4 req/s) | p-throttle `{ limit: 4, interval: 1000 }` |
| SCAN-04 | UI shows progressive loading as each chain completes | TanStack Query `useQueries` with `combine` option |

</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @covalenthq/client-sdk | ^2.x | Multi-chain transaction data | Only service covering 100+ chains with unified API, 25k free credits/month, built-in pagination |
| viem | ^2.46 | Address validation | TypeScript-first, 35kB bundle, `isAddress()` with strict checksum validation |
| @tanstack/react-query | ^5.90 | Parallel queries + caching | `useQueries` with `combine` option for aggregating results from 60+ chain queries |
| p-throttle | ^7.x | Rate limiting | Promise-based throttling at 4 RPS, queue-based (no discarded calls), strict algorithm |
| zustand | ^5.x | Client state | UI state for scan progress, failed chains, localStorage persistence |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui Progress | latest | Progress bar component | For "Scanning... 24/60 chains" display |
| shadcn/ui Input | latest | Wallet address input | Single input field with validation feedback |
| shadcn/ui Button | latest | Cancel/Retry actions | Cancel scan, retry failed chains |
| shadcn/ui Alert | latest | Error/warning banners | Failed chains warning, full error display |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| p-throttle | p-limit | p-limit controls concurrency but not requests/second; p-throttle controls rate |
| p-throttle | bottleneck | More features but heavier; p-throttle is simpler for our exact use case |
| GoldRush SDK | Individual chain APIs | Would require 60+ API keys and different response formats |
| viem | ethers.js | viem is 4x smaller, better TypeScript support |

**Installation:**
```bash
# Core dependencies (in addition to existing Next.js setup from PROJECT.md)
npm install @covalenthq/client-sdk viem @tanstack/react-query p-throttle zustand

# UI components
npx shadcn@latest add progress input button alert card skeleton
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── adapters/           # External API wrappers
│   └── covalent.adapter.ts     # GoldRush SDK wrapper
├── services/           # Business logic
│   └── scanner.service.ts      # Chain scanning orchestration
├── hooks/              # React hooks
│   └── useScanWallet.ts        # Main scanning hook
├── stores/             # Zustand stores
│   └── scan.store.ts           # Scan state management
├── components/         # React components
│   ├── wallet-input.tsx        # Address input with validation
│   ├── scan-progress.tsx       # Progress bar + chain results
│   └── error-banner.tsx        # Failed chains warning
├── lib/                # Utilities
│   └── throttle.ts             # Rate limiter setup
└── app/                # Next.js App Router
    └── page.tsx                # Main page
```

### Pattern 1: Throttled Chain Scanner

**What:** Rate-limited parallel API calls that respect 4 RPS limit while maximizing throughput.

**When to use:** Scanning all 60+ chains for a wallet's transactions.

**Example:**
```typescript
// lib/throttle.ts
import pThrottle from 'p-throttle';

// Covalent free tier: 4 requests/second
export const throttle = pThrottle({
  limit: 4,
  interval: 1000,
  strict: true  // Ensure no bursts exceed limit
});

// adapters/covalent.adapter.ts
import { CovalentClient } from "@covalenthq/client-sdk";
import { throttle } from '@/lib/throttle';

const client = new CovalentClient(process.env.COVALENT_API_KEY!);

const LIFI_DIAMOND = '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE';

export interface ChainTransaction {
  hash: string;
  timestamp: number;
  chainId: string;
  chainName: string;
  value: bigint;
  gasUsed: bigint;
}

// Throttled fetch function
export const fetchChainTransactions = throttle(
  async (wallet: string, chainName: string): Promise<ChainTransaction[]> => {
    const transactions: ChainTransaction[] = [];

    try {
      for await (const tx of client.TransactionService.getAllTransactionsForAddress(
        chainName,
        wallet
      )) {
        // Filter for LiFi Diamond contract
        if (tx.to_address?.toLowerCase() === LIFI_DIAMOND.toLowerCase()) {
          transactions.push({
            hash: tx.tx_hash,
            timestamp: new Date(tx.block_signed_at).getTime(),
            chainId: tx.chain_id,
            chainName,
            value: BigInt(tx.value || '0'),
            gasUsed: BigInt(tx.gas_spent || '0'),
          });
        }
      }
    } catch (error) {
      // Return empty array on error - don't throw
      console.error(`Chain ${chainName} failed:`, error);
      throw error; // Re-throw to mark chain as failed
    }

    return transactions;
  }
);
```

### Pattern 2: Progressive Loading with useQueries

**What:** Fire all chain queries in parallel, show results as each completes, aggregate loading states.

**When to use:** Scanning multiple chains with real-time progress feedback.

**Example:**
```typescript
// hooks/useScanWallet.ts
import { useQueries } from '@tanstack/react-query';
import { fetchChainTransactions, type ChainTransaction } from '@/adapters/covalent.adapter';
import { SUPPORTED_CHAINS } from '@/lib/chains';

interface ScanResult {
  transactions: ChainTransaction[];
  completedChains: number;
  totalChains: number;
  failedChains: string[];
  isLoading: boolean;
  isComplete: boolean;
}

export function useScanWallet(wallet: string | null): ScanResult {
  const results = useQueries({
    queries: wallet
      ? SUPPORTED_CHAINS.map((chain) => ({
          queryKey: ['transactions', wallet, chain.name] as const,
          queryFn: () => fetchChainTransactions(wallet, chain.name),
          staleTime: 5 * 60 * 1000,  // 5 minutes
          gcTime: 30 * 60 * 1000,    // 30 minutes (formerly cacheTime)
          retry: false,              // Don't retry - track as failed
          enabled: !!wallet,
        }))
      : [],
    combine: (results) => {
      const completed = results.filter(r => !r.isPending);
      const failed = results.filter(r => r.isError);
      const successful = results.filter(r => r.isSuccess);

      return {
        transactions: successful.flatMap(r => r.data ?? []),
        completedChains: completed.length,
        totalChains: SUPPORTED_CHAINS.length,
        failedChains: failed.map((_, i) => SUPPORTED_CHAINS[i].name),
        isLoading: results.some(r => r.isPending),
        isComplete: completed.length === SUPPORTED_CHAINS.length,
      };
    },
  });

  return results;
}
```

### Pattern 3: Address Validation with viem

**What:** Validate EVM addresses using viem's `isAddress()` and normalize with `getAddress()`.

**When to use:** Before initiating any scan.

**Example:**
```typescript
// lib/validation.ts
import { isAddress, getAddress } from 'viem';

export interface ValidationResult {
  isValid: boolean;
  normalizedAddress: string | null;
  error: string | null;
}

export function validateWalletAddress(input: string): ValidationResult {
  // Check length first (0x + 40 hex chars = 42)
  if (input.length !== 42) {
    return {
      isValid: false,
      normalizedAddress: null,
      error: input.length < 42 ? null : 'Invalid address length',
    };
  }

  // Check format (must start with 0x)
  if (!input.startsWith('0x')) {
    return {
      isValid: false,
      normalizedAddress: null,
      error: 'Address must start with 0x',
    };
  }

  // Validate with viem (strict checksum by default)
  if (!isAddress(input, { strict: false })) {
    return {
      isValid: false,
      normalizedAddress: null,
      error: 'Invalid address format',
    };
  }

  // Return checksummed version
  try {
    return {
      isValid: true,
      normalizedAddress: getAddress(input),
      error: null,
    };
  } catch {
    return {
      isValid: false,
      normalizedAddress: null,
      error: 'Invalid address checksum',
    };
  }
}
```

### Pattern 4: Scan State Management with Zustand

**What:** Centralized state for scan progress, results, and localStorage persistence.

**When to use:** Managing scan state across components.

**Example:**
```typescript
// stores/scan.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChainResult {
  chainName: string;
  transactionCount: number;
}

interface ScanState {
  // Persisted
  lastWallet: string | null;

  // Session
  currentWallet: string | null;
  isScanning: boolean;
  chainResults: ChainResult[];
  failedChains: string[];

  // Actions
  setLastWallet: (wallet: string) => void;
  startScan: (wallet: string) => void;
  updateChainResult: (chainName: string, count: number) => void;
  markChainFailed: (chainName: string) => void;
  cancelScan: () => void;
  reset: () => void;
}

export const useScanStore = create<ScanState>()(
  persist(
    (set) => ({
      lastWallet: null,
      currentWallet: null,
      isScanning: false,
      chainResults: [],
      failedChains: [],

      setLastWallet: (wallet) => set({ lastWallet: wallet }),

      startScan: (wallet) => set({
        currentWallet: wallet,
        isScanning: true,
        chainResults: [],
        failedChains: [],
      }),

      updateChainResult: (chainName, count) => set((state) => ({
        chainResults: [...state.chainResults, { chainName, transactionCount: count }],
      })),

      markChainFailed: (chainName) => set((state) => ({
        failedChains: [...state.failedChains, chainName],
      })),

      cancelScan: () => set({ isScanning: false }),

      reset: () => set({
        currentWallet: null,
        isScanning: false,
        chainResults: [],
        failedChains: [],
      }),
    }),
    {
      name: 'jumper-scan-store',
      partialize: (state) => ({ lastWallet: state.lastWallet }),
    }
  )
);
```

### Anti-Patterns to Avoid

- **Sequential chain fetching:** `for (chain of chains) await fetch(chain)` takes 60 chains * ~200ms = 12+ seconds. Use parallel with throttling instead.

- **Unthrottled parallel requests:** Firing all 60 requests at once will hit 429 rate limits immediately. Always use p-throttle.

- **Failing entire scan on single chain error:** Use `Promise.allSettled` pattern - continue with remaining chains, track failures separately.

- **Polling for updates:** Don't poll - TanStack Query's `useQueries` with `combine` gives reactive updates as each query completes.

- **Hardcoded chain list in components:** Keep chain list in a config file, fetch from Covalent at startup if possible.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rate limiting | Custom token bucket | p-throttle | Handles edge cases, queue management, strict mode |
| Address validation | Regex patterns | viem `isAddress()` | Checksums, edge cases, EIP compliance |
| Parallel query state | Manual Promise.all tracking | TanStack Query `useQueries` | Caching, deduplication, reactive updates |
| Progress aggregation | Manual counter state | TanStack Query `combine` | Automatically recomputes on each query state change |
| Local storage persistence | Manual localStorage calls | Zustand `persist` middleware | Handles serialization, hydration, SSR |

**Key insight:** Multi-chain scanning has many edge cases (rate limits, partial failures, progress tracking). The recommended libraries handle these specifically.

## Common Pitfalls

### Pitfall 1: Rate Limit Cascade Failure

**What goes wrong:** Firing 60+ requests triggers 429 errors. Retry logic creates more requests, causing cascade failure.

**Why it happens:** Covalent free tier is 4 RPS. Without throttling, initial burst exceeds this instantly.

**How to avoid:**
- Use p-throttle with `{ limit: 4, interval: 1000, strict: true }`
- Disable automatic retries in TanStack Query (`retry: false`)
- Track failed chains separately for manual retry

**Warning signs:** Multiple 429 responses in console, scan takes much longer than expected.

### Pitfall 2: Missing LiFi Contract Filter

**What goes wrong:** Returning ALL wallet transactions instead of just LiFi/Jumper ones. Results in massive data and wrong transaction counts.

**Why it happens:** Forgetting to filter by `to` address = `0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE`.

**How to avoid:** Filter in the adapter layer, not in components. Add unit test that verifies filter is applied.

**Warning signs:** Transaction counts in hundreds/thousands for typical wallets (should be tens).

### Pitfall 3: Progress Display Not Updating

**What goes wrong:** Progress bar shows "0/60" then jumps to "60/60" - no incremental updates.

**Why it happens:** Not using TanStack Query's `combine` option, or using a stale closure in the combine function.

**How to avoid:**
- Use `useQueries` with `combine` option
- Extract combine function if it has no dependencies (avoid re-renders)
- Verify each query has unique `queryKey`

**Warning signs:** No UI updates during scan, then sudden complete.

### Pitfall 4: Checksum Validation Breaking Valid Addresses

**What goes wrong:** Valid addresses rejected because checksum doesn't match.

**Why it happens:** viem's `isAddress()` uses strict checksum by default. User-pasted lowercase addresses fail.

**How to avoid:** Use `isAddress(input, { strict: false })` for validation, then normalize with `getAddress()`.

**Warning signs:** "Invalid address" errors for addresses that work on Etherscan.

### Pitfall 5: Scan Continues After Component Unmount

**What goes wrong:** Memory leaks and state updates on unmounted components.

**Why it happens:** TanStack Query continues fetching after navigation away.

**How to avoid:**
- Use `enabled: !!wallet` to disable queries when not needed
- Implement cancel functionality using `queryClient.cancelQueries()`
- AbortController in fetch functions

**Warning signs:** Console warnings about state updates on unmounted components.

## Code Examples

### Wallet Input Component

```typescript
// components/wallet-input.tsx
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { validateWalletAddress } from '@/lib/validation';
import { useScanStore } from '@/stores/scan.store';

export function WalletInput({ onValidAddress }: { onValidAddress: (addr: string) => void }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { lastWallet, setLastWallet } = useScanStore();

  // Pre-fill last wallet on mount
  useEffect(() => {
    if (lastWallet) {
      setInput(lastWallet);
    }
  }, [lastWallet]);

  const handleChange = (value: string) => {
    setInput(value);
    setError(null);

    // Auto-validate at 42 characters
    if (value.length === 42) {
      const result = validateWalletAddress(value);
      if (result.isValid && result.normalizedAddress) {
        setLastWallet(result.normalizedAddress);
        onValidAddress(result.normalizedAddress);
      } else {
        setError(result.error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow manual trigger for pre-filled addresses
    if (e.key === 'Enter' && input === lastWallet) {
      const result = validateWalletAddress(input);
      if (result.isValid && result.normalizedAddress) {
        onValidAddress(result.normalizedAddress);
      }
    }
  };

  return (
    <div className="w-full max-w-md">
      <Input
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="0x..."
        className="font-mono"
      />
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
```

### Scan Progress Component

```typescript
// components/scan-progress.tsx
'use client';

import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useScanWallet } from '@/hooks/useScanWallet';

interface ScanProgressProps {
  wallet: string;
  onCancel: () => void;
}

export function ScanProgress({ wallet, onCancel }: ScanProgressProps) {
  const { completedChains, totalChains, transactions, failedChains, isLoading } = useScanWallet(wallet);

  const progress = (completedChains / totalChains) * 100;

  // Group transactions by chain for display
  const chainResults = transactions.reduce((acc, tx) => {
    acc[tx.chainName] = (acc[tx.chainName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Scanning... {completedChains}/{totalChains} chains
        </span>
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <Progress value={progress} />

      {/* Show chains with transactions */}
      {Object.entries(chainResults).length > 0 && (
        <div className="space-y-1">
          {Object.entries(chainResults).map(([chain, count]) => (
            <div key={chain} className="text-sm">
              {chain}: {count} txns
            </div>
          ))}
        </div>
      )}

      {/* Show failed chains warning after completion */}
      {!isLoading && failedChains.length > 0 && (
        <div className="rounded-md bg-yellow-50 p-3">
          <p className="text-sm text-yellow-800">
            {failedChains.length} chains failed
          </p>
        </div>
      )}
    </div>
  );
}
```

### Supported Chains Configuration

```typescript
// lib/chains.ts
export interface Chain {
  name: string;
  chainId: number;
  displayName: string;
}

// Subset of Covalent-supported chains where LiFi operates
// Full list should be fetched from Covalent API or maintained in config
export const SUPPORTED_CHAINS: Chain[] = [
  { name: 'eth-mainnet', chainId: 1, displayName: 'Ethereum' },
  { name: 'matic-mainnet', chainId: 137, displayName: 'Polygon' },
  { name: 'arbitrum-mainnet', chainId: 42161, displayName: 'Arbitrum' },
  { name: 'optimism-mainnet', chainId: 10, displayName: 'Optimism' },
  { name: 'bsc-mainnet', chainId: 56, displayName: 'BNB Chain' },
  { name: 'base-mainnet', chainId: 8453, displayName: 'Base' },
  { name: 'avalanche-mainnet', chainId: 43114, displayName: 'Avalanche' },
  { name: 'fantom-mainnet', chainId: 250, displayName: 'Fantom' },
  { name: 'gnosis-mainnet', chainId: 100, displayName: 'Gnosis' },
  { name: 'moonbeam-mainnet', chainId: 1284, displayName: 'Moonbeam' },
  { name: 'moonriver-mainnet', chainId: 1285, displayName: 'Moonriver' },
  { name: 'celo-mainnet', chainId: 42220, displayName: 'Celo' },
  { name: 'aurora-mainnet', chainId: 1313161554, displayName: 'Aurora' },
  { name: 'cronos-mainnet', chainId: 25, displayName: 'Cronos' },
  { name: 'zksync-mainnet', chainId: 324, displayName: 'zkSync Era' },
  { name: 'linea-mainnet', chainId: 59144, displayName: 'Linea' },
  { name: 'scroll-mainnet', chainId: 534352, displayName: 'Scroll' },
  { name: 'mantle-mainnet', chainId: 5000, displayName: 'Mantle' },
  { name: 'polygon-zkevm-mainnet', chainId: 1101, displayName: 'Polygon zkEVM' },
  { name: 'metis-mainnet', chainId: 1088, displayName: 'Metis' },
  // ... Add remaining 40+ chains
];
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ethers.js for address validation | viem `isAddress()` / `getAddress()` | 2024 | 4x smaller bundle, better TypeScript |
| Manual Promise.all + state | TanStack Query v5 `useQueries` + `combine` | 2024 | Built-in caching, reactive updates |
| Custom rate limiting | p-throttle | N/A | Queue-based, strict mode, no discarded calls |
| Redux for client state | Zustand with persist | 2024 | Simpler API, built-in persistence |
| react-query v4 | @tanstack/react-query v5 | 2024 | `combine` option, better TypeScript |

**Deprecated/outdated:**
- `cacheTime` in TanStack Query v5: renamed to `gcTime` (garbage collection time)
- ethers.js for new projects: viem is the 2025/2026 standard
- Manual retry logic: p-throttle handles queue management

## Open Questions

1. **Full chain list source**
   - What we know: LiFi supports 67 chains, Covalent supports 100+, intersection is what we need
   - What's unclear: No published list of exact intersection
   - Recommendation: Start with known high-volume chains, expand based on LiFi's `/v1/chains` endpoint

2. **Pagination handling for heavy users**
   - What we know: Covalent SDK handles pagination via async generators
   - What's unclear: Performance impact for users with 1000+ transactions per chain
   - Recommendation: Monitor in testing, add date range filter if needed (last 12 months for points)

3. **Cancel scan implementation**
   - What we know: TanStack Query supports `queryClient.cancelQueries()`
   - What's unclear: Best UX for showing partial results after cancel
   - Recommendation: Stop new queries, keep completed results, show "Scan cancelled" state

## Sources

### Primary (HIGH confidence)
- [GoldRush SDK Guide](https://goldrush.dev/guides/getting-started-with-the-covalent-sdk/) - SDK initialization, TransactionService usage
- [viem getAddress](https://viem.sh/docs/utilities/getAddress) - Address normalization
- [viem isAddress](https://v1.viem.sh/docs/utilities/isAddress.html) - Address validation with strict mode
- [TanStack Query Parallel Queries](https://tanstack.com/query/latest/docs/framework/react/guides/parallel-queries) - useQueries pattern
- [TanStack Query useQueries Reference](https://tanstack.com/query/v5/docs/framework/react/reference/useQueries) - combine option
- [p-throttle GitHub](https://github.com/sindresorhus/p-throttle) - Rate limiting API
- [shadcn/ui Progress](https://ui.shadcn.com/docs/components/progress) - Progress component

### Secondary (MEDIUM confidence)
- [p-throttle npm](https://www.npmjs.com/package/p-throttle) - Version 7.x, queue-based throttling
- [Next.js Server/Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) - Component architecture
- [Parallel Queries in React Query 5](https://medium.com/@bobjunior542/how-to-run-parallel-queries-in-react-query-5-for-better-performance-with-usequeries-73abbb593bcc) - useQueries patterns

### Tertiary (LOW confidence)
- Chain list completeness: needs verification against LiFi's actual supported chains

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via official docs and npm
- Architecture patterns: HIGH - Based on TanStack Query official patterns and verified examples
- Pitfalls: HIGH - Documented in existing project research, verified with multiple sources

**Research date:** 2026-03-03
**Valid until:** 2026-04-03 (30 days - stable libraries)
