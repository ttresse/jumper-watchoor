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
import { getMonthBoundaries } from '@/lib/month-utils';

const API_BASE = 'https://li.quest/v2/analytics/transfers';

/**
 * Get a user-friendly error message based on HTTP status code.
 *
 * @param status - HTTP status code
 * @returns User-friendly error message
 */
function getErrorMessage(status: number): string {
  switch (status) {
    case 500:
    case 502:
    case 503:
    case 504:
      return 'LiFi server is temporarily unavailable. Please try again later.';
    case 429:
      return 'Too many requests. Please wait a moment before retrying.';
    case 404:
      return 'Wallet not found or no transactions available.';
    case 400:
      return 'Invalid wallet address format.';
    default:
      return `API error (${status}). Please try again.`;
  }
}

/**
 * Retry a function with fixed delay between attempts.
 *
 * @param fn - Async function to retry
 * @param maxRetries - Maximum retry attempts (default: 3)
 * @param delayMs - Delay between retries in ms (default: 3000)
 * @returns Result of successful function call
 * @throws Last error after all retries exhausted
 */
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 3000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        // Fixed 3 second delay between retries
        await new Promise((r) => setTimeout(r, delayMs));
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

  // Filter to last 12 months to reduce memory pressure with high-volume wallets
  const twelveMonthsAgo = Math.floor((Date.now() - (365 * 24 * 60 * 60 * 1000)) / 1000);
  url.searchParams.set('fromTimestamp', twelveMonthsAgo.toString());

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
        throw new Error(getErrorMessage(response.status));
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

/**
 * Build the URL for month-specific transfers endpoint.
 *
 * @param wallet - Wallet address to query
 * @param monthKey - Month in YYYY-MM format
 * @param cursor - Pagination cursor (optional)
 * @returns Fully constructed URL string
 */
function buildMonthTransfersUrl(
  wallet: string,
  monthKey: string,
  cursor?: string | null
): string {
  const url = new URL(API_BASE);
  url.searchParams.set('wallet', wallet);
  url.searchParams.set('limit', '100');
  url.searchParams.set('status', 'DONE'); // Only completed transactions

  // Set month boundaries
  const { from, to } = getMonthBoundaries(monthKey);
  url.searchParams.set('fromTimestamp', from.toString());
  url.searchParams.set('toTimestamp', to.toString());

  if (cursor) {
    url.searchParams.set('next', cursor);
  }
  return url.toString();
}

/**
 * Fetch LiFi transfers for a specific month.
 *
 * Fetches only transfers within the given month's boundaries.
 * Accumulates results across all pagination pages before returning.
 * Supports cancellation via AbortSignal.
 *
 * @param wallet - Wallet address to query
 * @param monthKey - Month in YYYY-MM format
 * @param signal - AbortSignal for cancellation support (optional)
 * @returns Array of transfers for the month, or empty array if cancelled/none found
 * @throws Error if API request fails after retries
 */
export async function fetchMonthTransfers(
  wallet: string,
  monthKey: string,
  signal?: AbortSignal
): Promise<LiFiTransfer[]> {
  const transfers: LiFiTransfer[] = [];
  let cursor: string | null = null;

  do {
    // Check if cancelled before each request
    if (signal?.aborted) {
      return [];
    }

    const url = buildMonthTransfersUrl(wallet, monthKey, cursor);

    const data = await fetchWithRetry(async () => {
      const response = await fetch(url, { signal });

      if (!response.ok) {
        throw new Error(getErrorMessage(response.status));
      }

      return response.json() as Promise<LiFiTransfersResponse>;
    });

    transfers.push(...data.data);
    cursor = data.next;
  } while (cursor);

  return transfers;
}
