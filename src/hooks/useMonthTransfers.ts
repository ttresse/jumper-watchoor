'use client';

/**
 * React hooks for per-month transfer fetching.
 *
 * Enables lazy loading with:
 * - Single month queries with proper staleTime (Infinity for past months)
 * - Parallel initial load of current + 3 previous months
 * - Cache keys via monthQueryKey for consistency
 *
 * Per CONTEXT.md: Past months are immutable (staleTime: Infinity).
 */

import { useQuery, useQueries, UseQueryResult } from '@tanstack/react-query';
import { fetchMonthTransfers } from '@/adapters/lifi.adapter';
import {
  monthQueryKey,
  getCurrentMonthKey,
  getLastNMonthKeys,
} from '@/lib/month-utils';
import type { LiFiTransfer } from '@/lib/lifi-types';

/**
 * Query result type for month transfer queries.
 */
type MonthTransferQueryResult = UseQueryResult<LiFiTransfer[], Error>;

// Cache timing constants
const FIVE_MINUTES = 5 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

/**
 * Determine staleTime based on whether month is current or past.
 *
 * Per CONTEXT.md: Past months are immutable - never refetch.
 * Current month uses 5 minute staleTime.
 *
 * @param monthKey - Month identifier in YYYY-MM format
 * @returns staleTime in milliseconds (Infinity for past months)
 */
function getStaleTime(monthKey: string): number {
  return monthKey === getCurrentMonthKey() ? FIVE_MINUTES : Infinity;
}

/**
 * Result object returned by useMonthTransfer.
 */
export interface UseMonthTransferResult {
  /** Array of transfers for the month */
  data: LiFiTransfer[];
  /** True while fetching */
  isLoading: boolean;
  /** True if fetch encountered an error */
  isError: boolean;
  /** Error object if fetch failed */
  error: Error | null;
}

/**
 * Fetch transfers for a single month.
 *
 * Uses React Query with appropriate staleTime based on month:
 * - Current month: 5 minutes
 * - Past months: Infinity (immutable per CONTEXT.md)
 *
 * @param wallet - Wallet address to query, or null to skip
 * @param monthKey - Month identifier in YYYY-MM format
 * @returns Object with transfers, loading state, and error
 */
export function useMonthTransfer(
  wallet: string | null,
  monthKey: string
): UseMonthTransferResult {
  const query = useQuery({
    queryKey: monthQueryKey(wallet ?? '', monthKey),
    queryFn: () => fetchMonthTransfers(wallet!, monthKey),
    enabled: !!wallet,
    staleTime: getStaleTime(monthKey),
    gcTime: ONE_HOUR, // Keep in memory for session
    retry: 3, // React Query default, silent retry per CONTEXT.md
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

/**
 * Result object returned by useInitialMonthLoad.
 */
export interface UseInitialMonthLoadResult {
  /** Array of query results for each month */
  queries: MonthTransferQueryResult[];
  /** True when all 4 initial months are done (success or error) */
  isInitialLoadComplete: boolean;
  /** Set of month keys that loaded successfully */
  loadedMonthKeys: Set<string>;
  /** Total transfers across all loaded months */
  totalTransfers: number;
}

/**
 * Fetch current + 3 previous months in parallel.
 *
 * Used for initial page load - fetches 4 months simultaneously
 * to show user recent data quickly while prefetch handles the rest.
 *
 * @param wallet - Wallet address to query, or null to skip
 * @returns Object with query results, completion state, loaded keys, and total count
 */
export function useInitialMonthLoad(
  wallet: string | null
): UseInitialMonthLoadResult {
  const monthKeys = getLastNMonthKeys(4);

  const queries = useQueries({
    queries: monthKeys.map((monthKey) => ({
      queryKey: monthQueryKey(wallet ?? '', monthKey),
      queryFn: () => fetchMonthTransfers(wallet!, monthKey),
      enabled: !!wallet,
      staleTime: getStaleTime(monthKey),
      gcTime: ONE_HOUR,
    })),
  }) as MonthTransferQueryResult[];

  // Calculate derived state
  const isInitialLoadComplete = queries.every(
    (q) => q.isSuccess || q.isError
  );

  const loadedMonthKeys = new Set<string>();
  let totalTransfers = 0;

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    if (query.isSuccess) {
      loadedMonthKeys.add(monthKeys[i]);
      totalTransfers += query.data?.length ?? 0;
    }
  }

  return {
    queries,
    isInitialLoadComplete,
    loadedMonthKeys,
    totalTransfers,
  };
}
