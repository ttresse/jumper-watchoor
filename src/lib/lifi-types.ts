/**
 * TypeScript types for LiFi Analytics API responses.
 *
 * Source: https://docs.li.fi/api-reference/get-a-paginated-list-of-filtered-transfers
 * Verified via direct API testing 2026-03-04
 */

/**
 * Token metadata from LiFi API.
 */
export interface LiFiToken {
  /** Token contract address */
  address: string;
  /** EVM chain ID */
  chainId: number;
  /** Token symbol (e.g., 'ETH', 'USDC') */
  symbol: string;
  /** Token decimals */
  decimals: number;
  /** Token name */
  name: string;
  /** Token price in USD at time of transaction */
  priceUSD: string;
  /** URL to token logo image */
  logoURI: string;
}

/**
 * Transaction details for sending or receiving side of a transfer.
 */
export interface LiFiTransactionDetails {
  /** Transaction hash */
  txHash: string;
  /** Link to block explorer for the transaction */
  txLink: string;
  /** Token amount transferred (raw, not formatted) */
  amount: string;
  /** USD value at time of transaction */
  amountUSD: string;
  /** Token metadata */
  token: LiFiToken;
  /** EVM chain ID */
  chainId: number;
  /** Gas used (raw value) */
  gasAmount: string;
  /** Gas cost in USD */
  gasAmountUSD: string;
  /** Unix timestamp (seconds) */
  timestamp: number;
}

/**
 * Transfer status values.
 */
export type LiFiTransferStatus =
  | 'DONE'
  | 'PENDING'
  | 'FAILED'
  | 'NOT_FOUND'
  | 'INVALID';

/**
 * Transfer substatus values.
 */
export type LiFiTransferSubstatus = 'COMPLETED' | 'PENDING' | 'REFUNDED' | string;

/**
 * Complete transfer record from LiFi Analytics API.
 */
export interface LiFiTransfer {
  /** Unique transaction identifier from LiFi */
  transactionId: string;
  /** Sending side details */
  sending: LiFiTransactionDetails;
  /** Receiving side details */
  receiving: LiFiTransactionDetails;
  /** Wallet address that initiated the transfer */
  fromAddress: string;
  /** Destination wallet address */
  toAddress: string;
  /** Bridge/DEX tool used (e.g., 'stargate', 'uniswap') */
  tool: string;
  /** Transfer status */
  status: LiFiTransferStatus;
  /** Transfer substatus */
  substatus: LiFiTransferSubstatus;
  /** Human-readable substatus message */
  substatusMessage: string;
  /** Link to LiFi explorer for this transfer */
  lifiExplorerLink: string;
  /** Optional metadata */
  metadata?: {
    integrator?: string;
  };
}

/**
 * Paginated response from LiFi Analytics API transfers endpoint.
 */
export interface LiFiTransfersResponse {
  /** Array of transfer records */
  data: LiFiTransfer[];
  /** Whether there are more results after this page */
  hasNext: boolean;
  /** Whether there are results before this page */
  hasPrevious: boolean;
  /** Cursor for next page, null if no more pages */
  next: string | null;
  /** Cursor for previous page, null if at start */
  previous: string | null;
}

// ============================================
// Month-based caching types for lazy loading
// ============================================

/**
 * Loading state for a month's transfer data.
 */
export type MonthLoadState = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Cache entry for a single month's transfers.
 *
 * Used by React Query hooks to track per-month loading state.
 */
export interface MonthCacheEntry {
  /** Month identifier in YYYY-MM format */
  monthKey: string;
  /** Current loading state */
  state: MonthLoadState;
  /** Array of transfers for this month */
  transfers: LiFiTransfer[];
  /** Error message if state is 'error' */
  error?: string;
  /** Unix timestamp (seconds) when data was fetched */
  fetchedAt?: number;
}
