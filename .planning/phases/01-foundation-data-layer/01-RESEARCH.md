# Phase 1: Foundation & Data Layer - Research

**Researched:** 2026-03-04
**Domain:** LiFi Analytics API integration, cursor-based pagination, React data fetching
**Confidence:** HIGH

## Summary

This phase migrates from multi-chain Covalent scanning (60+ parallel API calls) to a single unified LiFi Analytics API endpoint (`li.quest/v2/analytics/transfers`). The API provides pre-processed transaction data including USD values, transaction classification (via `sending.chainId` vs `receiving.chainId`), and pagination via cursor tokens. This dramatically simplifies both the implementation and user experience.

The key architectural change is moving from parallel chain queries with React Query's `useQueries` to sequential cursor-based pagination. The LiFi API handles all chain filtering internally, returning only LiFi transactions with complete metadata. No rate limiting is needed (single endpoint), no event decoding is required (classification data included), and no historical price lookups are necessary (`amountUSD` provided).

**Primary recommendation:** Replace Covalent adapter with a simple LiFi adapter using fetch + while-loop pagination, update types to match LiFi response structure, and modify the progress display from "chains scanned" to "transactions found".

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

**API Integration:**
- Use LiFi Analytics API: `GET li.quest/v2/analytics/transfers?wallet={address}`
- Handle cursor-based pagination via `next` token in response
- No API key required (public endpoint)
- Retry failed requests automatically 2-3 times before showing error
- If pagination error occurs mid-load, retry that specific page

**Wallet Input UX:**
- Single input field that accepts paste or typed address
- Validation feedback displayed inline below the input field
- Scan requires explicit button click (not auto-triggered on valid input)
- Remember last scanned wallet in localStorage, pre-fill on return visits
- Pre-filled address requires user action (click button) to start scan - no auto-scan on page load

**Progress Display:**
- Show live counter during load: "Loading... 150 transactions found"
- Counter increments as each pagination page is fetched
- Cancel button available during load
- If cancelled, discard all data (no partial results)
- Results appear only after complete load (no streaming preview)

**Error Handling:**
- Automatic retry (2-3 attempts) before showing error to user
- Error message displayed in place of results area (not toast/banner)
- Clear "Retry" button in error state
- If wallet has no LiFi transactions: simple text message "No LiFi transactions found for this wallet"

**Initial State:**
- Minimal design: input field + "Jumper Points Tracker" as text title
- No logo, no heavy branding
- No example/demo wallets
- Interface in English

### Claude's Discretion

- Exact retry logic and timing
- Loading spinner/animation alongside counter
- Color palette and typography
- Spacing and layout details
- Input placeholder text wording

### Deferred Ideas (OUT OF SCOPE)

None - discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| WALLET-01 | User can input an EVM wallet address (0x format) | Existing `WalletInput` component with viem validation remains valid |
| WALLET-02 | App validates address format before scanning | Existing `validateWalletAddress()` using viem `isAddress` remains valid |
| SCAN-01 | App scans all Jumper-supported chains for wallet transactions | LiFi API automatically scans all chains - single endpoint replaces 60+ chain queries |
| SCAN-02 | App filters transactions by LiFi Diamond contract | LiFi API only returns LiFi transactions - no filtering needed |

</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| fetch | native | HTTP requests to LiFi API | Built into browsers and Node 18+, no dependencies needed |
| @tanstack/react-query | ^5.90.21 | Data fetching state management | Already in project, handles caching, refetching, error states |
| zustand | ^5.0.11 | Client state (wallet persistence) | Already in project, handles localStorage persistence |
| viem | ^2.46.3 | Address validation | Already in project, `isAddress` and `getAddress` for wallet validation |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Next.js | 16.1.6 | Framework | Already in project |
| TypeScript | ^5 | Type safety | LiFi response types need definition |

### Removed from Stack (Migration)

| Library | Reason for Removal |
|---------|-------------------|
| @covalenthq/client-sdk | No longer needed - LiFi API replaces Covalent |
| p-throttle | No longer needed - single endpoint, no rate limiting required |

**Installation:**
```bash
# No new packages needed - all requirements met by existing dependencies
# Can optionally remove: npm uninstall @covalenthq/client-sdk p-throttle
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── adapters/
│   └── lifi.adapter.ts        # NEW: LiFi API client (replaces covalent.adapter.ts)
├── hooks/
│   └── useLiFiTransfers.ts    # NEW: Hook for fetching transfers (replaces useScanWallet.ts)
├── lib/
│   └── types.ts               # UPDATE: Add LiFi-specific types
├── stores/
│   └── scan.store.ts          # UPDATE: Simplify state (no chain-level tracking)
└── components/
    ├── wallet-input.tsx       # UPDATE: Add explicit "Scan" button
    └── scan-progress.tsx      # UPDATE: Show transaction count, not chain count
```

### Pattern 1: Cursor-Based Pagination with Accumulation

**What:** Fetch all pages before returning data, accumulating results in memory
**When to use:** When all data must be loaded before display (per CONTEXT.md: "Results appear only after complete load")
**Example:**
```typescript
// Source: Verified against li.quest/v2/analytics/transfers API
interface LiFiTransfersResponse {
  data: LiFiTransfer[];
  hasNext: boolean;
  hasPrevious: boolean;
  next: string | null;
  previous: string | null;
}

async function fetchAllTransfers(
  wallet: string,
  onProgress?: (count: number) => void
): Promise<LiFiTransfer[]> {
  const transfers: LiFiTransfer[] = [];
  let cursor: string | null = null;

  do {
    const url = new URL('https://li.quest/v2/analytics/transfers');
    url.searchParams.set('wallet', wallet);
    url.searchParams.set('limit', '100'); // Max allowed
    url.searchParams.set('status', 'DONE'); // Only completed transactions
    if (cursor) url.searchParams.set('next', cursor);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data: LiFiTransfersResponse = await response.json();
    transfers.push(...data.data);
    cursor = data.next;

    onProgress?.(transfers.length);
  } while (cursor);

  return transfers;
}
```

### Pattern 2: Retry with Exponential Backoff

**What:** Automatic retry of failed requests with increasing delays
**When to use:** For transient API errors (per CONTEXT.md: "Retry failed requests automatically 2-3 times")
**Example:**
```typescript
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError;
}
```

### Pattern 3: Cancellable Fetch with AbortController

**What:** Allow user to cancel ongoing pagination loop
**When to use:** Per CONTEXT.md: "Cancel button available during load" and "If cancelled, discard all data"
**Example:**
```typescript
async function fetchAllTransfers(
  wallet: string,
  signal: AbortSignal,
  onProgress?: (count: number) => void
): Promise<LiFiTransfer[]> {
  const transfers: LiFiTransfer[] = [];
  let cursor: string | null = null;

  do {
    if (signal.aborted) {
      return []; // Discard all data per CONTEXT.md
    }

    const url = new URL('https://li.quest/v2/analytics/transfers');
    url.searchParams.set('wallet', wallet);
    if (cursor) url.searchParams.set('next', cursor);

    const response = await fetch(url.toString(), { signal });
    const data = await response.json();
    transfers.push(...data.data);
    cursor = data.next;

    onProgress?.(transfers.length);
  } while (cursor);

  return transfers;
}
```

### Anti-Patterns to Avoid

- **Using useInfiniteQuery:** The TanStack Query `useInfiniteQuery` hook is designed for infinite scroll UX where pages are displayed progressively. Our requirement is to fetch ALL data before displaying anything, making a simple `useQuery` with internal pagination loop more appropriate.

- **Streaming partial results:** Per CONTEXT.md, results should only appear after complete load. Don't update UI state until all pages are fetched.

- **Parallel page fetching:** Cursor pagination is inherently sequential - each page's cursor comes from the previous response. Don't attempt to parallelize.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Address validation | Custom regex | `viem.isAddress()` | Already handles all edge cases, checksums, lowercase |
| Retry logic | Simple try/catch | Exponential backoff utility | Prevents thundering herd, handles rate limits gracefully |
| AbortController management | Manual ref cleanup | React Query's built-in cancel | Query cancellation is automatic on unmount/refetch |

**Key insight:** The LiFi API is simple enough that we don't need heavy abstractions. A straightforward adapter with fetch, retry logic, and abort support is sufficient.

## Common Pitfalls

### Pitfall 1: Forgetting to URL-encode the cursor

**What goes wrong:** The `next` cursor may contain special characters that break URL parsing
**Why it happens:** Cursors are often base64 or contain `+`, `/`, `=` characters
**How to avoid:** Use `URLSearchParams.set()` which auto-encodes, or explicitly `encodeURIComponent(cursor)`
**Warning signs:** 400 errors from API, truncated or corrupted responses

### Pitfall 2: Not handling empty wallet case

**What goes wrong:** Treating "no transactions" as an error instead of valid empty state
**Why it happens:** API returns `{ data: [], hasNext: false }` for wallets with no LiFi history
**How to avoid:** Check `data.length === 0 && cursor === null` and show "No LiFi transactions found" message
**Warning signs:** Error states for valid wallets that simply haven't used LiFi

### Pitfall 3: Infinite loop on pagination errors

**What goes wrong:** If a page fails and retry succeeds with same cursor, loop continues forever
**Why it happens:** Not tracking which pages have been fetched
**How to avoid:** Either track fetched cursors, or let retry exhaust attempts then throw
**Warning signs:** Network tab shows same request repeating indefinitely

### Pitfall 4: Memory pressure with large wallets

**What goes wrong:** Accumulating thousands of transfers in memory before render
**Why it happens:** Power users may have hundreds or thousands of transactions
**How to avoid:** Consider adding `fromTimestamp` filter to limit to recent transactions, or implement chunked processing
**Warning signs:** Slow performance, browser tab becomes unresponsive

### Pitfall 5: Race conditions on wallet change

**What goes wrong:** User enters new wallet while previous scan is in progress, results get mixed
**Why it happens:** AbortController not properly managed, or state update from old request
**How to avoid:** Abort previous request immediately on new wallet input, verify wallet matches before state update
**Warning signs:** Incorrect transaction counts, transactions from wrong wallet appearing

## Code Examples

Verified patterns from official LiFi API documentation and testing:

### LiFi Transfer Type Definition

```typescript
// Source: https://docs.li.fi/api-reference/get-a-paginated-list-of-filtered-transfers
// Verified via direct API testing 2026-03-04

interface LiFiToken {
  address: string;
  chainId: number;
  symbol: string;
  decimals: number;
  name: string;
  priceUSD: string;
  logoURI: string;
}

interface LiFiTransactionDetails {
  txHash: string;
  txLink: string;
  amount: string;
  amountUSD: string;
  token: LiFiToken;
  chainId: number;
  gasAmount: string;
  gasAmountUSD: string;
  timestamp: number;
}

interface LiFiTransfer {
  transactionId: string;
  sending: LiFiTransactionDetails;
  receiving: LiFiTransactionDetails;
  fromAddress: string;
  toAddress: string;
  tool: string;
  status: 'DONE' | 'PENDING' | 'FAILED' | 'NOT_FOUND' | 'INVALID';
  substatus: 'COMPLETED' | 'PENDING' | 'REFUNDED' | string;
  substatusMessage: string;
  lifiExplorerLink: string;
  metadata?: {
    integrator?: string;
  };
}

interface LiFiTransfersResponse {
  data: LiFiTransfer[];
  hasNext: boolean;
  hasPrevious: boolean;
  next: string | null;
  previous: string | null;
}
```

### Classifying Bridge vs Swap

```typescript
// Classification is trivial with LiFi data - no event decoding needed
function classifyTransfer(transfer: LiFiTransfer): 'bridge' | 'swap' {
  return transfer.sending.chainId === transfer.receiving.chainId
    ? 'swap'
    : 'bridge';
}
```

### API URL Construction

```typescript
// Base endpoint (no API key required)
const API_BASE = 'https://li.quest/v2/analytics/transfers';

function buildTransfersUrl(wallet: string, cursor?: string | null): string {
  const url = new URL(API_BASE);
  url.searchParams.set('wallet', wallet);
  url.searchParams.set('limit', '100');
  url.searchParams.set('status', 'DONE'); // Only completed transactions
  if (cursor) {
    url.searchParams.set('next', cursor);
  }
  return url.toString();
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Covalent multi-chain scanning | LiFi Analytics API | 2026-03-04 | Single endpoint, no rate limiting, pre-processed data |
| Event log decoding for classification | `sending.chainId` vs `receiving.chainId` | N/A (API provides) | No ABI needed, no viem decoding |
| Historical price lookups | `amountUSD` in response | N/A (API provides) | No DefiLlama integration needed |
| Chain-by-chain progress | Transaction count progress | This migration | "Loading... 150 transactions" vs "24/60 chains" |

**Deprecated/outdated:**
- `covalent.adapter.ts`: No longer needed - LiFi API replaces all functionality
- `p-throttle` usage: No rate limiting needed for single endpoint
- Chain-level progress tracking: API scans all chains internally

## Open Questions

1. **Rate limits on LiFi Analytics API?**
   - What we know: No API key required, public endpoint
   - What's unclear: Undocumented rate limits may exist
   - Recommendation: Add retry logic with exponential backoff; monitor for 429 responses

2. **Maximum transactions returnable?**
   - What we know: Pagination suggests no hard limit
   - What's unclear: Is there a maximum total count before API refuses?
   - Recommendation: Test with known high-volume wallets; add `fromTimestamp` filter as fallback

3. **Cursor expiration?**
   - What we know: Cursors work across multiple requests
   - What's unclear: Do cursors expire after some time?
   - Recommendation: Complete pagination in single user session; if error on cursor, restart from beginning

## Sources

### Primary (HIGH confidence)
- [LiFi API Documentation](https://docs.li.fi/api-reference/get-a-paginated-list-of-filtered-transfers) - Endpoint specification, parameters, response structure
- Direct API testing (2026-03-04) - Verified response structure with real wallets

### Secondary (MEDIUM confidence)
- [TanStack Query v5 Docs](https://tanstack.com/query/v5/docs/react/reference/useInfiniteQuery) - Pagination patterns (though we'll use simple useQuery)
- [Handle Cursor-Based Pagination with React](https://blog.api-fiddle.com/posts/handle-cursor-pagination-with-react) - General cursor pagination patterns

### Tertiary (LOW confidence)
- Rate limits - Not documented, inferred from public endpoint behavior

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing project dependencies, no new libraries
- Architecture: HIGH - LiFi API structure verified via direct testing
- Pitfalls: MEDIUM - Based on general cursor pagination experience, not LiFi-specific

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (30 days - API is stable, documented)
