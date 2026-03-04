# Phase 2: Transaction Classification - Research

**Researched:** 2026-03-04
**Domain:** LiFi transaction parsing, event decoding, monthly aggregation
**Confidence:** HIGH

## Summary

Phase 2 transforms raw LiFi transactions into classified, monthly-aggregated data. The core challenge is distinguishing bridges (cross-chain) from swaps (same-chain) by decoding LiFi contract events. The LiFi Diamond contract emits `LiFiTransferStarted` events with `destinationChainId` for bridges and `LiFiGenericSwapCompleted` events for same-chain swaps.

The existing codebase already uses viem, which provides `decodeEventLog` for parsing event data. The Covalent adapter currently skips logs (`noLogs: true`) for performance, so Phase 2 must fetch full transaction data including logs for classification. Monthly grouping uses UTC timezone with native JavaScript Date methods.

**Primary recommendation:** Decode `LiFiTransferStarted` events to extract `destinationChainId`. If `destinationChainId` differs from source chain, it's a bridge. If event is `LiFiGenericSwapCompleted` or `destinationChainId` equals source chain, it's a swap. Store both raw transactions and derived classifications.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Classification Logic**
- Compare source chain ID to destination chain ID from decoded LiFi contract events
- Different chain IDs = bridge, same chain ID = swap
- If destination chain ID is missing or unavailable, treat as swap (conservative approach)
- Decode LiFi contract event logs to get accurate source/destination chain IDs
- CHAINOOR tracking: count source chain only (not destination from bridges)

**Status Verification**
- Use Covalent's `tx_succeeded` field to detect failed/reverted transactions
- Trust source transaction success only — no cross-chain verification for bridge destinations
- Exclude zero-value transactions (gas-only, failed calls with no token movement)
- Failed/reverted transactions do not count toward TRANSACTOOR

**Monthly Boundaries**
- Use UTC timezone for all transaction bucketing
- Mark current (partial) month as "In Progress" to distinguish from completed months
- Limit aggregation to last 12 months of history
- Show all months in the 12-month range, including months with zero activity

**Output Structure**
- Store both original raw transaction data and derived classification fields
- Monthly aggregates organized as Map keyed by YYYY-MM format (fast lookup)
- Classification runs after all chains complete scanning (not streaming/progressive)
- Track classification errors: store list of transactions that couldn't be parsed

### Claude's Discretion

- Exact LiFi event ABI and parsing implementation
- Error handling for malformed event data
- Memory optimization for large transaction sets
- Internal data structure for tracking classification state

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CLASS-01 | App classifies transactions as bridge (cross-chain) or swap (same-chain) | LiFi events research: use `LiFiTransferStarted.destinationChainId` vs source chainId; `LiFiGenericSwapCompleted` indicates swap |
| CLASS-02 | App counts total LiFi transactions per month | UTC month grouping using `getUTCFullYear()`/`getUTCMonth()` with YYYY-MM format keys |
| CLASS-03 | App tracks unique chains used per month | Track unique source chainIds in Set per month; per CONTEXT.md, count source chain only |

</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| viem | ^2.46.3 | Event log decoding | Already in project; `decodeEventLog` handles ABI parsing with type safety |
| @covalenthq/client-sdk | ^3.0.3 | Transaction fetching with logs | Already in project; just remove `noLogs: true` to get event data |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Native Date | ES5+ | UTC month formatting | Built-in `getUTCFullYear()`/`getUTCMonth()` for YYYY-MM keys |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native Date | date-fns | Overkill for simple YYYY-MM formatting; adds dependency |
| viem decodeEventLog | ethers Interface.parseLog | viem already in project, better TypeScript types |

**Installation:**
```bash
# No new dependencies needed - viem and Covalent SDK already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── types.ts              # Add ClassifiedTransaction, MonthlyAggregate types
│   └── lifi-abi.ts           # LiFi event ABI definitions (NEW)
├── classifiers/
│   └── transaction.classifier.ts  # Classification logic (NEW)
├── hooks/
│   └── useClassifiedTransactions.ts  # React hook for UI (NEW)
└── adapters/
    └── covalent.adapter.ts   # Modify to fetch logs
```

### Pattern 1: Classifier Function (Pure)

**What:** Stateless function that takes raw transaction with logs and returns classified transaction
**When to use:** Processing each transaction after fetch
**Example:**
```typescript
// Source: CONTEXT.md classification logic + viem docs
import { decodeEventLog } from 'viem';
import { LIFI_EVENTS_ABI } from '@/lib/lifi-abi';

export interface ClassifiedTransaction {
  // Original transaction data
  hash: string;
  timestamp: number;
  chainId: number;
  chainName: string;
  value: string;
  // Classification fields
  type: 'bridge' | 'swap';
  destinationChainId: number | null;
  successful: boolean;
}

export function classifyTransaction(
  tx: ChainTransactionWithLogs,
  sourceChainId: number
): ClassifiedTransaction {
  // Find LiFiTransferStarted or LiFiGenericSwapCompleted event
  for (const log of tx.logEvents) {
    try {
      const decoded = decodeEventLog({
        abi: LIFI_EVENTS_ABI,
        data: log.raw_log_data,
        topics: log.raw_log_topics as [`0x${string}`, ...`0x${string}`[]],
        strict: false  // Allow partial decoding
      });

      if (decoded.eventName === 'LiFiTransferStarted') {
        const destChainId = Number(decoded.args.bridgeData.destinationChainId);
        return {
          ...tx,
          type: destChainId !== sourceChainId ? 'bridge' : 'swap',
          destinationChainId: destChainId,
          successful: tx.successful,
        };
      }

      if (decoded.eventName === 'LiFiGenericSwapCompleted') {
        return {
          ...tx,
          type: 'swap',
          destinationChainId: null,
          successful: tx.successful,
        };
      }
    } catch {
      // Continue to next log if this one fails to decode
    }
  }

  // Default to swap if no LiFi events found (conservative per CONTEXT.md)
  return {
    ...tx,
    type: 'swap',
    destinationChainId: null,
    successful: tx.successful,
  };
}
```

### Pattern 2: Monthly Aggregation Map

**What:** Map keyed by YYYY-MM for O(1) lookup of monthly data
**When to use:** Storing and retrieving aggregated monthly stats
**Example:**
```typescript
// Source: CONTEXT.md monthly boundaries decision
export interface MonthlyAggregate {
  month: string;  // YYYY-MM format
  isPartial: boolean;  // true if current month (incomplete)
  transactions: ClassifiedTransaction[];
  bridgeCount: number;
  swapCount: number;
  uniqueChains: Set<number>;  // Source chains only per CONTEXT.md
  errorCount: number;  // Transactions that couldn't be parsed
}

export function groupByMonth(
  transactions: ClassifiedTransaction[]
): Map<string, MonthlyAggregate> {
  const now = new Date();
  const currentMonth = formatUTCMonth(now);
  const aggregates = new Map<string, MonthlyAggregate>();

  for (const tx of transactions) {
    const month = formatUTCMonth(new Date(tx.timestamp));

    if (!aggregates.has(month)) {
      aggregates.set(month, {
        month,
        isPartial: month === currentMonth,
        transactions: [],
        bridgeCount: 0,
        swapCount: 0,
        uniqueChains: new Set(),
        errorCount: 0,
      });
    }

    const agg = aggregates.get(month)!;
    agg.transactions.push(tx);

    if (tx.successful) {
      if (tx.type === 'bridge') agg.bridgeCount++;
      else agg.swapCount++;
      agg.uniqueChains.add(tx.chainId);  // Source chain only
    }
  }

  return aggregates;
}

function formatUTCMonth(date: Date): string {
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}
```

### Pattern 3: 12-Month Window with Empty Months

**What:** Generate all months in range, including those with zero activity
**When to use:** Ensuring consistent display even when user was inactive
**Example:**
```typescript
// Source: CONTEXT.md - "Show all months in the 12-month range"
export function generateLast12Months(): string[] {
  const months: string[] = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push(formatUTCMonth(date));
  }

  return months;
}

export function fillEmptyMonths(
  aggregates: Map<string, MonthlyAggregate>
): MonthlyAggregate[] {
  const months = generateLast12Months();
  const currentMonth = months[months.length - 1];

  return months.map(month => {
    if (aggregates.has(month)) {
      return aggregates.get(month)!;
    }
    return {
      month,
      isPartial: month === currentMonth,
      transactions: [],
      bridgeCount: 0,
      swapCount: 0,
      uniqueChains: new Set(),
      errorCount: 0,
    };
  });
}
```

### Anti-Patterns to Avoid

- **Streaming classification:** Don't classify while chains are still loading. Per CONTEXT.md, classification runs after all chains complete.
- **Local timezone:** Never use `getMonth()`/`getFullYear()` - always use UTC variants.
- **Counting destination chains:** Per CONTEXT.md, CHAINOOR counts source chain only.
- **Counting failed transactions:** Per CONTEXT.md, failed/reverted don't count toward TRANSACTOOR.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Event log decoding | Manual hex parsing | viem `decodeEventLog` | ABI decoding is complex; viem handles indexed params, structs, edge cases |
| Transaction fetching | Custom RPC calls | Covalent adapter | Already built, handles pagination, rate limiting |
| Month boundary math | Manual date arithmetic | `Date.UTC()` with getUTC* methods | Avoids timezone bugs, DST issues |

**Key insight:** LiFi event ABIs are complex (nested BridgeData struct). viem's type inference prevents silent failures.

## Common Pitfalls

### Pitfall 1: Missing Log Events

**What goes wrong:** Transaction has no decodable LiFi events
**Why it happens:** Contract upgrade changed events, or transaction interacted with different facet
**How to avoid:** Default to 'swap' classification (conservative per CONTEXT.md); track as classification error
**Warning signs:** `errorCount` growing significantly compared to total transactions

### Pitfall 2: Timezone Drift in Monthly Grouping

**What goes wrong:** Same transaction appears in different months for different users
**Why it happens:** Using local timezone instead of UTC
**How to avoid:** Always use `getUTCFullYear()`, `getUTCMonth()`, never local variants
**Warning signs:** Edge-of-month transactions classified inconsistently

### Pitfall 3: Counting Failed Transactions

**What goes wrong:** TRANSACTOOR XP inflated by failed/reverted transactions
**Why it happens:** Not filtering by `successful` field before counting
**How to avoid:** Check `tx.successful === true` before incrementing counts
**Warning signs:** Transaction count higher than expected; includes gas-only failures

### Pitfall 4: Covalent Field Name Mismatch

**What goes wrong:** `tx_succeeded` field not found on transaction object
**Why it happens:** Covalent SDK uses different field names in different versions/endpoints
**How to avoid:** Check actual SDK types; field may be `successful` not `tx_succeeded`
**Warning signs:** TypeScript errors, undefined checks passing unexpectedly

### Pitfall 5: Zero-Value Transactions

**What goes wrong:** Gas-only or failed calls counted as real activity
**Why it happens:** Not filtering out `value === '0'` combined with failed status
**How to avoid:** Exclude when `!tx.successful` OR when value is zero AND no meaningful token transfer
**Warning signs:** High transaction counts from wallets with minimal real LiFi usage

## Code Examples

### LiFi Events ABI Definition

```typescript
// Source: ILiFi.sol interface from lifinance/contracts
export const LIFI_EVENTS_ABI = [
  {
    type: 'event',
    name: 'LiFiTransferStarted',
    inputs: [
      {
        name: 'bridgeData',
        type: 'tuple',
        indexed: false,
        components: [
          { name: 'transactionId', type: 'bytes32' },
          { name: 'bridge', type: 'string' },
          { name: 'integrator', type: 'string' },
          { name: 'referrer', type: 'address' },
          { name: 'sendingAssetId', type: 'address' },
          { name: 'receiver', type: 'address' },
          { name: 'minAmount', type: 'uint256' },
          { name: 'destinationChainId', type: 'uint256' },
          { name: 'hasSourceSwaps', type: 'bool' },
          { name: 'hasDestinationCall', type: 'bool' },
        ],
      },
    ],
  },
  {
    type: 'event',
    name: 'LiFiTransferCompleted',
    inputs: [
      { name: 'transactionId', type: 'bytes32', indexed: true },
      { name: 'receivingAssetId', type: 'address', indexed: false },
      { name: 'receiver', type: 'address', indexed: false },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'LiFiGenericSwapCompleted',
    inputs: [
      { name: 'transactionId', type: 'bytes32', indexed: true },
      { name: 'integrator', type: 'string', indexed: false },
      { name: 'referrer', type: 'string', indexed: false },
      { name: 'receiver', type: 'address', indexed: false },
      { name: 'fromAssetId', type: 'address', indexed: false },
      { name: 'toAssetId', type: 'address', indexed: false },
      { name: 'fromAmount', type: 'uint256', indexed: false },
      { name: 'toAmount', type: 'uint256', indexed: false },
    ],
  },
] as const;
```

### Extending Covalent Adapter for Logs

```typescript
// Source: Covalent GoldRush API docs
// Modify fetchChainTransactions to include logs

// Change noLogs: true to noLogs: false (or remove the option)
for await (const response of covalent.TransactionService.getAllTransactionsForAddress(
  chainName as ChainName,
  wallet,
  { noLogs: false }  // Now includes log_events
)) {
  // ...
}

// Extended transaction type
export interface ChainTransactionWithLogs extends ChainTransaction {
  successful: boolean;  // From response tx.successful field
  logEvents: Array<{
    raw_log_data: string;
    raw_log_topics: string[];
    sender_address: string;
  }>;
}
```

### Classification Flow

```typescript
// Source: Project architecture patterns
export function classifyAllTransactions(
  rawTransactions: ChainTransactionWithLogs[]
): {
  classified: ClassifiedTransaction[];
  errors: ChainTransactionWithLogs[];
} {
  const classified: ClassifiedTransaction[] = [];
  const errors: ChainTransactionWithLogs[] = [];

  for (const tx of rawTransactions) {
    // Skip failed transactions entirely per CONTEXT.md
    if (!tx.successful) continue;

    try {
      const result = classifyTransaction(tx, tx.chainId);
      classified.push(result);
    } catch (error) {
      errors.push(tx);
    }
  }

  return { classified, errors };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| LiFiData struct | BridgeData struct | 2023 | ILiFi interface no longer has LiFiData; use BridgeData |
| Manual RPC log fetching | Covalent `noLogs: false` | N/A | Covalent handles pagination and decoding |
| viem v1 | viem v2.x | 2024 | Some API changes; `decodeEventLog` signature stable |

**Deprecated/outdated:**
- LiFiData struct: Replaced by BridgeData in current LiFi contracts
- Covalent v2 API: Use v3/GoldRush SDK

## Open Questions

1. **Covalent `successful` vs `tx_succeeded` field name**
   - What we know: Documentation mentions both; SDK types should clarify
   - What's unclear: Exact field name in `@covalenthq/client-sdk` v3.0.3 types
   - Recommendation: Check SDK TypeScript definitions at implementation time

2. **LiFi event signature changes across chains**
   - What we know: LiFi Diamond is same address on all chains
   - What's unclear: Whether all chains emit identical event signatures
   - Recommendation: Test with transactions from multiple chains; use `strict: false` for resilience

3. **Performance impact of fetching logs**
   - What we know: Current adapter uses `noLogs: true` for speed
   - What's unclear: Exact slowdown factor when fetching logs
   - Recommendation: Measure after implementation; consider caching classified results

## Sources

### Primary (HIGH confidence)
- [LiFi Contracts GitHub](https://github.com/lifinance/contracts) - BridgeData struct, event definitions
- [ILiFi.sol interface](https://raw.githubusercontent.com/lifinance/contracts/main/src/Interfaces/ILiFi.sol) - Event signatures, BridgeData struct fields
- [viem decodeEventLog docs](https://v1.viem.sh/docs/contract/decodeEventLog.html) - Event decoding API, strict mode
- [Covalent GoldRush API docs](https://goldrush.dev/docs/api-reference/foundational-api/transactions/get-a-transaction) - Transaction response fields, log_events structure

### Secondary (MEDIUM confidence)
- [LiFi Smart Contracts Overview](https://docs.li.fi/smart-contracts/overview) - Diamond proxy pattern, facet architecture
- [GenericSwapFacet docs](https://github.com/reednaa/lifi-contracts/blob/main/docs/GenericSwapFacet.md) - Same-chain swap handling
- [MDN Date UTC methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/UTC) - UTC date handling

### Tertiary (LOW confidence)
- [Code-423n4 LiFi audit](https://github.com/code-423n4/2022-03-lifinance) - Older event examples (may be outdated)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - viem and Covalent already in project, well-documented
- Architecture: HIGH - Clear patterns from CONTEXT.md decisions
- Pitfalls: MEDIUM - Some based on general web3 experience, not LiFi-specific testing

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (LiFi contracts stable; 30 days reasonable)
