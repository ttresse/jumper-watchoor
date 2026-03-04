'use client';

/**
 * React hook for fetching LiFi transfers.
 *
 * Uses React Query with internal cursor-based pagination.
 * Returns transfers only after complete load (per CONTEXT.md).
 */

import { useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAllTransfers } from '@/adapters/lifi.adapter';
import { useScanStore } from '@/stores/scan.store';
import type { LiFiTransfer } from '@/lib/lifi-types';

export interface UseLiFiTransfersResult {
  transfers: LiFiTransfer[];
  transactionCount: number;
  isLoading: boolean;
  isComplete: boolean;
  error: string | null;
  cancel: () => void;
  retry: () => void;
}

/**
 * Fetch all LiFi transfers for a wallet address.
 *
 * @param wallet - Wallet address to query, or null to skip
 * @returns Object with transfers, loading state, error handling, and control functions
 */
export function useLiFiTransfers(wallet: string | null): UseLiFiTransfersResult {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Store state and actions
  const store = useScanStore();
  const {
    transactionCount,
    transfers: storedTransfers,
    error: storeError,
    isCancelled,
    startScan,
    updateProgress,
    completeScan,
    failScan,
    cancelScan,
    reset,
  } = store;

  // Query for fetching transfers
  const query = useQuery({
    queryKey: ['lifi-transfers', wallet],
    queryFn: async () => {
      if (!wallet) return [];

      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();

      // Start scan in store
      startScan(wallet);

      try {
        const transfers = await fetchAllTransfers(
          wallet,
          abortControllerRef.current.signal,
          (count) => {
            // Progress callback - update store with running count
            updateProgress(count);
          }
        );

        // Complete scan in store with final transfers
        completeScan(transfers);

        return transfers;
      } catch (err) {
        // Handle abort (not an error, just cancelled)
        if (err instanceof Error && err.name === 'AbortError') {
          return [];
        }

        // Handle actual errors
        const message = err instanceof Error ? err.message : 'Failed to fetch transfers';
        failScan(message);
        throw err;
      }
    },
    enabled: !!wallet && !isCancelled,
    retry: false, // We handle retries in the adapter
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Cancel function
  const cancel = () => {
    // Abort the fetch request
    abortControllerRef.current?.abort();

    // Cancel React Query
    queryClient.cancelQueries({ queryKey: ['lifi-transfers', wallet] });

    // Update store state
    cancelScan();
  };

  // Retry function
  const retry = () => {
    // Reset store state
    if (wallet) {
      startScan(wallet);
    }

    // Reset and refetch the query
    queryClient.resetQueries({ queryKey: ['lifi-transfers', wallet] });
  };

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Reset store when wallet changes to null
  useEffect(() => {
    if (!wallet) {
      reset();
    }
  }, [wallet, reset]);

  return {
    // Return transfers from store (empty until complete per CONTEXT.md)
    transfers: storedTransfers,
    transactionCount,
    isLoading: query.isLoading || query.isFetching,
    isComplete: query.isSuccess && !query.isFetching,
    error: storeError,
    cancel,
    retry,
  };
}
