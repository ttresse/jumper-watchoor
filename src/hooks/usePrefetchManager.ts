'use client';

/**
 * Prefetch manager hook for on-demand loading of month data.
 *
 * Only prefetches months adjacent to user navigation (+/- 2 months).
 * No aggressive background prefetching of all history.
 *
 * Strategy:
 * - Initial 4 months loaded by useInitialMonthLoad
 * - When user navigates, prefetch adjacent months
 * - Silent retry on failures via React Query defaults
 */

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fetchMonthTransfers } from '@/adapters/lifi.adapter';
import { monthQueryKey, getAllAvailableMonthKeys } from '@/lib/month-utils';

/**
 * Result object returned by usePrefetchManager.
 */
export interface UsePrefetchManagerResult {
  /**
   * Immediately fetch a specific month (for user navigation).
   *
   * @param monthKey - Month to fetch immediately
   * @returns Promise resolving when fetch completes
   */
  prioritizeMonth: (monthKey: string) => Promise<void>;

  /**
   * Prefetch months adjacent to the given index (+/- 2 months).
   * Used to smooth navigation experience.
   *
   * @param monthIndex - Current month index in allMonthKeys array
   */
  prefetchAdjacent: (monthIndex: number) => void;
}

/**
 * On-demand prefetch manager for month data.
 *
 * Does NOT prefetch all history automatically.
 * Only prefetches adjacent months when user navigates.
 *
 * @param wallet - Wallet address to prefetch for, or null to skip
 * @param _loadedMonthKeys - Set of already-loaded month keys (kept for API compatibility)
 * @returns Object with prioritizeMonth and prefetchAdjacent functions
 */
export function usePrefetchManager(
  wallet: string | null,
  _loadedMonthKeys: Set<string>
): UsePrefetchManagerResult {
  const queryClient = useQueryClient();

  /**
   * Immediately fetch a specific month for user navigation.
   * Uses ensureQueryData to fetch if not in cache.
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

  /**
   * Prefetch months adjacent to current position (+/- 2 months).
   * Non-blocking - fires and forgets.
   */
  const prefetchAdjacent = useCallback(
    (monthIndex: number): void => {
      if (!wallet) return;

      const allMonths = getAllAvailableMonthKeys();

      // Prefetch 2 months before and 2 months after current position
      const indicesToPrefetch = [
        monthIndex - 2,
        monthIndex - 1,
        monthIndex + 1,
        monthIndex + 2,
      ].filter((i) => i >= 0 && i < allMonths.length);

      for (const idx of indicesToPrefetch) {
        const monthKey = allMonths[idx];
        // Fire and forget - don't await
        queryClient.prefetchQuery({
          queryKey: monthQueryKey(wallet, monthKey),
          queryFn: () => fetchMonthTransfers(wallet, monthKey),
          staleTime: Infinity,
        });
      }
    },
    [wallet, queryClient]
  );

  // No automatic prefetch on mount - only on-demand

  return {
    prioritizeMonth,
    prefetchAdjacent,
  };
}
