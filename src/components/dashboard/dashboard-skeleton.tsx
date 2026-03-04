/**
 * Loading skeleton for dashboard.
 *
 * Per CONTEXT.md: "Skeleton placeholders while loading"
 * Matches dimensions of actual content to prevent layout shift (per RESEARCH.md Pitfall 3).
 */

import { Skeleton } from '@/components/ui/skeleton';

/**
 * Display loading skeleton matching dashboard layout.
 * Shows placeholders for month nav, total XP, and 4 category rows.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Month navigation skeleton */}
      <div className="flex items-center justify-center gap-2">
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-6 w-[150px]" />
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>

      {/* Total XP skeleton */}
      <div className="text-center py-6">
        <div className="flex items-baseline justify-center gap-2">
          <Skeleton className="h-12 w-36" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>

      {/* Category rows skeleton (4 categories) */}
      <div className="space-y-0">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-border last:border-b-0 gap-1 sm:gap-4"
          >
            {/* Left side */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-[100px]" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            {/* Right side */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
