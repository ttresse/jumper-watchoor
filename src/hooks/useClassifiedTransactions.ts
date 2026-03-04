'use client';

/**
 * React hooks for classified transaction data.
 *
 * Provides two hooks:
 * - useMonthClassification: Per-month classification (lazy loading)
 * - useClassifiedTransactions: Full classification (deprecated, backwards compat)
 *
 * Per CONTEXT.md: Classification runs per-month, not waiting for all data.
 */

import { useMemo } from 'react';
import { useLiFiTransfers } from './useLiFiTransfers';
import { useMonthTransfer } from './useMonthTransfers';
import { aggregateByMonth, fillMonthRange } from '@/lib/classification';
import type { ClassifiedData, MonthlyAggregate } from '@/lib/classification-types';
import type { LiFiTransfer } from '@/lib/lifi-types';

// ============================================
// Per-month classification (new lazy loading)
// ============================================

/**
 * Result object returned by useMonthClassification.
 */
export interface UseMonthClassificationResult {
  /** Classified data for the month, null while loading */
  monthData: MonthlyAggregate | null;
  /** Raw transfers for the month */
  transfers: LiFiTransfer[];
  /** True while fetching */
  isLoading: boolean;
  /** True if fetch encountered an error */
  isError: boolean;
  /** Error object if fetch failed */
  error: Error | null;
}

/**
 * Classify transfers for a single month.
 *
 * Uses useMonthTransfer to get transfers, then aggregates.
 * Returns classification for that single month only.
 *
 * Per CONTEXT.md: Classification runs per-month, not waiting for all data.
 *
 * @param wallet - Wallet address to query, or null to skip
 * @param monthKey - Month identifier in YYYY-MM format
 * @returns Object with month classification, loading state, and error
 */
export function useMonthClassification(
  wallet: string | null,
  monthKey: string
): UseMonthClassificationResult {
  const { data: transfers, isLoading, isError, error } = useMonthTransfer(
    wallet,
    monthKey
  );

  const monthData = useMemo<MonthlyAggregate | null>(() => {
    // Don't compute while loading
    if (isLoading || transfers.length === 0) return null;

    // Aggregate this month's transfers
    const monthMap = aggregateByMonth(transfers);

    // Get the aggregate for this month (should be exactly one entry)
    return monthMap.get(monthKey) ?? null;
  }, [transfers, isLoading, monthKey]);

  return {
    monthData,
    transfers,
    isLoading,
    isError,
    error,
  };
}

// ============================================
// Full classification (deprecated, backwards compat)
// ============================================

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
 * @deprecated Use useMonthClassification for per-month lazy loading.
 * This hook fetches all data before classification - will be removed in Plan 03.
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
