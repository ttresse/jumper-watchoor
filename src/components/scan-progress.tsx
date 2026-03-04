'use client';

import { Button } from '@/components/ui/button';

interface ScanProgressProps {
  transactionCount: number;
  onCancel: () => void;
}

export function ScanProgress({
  transactionCount,
  onCancel
}: ScanProgressProps) {
  return (
    <div className="w-full max-w-lg flex items-center justify-between">
      {/* Progress counter per CONTEXT.md: "Loading... N transactions found" */}
      <span className="text-sm text-muted-foreground">
        Loading... {transactionCount} transaction{transactionCount !== 1 ? 's' : ''} found
      </span>
      {/* Cancel button per CONTEXT.md */}
      <Button
        variant="outline"
        size="sm"
        onClick={onCancel}
      >
        Cancel
      </Button>
    </div>
  );
}
