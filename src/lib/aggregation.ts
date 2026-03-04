/**
 * Monthly aggregation functions for classified transactions.
 *
 * Groups transactions by YYYY-MM format using UTC dates to avoid
 * timezone-related inconsistencies.
 */

import type { ClassifiedTransaction } from './types';

/**
 * Monthly aggregate of classified transactions.
 */
export interface MonthlyAggregate {
  /** Month in YYYY-MM format */
  month: string;
  /** True for the current month (still accumulating data) */
  isPartial: boolean;
  /** Transactions in this month */
  transactions: ClassifiedTransaction[];
  /** Number of bridge transactions (successful only) */
  bridgeCount: number;
  /** Number of swap transactions (successful only) */
  swapCount: number;
  /** Source chain IDs seen in this month */
  uniqueChains: Set<number>;
  /** Number of transactions that had classification errors */
  errorCount: number;
}

/**
 * Format a date as YYYY-MM string using UTC.
 *
 * @param date - Date to format
 * @returns Month string in YYYY-MM format
 */
export function formatUTCMonth(date: Date): string {
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Generate array of last 12 months in YYYY-MM format.
 *
 * Returns months from 11 months ago to current month, ordered oldest to newest.
 *
 * @returns Array of 12 month strings
 */
export function generateLast12Months(): string[] {
  const months: string[] = [];
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth();

  for (let i = 11; i >= 0; i--) {
    // Use Date.UTC to avoid timezone issues
    const date = new Date(Date.UTC(currentYear, currentMonth - i, 1));
    months.push(formatUTCMonth(date));
  }

  return months;
}

/**
 * Group classified transactions by month.
 *
 * Creates monthly aggregates with counts for bridges, swaps, and unique chains.
 * Only successful transactions are counted toward bridge/swap totals.
 *
 * @param transactions - Array of classified transactions
 * @returns Map of month string to MonthlyAggregate
 */
export function groupByMonth(
  transactions: ClassifiedTransaction[]
): Map<string, MonthlyAggregate> {
  const aggregates = new Map<string, MonthlyAggregate>();
  const currentMonth = formatUTCMonth(new Date());

  for (const tx of transactions) {
    const month = formatUTCMonth(new Date(tx.timestamp));

    let aggregate = aggregates.get(month);
    if (!aggregate) {
      aggregate = {
        month,
        isPartial: month === currentMonth,
        transactions: [],
        bridgeCount: 0,
        swapCount: 0,
        uniqueChains: new Set(),
        errorCount: 0,
      };
      aggregates.set(month, aggregate);
    }

    aggregate.transactions.push(tx);

    // Count bridge/swap for successful transactions only
    if (tx.successful) {
      if (tx.type === 'bridge') {
        aggregate.bridgeCount++;
      } else {
        aggregate.swapCount++;
      }
    }

    // Track source chain (per CONTEXT.md - source chain only)
    aggregate.uniqueChains.add(tx.chainId);
  }

  return aggregates;
}

/**
 * Fill in empty months for the last 12 months.
 *
 * Returns a complete array of 12 months, creating empty aggregates
 * for months with no transactions. Current month is marked as partial.
 *
 * @param aggregates - Map of existing aggregates
 * @returns Array of 12 MonthlyAggregate objects, oldest to newest
 */
export function fillEmptyMonths(
  aggregates: Map<string, MonthlyAggregate>
): MonthlyAggregate[] {
  const months = generateLast12Months();
  const currentMonth = formatUTCMonth(new Date());

  return months.map((month) => {
    const existing = aggregates.get(month);
    if (existing) {
      // Ensure isPartial is correct for current month
      return {
        ...existing,
        isPartial: month === currentMonth,
      };
    }

    // Create empty aggregate for months with no transactions
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
