/**
 * Single category display row.
 *
 * Per CONTEXT.md: "category name, XP value, tier badge, distance to next tier, USD volume"
 * Shows all four categories always in fixed order (not sorted by XP value).
 */

import { Badge } from '@/components/ui/badge';
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
}: CategoryRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-border last:border-b-0 gap-1 sm:gap-4">
      {/* Left side: category name, XP, tier badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-semibold uppercase text-sm tracking-wide min-w-[100px]">
          {category.categoryId}
        </span>
        <span className="text-lg font-bold tabular-nums">
          {formatXP(category.xp)}
        </span>
        {category.tierName && (
          <Badge variant="secondary">{category.tierName}</Badge>
        )}
      </div>

      {/* Right side: volume/count and next tier info */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        {/* Volume: USD for bridgoor/swapoor, count with unit for transactoor/chainoor */}
        {volume !== undefined && (
          <span>
            {volumeUnit ? formatCount(volume, volumeUnit) : formatUSD(volume)}
          </span>
        )}

        {/* Next tier distance */}
        {nextTierInfo && (
          <span className="text-xs">
            {nextTierInfo.distance.toLocaleString()} {nextTierInfo.unit} to{' '}
            {nextTierInfo.tierName}
          </span>
        )}
      </div>
    </div>
  );
}
