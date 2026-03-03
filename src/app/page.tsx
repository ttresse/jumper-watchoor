'use client';

import { useState } from 'react';
import { WalletInput } from '@/components/wallet-input';
import { ScanProgress } from '@/components/scan-progress';
import { ChainResults } from '@/components/chain-results';
import { ErrorBanner } from '@/components/error-banner';
import { useScanWallet } from '@/hooks/useScanWallet';
import { SUPPORTED_CHAINS } from '@/lib/chains';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const {
    completedChains,
    totalChains,
    successfulChains,
    failedChains,
    isLoading,
    isComplete,
    cancel,
    retry
  } = useScanWallet(walletAddress);

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

  // Determine if ALL chains failed (for full error display)
  const allFailed = isComplete &&
    failedChains.length === SUPPORTED_CHAINS.length;

  // Calculate total transactions found
  const totalTransactions = successfulChains.reduce(
    (sum, c) => sum + c.transactionCount,
    0
  );

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
            completedChains={completedChains}
            totalChains={totalChains}
            onCancel={handleCancel}
          />
        )}

        {/* Chain Results - show as they come in */}
        {walletAddress && (
          <ChainResults chains={successfulChains} />
        )}

        {/* Error Banner - show after scan completes with failures */}
        {isComplete && failedChains.length > 0 && (
          <ErrorBanner
            failedChains={failedChains}
            onRetry={retry}
            variant={allFailed ? 'error' : 'warning'}
          />
        )}

        {/* Summary after scan completes */}
        {isComplete && !allFailed && (
          <div className="text-center space-y-4">
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-lg font-medium">
                Found {totalTransactions} LiFi transaction{totalTransactions !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-muted-foreground">
                across {successfulChains.filter(c => c.transactionCount > 0).length} chain{successfulChains.filter(c => c.transactionCount > 0).length !== 1 ? 's' : ''}
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
