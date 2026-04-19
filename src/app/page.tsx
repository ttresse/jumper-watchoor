'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WalletInput } from '@/components/wallet-input';
import { ScanProgress } from '@/components/scan-progress';
import { XPDashboard } from '@/components/dashboard/xp-dashboard';
import { useLiFiTransfers } from '@/hooks/useLiFiTransfers';
import { useScanStore } from '@/stores/scan.store';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const clearLastWallet = useScanStore((state) => state.clearLastWallet);

  const { transactionCount, isLoading, isComplete, error, cancel, retry } =
    useLiFiTransfers(walletAddress);

  const handleValidAddress = (address: string) => {
    // If same wallet and there was an error, retry instead of just setting address
    if (address === walletAddress && error) {
      retry();
    } else {
      setWalletAddress(address);
    }
  };

  const handleCancel = () => {
    cancel();
    // Clear walletAddress to hide all scan-related UI
    // WalletInput keeps its internal state, so address remains visible there
    setWalletAddress(null);
  };

  const handleReset = () => {
    setWalletAddress(null);
    // Clear lastWallet from store so WalletInput doesn't pre-fill on remount
    clearLastWallet();
    // Increment resetKey to force WalletInput remount and clear internal state
    setResetKey((k) => k + 1);
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

        {/* Wallet Input - hidden when dashboard is displayed (use Refresh or "Scan different wallet" instead) */}
        {!(isComplete && !error && walletAddress) && (
          <WalletInput
            key={resetKey}
            onValidAddress={handleValidAddress}
            disabled={isLoading}
          />
        )}

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
