/**
 * TypeScript types for transaction classification and aggregation.
 *
 * Used by Phase 3 for XP calculation based on monthly aggregates.
 */

/**
 * Classification result: bridge or swap.
 * Bridge = different chainIds (cross-chain)
 * Swap = same chainId (same-chain)
 */
export type TransactionType = 'bridge' | 'swap';

/**
 * Monthly aggregate data for a single month.
 */
export interface MonthlyAggregate {
  /** Month identifier in YYYY-MM format */
  month: string;
  /** Total number of transactions in this month */
  transactionCount: number;
  /** Number of bridge transactions (cross-chain) */
  bridgeCount: number;
  /** Number of swap transactions (same-chain) */
  swapCount: number;
  /** Unique source chain IDs used this month (per CONTEXT.md: count source only) */
  uniqueChains: Set<number>;
}

/**
 * Complete classified data structure for UI consumption.
 */
export interface ClassifiedData {
  /** Map of month key to aggregate data (fast lookup) */
  months: Map<string, MonthlyAggregate>;
  /** Array of 12 months including empty ones (for UI iteration) */
  monthsArray: MonthlyAggregate[];
  /** Total transaction count across all months */
  totalTransactions: number;
  /** Total bridge count across all months */
  totalBridges: number;
  /** Total swap count across all months */
  totalSwaps: number;
}
