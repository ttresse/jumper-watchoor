import { isAddress, getAddress } from 'viem';

/**
 * Address type for multi-chain support.
 */
export type AddressType = 'evm' | 'solana' | 'bitcoin';

/**
 * Result of wallet address validation.
 */
export interface ValidationResult {
  /** Whether the address is valid */
  isValid: boolean;
  /** Normalized address if valid, null otherwise */
  normalizedAddress: string | null;
  /** Error message if invalid, null if valid or still typing */
  error: string | null;
  /** Detected address type (EVM, Solana, or Bitcoin) */
  addressType?: AddressType;
}

/**
 * Base58 alphabet for Solana addresses.
 * Excludes: 0, O, I, l (to avoid visual confusion)
 */
const BASE58_ALPHABET = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;

/**
 * Bech32 alphabet for Bitcoin SegWit/Taproot addresses.
 * Lowercase only: a-z and 0-9 excluding 1, b, i, o
 */
const BECH32_ALPHABET = /^[023456789acdefghjklmnpqrstuvwxyz]+$/;

/**
 * Validates a Solana address.
 * Solana addresses are Base58 encoded, 32-44 characters.
 */
function validateSolanaAddress(address: string): ValidationResult {
  // Solana addresses are 32-44 characters
  if (address.length < 32 || address.length > 44) {
    return {
      isValid: false,
      normalizedAddress: null,
      error: 'Solana address must be 32-44 characters',
      addressType: 'solana',
    };
  }

  // Must be valid Base58
  if (!BASE58_ALPHABET.test(address)) {
    return {
      isValid: false,
      normalizedAddress: null,
      error: 'Invalid Solana address format',
      addressType: 'solana',
    };
  }

  return {
    isValid: true,
    normalizedAddress: address,
    error: null,
    addressType: 'solana',
  };
}

/**
 * Validates a Bitcoin address.
 * Supports: Legacy (1..., 3...), SegWit (bc1q...), Taproot (bc1p...)
 */
function validateBitcoinAddress(address: string): ValidationResult {
  const lowerAddress = address.toLowerCase();

  // Taproot (bc1p...): 62 characters, Bech32m
  if (lowerAddress.startsWith('bc1p')) {
    if (address.length !== 62) {
      return {
        isValid: false,
        normalizedAddress: null,
        error: 'Bitcoin Taproot address must be 62 characters',
        addressType: 'bitcoin',
      };
    }
    // Validate Bech32m alphabet (after bc1p prefix)
    const data = lowerAddress.slice(4);
    if (!BECH32_ALPHABET.test(data)) {
      return {
        isValid: false,
        normalizedAddress: null,
        error: 'Invalid Bitcoin Taproot address format',
        addressType: 'bitcoin',
      };
    }
    return {
      isValid: true,
      normalizedAddress: address.toLowerCase(),
      error: null,
      addressType: 'bitcoin',
    };
  }

  // SegWit (bc1q...): 42-62 characters, Bech32
  if (lowerAddress.startsWith('bc1q')) {
    if (address.length < 42 || address.length > 62) {
      return {
        isValid: false,
        normalizedAddress: null,
        error: 'Bitcoin SegWit address must be 42-62 characters',
        addressType: 'bitcoin',
      };
    }
    // Validate Bech32 alphabet (after bc1q prefix)
    const data = lowerAddress.slice(4);
    if (!BECH32_ALPHABET.test(data)) {
      return {
        isValid: false,
        normalizedAddress: null,
        error: 'Invalid Bitcoin SegWit address format',
        addressType: 'bitcoin',
      };
    }
    return {
      isValid: true,
      normalizedAddress: address.toLowerCase(),
      error: null,
      addressType: 'bitcoin',
    };
  }

  // Legacy P2PKH (starts with 1): 25-34 characters
  if (address.startsWith('1')) {
    if (address.length < 25 || address.length > 34) {
      return {
        isValid: false,
        normalizedAddress: null,
        error: 'Bitcoin legacy address must be 25-34 characters',
        addressType: 'bitcoin',
      };
    }
    if (!BASE58_ALPHABET.test(address)) {
      return {
        isValid: false,
        normalizedAddress: null,
        error: 'Invalid Bitcoin legacy address format',
        addressType: 'bitcoin',
      };
    }
    return {
      isValid: true,
      normalizedAddress: address,
      error: null,
      addressType: 'bitcoin',
    };
  }

  // Legacy P2SH (starts with 3): 25-34 characters
  if (address.startsWith('3')) {
    if (address.length < 25 || address.length > 34) {
      return {
        isValid: false,
        normalizedAddress: null,
        error: 'Bitcoin legacy address must be 25-34 characters',
        addressType: 'bitcoin',
      };
    }
    if (!BASE58_ALPHABET.test(address)) {
      return {
        isValid: false,
        normalizedAddress: null,
        error: 'Invalid Bitcoin legacy address format',
        addressType: 'bitcoin',
      };
    }
    return {
      isValid: true,
      normalizedAddress: address,
      error: null,
      addressType: 'bitcoin',
    };
  }

  // If starts with bc1 but not bc1p or bc1q, it's invalid
  if (lowerAddress.startsWith('bc1')) {
    return {
      isValid: false,
      normalizedAddress: null,
      error: 'Invalid Bitcoin address format (must be bc1q or bc1p)',
      addressType: 'bitcoin',
    };
  }

  // Not a recognized Bitcoin format
  return {
    isValid: false,
    normalizedAddress: null,
    error: 'Invalid address format',
  };
}

/**
 * Validates an EVM wallet address.
 */
function validateEvmAddress(address: string): ValidationResult {
  // Check length - if less than 42, user is still typing
  if (address.length < 42) {
    return { isValid: false, normalizedAddress: null, error: null, addressType: 'evm' };
  }

  // Check length - if more than 42, invalid
  if (address.length > 42) {
    return {
      isValid: false,
      normalizedAddress: null,
      error: 'EVM address must be exactly 42 characters',
      addressType: 'evm',
    };
  }

  // Use viem's isAddress with strict: false to accept lowercase addresses
  if (!isAddress(address, { strict: false })) {
    return {
      isValid: false,
      normalizedAddress: null,
      error: 'Invalid EVM address format',
      addressType: 'evm',
    };
  }

  // Normalize to checksummed address
  try {
    const normalized = getAddress(address);
    return { isValid: true, normalizedAddress: normalized, error: null, addressType: 'evm' };
  } catch {
    return {
      isValid: false,
      normalizedAddress: null,
      error: 'Invalid EVM address checksum',
      addressType: 'evm',
    };
  }
}

/**
 * Validates a multi-chain wallet address.
 *
 * Supports:
 * - EVM: 0x + 40 hex characters (42 total)
 * - Solana: Base58 encoded, 32-44 characters
 * - Bitcoin: Legacy (1..., 3...), SegWit (bc1q...), Taproot (bc1p...)
 *
 * @param input - The address string to validate
 * @returns ValidationResult with validation status, normalized address, and detected type
 *
 * @example
 * ```typescript
 * // EVM address
 * validateWalletAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f5a3c3')
 * // => { isValid: true, normalizedAddress: '0x742d...', error: null, addressType: 'evm' }
 *
 * // Solana address
 * validateWalletAddress('Edj9krWxmUNMDfeBCwaJz8KEWeepqBtz4ySJjYKH2HiS')
 * // => { isValid: true, normalizedAddress: 'Edj9kr...', error: null, addressType: 'solana' }
 *
 * // Bitcoin Taproot
 * validateWalletAddress('bc1pnjht6ejqe7q2ak8qa6wefnmyxq2zma4np76s00pqd4mjw6kfzemsmqucvh')
 * // => { isValid: true, normalizedAddress: 'bc1pnj...', error: null, addressType: 'bitcoin' }
 *
 * // Still typing
 * validateWalletAddress('0x742d35')
 * // => { isValid: false, normalizedAddress: null, error: null }
 * ```
 */
export function validateWalletAddress(input: string): ValidationResult {
  // Trim whitespace
  const trimmed = input.trim();

  // Check if empty - no error shown while typing
  if (trimmed.length === 0) {
    return { isValid: false, normalizedAddress: null, error: null };
  }

  // Detect address type and validate
  const lowerTrimmed = trimmed.toLowerCase();

  // ENS names are not supported - provide helpful error
  if (lowerTrimmed.endsWith('.eth')) {
    return {
      isValid: false,
      normalizedAddress: null,
      error: 'ENS names are not supported. Please enter the resolved wallet address.',
    };
  }

  // If too short (< 25), user is still typing
  // 25 is the minimum for Bitcoin legacy addresses
  if (trimmed.length < 25) {
    return { isValid: false, normalizedAddress: null, error: null };
  }

  // EVM: starts with 0x
  if (trimmed.startsWith('0x')) {
    return validateEvmAddress(trimmed);
  }

  // Bitcoin Bech32: starts with bc1
  if (lowerTrimmed.startsWith('bc1')) {
    return validateBitcoinAddress(trimmed);
  }

  // Bitcoin Legacy: starts with 1 or 3
  if (trimmed.startsWith('1') || trimmed.startsWith('3')) {
    return validateBitcoinAddress(trimmed);
  }

  // Otherwise, try Solana (Base58)
  // Note: This catches any alphanumeric string that matches Base58 pattern
  return validateSolanaAddress(trimmed);
}
