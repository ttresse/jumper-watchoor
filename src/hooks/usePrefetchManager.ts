'use client';

/**
 * Prefetch manager hook for background loading of month data.
 *
 * After initial 4 months load, begins prefetching remaining history
 * in batches of 3 months. Supports priority interruption for user
 * navigation to unloaded months.
 *
 * Per CONTEXT.md:
 * - Prefetch begins after initial 4 months complete
 * - Fetch 3 months in parallel per batch
 * - User requests jump the prefetch queue
 * - Silent retry on failures
 */

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fetchMonthTransfers } from '@/adapters/lifi.adapter';
import { monthQueryKey, getAllAvailableMonthKeys } from '@/lib/month-utils';

// Batch size for parallel prefetch (per CONTEXT.md)
const PREFETCH_BATCH_SIZE = 3;

/**
 * Result object returned by usePrefetchManager.
 */
export interface UsePrefetchManagerResult {
  /**
   * Immediately fetch a specific month (for user navigation).
   * Per CONTEXT.md: User requests jump the prefetch queue.
   *
   * @param monthKey - Month to fetch immediately
   * @returns Promise resolving when fetch completes
   */
  prioritizeMonth: (monthKey: string) => Promise<void>;
}

/**
 * Background prefetch manager for month data.
 *
 * Starts prefetching after initial load completes (4 months).
 * Processes remaining months in batches of 3 in parallel.
 * Errors are silently retried via React Query defaults.
 *
 * @param wallet - Wallet address to prefetch for, or null to skip
 * @param loadedMonthKeys - Set of already-loaded month keys
 * @returns Object with prioritizeMonth function for immediate fetches
 */
export function usePrefetchManager(
  wallet: string | null,
  loadedMonthKeys: Set<string>
): UsePrefetchManagerResult {
  const queryClient = useQueryClient();
  const isPrefetchingRef = useRef(false);

  /**
   * Prefetch months not yet loaded in sequential batches.
   * Each batch processes PREFETCH_BATCH_SIZE months in parallel.
   */
  const startPrefetch = useCallback(async () => {
    if (!wallet || isPrefetchingRef.current) return;

    isPrefetchingRef.current = true;

    try {
      // Get all available months and filter out already loaded
      const allMonths = getAllAvailableMonthKeys();
      const monthsToFetch = allMonths.filter(
        (monthKey) => !loadedMonthKeys.has(monthKey)
      );

      // Process in batches of 3 (sequential batches, parallel within)
      for (let i = 0; i < monthsToFetch.length; i += PREFETCH_BATCH_SIZE) {
        const batch = monthsToFetch.slice(i, i + PREFETCH_BATCH_SIZE);

        // Fetch batch in parallel using Promise.all
        await Promise.all(
          batch.map((monthKey) =>
            queryClient.prefetchQuery({
              queryKey: monthQueryKey(wallet, monthKey),
              queryFn: () => fetchMonthTransfers(wallet, monthKey),
              staleTime: Infinity, // All prefetched months are past months
            })
          )
        );
      }
    } finally {
      isPrefetchingRef.current = false;
    }
  }, [wallet, loadedMonthKeys, queryClient]);

  /**
   * Immediately fetch a specific month for user navigation.
   * Uses ensureQueryData to fetch if not in cache.
   * Does NOT abort background prefetch - let it continue.
   */
  const prioritizeMonth = useCallback(
    async (monthKey: string): Promise<void> => {
      if (!wallet) return;

      await queryClient.ensureQueryData({
        queryKey: monthQueryKey(wallet, monthKey),
        queryFn: () => fetchMonthTransfers(wallet, monthKey),
        staleTime: Infinity, // Past months are immutable
      });
    },
    [wallet, queryClient]
  );

  // Start prefetch when initial load completes (4 months loaded)
  useEffect(() => {
    if (wallet && loadedMonthKeys.size >= 4) {
      startPrefetch();
    }
  }, [wallet, loadedMonthKeys.size, startPrefetch]);

  return {
    prioritizeMonth,
  };
}
