import type { CategoryId } from './tiers-types';

/**
 * XP result for a single category in a single month.
 */
export interface CategoryPoints {
  /** Category identifier */
  categoryId: CategoryId;
  /** XP earned this month for this category */
  xp: number;
}

/**
 * XP results for all categories in a single month.
 */
export interface MonthlyPoints {
  /** Month identifier (YYYY-MM) */
  month: string;
  /** XP by category (always 4 entries: transactoor, bridgoor, swapoor, chainoor) */
  categories: CategoryPoints[];
  /** Total XP for this month (sum of all categories) */
  totalXP: number;
}

/**
 * Complete XP data structure for all months.
 */
export interface PointsData {
  /** Points by month (chronological order, oldest to newest) */
  months: MonthlyPoints[];
}
