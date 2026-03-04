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
  /** Transaction details (includes logs for classification) */
  transactions: ChainTransactionWithLogs[];
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

// ============================================================================
// Transaction Classification Types
// ============================================================================

/**
 * Raw log event data from Covalent API.
 */
export interface LogEvent {
  /** Raw hex-encoded log data */
  raw_log_data: string;
  /** Array of hex-encoded log topics */
  raw_log_topics: string[];
  /** Address that emitted the event */
  sender_address: string;
}

/**
 * Transaction with log events for classification.
 * Extends ChainTransaction with logs needed for LiFi event decoding.
 */
export interface ChainTransactionWithLogs extends ChainTransaction {
  /** Whether the transaction succeeded (from Covalent tx.successful field) */
  successful: boolean;
  /** Log events emitted by the transaction */
  logEvents: LogEvent[];
}

/**
 * Transaction after classification as bridge or swap.
 */
export interface ClassifiedTransaction {
  /** Transaction hash */
  hash: string;
  /** Unix timestamp (seconds) */
  timestamp: number;
  /** EVM chain ID */
  chainId: number;
  /** Covalent chain name */
  chainName: string;
  /** Transaction value as string */
  value: string;
  /** Gas used as string */
  gasUsed: string;
  /** Recipient address */
  toAddress: string;
  /** Sender address */
  fromAddress: string;
  /** Classification: bridge (cross-chain) or swap (same-chain) */
  type: 'bridge' | 'swap';
  /** Destination chain ID for bridges, null for swaps */
  destinationChainId: number | null;
  /** Whether the transaction succeeded */
  successful: boolean;
}

/**
 * Result of classifying a batch of transactions.
 */
export interface ClassificationResult {
  /** Successfully classified transactions */
  classified: ClassifiedTransaction[];
  /** Transactions that couldn't be parsed (kept for debugging) */
  errors: ChainTransactionWithLogs[];
}
