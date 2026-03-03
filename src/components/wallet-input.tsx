'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { validateWalletAddress } from '@/lib/validation';
import { useScanStore } from '@/stores/scan.store';

interface WalletInputProps {
  onValidAddress: (address: string) => void;
  disabled?: boolean;
}

export function WalletInput({ onValidAddress, disabled }: WalletInputProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { lastWallet } = useScanStore();
  const [hasPreFilled, setHasPreFilled] = useState(false);

  // Pre-fill last wallet on mount (per CONTEXT.md)
  useEffect(() => {
    if (lastWallet && !hasPreFilled) {
      setInput(lastWallet);
      setHasPreFilled(true);
    }
  }, [lastWallet, hasPreFilled]);

  const handleValidation = useCallback((value: string, autoStart: boolean) => {
    const result = validateWalletAddress(value);

    if (result.error) {
      setError(result.error);
      return;
    }

    setError(null);

    if (result.isValid && result.normalizedAddress && autoStart) {
      // Auto-start scan per CONTEXT.md
      onValidAddress(result.normalizedAddress);
    }
  }, [onValidAddress]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    // Clear error while typing
    setError(null);

    // Auto-validate when reaching 42 characters (per CONTEXT.md)
    // Only auto-start for NEW input, not pre-filled addresses
    if (value.length === 42 && value !== lastWallet) {
      handleValidation(value, true);
    } else if (value.length > 42) {
      setError('Address too long');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Manual trigger for pre-filled addresses (per CONTEXT.md)
    // Pre-filled address requires user action (Enter) to start scan
    if (e.key === 'Enter') {
      const result = validateWalletAddress(input);
      if (result.isValid && result.normalizedAddress) {
        onValidAddress(result.normalizedAddress);
      } else if (result.error) {
        setError(result.error);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    // Get pasted value and validate immediately
    const pasted = e.clipboardData.getData('text');
    if (pasted.length === 42) {
      // Let the onChange handle it, but ensure auto-start
      // The setTimeout ensures state updates from paste complete first
      setTimeout(() => {
        handleValidation(pasted, true);
      }, 0);
    }
  };

  return (
    <div className="w-full max-w-lg">
      <Input
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder="0x..."
        className="font-mono text-base h-12"
        disabled={disabled}
        aria-label="Wallet address"
        aria-describedby={error ? "address-error" : undefined}
      />
      {/* Inline validation feedback per CONTEXT.md */}
      {error && (
        <p id="address-error" className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}
      {/* Show hint for pre-filled addresses */}
      {input === lastWallet && input.length === 42 && !error && (
        <p className="mt-2 text-sm text-muted-foreground">
          Press Enter to scan again
        </p>
      )}
    </div>
  );
}
