/**
 * Loading indicator for dashboard.
 *
 * Simple spinner with text instead of skeleton placeholders.
 */

import { LoaderIcon } from 'lucide-react';

/**
 * Display loading indicator with spinner.
 */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <LoaderIcon className="h-6 w-6 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Fetching transactions...</p>
    </div>
  );
}
