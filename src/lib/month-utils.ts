/**
 * Pure utility functions for month-based operations.
 *
 * Used for lazy loading infrastructure - enables fetching transfers
 * for specific months using LiFi API's timestamp parameters.
 *
 * Key decisions:
 * - All functions use UTC to match classification.ts patterns
 * - Timestamps in seconds (not milliseconds) for LiFi API compatibility
 * - Month keys use YYYY-MM format for consistency
 */

/**
 * Calculate Unix timestamps for month start and end boundaries.
 *
 * @param monthKey - Month identifier in YYYY-MM format
 * @returns Object with `from` (start of month) and `to` (end of month) in Unix seconds
 *
 * @example
 * getMonthBoundaries('2026-03')
 * // Returns { from: 1772438400, to: 1775116799 }
 */
export function getMonthBoundaries(monthKey: string): { from: number; to: number } {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // JavaScript months are 0-indexed

  // Start of month: 00:00:00 UTC
  const fromDate = Date.UTC(year, month, 1, 0, 0, 0, 0);
  const from = Math.floor(fromDate / 1000);

  // End of month: 23:59:59 UTC on the last day
  // Calculate by getting day 0 of next month (which is last day of current month)
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const toDate = Date.UTC(year, month, lastDay, 23, 59, 59, 999);
  const to = Math.floor(toDate / 1000);

  return { from, to };
}

/**
 * Get the current month as a YYYY-MM key (UTC).
 *
 * @returns Current month in YYYY-MM format
 *
 * @example
 * getCurrentMonthKey() // '2026-03' (if current UTC month is March 2026)
 */
export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Generate an array of N month keys ending with the current month.
 *
 * @param n - Number of months to generate
 * @returns Array of month keys sorted chronologically (oldest first)
 *
 * @example
 * getLastNMonthKeys(4) // ['2025-12', '2026-01', '2026-02', '2026-03'] (for March 2026)
 */
export function getLastNMonthKeys(n: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth(); // 0-indexed

  for (let i = n - 1; i >= 0; i--) {
    const targetMonth = currentMonth - i;
    const date = new Date(Date.UTC(currentYear, targetMonth, 1));
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    keys.push(`${year}-${month}`);
  }

  return keys;
}

/**
 * React Query key factory for month-specific transfer queries.
 *
 * @param wallet - Wallet address
 * @param monthKey - Month identifier in YYYY-MM format
 * @returns Readonly tuple for React Query key
 *
 * @example
 * monthQueryKey('0x1234...', '2026-03')
 * // ['lifi-transfers', '0x1234...', '2026-03']
 */
export function monthQueryKey(
  wallet: string,
  monthKey: string
): readonly ['lifi-transfers', string, string] {
  return ['lifi-transfers', wallet, monthKey] as const;
}

/**
 * Generate all month keys from LiFi launch (Jan 2022) to current month.
 *
 * @returns Array of month keys sorted chronologically (oldest first)
 *
 * @example
 * getAllAvailableMonthKeys() // ['2022-01', '2022-02', ..., '2026-03']
 */
export function getAllAvailableMonthKeys(): string[] {
  const keys: string[] = [];
  const startYear = 2022;
  const startMonth = 0; // January (0-indexed)

  const now = new Date();
  const endYear = now.getUTCFullYear();
  const endMonth = now.getUTCMonth(); // 0-indexed

  for (let year = startYear; year <= endYear; year++) {
    const monthStart = year === startYear ? startMonth : 0;
    const monthEnd = year === endYear ? endMonth : 11;

    for (let month = monthStart; month <= monthEnd; month++) {
      const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
      keys.push(monthKey);
    }
  }

  return keys;
}
