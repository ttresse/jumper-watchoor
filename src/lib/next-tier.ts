/**
 * Next tier calculation utility.
 *
 * Calculates distance to next tier for progress display.
 */

import { getCategoryConfig } from './tiers-config';
import type { CategoryId } from './tiers-types';

/**
 * Information about the next tier a user can achieve.
 */
export interface NextTierInfo {
  /** Distance to reach next tier (e.g., 500 for "$500 to go") */
  distance: number;
  /** Unit of measurement (e.g., "USD", "transactions") */
  unit: string;
}

/**
 * Get information about the next tier for a category.
 *
 * @param categoryId - Category identifier
 * @param currentValue - User's current value in this category
 * @returns NextTierInfo if a higher tier exists, null if at max tier or invalid category
 */
export function getNextTierInfo(
  categoryId: CategoryId,
  currentValue: number
): NextTierInfo | null {
  const config = getCategoryConfig(categoryId);

  if (!config) {
    return null;
  }

  // Tiers are stored descending by threshold, reverse to ascending for lookup
  const ascendingTiers = [...config.tiers].reverse();

  // Find first tier where threshold > currentValue (the next tier to achieve)
  const nextTier = ascendingTiers.find((tier) => tier.threshold > currentValue);

  if (!nextTier) {
    // Already at max tier
    return null;
  }

  return {
    distance: nextTier.threshold - currentValue,
    unit: config.unit,
  };
}
