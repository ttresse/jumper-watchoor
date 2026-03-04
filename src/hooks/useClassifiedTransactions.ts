'use client';

/**
 * React hook for classified and aggregated transaction data.
 *
 * Orchestrates classification after scanning completes:
 * 1. Waits for useScanWallet to complete
 * 2. Classifies transactions as bridge/swap
 * 3. Aggregates by month with counts
 */

import { useMemo } from 'react';
import { useScanWallet } from './useScanWallet';
import { classifyAllTransactions } from '@/classifiers/transaction.classifier';
import { groupByMonth, fillEmptyMonths, type MonthlyAggregate } from '@/lib/aggregation';
import type { ClassificationResult } from '@/lib/types';

/**
 * State returned by useClassifiedTransactions.
 */
export interface ClassificationState {
  // From useScanWallet
  /** Whether scan is in progress */
  isLoading: boolean;
  /** Whether scan has completed (all chains processed) */
  isComplete: boolean;
  /** Scan progress - completed chains and total */
  progress: { completed: number; total: number };
  /** Chains that failed to fetch */
  failedChains: string[];
  /** Cancel the current scan */
  cancel: () => void;
  /** Retry failed chains */
  retry: (chainNames: string[]) => void;

  // Classification results
  /** Raw classification result with errors */
  classification: ClassificationResult | null;
  /** Monthly aggregates with bridge/swap counts */
  monthlyAggregates: MonthlyAggregate[];

  // Computed stats
  /** Total bridge transactions (successful only) */
  totalBridges: number;
  /** Total swap transactions (successful only) */
  totalSwaps: number;
  /** Number of unique source chains used */
  totalUniqueChains: number;
  /** Transactions that failed to classify */
  classificationErrors: number;
}

/**
 * Hook that combines wallet scanning with transaction classification.
 *
 * Classification runs only after scan completes to avoid wasted computation.
 * Monthly aggregates include all 12 months, with current month marked partial.
 *
 * @param wallet - Wallet address to scan, or null to reset
 * @returns Classification state with monthly aggregates and totals
 */
export function useClassifiedTransactions(wallet: string | null): ClassificationState {
  const scanResult = useScanWallet(wallet);

  // Classification runs only when scan is complete (per CONTEXT.md)
  const classification = useMemo(() => {
    if (!scanResult.isComplete || scanResult.transactions.length === 0) {
      return null;
    }
    return classifyAllTransactions(scanResult.transactions);
  }, [scanResult.isComplete, scanResult.transactions]);

  // Monthly aggregation
  const monthlyAggregates = useMemo(() => {
    if (!classification) return [];
    const grouped = groupByMonth(classification.classified);
    return fillEmptyMonths(grouped);
  }, [classification]);

  // Computed totals
  const totals = useMemo(() => {
    if (!classification) {
      return { totalBridges: 0, totalSwaps: 0, totalUniqueChains: 0, classificationErrors: 0 };
    }

    const allChains = new Set<number>();
    let bridges = 0;
    let swaps = 0;

    for (const tx of classification.classified) {
      if (tx.type === 'bridge') bridges++;
      else swaps++;
      allChains.add(tx.chainId); // Source chain only
    }

    return {
      totalBridges: bridges,
      totalSwaps: swaps,
      totalUniqueChains: allChains.size,
      classificationErrors: classification.errors.length,
    };
  }, [classification]);

  return {
    isLoading: scanResult.isLoading,
    isComplete: scanResult.isComplete,
    progress: {
      completed: scanResult.completedChains,
      total: scanResult.totalChains,
    },
    failedChains: scanResult.failedChains,
    cancel: scanResult.cancel,
    retry: scanResult.retry,
    classification,
    monthlyAggregates,
    ...totals,
  };
}
