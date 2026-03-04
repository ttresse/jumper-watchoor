'use client';

import { LoaderIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScanProgressProps {
  transactionCount: number;
  onCancel: () => void;
}

export function ScanProgress({
  onCancel
}: ScanProgressProps) {
  return (
    <div className="w-full max-w-lg flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <LoaderIcon className="h-4 w-4 animate-spin" />
        <span>Fetching transactions...</span>
      </div>
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
