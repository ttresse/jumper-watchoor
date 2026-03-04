/**
 * Month navigation arrows.
 *
 * Per CONTEXT.md: "Arrow buttons (< and >) to step through months"
 * Current month displayed between arrows with stable width.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatMonthLabel } from '@/lib/format';

interface MonthNavProps {
  /** Current month key in YYYY-MM format */
  monthKey: string;
  /** Whether previous month navigation is available */
  canGoPrev: boolean;
  /** Whether next month navigation is available */
  canGoNext: boolean;
  /** Handler for previous month click */
  onPrev: () => void;
  /** Handler for next month click */
  onNext: () => void;
}

/**
 * Display month navigation with arrow buttons.
 *
 * @param props - Component props
 */
export function MonthNav({
  monthKey,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
}: MonthNavProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrev}
        disabled={!canGoPrev}
        aria-label="Previous month"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      {/* min-w for stable width during navigation (per PLAN.md) */}
      <span className="min-w-[150px] text-center font-medium">
        {formatMonthLabel(monthKey)}
      </span>

      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={!canGoNext}
        aria-label="Next month"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
