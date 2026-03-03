'use client';

import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { fetchChainTransactions } from '@/adapters/covalent.adapter';
import { SUPPORTED_CHAINS } from '@/lib/chains';
import { useScanStore } from '@/stores/scan.store';
import type { ChainResult, ScanProgress } from '@/lib/types';

export function useScanWallet(wallet: string | null): ScanProgress & {
  cancel: () => void;
  retry: (chainNames: string[]) => void;
  transactions: ChainResult['transactions'];
} {
  const queryClient = useQueryClient();
  const {
    startScan,
    updateChainResult,
    cancelScan,
    isCancelled,
    reset
  } = useScanStore();

  // Start scan when wallet changes
  useEffect(() => {
    if (wallet) {
      startScan(wallet);
    } else {
      reset();
    }
  }, [wallet, startScan, reset]);

  // Fire all chain queries in parallel
  const results = useQueries({
    queries: wallet
      ? SUPPORTED_CHAINS.map((chain) => ({
          queryKey: ['transactions', wallet, chain.name] as const,
          queryFn: async (): Promise<ChainResult> => {
            try {
              const transactions = await fetchChainTransactions(wallet, chain.name);
              const result: ChainResult = {
                chainName: chain.name,
                displayName: chain.displayName,
                transactionCount: transactions.length,
                transactions,
                status: 'success',
              };
              return result;
            } catch (error) {
              const result: ChainResult = {
                chainName: chain.name,
                displayName: chain.displayName,
                transactionCount: 0,
                transactions: [],
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
              };
              return result;
            }
          },
          staleTime: 5 * 60 * 1000,  // 5 minutes
          gcTime: 30 * 60 * 1000,    // 30 minutes (formerly cacheTime)
          retry: false,              // Don't retry - track as failed per CONTEXT.md
          enabled: !!wallet && !isCancelled,
        }))
      : [],
    combine: (queryResults) => {
      const completed = queryResults.filter(r => !r.isPending);
      const successful = queryResults
        .filter(r => r.isSuccess && r.data?.status === 'success')
        .map(r => r.data!);
      const failed = queryResults
        .filter(r => r.isSuccess && r.data?.status === 'error')
        .map(r => r.data!.chainName);

      return {
        transactions: successful.flatMap(r => r.transactions),
        completedChains: completed.length,
        totalChains: SUPPORTED_CHAINS.length,
        successfulChains: successful,
        failedChains: failed,
        isLoading: queryResults.some(r => r.isPending),
        isComplete: completed.length === SUPPORTED_CHAINS.length,
      };
    },
  });

  // Update store with results for UI state management
  useEffect(() => {
    results.successfulChains.forEach(chain => {
      updateChainResult(chain.chainName, chain);
    });
  }, [results.successfulChains, updateChainResult]);

  // Cancel functionality
  const cancel = useCallback(() => {
    cancelScan();
    // Cancel all pending queries
    SUPPORTED_CHAINS.forEach(chain => {
      queryClient.cancelQueries({
        queryKey: ['transactions', wallet, chain.name]
      });
    });
  }, [wallet, queryClient, cancelScan]);

  // Retry specific chains
  const retry = useCallback((chainNames: string[]) => {
    chainNames.forEach(chainName => {
      queryClient.invalidateQueries({
        queryKey: ['transactions', wallet, chainName]
      });
    });
  }, [wallet, queryClient]);

  return {
    ...results,
    cancel,
    retry,
  };
}
