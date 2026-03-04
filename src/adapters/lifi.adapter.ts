/**
 * LiFi Analytics API adapter.
 *
 * Fetches all LiFi transfers for a wallet address with:
 * - Cursor-based pagination
 * - Exponential backoff retry
 * - AbortController cancellation support
 * - Progress callbacks for live counter
 */

import type {
  LiFiTransfer,
  LiFiTransfersResponse,
} from '@/lib/lifi-types';

const API_BASE = 'https://li.quest/v2/analytics/transfers';

/**
 * Retry a function with exponential backoff.
 *
 * @param fn - Async function to retry
 * @param maxRetries - Maximum retry attempts (default: 3)
 * @returns Result of successful function call
 * @throws Last error after all retries exhausted
 */
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError;
}

/**
 * Build the URL for the transfers endpoint.
 *
 * @param wallet - Wallet address to query
 * @param cursor - Pagination cursor (optional)
 * @returns Fully constructed URL string
 */
function buildTransfersUrl(wallet: string, cursor?: string | null): string {
  const url = new URL(API_BASE);
  url.searchParams.set('wallet', wallet);
  url.searchParams.set('limit', '100');
  url.searchParams.set('status', 'DONE'); // Only completed transactions
  if (cursor) {
    url.searchParams.set('next', cursor);
  }
  return url.toString();
}

/**
 * Fetch all LiFi transfers for a wallet address.
 *
 * Accumulates results across all pagination pages before returning.
 * Supports cancellation via AbortSignal - if cancelled, returns empty array
 * (per CONTEXT.md: cancel discards all data).
 *
 * @param wallet - Wallet address to query
 * @param signal - AbortSignal for cancellation support
 * @param onProgress - Optional callback called after each page with running total
 * @returns Array of all transfers, or empty array if cancelled
 * @throws Error if API request fails after retries
 */
export async function fetchAllTransfers(
  wallet: string,
  signal: AbortSignal,
  onProgress?: (count: number) => void
): Promise<LiFiTransfer[]> {
  const transfers: LiFiTransfer[] = [];
  let cursor: string | null = null;

  do {
    // Check if cancelled before each request (per CONTEXT.md: discard all data)
    if (signal.aborted) {
      return [];
    }

    const url = buildTransfersUrl(wallet, cursor);

    const data = await fetchWithRetry(async () => {
      const response = await fetch(url, { signal });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json() as Promise<LiFiTransfersResponse>;
    });

    transfers.push(...data.data);
    cursor = data.next;

    // Report progress after each page
    onProgress?.(transfers.length);
  } while (cursor);

  return transfers;
}
