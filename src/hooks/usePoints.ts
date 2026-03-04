'use client';

/**
 * React hooks for deriving XP points from classified transaction data.
 *
 * Provides three hooks:
 * - useMonthPoints: XP for a single month (lazy loading)
 * - useAggregatedPoints: Total XP across all loaded months (partial display)
 * - usePoints: Full XP calculation (deprecated, backwards compat)
 *
 * Per CONTEXT.md: Per-month XP calculation for lazy loading.
 */

import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useClassifiedTransactions, useMonthClassification } from './useClassifiedTransactions';
import { calculateAllPoints, calculateMonthlyPoints } from '@/lib/points';
import { monthQueryKey, getLastNMonthKeys, getCurrentMonthKey } from '@/lib/month-utils';
import { aggregateByMonth } from '@/lib/classification';
import type { PointsData, MonthlyPoints } from '@/lib/points-types';
import type { MonthlyAggregate } from '@/lib/classification-types';
import type { LiFiTransfer } from '@/lib/lifi-types';

// ============================================
// Per-month points (new lazy loading)
// ============================================

/**
 * Result object returned by useMonthPoints.
 */
export interface UseMonthPointsResult {
  /** XP data for the month, null while loading */
  monthPoints: MonthlyPoints | null;
  /** True while fetching */
  isLoading: boolean;
  /** True if fetch encountered an error */
  isError: boolean;
}

/**
 * Calculate XP for a single month.
 *
 * Uses useMonthClassification to get classified data, then calculates XP.
 * Returns XP for that single month only.
 *
 * @param wallet - Wallet address to query, or null to skip
 * @param monthKey - Month identifier in YYYY-MM format
 * @returns Object with month XP, loading state, and error
 */
export function useMonthPoints(
  wallet: string | null,
  monthKey: string
): UseMonthPointsResult {
  const { monthData, isLoading, isError } = useMonthClassification(
    wallet,
    monthKey
  );

  const monthPoints = useMemo<MonthlyPoints | null>(() => {
    // Don't compute while loading or if no data
    if (isLoading || !monthData) return null;

    return calculateMonthlyPoints(monthData);
  }, [monthData, isLoading]);

  return {
    monthPoints,
    isLoading,
    isError,
  };
}

// ============================================
// Aggregated points across loaded months
// ============================================

/**
 * Result object returned by useAggregatedPoints.
 */
export interface UseAggregatedPointsResult {
  /** Total XP from all loaded months */
  totalXP: number;
  /** True if not all months are loaded yet */
  isPartial: boolean;
  /** Number of months contributing to total */
  monthsLoaded: number;
  /** Total months available (12) */
  monthsTotal: number;
  /** True if any month is still loading */
  isLoading: boolean;
}

// Cache timing constants
const FIVE_MINUTES = 5 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

/**
 * Determine staleTime based on whether month is current or past.
 */
function getStaleTime(monthKey: string): number {
  return monthKey === getCurrentMonthKey() ? FIVE_MINUTES : Infinity;
}

/**
 * Aggregate XP across all loaded months.
 *
 * Fetches XP for all 12 months using useQueries, aggregates totals.
 * Returns partial indicator when not all months are loaded.
 *
 * @param wallet - Wallet address to query, or null to skip
 * @param loadedMonthKeys - Set of month keys that are already loaded
 * @returns Object with total XP, partial indicator, and loading counts
 */
export function useAggregatedPoints(
  wallet: string | null,
  loadedMonthKeys: Set<string>
): UseAggregatedPointsResult {
  const monthKeys = getLastNMonthKeys(12);

  // Query transfer data for all 12 months
  const queries = useQueries({
    queries: monthKeys.map((monthKey) => ({
      queryKey: monthQueryKey(wallet ?? '', monthKey),
      queryFn: async (): Promise<LiFiTransfer[]> => {
        // Return empty array - data should already be fetched by useInitialMonthLoad or prefetch
        // This query just reads from cache
        return [];
      },
      enabled: !!wallet && loadedMonthKeys.has(monthKey),
      staleTime: getStaleTime(monthKey),
      gcTime: ONE_HOUR,
    })),
  });

  // Calculate aggregated points from cached data
  const result = useMemo(() => {
    let totalXP = 0;
    let monthsLoaded = 0;

    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      const monthKey = monthKeys[i];

      // Only count months that are in loadedMonthKeys (actually loaded)
      if (loadedMonthKeys.has(monthKey) && query.data) {
        const transfers = query.data as LiFiTransfer[];
        if (transfers.length > 0) {
          // Aggregate transfers for this month
          const monthMap = aggregateByMonth(transfers);
          const monthData = monthMap.get(monthKey);
          if (monthData) {
            const points = calculateMonthlyPoints(monthData);
            totalXP += points.totalXP;
          }
        }
        monthsLoaded++;
      } else if (loadedMonthKeys.has(monthKey)) {
        // Month is loaded but has no data (empty month)
        monthsLoaded++;
      }
    }

    const isLoading = queries.some((q) => q.isLoading);
    const isPartial = monthsLoaded < 12;

    return {
      totalXP,
      isPartial,
      monthsLoaded,
      monthsTotal: 12,
      isLoading,
    };
  }, [queries, loadedMonthKeys, monthKeys]);

  return result;
}

// ============================================
// Full points calculation (deprecated, backwards compat)
// ============================================

/**
 * Result object returned by usePoints.
 */
export interface UsePointsResult {
  /** XP data by month, null until classification completes */
  pointsData: PointsData | null;
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
 * Calculate XP points for a wallet address.
 *
 * @deprecated Use useMonthPoints for per-month lazy loading.
 * This hook fetches all data before calculation - will be removed after Plan 03 verified.
 *
 * Derives XP from classified transaction data using useMemo.
 * Returns null for pointsData until classification completes.
 *
 * @param wallet - Wallet address to query, or null to skip
 * @returns Object with points data, loading state, error handling, and control functions
 */
export function usePoints(wallet: string | null): UsePointsResult {
  const { classifiedData, isLoading, isComplete, error, cancel, retry } =
    useClassifiedTransactions(wallet);

  const pointsData = useMemo<PointsData | null>(() => {
    // Don't compute until classification is complete
    if (!classifiedData) return null;

    return calculateAllPoints(classifiedData.monthsArray);
  }, [classifiedData]);

  return {
    pointsData,
    isLoading,
    isComplete,
    error,
    cancel,
    retry,
  };
}
