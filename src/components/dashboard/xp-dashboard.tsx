'use client';

/**
 * Main XP dashboard container with lazy loading.
 *
 * Per CONTEXT.md: "Stacked single column layout", "UI is minimal, single-page"
 * Integrates all dashboard components and manages month navigation state.
 *
 * Uses per-month hooks for lazy loading:
 * - Initial 4 months fetched in parallel
 * - Background prefetch for remaining months
 * - Skeleton shown for months still loading
 * - Partial XP display with "+" indicator
 */

import { useState, useEffect, useMemo } from 'react';
import { useInitialMonthLoad } from '@/hooks/useMonthTransfers';
import { usePrefetchManager } from '@/hooks/usePrefetchManager';
import { useMonthPoints } from '@/hooks/usePoints';
import { useMonthClassification } from '@/hooks/useClassifiedTransactions';
import { getLastNMonthKeys, getCurrentMonthKey } from '@/lib/month-utils';
import { getNextTierInfo } from '@/lib/next-tier';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

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
 * Main XP dashboard component with lazy loading.
 *
 * @param props - Component props
 * @param props.wallet - Wallet address to query
 */
export function XPDashboard({ wallet }: XPDashboardProps) {
  const queryClient = useQueryClient();

  // Get all 12 month keys (chronological: oldest first, current last)
  const allMonthKeys = useMemo(() => getLastNMonthKeys(12), []);
  const currentMonthKey = getCurrentMonthKey();

  // Initial load: fetch current + 3 previous months in parallel
  const { isInitialLoadComplete, loadedMonthKeys } = useInitialMonthLoad(wallet);

  // Background prefetch: start after initial 4 months complete
  const { prioritizeMonth } = usePrefetchManager(wallet, loadedMonthKeys);

  // Month navigation state - default to 11 (current month, last in array)
  // Per RESEARCH.md Pitfall 1: months[0] is oldest, months[11] is current
  const [monthIndex, setMonthIndex] = useState(11);

  // Reset monthIndex to 11 when wallet changes (per RESEARCH.md Pitfall 4)
  useEffect(() => {
    setMonthIndex(11);
  }, [wallet]);

  // Get the selected month key based on index
  const selectedMonthKey = allMonthKeys[monthIndex];

  // Check if selected month is loaded
  const isSelectedMonthLoaded = loadedMonthKeys.has(selectedMonthKey);

  // Per-month data hooks for selected month
  const { monthPoints, isLoading: isMonthPointsLoading } = useMonthPoints(
    wallet,
    selectedMonthKey
  );
  const { monthData: monthAggregate, isLoading: isMonthDataLoading, isError } = useMonthClassification(
    wallet,
    selectedMonthKey
  );

  // Combined loading state for selected month
  const isSelectedMonthLoading = isMonthPointsLoading || isMonthDataLoading;

  // Month navigation handlers
  const goToPrevMonth = async () => {
    const newIndex = Math.max(0, monthIndex - 1);
    const newMonthKey = allMonthKeys[newIndex];

    // If navigating to unloaded month, prioritize fetch
    if (!loadedMonthKeys.has(newMonthKey)) {
      prioritizeMonth(newMonthKey);
    }

    setMonthIndex(newIndex);
  };

  const goToNextMonth = async () => {
    const newIndex = Math.min(11, monthIndex + 1);
    const newMonthKey = allMonthKeys[newIndex];

    // If navigating to unloaded month, prioritize fetch
    if (!loadedMonthKeys.has(newMonthKey)) {
      prioritizeMonth(newMonthKey);
    }

    setMonthIndex(newIndex);
  };

  const canGoPrev = monthIndex > 0;
  const canGoNext = monthIndex < 11;

  // Past months are frozen (data cannot change) - only current month (index 11) is actionable
  const isCurrentMonth = monthIndex === 11;

  // Calculate if showing partial XP (not all months loaded yet)
  const isPartialXP = loadedMonthKeys.size < 12;

  // Refresh handler for current month only
  const handleRefresh = () => {
    if (isCurrentMonth && wallet) {
      // Invalidate only current month's query to trigger refetch
      queryClient.invalidateQueries({
        queryKey: ['lifi-transfers', wallet, currentMonthKey],
      });
    }
  };

  // Compute volume and next tier info for each category
  const categoryData = useMemo(() => {
    if (!monthPoints || !monthAggregate) return null;

    return CATEGORY_ORDER.map((categoryId) => {
      const category = monthPoints.categories.find(
        (c) => c.categoryId === categoryId
      );
      if (!category) return null;

      // Get volume/count based on category
      let volume: number | undefined;
      let rawValue: number;

      switch (categoryId) {
        case 'transactoor':
          volume = monthAggregate.transactionCount;
          rawValue = monthAggregate.transactionCount;
          break;
        case 'bridgoor':
          volume = monthAggregate.bridgeVolumeUSD;
          rawValue = Math.floor(monthAggregate.bridgeVolumeUSD);
          break;
        case 'swapoor':
          volume = monthAggregate.swapVolumeUSD;
          rawValue = Math.floor(monthAggregate.swapVolumeUSD);
          break;
        case 'chainoor':
          volume = monthAggregate.uniqueChains.size;
          rawValue = monthAggregate.uniqueChains.size;
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
  }, [monthPoints, monthAggregate]);

  // Show skeleton while initial load is in progress
  if (!isInitialLoadComplete) {
    return <DashboardSkeleton />;
  }

  // Show skeleton if selected month is not loaded yet
  if (!isSelectedMonthLoaded || isSelectedMonthLoading) {
    return (
      <div className="space-y-6">
        {/* Month navigation still visible during loading */}
        <MonthNav
          monthKey={selectedMonthKey}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          onPrev={goToPrevMonth}
          onNext={goToNextMonth}
        />
        <DashboardSkeleton />
      </div>
    );
  }

  // Error state per CONTEXT.md: "Inline error messages with retry button"
  if (isError) {
    return (
      <div className="space-y-6">
        <MonthNav
          monthKey={selectedMonthKey}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          onPrev={goToPrevMonth}
          onNext={goToNextMonth}
        />
        <div className="text-center space-y-4 py-8">
          <p className="text-red-500">Error loading data</p>
          <Button onClick={handleRefresh}>Retry</Button>
        </div>
      </div>
    );
  }

  // Empty state for selected month (no transactions)
  if (!monthPoints || !categoryData) {
    return (
      <div className="space-y-6">
        <MonthNav
          monthKey={selectedMonthKey}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          onPrev={goToPrevMonth}
          onNext={goToNextMonth}
        />
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No Jumper transactions found for this month
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Month navigation at top */}
      <MonthNav
        monthKey={monthPoints.month}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        onPrev={goToPrevMonth}
        onNext={goToNextMonth}
      />

      {/* Total XP hero section - show partial indicator when loading more months */}
      <XPTotal totalXP={monthPoints.totalXP} isPartial={isPartialXP && isCurrentMonth} />

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

      {/* Refresh button - only for current month per CONTEXT.md */}
      {isCurrentMonth && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      )}
    </div>
  );
}
