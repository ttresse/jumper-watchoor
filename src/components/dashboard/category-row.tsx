/**
 * Single category display row.
 *
 * Per CONTEXT.md: "category name, XP value, tier badge, distance to next tier, USD volume"
 * Shows all four categories always in fixed order (not sorted by XP value).
 */

import { formatXP, formatUSD, formatCount } from '@/lib/format';
import type { CategoryPoints } from '@/lib/points-types';
import type { NextTierInfo } from '@/lib/next-tier';

interface CategoryRowProps {
  /** Category points data */
  category: CategoryPoints;
  /** USD volume for bridgoor/swapoor, count for transactoor/chainoor */
  volume: number | undefined;
  /** Volume unit (e.g., "transactions", "chains") - only used for count-based categories */
  volumeUnit?: string;
  /** Next tier info for progress display */
  nextTierInfo: NextTierInfo | null;
  /** Whether this is the current month (default true for backwards compatibility) */
  isCurrentMonth?: boolean;
}

/**
 * Display a single category row with XP, tier badge, and progress.
 *
 * @param props - Component props
 */
export function CategoryRow({
  category,
  volume,
  volumeUnit,
  nextTierInfo,
  isCurrentMonth = true,
}: CategoryRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-border last:border-b-0 gap-2 sm:gap-4">
      {/* Left side: category name and XP - stacked on mobile, inline on desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
        <span className="font-semibold uppercase text-sm tracking-wide sm:min-w-[100px]">
          {category.categoryId}
        </span>
        <span className="text-lg font-bold tabular-nums">
          {formatXP(category.xp)}
        </span>
      </div>

      {/* Right side: volume/count and next tier info - always vertical stack */}
      <div className="flex flex-col items-start sm:items-end gap-0.5">
        {/* Volume: USD for bridgoor/swapoor, count with unit for transactoor/chainoor */}
        {/* Prominent styling: larger, bolder, full color */}
        {volume !== undefined && (
          <span className="text-base font-semibold text-foreground tabular-nums">
            {volumeUnit ? formatCount(volume, volumeUnit) : formatUSD(volume)}
          </span>
        )}

        {/* Next tier distance - only shown for current month (past months are frozen) */}
        {/* Muted styling: smaller, subdued color */}
        {isCurrentMonth && nextTierInfo && (
          <span className="text-xs text-muted-foreground">
            {nextTierInfo.unit === 'USD'
              ? `${formatUSD(nextTierInfo.distance)} to next tier`
              : `${nextTierInfo.distance.toLocaleString()} ${nextTierInfo.unit} to next tier`}
          </span>
        )}
      </div>
    </div>
  );
}
