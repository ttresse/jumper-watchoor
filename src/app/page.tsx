'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WalletInput } from '@/components/wallet-input';
import { ScanProgress } from '@/components/scan-progress';
import { XPDashboard } from '@/components/dashboard/xp-dashboard';
import { useLiFiTransfers } from '@/hooks/useLiFiTransfers';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const { transactionCount, isLoading, isComplete, error, cancel } =
    useLiFiTransfers(walletAddress);

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
          <h1 className="text-2xl font-bold">JumperWatchoor</h1>
          {/* Tagline per CONTEXT.md */}
          {!walletAddress && (
            <>
              <p className="text-muted-foreground">
                Enter wallet to see your Jumper points
              </p>
              <Link
                href="/how-it-works"
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                How does XP work?
              </Link>
            </>
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

        {/* Dashboard or error state - XPDashboard handles error/empty states internally */}
        {!isLoading && walletAddress && !error && (
          <XPDashboard wallet={walletAddress} />
        )}

        {/* Error state per CONTEXT.md: "Error message displayed in place of results area" */}
        {/* Note: XPDashboard also shows error state, but we show it here during scan phase */}
        {error && !isLoading && (
          <div className="text-center">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Allow scanning a different wallet after scan completes */}
        {isComplete && !error && walletAddress && (
          <div className="text-center">
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
