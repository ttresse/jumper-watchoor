'use client';

/**
 * React hook for deriving classified transaction data from LiFi transfers.
 *
 * Uses useMemo to compute classification and aggregation only when transfers complete.
 * Per CONTEXT.md: classification runs after all data is loaded (not streaming).
 */

import { useMemo } from 'react';
import { useLiFiTransfers } from './useLiFiTransfers';
import { aggregateByMonth, fillMonthRange } from '@/lib/classification';
import type { ClassifiedData } from '@/lib/classification-types';

/**
 * Result object returned by useClassifiedTransactions.
 */
export interface UseClassifiedTransactionsResult {
  /** Classified and aggregated data, null until loading completes */
  classifiedData: ClassifiedData | null;
  /** True while fetching transfers */
  isLoading: boolean;
  /** True when fetch is complete (success or error) */
  isComplete: boolean;
  /** Error message if fetch failed, null otherwise */
  error: string | null;
  /** Cancel the in-progress fetch */
  cancel: () => void;
  /** Retry the fetch after error or cancellation */
  retry: () => void;
}

/**
 * Fetch and classify LiFi transfers for a wallet address.
 *
 * Derives classified data using useMemo after fetch completes.
 * Returns null for classifiedData until isComplete is true.
 *
 * @param wallet - Wallet address to query, or null to skip
 * @returns Object with classified data, loading state, error handling, and control functions
 */
export function useClassifiedTransactions(
  wallet: string | null
): UseClassifiedTransactionsResult {
  const { transfers, isLoading, isComplete, error, cancel, retry } =
    useLiFiTransfers(wallet);

  const classifiedData = useMemo<ClassifiedData | null>(() => {
    // Don't compute until fetch is complete (per CONTEXT.md: classification after all complete)
    if (!isComplete || transfers.length === 0) return null;

    // Aggregate transfers by month
    const months = aggregateByMonth(transfers);

    // Fill 12-month range including empty months
    const monthsArray = fillMonthRange(months);

    // Calculate totals from Map values
    let totalBridges = 0;
    let totalSwaps = 0;
    for (const month of months.values()) {
      totalBridges += month.bridgeCount;
      totalSwaps += month.swapCount;
    }

    return {
      months,
      monthsArray,
      totalTransactions: transfers.length,
      totalBridges,
      totalSwaps,
    };
  }, [transfers, isComplete]);

  return {
    classifiedData,
    isLoading,
    isComplete,
    error,
    cancel,
    retry,
  };
}
