'use client';

import type { ChainResult } from '@/lib/types';

interface ChainResultsProps {
  chains: ChainResult[];
}

export function ChainResults({ chains }: ChainResultsProps) {
  // Only show chains that have transactions (per CONTEXT.md)
  const chainsWithTxns = chains.filter(c => c.transactionCount > 0);

  if (chainsWithTxns.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-lg space-y-1">
      {/* Per CONTEXT.md: "Arbitrum: 3 txns", "Optimism: 7 txns" */}
      {chainsWithTxns.map((chain) => (
        <div
          key={chain.chainName}
          className="flex items-center justify-between text-sm py-1"
        >
          <span className="font-medium">{chain.displayName}</span>
          <span className="text-muted-foreground">
            {chain.transactionCount} txn{chain.transactionCount !== 1 ? 's' : ''}
          </span>
        </div>
      ))}
    </div>
  );
}
