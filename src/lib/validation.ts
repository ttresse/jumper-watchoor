import { isAddress, getAddress } from 'viem';

/**
 * Result of wallet address validation.
 */
export interface ValidationResult {
  /** Whether the address is valid */
  isValid: boolean;
  /** Checksummed address if valid, null otherwise */
  normalizedAddress: string | null;
  /** Error message if invalid, null if valid or still typing */
  error: string | null;
}

/**
 * Validates an EVM wallet address.
 *
 * Behavior per CONTEXT.md:
 * - Auto-validate when input reaches 42 characters
 * - No error shown while user is typing (length < 42)
 * - Accept lowercase addresses (strict: false)
 * - Return checksummed normalized address on success
 *
 * @param input - The address string to validate
 * @returns ValidationResult with validation status and normalized address
 *
 * @example
 * ```typescript
 * // Valid address
 * validateWalletAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f5a3c3')
 * // => { isValid: true, normalizedAddress: '0x742d...', error: null }
 *
 * // Still typing
 * validateWalletAddress('0x742d35')
 * // => { isValid: false, normalizedAddress: null, error: null }
 *
 * // Invalid format
 * validateWalletAddress('not-an-address-at-all-42chars')
 * // => { isValid: false, normalizedAddress: null, error: 'Address must start with 0x' }
 * ```
 */
export function validateWalletAddress(input: string): ValidationResult {
  // Trim whitespace
  const trimmed = input.trim();

  // Check if empty - no error shown while typing
  if (trimmed.length === 0) {
    return { isValid: false, normalizedAddress: null, error: null };
  }

  // Check length - if less than 42, user is still typing
  if (trimmed.length < 42) {
    return { isValid: false, normalizedAddress: null, error: null };
  }

  // Check length - if more than 42, invalid
  if (trimmed.length > 42) {
    return { isValid: false, normalizedAddress: null, error: 'Address too long' };
  }

  // Must start with 0x
  if (!trimmed.startsWith('0x')) {
    return { isValid: false, normalizedAddress: null, error: 'Address must start with 0x' };
  }

  // Use viem's isAddress with strict: false to accept lowercase addresses
  // (Many users paste addresses in lowercase from block explorers)
  if (!isAddress(trimmed, { strict: false })) {
    return { isValid: false, normalizedAddress: null, error: 'Invalid address format' };
  }

  // Normalize to checksummed address
  try {
    const normalized = getAddress(trimmed);
    return { isValid: true, normalizedAddress: normalized, error: null };
  } catch {
    return { isValid: false, normalizedAddress: null, error: 'Invalid address checksum' };
  }
}
