import { GoldRushClient, type ChainName } from "@covalenthq/client-sdk";
import { throttle } from '@/lib/throttle';
import { LIFI_DIAMOND } from '@/lib/chains';
import type { ChainTransactionWithLogs } from '@/lib/types';

// Client is lazily initialized to allow env var reading at runtime
let client: GoldRushClient | null = null;

function getClient(): GoldRushClient {
  if (!client) {
    const apiKey = process.env.NEXT_PUBLIC_COVALENT_API_KEY;
    if (!apiKey) {
      throw new Error('NEXT_PUBLIC_COVALENT_API_KEY is not configured');
    }
    client = new GoldRushClient(apiKey);
  }
  return client;
}

// Throttled fetch function - wraps the actual API call
const throttledFetch = throttle(
  async (wallet: string, chainName: string): Promise<ChainTransactionWithLogs[]> => {
    const covalent = getClient();
    const transactions: ChainTransactionWithLogs[] = [];

    // Use getAllTransactionsForAddress which returns an async iterator over pages
    // Each page is a GoldRushResponse containing items (transactions)
    for await (const response of covalent.TransactionService.getAllTransactionsForAddress(
      chainName as ChainName,
      wallet,
      { noLogs: false } // Fetch log events for classification
    )) {
      // Check for error responses
      if (response.error) {
        throw new Error(response.error_message || 'Unknown API error');
      }

      // Process items in this page
      const items = response.data?.items ?? [];
      for (const tx of items) {
        if (!tx) continue;

        // Filter for LiFi Diamond contract interactions only
        // Check 'to' address (most common case for LiFi swaps/bridges)
        const isLiFiTx =
          tx.to_address?.toLowerCase() === LIFI_DIAMOND.toLowerCase();

        if (isLiFiTx) {
          transactions.push({
            hash: tx.tx_hash ?? '',
            timestamp: tx.block_signed_at ? new Date(tx.block_signed_at).getTime() : 0,
            chainId: response.data?.chain_id ? Number(response.data.chain_id) : 0,
            chainName,
            value: tx.value?.toString() ?? '0',
            gasUsed: tx.gas_spent?.toString() ?? '0',
            toAddress: tx.to_address ?? '',
            fromAddress: tx.from_address ?? '',
            successful: tx.successful ?? true,
            logEvents: (tx.log_events ?? []).map(log => ({
              raw_log_data: log.raw_log_data ?? '',
              raw_log_topics: log.raw_log_topics ?? [],
              sender_address: log.sender_address ?? '',
            })),
          });
        }
      }
    }

    return transactions;
  }
);

/**
 * Fetch all LiFi transactions for a wallet on a specific chain.
 * Rate-limited to 4 requests/second across all calls.
 *
 * @param wallet - The wallet address to scan
 * @param chainName - Covalent chain name (e.g., 'eth-mainnet')
 * @returns Array of ChainTransactionWithLogs objects (includes log events for classification)
 * @throws Error if API call fails (caller should handle)
 */
export async function fetchChainTransactions(
  wallet: string,
  chainName: string
): Promise<ChainTransactionWithLogs[]> {
  return throttledFetch(wallet, chainName);
}
