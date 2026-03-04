import type { TierLevel, CategoryId } from './tiers-types';
import type { MonthlyAggregate } from './classification-types';
import type { CategoryPoints, MonthlyPoints, PointsData } from './points-types';
import { getCategoryConfig } from './tiers-config';

/**
 * Find the highest tier the value qualifies for.
 * CRITICAL: Tiers must be sorted by threshold descending.
 *
 * @param value - The metric value to check (count, USD, chains)
 * @param tiers - Tier levels sorted by threshold descending
 * @returns Highest qualifying tier, or null if below all thresholds
 */
export function findQualifyingTier(
  value: number,
  tiers: TierLevel[]
): TierLevel | null {
  for (const tier of tiers) {
    if (value >= tier.threshold) {
      return tier;
    }
  }
  return null;
}

/**
 * Calculate XP for a value given tier configuration.
 * Per CONTEXT.md: Returns 0 if no tier is reached (explicit 0 XP).
 */
export function calculateTierXP(
  value: number,
  tiers: TierLevel[]
): { xp: number } {
  const tier = findQualifyingTier(value, tiers);
  return {
    xp: tier?.xp ?? 0,
  };
}

/**
 * Calculate XP for a single category from monthly aggregate.
 */
function calculateCategoryXP(
  categoryId: CategoryId,
  aggregate: MonthlyAggregate
): CategoryPoints {
  const config = getCategoryConfig(categoryId);
  if (!config) {
    return { categoryId, xp: 0 };
  }

  // Get the metric value based on category
  let value: number;
  switch (categoryId) {
    case 'transactoor':
      value = aggregate.transactionCount;
      break;
    case 'bridgoor':
      // Per CONTEXT.md: Truncate (floor) USD for tier matching
      value = Math.floor(aggregate.bridgeVolumeUSD);
      break;
    case 'swapoor':
      value = Math.floor(aggregate.swapVolumeUSD);
      break;
    case 'chainoor':
      value = aggregate.uniqueChains.size;
      break;
  }

  const result = calculateTierXP(value, config.tiers);
  return {
    categoryId,
    xp: result.xp,
  };
}

/**
 * Calculate XP for all categories for a single month.
 */
export function calculateMonthlyPoints(
  aggregate: MonthlyAggregate
): MonthlyPoints {
  const categoryIds: CategoryId[] = ['transactoor', 'bridgoor', 'swapoor', 'chainoor'];

  const categories = categoryIds.map(id => calculateCategoryXP(id, aggregate));
  const totalXP = categories.reduce((sum, cat) => sum + cat.xp, 0);

  return {
    month: aggregate.month,
    categories,
    totalXP,
  };
}

/**
 * Calculate XP for all months from classified data.
 * Per CONTEXT.md: Per-month data only, no cumulative totals.
 *
 * @param monthsArray - Array of MonthlyAggregate from ClassifiedData
 * @returns PointsData with XP for each month
 */
export function calculateAllPoints(
  monthsArray: MonthlyAggregate[]
): PointsData {
  const months = monthsArray.map(calculateMonthlyPoints);
  return { months };
}
