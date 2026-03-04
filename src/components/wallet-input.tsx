'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { validateWalletAddress } from '@/lib/validation';
import { useScanStore } from '@/stores/scan.store';

interface WalletInputProps {
  onValidAddress: (address: string) => void;
  disabled?: boolean;
}

export function WalletInput({ onValidAddress, disabled }: WalletInputProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValidAddress, setIsValidAddress] = useState(false);
  const { lastWallet } = useScanStore();
  const [hasPreFilled, setHasPreFilled] = useState(false);

  // Pre-fill last wallet on mount (per CONTEXT.md)
  useEffect(() => {
    if (lastWallet && !hasPreFilled) {
      setInput(lastWallet);
      setHasPreFilled(true);
      // Validate the pre-filled address
      const result = validateWalletAddress(lastWallet);
      setIsValidAddress(result.isValid);
    }
  }, [lastWallet, hasPreFilled]);

  // Validate input and track validity for button state
  const validateInput = useCallback((value: string) => {
    if (!value) {
      setError(null);
      setIsValidAddress(false);
      return;
    }

    const result = validateWalletAddress(value);

    if (result.error) {
      setError(result.error);
      setIsValidAddress(false);
      return;
    }

    setError(null);
    setIsValidAddress(result.isValid);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    // Clear error while typing, then validate
    setError(null);

    // Validate on each change (for button disabled state)
    if (value.length >= 42) {
      validateInput(value);
    } else {
      setIsValidAddress(false);
      if (value.length > 42) {
        setError('Address too long');
      }
    }
  };

  // Handle scan button click (per CONTEXT.md: scan requires explicit button click)
  const handleScan = useCallback(() => {
    const result = validateWalletAddress(input);
    if (result.isValid && result.normalizedAddress) {
      onValidAddress(result.normalizedAddress);
    } else if (result.error) {
      setError(result.error);
    }
  }, [input, onValidAddress]);

  return (
    <div className="w-full max-w-lg">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={handleChange}
          placeholder="0x..."
          className="font-mono text-base h-12 flex-1"
          disabled={disabled}
          aria-label="Wallet address"
          aria-describedby={error ? "address-error" : undefined}
        />
        <Button
          onClick={handleScan}
          disabled={disabled || !isValidAddress}
          className="h-12"
        >
          Scan
        </Button>
      </div>
      {/* Inline validation feedback per CONTEXT.md */}
      {error && (
        <p id="address-error" className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
