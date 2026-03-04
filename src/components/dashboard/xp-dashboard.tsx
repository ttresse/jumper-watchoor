'use client';

/**
 * Main XP dashboard container.
 *
 * Per CONTEXT.md: "Stacked single column layout", "UI is minimal, single-page"
 * Integrates all dashboard components and manages month navigation state.
 */

import { useState, useEffect, useMemo } from 'react';
import { usePoints } from '@/hooks/usePoints';
import { useClassifiedTransactions } from '@/hooks/useClassifiedTransactions';
import { getNextTierInfo } from '@/lib/next-tier';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

import { XPTotal } from './xp-total';
import { CategoryRow } from './category-row';
import { MonthNav } from './month-nav';
import { DashboardSkeleton } from './dashboard-skeleton';

import type { CategoryId } from '@/lib/tiers-types';

interface XPDashboardProps {
  /** Wallet address to display, or null if not set */
  wallet: string | null;
}

/** Fixed category order per CONTEXT.md */
const CATEGORY_ORDER: CategoryId[] = [
  'transactoor',
  'bridgoor',
  'swapoor',
  'chainoor',
];

/** Unit labels for count-based categories */
const CATEGORY_UNITS: Record<CategoryId, string | null> = {
  transactoor: 'transactions',
  bridgoor: null, // uses USD
  swapoor: null, // uses USD
  chainoor: 'chains',
};

/**
 * Main XP dashboard component.
 *
 * @param props - Component props
 * @param props.wallet - Wallet address to query
 */
export function XPDashboard({ wallet }: XPDashboardProps) {
  const { pointsData, isLoading, isComplete, error, retry } = usePoints(wallet);
  const { classifiedData } = useClassifiedTransactions(wallet);

  // Month navigation state - default to 11 (current month, last in array)
  // Per RESEARCH.md Pitfall 1: months[0] is oldest, months[11] is current
  const [monthIndex, setMonthIndex] = useState(11);

  // Reset monthIndex to 11 when wallet changes (per RESEARCH.md Pitfall 4)
  useEffect(() => {
    setMonthIndex(11);
  }, [wallet]);

  // Get current month data
  const currentMonth = pointsData?.months[monthIndex];
  const currentMonthAggregate = classifiedData?.monthsArray[monthIndex];

  // Month navigation handlers
  const goToPrevMonth = () => setMonthIndex((i) => Math.max(0, i - 1));
  const goToNextMonth = () => setMonthIndex((i) => Math.min(11, i + 1));
  const canGoPrev = monthIndex > 0;
  const canGoNext = monthIndex < 11;

  // Past months are frozen (data cannot change) - only current month (index 11) is actionable
  const isCurrentMonth = monthIndex === 11;

  // Compute volume and next tier info for each category
  const categoryData = useMemo(() => {
    if (!currentMonth || !currentMonthAggregate) return null;

    return CATEGORY_ORDER.map((categoryId) => {
      const category = currentMonth.categories.find(
        (c) => c.categoryId === categoryId
      );
      if (!category) return null;

      // Get volume/count based on category
      let volume: number | undefined;
      let rawValue: number;

      switch (categoryId) {
        case 'transactoor':
          volume = currentMonthAggregate.transactionCount;
          rawValue = currentMonthAggregate.transactionCount;
          break;
        case 'bridgoor':
          volume = currentMonthAggregate.bridgeVolumeUSD;
          rawValue = Math.floor(currentMonthAggregate.bridgeVolumeUSD);
          break;
        case 'swapoor':
          volume = currentMonthAggregate.swapVolumeUSD;
          rawValue = Math.floor(currentMonthAggregate.swapVolumeUSD);
          break;
        case 'chainoor':
          volume = currentMonthAggregate.uniqueChains.size;
          rawValue = currentMonthAggregate.uniqueChains.size;
          break;
      }

      const nextTierInfo = getNextTierInfo(categoryId, rawValue);

      return {
        category,
        volume,
        volumeUnit: CATEGORY_UNITS[categoryId],
        nextTierInfo,
      };
    }).filter(Boolean);
  }, [currentMonth, currentMonthAggregate]);

  // Loading state
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Error state per CONTEXT.md: "Inline error messages with retry button"
  if (error && !isLoading) {
    return (
      <div className="text-center space-y-4 py-8">
        <p className="text-red-500">{error}</p>
        <Button onClick={retry}>Retry</Button>
      </div>
    );
  }

  // Empty state per CONTEXT.md: "No Jumper transactions found for this wallet"
  if (isComplete && !pointsData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No Jumper transactions found for this wallet
        </p>
      </div>
    );
  }

  // Not ready yet
  if (!currentMonth || !categoryData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Month navigation at top */}
      <MonthNav
        monthKey={currentMonth.month}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        onPrev={goToPrevMonth}
        onNext={goToNextMonth}
      />

      {/* Total XP hero section */}
      <XPTotal totalXP={currentMonth.totalXP} />

      {/* Category rows in fixed order - past months have muted styling */}
      <div
        className={`border border-border rounded-lg px-4 ${
          !isCurrentMonth ? 'opacity-60' : ''
        }`}
      >
        {categoryData.map((data) =>
          data ? (
            <CategoryRow
              key={data.category.categoryId}
              category={data.category}
              volume={data.volume}
              volumeUnit={data.volumeUnit ?? undefined}
              nextTierInfo={data.nextTierInfo}
              isCurrentMonth={isCurrentMonth}
            />
          ) : null
        )}
      </div>

      {/* Refresh button at bottom per CONTEXT.md */}
      <div className="flex justify-center">
        <Button variant="outline" size="sm" onClick={retry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  );
}
