'use client';

import { useState } from 'react';
import { WalletInput } from '@/components/wallet-input';
import { ScanProgress } from '@/components/scan-progress';
import { useLiFiTransfers } from '@/hooks/useLiFiTransfers';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const {
    transfers,
    transactionCount,
    isLoading,
    isComplete,
    error,
    cancel,
    retry
  } = useLiFiTransfers(walletAddress);

  const handleValidAddress = (address: string) => {
    setWalletAddress(address);
  };

  const handleCancel = () => {
    cancel();
    // Clear walletAddress to hide all scan-related UI
    // WalletInput keeps its internal state, so address remains visible there
    setWalletAddress(null);
  };

  const handleReset = () => {
    setWalletAddress(null);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-lg space-y-8">
        {/* Header per CONTEXT.md: minimal, text only */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Jumper Points Tracker</h1>
          {/* Tagline per CONTEXT.md */}
          {!walletAddress && (
            <p className="text-muted-foreground">
              Enter wallet to see your Jumper points
            </p>
          )}
        </div>

        {/* Wallet Input */}
        <WalletInput
          onValidAddress={handleValidAddress}
          disabled={isLoading}
        />

        {/* Scanning Progress */}
        {isLoading && (
          <ScanProgress
            transactionCount={transactionCount}
            onCancel={handleCancel}
          />
        )}

        {/* Error state per CONTEXT.md: "Error message displayed in place of results area" */}
        {error && !isLoading && (
          <div className="text-center space-y-4">
            <p className="text-red-500">{error}</p>
            <Button onClick={retry}>Retry</Button>
          </div>
        )}

        {/* Empty wallet per CONTEXT.md: "No LiFi transactions found for this wallet" */}
        {isComplete && !error && transfers.length === 0 && (
          <div className="text-center">
            <p className="text-muted-foreground">No LiFi transactions found for this wallet</p>
          </div>
        )}

        {/* Success state: show transaction count */}
        {isComplete && !error && transfers.length > 0 && (
          <div className="text-center space-y-4">
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-lg font-medium">
                Found {transfers.length} LiFi transaction{transfers.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Allow scanning a different wallet */}
            <button
              onClick={handleReset}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Scan a different wallet
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
