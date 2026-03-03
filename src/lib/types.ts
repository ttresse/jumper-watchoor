/**
 * Core TypeScript types for the Jumper Points Tracker.
 */

/**
 * Chain configuration for Covalent API.
 */
export interface Chain {
  /** Covalent chain name (e.g., 'eth-mainnet') */
  name: string;
  /** EVM chain ID */
  chainId: number;
  /** Human-readable display name */
  displayName: string;
}

/**
 * Normalized transaction data from any chain.
 */
export interface ChainTransaction {
  /** Transaction hash */
  hash: string;
  /** Unix timestamp (seconds) */
  timestamp: number;
  /** EVM chain ID */
  chainId: number;
  /** Covalent chain name */
  chainName: string;
  /** Transaction value as string (avoids BigInt serialization issues) */
  value: string;
  /** Gas used as string */
  gasUsed: string;
  /** Recipient address */
  toAddress: string;
  /** Sender address */
  fromAddress: string;
}

/**
 * Result from scanning a single chain.
 */
export interface ChainResult {
  /** Covalent chain name */
  chainName: string;
  /** Human-readable display name */
  displayName: string;
  /** Number of LiFi transactions found */
  transactionCount: number;
  /** Transaction details */
  transactions: ChainTransaction[];
  /** Scan status */
  status: 'pending' | 'success' | 'error';
  /** Error message if status is 'error' */
  error?: string;
}

/**
 * Overall scan progress state.
 */
export interface ScanProgress {
  /** Number of chains that have completed (success or error) */
  completedChains: number;
  /** Total number of chains being scanned */
  totalChains: number;
  /** Results from chains with transactions */
  successfulChains: ChainResult[];
  /** Names of chains that failed to fetch */
  failedChains: string[];
  /** Whether scan is in progress */
  isLoading: boolean;
  /** Whether all chains have been processed */
  isComplete: boolean;
}
