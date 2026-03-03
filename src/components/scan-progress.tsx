'use client';

import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface ScanProgressProps {
  completedChains: number;
  totalChains: number;
  onCancel: () => void;
}

export function ScanProgress({
  completedChains,
  totalChains,
  onCancel
}: ScanProgressProps) {
  const progress = totalChains > 0 ? (completedChains / totalChains) * 100 : 0;

  return (
    <div className="w-full max-w-lg space-y-3">
      <div className="flex items-center justify-between">
        {/* Progress counter per CONTEXT.md: "Scanning... 24/60 chains" */}
        <span className="text-sm text-muted-foreground">
          Scanning... {completedChains}/{totalChains} chains
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

      <Progress value={progress} className="h-2" />
    </div>
  );
}
