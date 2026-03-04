/**
 * Tier configuration loader with type-safe access.
 *
 * Imports tiers.json with TypeScript type assertion for build-time validation.
 */

import tiersJson from '@/config/tiers.json';
import type { TiersConfig, CategoryConfig, CategoryId } from './tiers-types';

/**
 * Tier configuration with type assertion.
 * TypeScript validates structure at build time.
 */
export const tiersConfig = tiersJson as TiersConfig;

/**
 * Get category configuration by ID.
 *
 * @param id - Category identifier (transactoor, bridgoor, swapoor, chainoor)
 * @returns CategoryConfig or undefined if not found
 */
export function getCategoryConfig(id: CategoryId): CategoryConfig | undefined {
  return tiersConfig.categories.find((cat) => cat.id === id);
}
