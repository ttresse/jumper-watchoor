'use client';

/**
 * React hook for deriving XP points from classified transaction data.
 *
 * Uses useMemo to compute XP only when classified data changes.
 * Per CONTEXT.md: usePoints() derives from useClassifiedTransactions().
 */

import { useMemo } from 'react';
import { useClassifiedTransactions } from './useClassifiedTransactions';
import { calculateAllPoints } from '@/lib/points';
import type { PointsData } from '@/lib/points-types';

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
