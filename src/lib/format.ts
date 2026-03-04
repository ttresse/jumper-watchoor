/**
 * Formatting utilities for dashboard display.
 *
 * Uses Intl API for locale-aware number and date formatting.
 * Module-level formatter instances are reused for performance.
 */

/**
 * Number formatter for XP values (e.g., "12,450 XP")
 */
const xpFormatter = new Intl.NumberFormat('en-US');

/**
 * Currency formatter for USD values (e.g., "$2,500")
 */
const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Date formatter for month labels (e.g., "March 2026")
 */
const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/**
 * Format XP value with thousands separator and "XP" suffix.
 *
 * @param value - XP amount
 * @returns Formatted string (e.g., "12,450 XP")
 */
export function formatXP(value: number): string {
  return `${xpFormatter.format(value)} XP`;
}

/**
 * Format USD value with currency symbol (no decimals).
 *
 * @param value - USD amount
 * @returns Formatted string (e.g., "$2,500")
 */
export function formatUSD(value: number): string {
  return usdFormatter.format(value);
}

/**
 * Format month key to human-readable label.
 *
 * @param monthKey - Month in "YYYY-MM" format
 * @returns Formatted string (e.g., "March 2026")
 */
export function formatMonthLabel(monthKey: string): string {
  // Parse as UTC to avoid timezone issues
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  return monthFormatter.format(date);
}

/**
 * Format count with unit.
 *
 * @param value - Numeric count
 * @param unit - Unit name (e.g., "transactions", "chains")
 * @returns Formatted string (e.g., "15 transactions")
 */
export function formatCount(value: number, unit: string): string {
  return `${xpFormatter.format(value)} ${unit}`;
}
