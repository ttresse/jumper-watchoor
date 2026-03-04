/**
 * TypeScript types for tier configuration.
 *
 * Used for build-time validation of tiers.json structure.
 * Per CONTEXT.md: Fixed XP per tier, highest qualified tier only.
 */

/**
 * Single tier level within a category.
 * Note: tier names removed from official Jumper system.
 */
export interface TierLevel {
  /** Minimum threshold to qualify for this tier */
  threshold: number;
  /** Fixed XP awarded for reaching this tier */
  xp: number;
}

/**
 * Category identifier for the four XP categories.
 */
export type CategoryId = 'transactoor' | 'bridgoor' | 'swapoor' | 'chainoor';

/**
 * Configuration for a single XP category.
 */
export interface CategoryConfig {
  /** Category identifier */
  id: CategoryId;
  /** Display name for UI (Phase 4) */
  displayName: string;
  /** Category description for UI (Phase 4) */
  description: string;
  /** Icon identifier for UI (Phase 4) */
  icon: string;
  /** Unit of measurement (e.g., "transactions", "USD", "chains") */
  unit: string;
  /** Tier levels - MUST be sorted by threshold descending */
  tiers: TierLevel[];
}

/**
 * Complete tier configuration structure.
 */
export interface TiersConfig {
  /** Config version for future migrations */
  version: string;
  /** All category configurations */
  categories: CategoryConfig[];
}
