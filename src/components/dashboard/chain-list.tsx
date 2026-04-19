'use client';

import { useState, useMemo } from 'react';
import { CHAIN_NAMES, getChainName } from '@/config/chains';

interface ChainListProps {
  uniqueChains: Set<number>;
  isCurrentMonth: boolean;
}

export function ChainList({ uniqueChains, isCurrentMonth }: ChainListProps) {
  const [showMissing, setShowMissing] = useState(false);

  const usedChains = useMemo(
    () =>
      Array.from(uniqueChains)
        .map((id) => ({ id, name: getChainName(id) }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [uniqueChains]
  );

  const missingChains = useMemo(() => {
    if (!isCurrentMonth) return [];
    return Object.entries(CHAIN_NAMES)
      .filter(([id]) => !uniqueChains.has(Number(id)))
      .map(([id, name]) => ({ id: Number(id), name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [uniqueChains, isCurrentMonth]);

  if (usedChains.length === 0) return null;

  return (
    <div className="pb-4 px-1 space-y-2">
      {/* Active chains */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-xs text-muted-foreground mr-1">Active on</span>
        {usedChains.map((chain) => (
          <span
            key={chain.id}
            className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium"
          >
            {chain.name}
          </span>
        ))}
      </div>

      {/* Missing chains - current month only */}
      {isCurrentMonth && missingChains.length > 0 && (
        <div className="space-y-1.5">
          <button
            onClick={() => setShowMissing(!showMissing)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showMissing
              ? 'Hide missing chains'
              : `Show ${missingChains.length} missing chains`}
          </button>
          {showMissing && (
            <div className="flex flex-wrap gap-1.5">
              {missingChains.map((chain) => (
                <span
                  key={chain.id}
                  className="rounded-full bg-muted text-muted-foreground px-2.5 py-0.5 text-xs"
                >
                  {chain.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
