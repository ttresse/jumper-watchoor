# Phase 6: Lazy Loading API - Research

**Researched:** 2026-03-04
**Domain:** API data fetching, caching, prefetching with TanStack Query and Zustand
**Confidence:** HIGH

## Summary

This phase transforms the current "fetch all at once" approach into a lazy loading system that fetches the current month first (with 3 previous months), prefetches remaining history in background, loads on-demand during navigation, and treats past months as immutable. The LiFi API natively supports `fromTimestamp` and `toTimestamp` parameters for month-based filtering, making this architecture straightforward.

The key insight is leveraging React Query's per-query `staleTime` configuration: current month gets normal staleness (can be refreshed), while past months use `staleTime: Infinity` since historical data never changes. Combined with Zustand's session storage middleware for cache persistence within a session, this creates an efficient system that respects the user's decision for fresh data on each visit.

**Primary recommendation:** Use separate React Query queries per month with timestamp filtering, implement priority-based prefetching using `queryClient.prefetchQuery()`, and configure `staleTime: Infinity` for past months to prevent unnecessary refetches.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
**Initial Load Strategy**
- Load current month + 3 most recent months immediately on wallet input
- Show skeleton placeholders for months still loading
- Display partial total XP with indicator (e.g., "12,450 XP+") while history loads
- No explicit progress counter - skeletons imply loading

**Prefetch Behavior**
- Begin prefetch immediately after initial 4 months complete
- Fetch 3 months in parallel (balance speed vs API load)
- Fetch all available history (not capped at 12 or 24 months)
- Silent retry on failures (2-3 attempts), show error state only if persistent

**Navigation Triggers**
- Prev/Next arrows to step through months one at a time
- When navigating to unloaded month: show skeleton, fetch immediately, display when ready
- User requests jump the prefetch queue (if user clicks month 8 while prefetching month 5, fetch 8 first)
- Disable/hide arrows beyond data availability boundaries

**Cache & Staleness**
- Past months are immutable - never refetch completed months
- Current month refreshed only via manual refresh button (no auto-refresh)
- Cache persists within session only (memory/session storage)
- Fresh fetch on each new site visit - no localStorage persistence across sessions

### Claude's Discretion
- Exact skeleton animation and styling
- Retry timing and backoff strategy
- How to handle edge case of user navigating during initial load
- Cache implementation details (zustand persist vs session storage)

### Deferred Ideas (OUT OF SCOPE)
None - discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/react-query | ^5.90.21 | Data fetching, caching, prefetching | Already in use; native prefetch support |
| zustand | ^5.0.11 | Session state management | Already in use; persist middleware for sessionStorage |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zustand/middleware | (bundled) | Persist middleware with sessionStorage | Cache month data within session |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Per-month queries | Single query with slice | Single query is current approach; per-month allows granular prefetch |
| sessionStorage via Zustand | React Query persist plugin | Zustand already set up; keeping stack minimal |

**Installation:**
```bash
# No new packages needed - using existing stack
```

## Architecture Patterns

### Recommended Data Flow
```
User enters wallet
        ↓
┌─────────────────────────────────────┐
│ Initial Load (parallel)             │
│ • Current month (index 11)          │
│ • Previous 3 months (8, 9, 10)      │
│ → Show dashboard with partial data  │
│ → Total XP shows "12,450 XP+"       │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│ Background Prefetch (3 at a time)   │
│ • Months 7, 6, 5 → then 4, 3, 2...  │
│ • Priority queue for user requests  │
│ → Silent, no UI indication          │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│ Navigation                          │
│ • If cached: instant display        │
│ • If loading: show skeleton         │
│ • If not started: fetch immediately │
└─────────────────────────────────────┘
```

### Pattern 1: Per-Month Query Keys
**What:** Separate React Query entries per month with timestamp boundaries
**When to use:** All month data fetching

```typescript
// Query key structure for month-specific caching
const monthQueryKey = (wallet: string, monthKey: string) =>
  ['lifi-transfers', wallet, monthKey] as const;

// Calculate month boundaries in Unix seconds
function getMonthBoundaries(monthKey: string): { from: number; to: number } {
  const [year, month] = monthKey.split('-').map(Number);
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));
  return {
    from: Math.floor(startDate.getTime() / 1000),
    to: Math.floor(endDate.getTime() / 1000),
  };
}
```

### Pattern 2: Immutable Past Months with staleTime
**What:** Configure past months to never refetch
**When to use:** All non-current months

```typescript
// Source: TanStack Query docs - staleTime: Infinity pattern
const isCurrentMonth = monthKey === getCurrentMonthKey();

const query = useQuery({
  queryKey: monthQueryKey(wallet, monthKey),
  queryFn: () => fetchMonthTransfers(wallet, monthKey),
  // Past months are immutable - never refetch
  staleTime: isCurrentMonth ? 5 * 60 * 1000 : Infinity,
  // Keep in cache for session duration
  gcTime: 60 * 60 * 1000,
});
```

### Pattern 3: Priority-Based Prefetching
**What:** Prefetch queue that user navigation can interrupt
**When to use:** Background loading and on-demand fetching

```typescript
// Prefetch with lower priority (background)
const prefetchMonth = async (monthKey: string) => {
  await queryClient.prefetchQuery({
    queryKey: monthQueryKey(wallet, monthKey),
    queryFn: () => fetchMonthTransfers(wallet, monthKey),
    staleTime: Infinity, // Past months never stale
  });
};

// Fetch with high priority (user navigated here)
const fetchMonthUrgent = async (monthKey: string) => {
  // ensureQueryData fetches if not cached, returns cache if available
  return queryClient.ensureQueryData({
    queryKey: monthQueryKey(wallet, monthKey),
    queryFn: () => fetchMonthTransfers(wallet, monthKey),
  });
};
```

### Pattern 4: Session-Only Cache with Zustand
**What:** Persist month data to sessionStorage (not localStorage)
**When to use:** Cache management across page reloads within session

```typescript
import { persist, createJSONStorage } from 'zustand/middleware';

// Per CONTEXT.md: session storage only, fresh fetch on new visits
const useMonthCache = create<MonthCacheState>()(
  persist(
    (set) => ({
      // Track which months are loaded for this wallet
      loadedMonths: new Map<string, boolean>(),
      // ... other state
    }),
    {
      name: 'jumper-month-cache',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
```

### Anti-Patterns to Avoid
- **Fetching all months then slicing:** Current approach; prevents granular prefetch/cache
- **Using localStorage for transfers:** Per CONTEXT.md, user wants fresh data on new visits
- **Refetching past months:** Historical data is immutable; wastes API calls
- **Single monolithic query:** Can't prefetch individual months or show partial results

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Priority queue | Custom queue manager | React Query's internal queue + cancel/refetch | Query deduplication built-in |
| Cache invalidation | Manual cache clearing | React Query staleTime + gcTime | Proven patterns, less bugs |
| Retry with backoff | Custom retry logic | React Query retry config or existing fetchWithRetry | Already implemented in adapter |
| Session storage | Raw sessionStorage calls | Zustand persist middleware | Type-safe, auto-serialization |

**Key insight:** React Query already manages request deduplication, caching, and background refetching. The per-month query key pattern unlocks granular control without building custom infrastructure.

## Common Pitfalls

### Pitfall 1: Month Boundary Off-by-One
**What goes wrong:** Transfers near midnight UTC appear in wrong month or are missed
**Why it happens:** JavaScript Date month is 0-indexed; timestamp conversion errors
**How to avoid:** Use UTC throughout, test with edge-case timestamps
**Warning signs:** Transaction count differs between old and new approach

### Pitfall 2: Prefetch Queue Blocking Navigation
**What goes wrong:** User navigates to month 7 but waits for month 5 to finish
**Why it happens:** Serial prefetch without priority interruption
**How to avoid:** Use `ensureQueryData` for navigation; it returns immediately if cached or fetches fresh
**Warning signs:** Navigation feels slow even for nearby months

### Pitfall 3: Cache Key Mismatch
**What goes wrong:** Month data fetched but not found when navigating
**Why it happens:** Query key doesn't match between prefetch and useQuery
**How to avoid:** Single `monthQueryKey()` helper function used everywhere
**Warning signs:** Data refetches on navigation despite prefetch completing

### Pitfall 4: Total XP Calculation Drift
**What goes wrong:** Total XP shows inconsistent values as months load
**Why it happens:** Summing partial data without clear "loading more" indicator
**How to avoid:** Per CONTEXT.md: show "12,450 XP+" with plus sign while loading
**Warning signs:** Total XP jumps around confusingly

### Pitfall 5: Current Month Not Refreshing
**What goes wrong:** Refresh button doesn't update current month
**Why it happens:** staleTime: Infinity applied to current month accidentally
**How to avoid:** Explicit `isCurrentMonth` check before setting staleTime
**Warning signs:** New transactions don't appear after refresh

## Code Examples

### LiFi API Month-Based Fetching
```typescript
// Source: LiFi API docs - fromTimestamp/toTimestamp parameters
// https://docs.li.fi/api-reference/get-a-paginated-list-of-filtered-transfers

async function fetchMonthTransfers(
  wallet: string,
  monthKey: string,
  signal?: AbortSignal
): Promise<LiFiTransfer[]> {
  const { from, to } = getMonthBoundaries(monthKey);
  const transfers: LiFiTransfer[] = [];
  let cursor: string | null = null;

  do {
    const url = new URL('https://li.quest/v2/analytics/transfers');
    url.searchParams.set('wallet', wallet);
    url.searchParams.set('status', 'DONE');
    url.searchParams.set('fromTimestamp', from.toString());
    url.searchParams.set('toTimestamp', to.toString());
    url.searchParams.set('limit', '100');
    if (cursor) url.searchParams.set('next', cursor);

    const response = await fetch(url, { signal });
    const data = await response.json();
    transfers.push(...data.data);
    cursor = data.next;
  } while (cursor);

  return transfers;
}
```

### Initial Load Hook
```typescript
// Fetch current + 3 previous months in parallel on wallet input
function useInitialMonthLoad(wallet: string | null) {
  const monthKeys = useMemo(() => {
    if (!wallet) return [];
    return getLastNMonthKeys(4); // [current, prev1, prev2, prev3]
  }, [wallet]);

  // useQueries for parallel fetching
  const queries = useQueries({
    queries: monthKeys.map((monthKey) => ({
      queryKey: monthQueryKey(wallet!, monthKey),
      queryFn: () => fetchMonthTransfers(wallet!, monthKey),
      enabled: !!wallet,
      staleTime: monthKey === getCurrentMonthKey() ? 5 * 60 * 1000 : Infinity,
    })),
  });

  const isInitialLoadComplete = queries.every((q) => q.isSuccess || q.isError);
  const loadedMonths = queries
    .filter((q) => q.isSuccess)
    .map((q, i) => monthKeys[i]);

  return { queries, isInitialLoadComplete, loadedMonths };
}
```

### Background Prefetch Manager
```typescript
// Prefetch remaining months after initial load, 3 at a time
async function prefetchRemainingMonths(
  wallet: string,
  queryClient: QueryClient,
  loadedMonths: Set<string>
) {
  const allMonthKeys = getAllAvailableMonthKeys(); // All months with data
  const remaining = allMonthKeys.filter((m) => !loadedMonths.has(m));

  // Process in batches of 3 (per CONTEXT.md)
  for (let i = 0; i < remaining.length; i += 3) {
    const batch = remaining.slice(i, i + 3);
    await Promise.all(
      batch.map((monthKey) =>
        queryClient.prefetchQuery({
          queryKey: monthQueryKey(wallet, monthKey),
          queryFn: () => fetchMonthTransfers(wallet, monthKey),
          staleTime: Infinity,
        })
      )
    );
  }
}
```

### Navigation with On-Demand Loading
```typescript
// Handle navigation to any month with skeleton support
function useMonthNavigation(wallet: string, monthKey: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: monthQueryKey(wallet, monthKey),
    queryFn: () => fetchMonthTransfers(wallet, monthKey),
    staleTime: monthKey === getCurrentMonthKey() ? 5 * 60 * 1000 : Infinity,
  });

  // If user navigates to unloaded month, this query starts immediately
  // Skeleton shown while isLoading
  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Fetch all transfers at once | Per-month lazy loading | This phase | Faster initial load, lower memory |
| 12-month fixed window | Fetch all available history | This phase | Complete historical data |
| No prefetching | Background prefetch queue | This phase | Instant navigation feel |
| localStorage cache | sessionStorage only | This phase | Fresh data on new visits |

**Deprecated/outdated:**
- `useLiFiTransfers` single-fetch approach: Replaced by per-month queries
- `fillMonthRange` 12-month fixed range: Will need adjustment for dynamic months

## Open Questions

1. **How many months of history exist?**
   - What we know: LiFi API defaults to 30 days; can query further back
   - What's unclear: Maximum lookback supported by API; user history depth varies
   - Recommendation: Start prefetch from current month backwards, stop when API returns empty

2. **Prefetch queue interruption mechanism**
   - What we know: React Query handles concurrent requests; user navigation should take priority
   - What's unclear: Whether to abort background prefetch or just ensure navigation query runs
   - Recommendation: Use `ensureQueryData` for navigation (returns cached or fetches); let background continue

3. **Month boundary edge case with timezones**
   - What we know: Using UTC consistently for aggregation
   - What's unclear: If user's local timezone affects perception of "current month"
   - Recommendation: Keep UTC throughout; document that months are UTC-based

## Sources

### Primary (HIGH confidence)
- [TanStack Query v5 Prefetching Guide](https://tanstack.com/query/v5/docs/framework/react/guides/prefetching) - prefetchQuery, ensureQueryData, staleTime patterns
- [TanStack Query useQueries Reference](https://tanstack.com/query/v5/docs/framework/react/reference/useQueries) - parallel query execution
- [LiFi API Transfers Endpoint](https://docs.li.fi/api-reference/get-a-paginated-list-of-filtered-transfers) - fromTimestamp/toTimestamp parameters, pagination

### Secondary (MEDIUM confidence)
- [Zustand Persist Middleware](https://github.com/pmndrs/zustand) - sessionStorage configuration with createJSONStorage
- [React Query staleTime: Infinity Pattern](https://github.com/TanStack/query/discussions/1685) - immutable data handling

### Tertiary (LOW confidence)
- None - all patterns verified against official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing libraries with documented features
- Architecture: HIGH - LiFi API confirmed to support timestamp filtering; React Query patterns well-documented
- Pitfalls: MEDIUM - Based on known React Query patterns; edge cases may emerge

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (30 days - stable patterns)
