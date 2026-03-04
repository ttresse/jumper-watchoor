/**
 * Transaction classifier for LiFi transactions.
 *
 * Classifies transactions as bridges (cross-chain) or swaps (same-chain)
 * by decoding LiFi contract event logs.
 *
 * Classification logic:
 * - LiFiTransferStarted with different destination chain = bridge
 * - LiFiTransferStarted with same destination chain = swap
 * - LiFiGenericSwapCompleted = swap
 * - No LiFi events decoded = swap (conservative default per CONTEXT.md)
 */

import { decodeEventLog } from 'viem';
import { LIFI_EVENTS_ABI } from '@/lib/lifi-abi';
import type {
  ChainTransactionWithLogs,
  ClassifiedTransaction,
  ClassificationResult,
} from '@/lib/types';

/**
 * Classify a single transaction as bridge or swap.
 *
 * Iterates through transaction log events, attempting to decode LiFi events.
 * Uses destinationChainId from LiFiTransferStarted to determine if bridge.
 *
 * @param tx - Transaction with log events
 * @param sourceChainId - Chain ID where transaction originated
 * @returns Classified transaction with type and destinationChainId
 */
export function classifyTransaction(
  tx: ChainTransactionWithLogs,
  sourceChainId: number
): ClassifiedTransaction {
  // Iterate through log events looking for LiFi events
  for (const log of tx.logEvents) {
    try {
      // Skip logs without topics (shouldn't happen but be defensive)
      if (!log.raw_log_topics || log.raw_log_topics.length === 0) {
        continue;
      }

      const decoded = decodeEventLog({
        abi: LIFI_EVENTS_ABI,
        data: log.raw_log_data as `0x${string}`,
        topics: log.raw_log_topics as [`0x${string}`, ...`0x${string}`[]],
        strict: false, // Allow partial decoding
      });

      // LiFiTransferStarted indicates a bridge (check destination chain)
      if (decoded.eventName === 'LiFiTransferStarted') {
        const args = decoded.args as {
          bridgeData: {
            destinationChainId: bigint;
          };
        };
        const destinationChainId = Number(args.bridgeData.destinationChainId);

        return {
          hash: tx.hash,
          timestamp: tx.timestamp,
          chainId: tx.chainId,
          chainName: tx.chainName,
          value: tx.value,
          gasUsed: tx.gasUsed,
          toAddress: tx.toAddress,
          fromAddress: tx.fromAddress,
          type: destinationChainId !== sourceChainId ? 'bridge' : 'swap',
          destinationChainId,
          successful: tx.successful,
        };
      }

      // LiFiGenericSwapCompleted indicates a same-chain swap
      if (decoded.eventName === 'LiFiGenericSwapCompleted') {
        return {
          hash: tx.hash,
          timestamp: tx.timestamp,
          chainId: tx.chainId,
          chainName: tx.chainName,
          value: tx.value,
          gasUsed: tx.gasUsed,
          toAddress: tx.toAddress,
          fromAddress: tx.fromAddress,
          type: 'swap',
          destinationChainId: null,
          successful: tx.successful,
        };
      }
    } catch {
      // Decoding failed for this log, try next one
      continue;
    }
  }

  // No LiFi events found - default to swap (conservative per CONTEXT.md)
  return {
    hash: tx.hash,
    timestamp: tx.timestamp,
    chainId: tx.chainId,
    chainName: tx.chainName,
    value: tx.value,
    gasUsed: tx.gasUsed,
    toAddress: tx.toAddress,
    fromAddress: tx.fromAddress,
    type: 'swap',
    destinationChainId: null,
    successful: tx.successful,
  };
}

/**
 * Classify all transactions in a batch.
 *
 * Filters out failed/reverted transactions, then classifies the rest.
 * Transactions that throw during classification are added to errors array.
 *
 * @param rawTransactions - Transactions with log events to classify
 * @returns Classification result with classified transactions and errors
 */
export function classifyAllTransactions(
  rawTransactions: ChainTransactionWithLogs[]
): ClassificationResult {
  const classified: ClassifiedTransaction[] = [];
  const errors: ChainTransactionWithLogs[] = [];

  for (const tx of rawTransactions) {
    // Skip failed/reverted transactions per CONTEXT.md
    if (!tx.successful) {
      continue;
    }

    try {
      const result = classifyTransaction(tx, tx.chainId);
      classified.push(result);
    } catch {
      // Classification failed - add to errors for debugging
      errors.push(tx);
    }
  }

  return { classified, errors };
}
