/**
 * Pure functions for transaction classification and monthly aggregation.
 *
 * Key decisions per CONTEXT.md:
 * - UTC dates for month formatting (avoid timezone inconsistencies)
 * - Count source chain only for uniqueChains (not destination)
 * - Classification runs after all data is loaded (not streaming)
 */

import type { LiFiTransfer } from './lifi-types';
import type {
  TransactionType,
  MonthlyAggregate,
} from './classification-types';

/**
 * Classify a transfer as bridge or swap.
 *
 * @param transfer - LiFi transfer to classify
 * @returns 'bridge' if cross-chain (different chainIds), 'swap' if same-chain
 */
export function classifyTransfer(transfer: LiFiTransfer): TransactionType {
  return transfer.sending.chainId !== transfer.receiving.chainId
    ? 'bridge'
    : 'swap';
}

/**
 * Extract month key from Unix timestamp (seconds).
 *
 * @param unixSeconds - Unix timestamp in seconds (LiFi API format)
 * @returns Month string in YYYY-MM format (UTC)
 */
export function getMonthKey(unixSeconds: number): string {
  const date = new Date(unixSeconds * 1000); // Convert seconds to milliseconds
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Create an empty monthly aggregate.
 *
 * @param monthKey - Month identifier in YYYY-MM format
 * @returns Empty MonthlyAggregate with new Set instance
 */
function createEmptyMonth(monthKey: string): MonthlyAggregate {
  return {
    month: monthKey,
    transactionCount: 0,
    bridgeCount: 0,
    swapCount: 0,
    uniqueChains: new Set(), // New Set each time to avoid shared references
    bridgeVolumeUSD: 0,
    swapVolumeUSD: 0,
  };
}

/**
 * Aggregate transfers by month.
 *
 * Single-pass aggregation over all transfers. For each transfer:
 * - Get month key from sending.timestamp
 * - Increment transaction count
 * - Add sending.chainId to uniqueChains (source only per CONTEXT.md)
 * - Increment bridge or swap count based on classification
 *
 * @param transfers - Array of LiFi transfers to aggregate
 * @returns Map of month keys to aggregated data
 */
export function aggregateByMonth(
  transfers: LiFiTransfer[]
): Map<string, MonthlyAggregate> {
  const monthMap = new Map<string, MonthlyAggregate>();

  for (const transfer of transfers) {
    // Get month key from sending timestamp (UTC)
    const monthKey = getMonthKey(transfer.sending.timestamp);

    // Get or create aggregate for this month
    let aggregate = monthMap.get(monthKey);
    if (!aggregate) {
      aggregate = createEmptyMonth(monthKey);
      monthMap.set(monthKey, aggregate);
    }

    // Increment transaction count
    aggregate.transactionCount++;

    // Add source chain ID (per CONTEXT.md: count source only)
    aggregate.uniqueChains.add(transfer.sending.chainId);

    // Classify and increment appropriate counter + USD volume
    const type = classifyTransfer(transfer);
    // Parse USD value with fallback to 0 for missing/invalid values (per CONTEXT.md)
    const amountUSD = parseFloat(transfer.sending.amountUSD) || 0;
    if (type === 'bridge') {
      aggregate.bridgeCount++;
      aggregate.bridgeVolumeUSD += amountUSD;
    } else {
      aggregate.swapCount++;
      aggregate.swapVolumeUSD += amountUSD;
    }
  }

  return monthMap;
}

/**
 * Fill 12-month range including empty months.
 *
 * Generates last 12 months going backwards from current month (UTC).
 * For each month, uses existing data from Map or creates empty month.
 *
 * @param monthMap - Map of existing monthly aggregates
 * @returns Array of 12 MonthlyAggregates sorted oldest to newest
 */
export function fillMonthRange(
  monthMap: Map<string, MonthlyAggregate>
): MonthlyAggregate[] {
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth(); // 0-indexed

  const months: MonthlyAggregate[] = [];

  // Generate last 12 months going backwards
  for (let i = 11; i >= 0; i--) {
    // Calculate year and month for this iteration
    const targetMonth = currentMonth - i;
    const date = new Date(Date.UTC(currentYear, targetMonth, 1));
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const monthKey = `${year}-${month}`;

    // Use existing data or create empty month
    const existing = monthMap.get(monthKey);
    months.push(
      existing || createEmptyMonth(monthKey)
    );
  }

  // Return chronologically sorted (oldest to newest)
  return months;
}
