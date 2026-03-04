/**
 * Total XP hero section.
 *
 * Per CONTEXT.md: "big number + 'XP' label only (no extra decoration)"
 * Shows the total XP for the selected month prominently at top of dashboard.
 *
 * Supports partial display with "+" indicator while history loads.
 * Per CONTEXT.md: "Display partial total XP with indicator (e.g., '12,450 XP+') while history loads."
 */

interface XPTotalProps {
  /** Total XP value to display */
  totalXP: number;
  /** Show "+" indicator when still loading more data */
  isPartial?: boolean;
}

/**
 * Format number with thousands separator (without XP suffix).
 * Uses same formatter logic as format.ts but returns raw number.
 */
const xpFormatter = new Intl.NumberFormat('en-US');

/**
 * Display total XP as a large centered number.
 *
 * When isPartial is true, appends "+" after XP to indicate
 * that more data is still loading and the total may increase.
 *
 * @param props - Component props
 * @param props.totalXP - Total XP value
 * @param props.isPartial - Show "+" suffix when loading more data
 */
export function XPTotal({ totalXP, isPartial = false }: XPTotalProps) {
  const formattedXP = xpFormatter.format(totalXP);
  const ariaLabel = isPartial
    ? `${formattedXP} XP and counting, more data loading`
    : `${formattedXP} XP`;

  return (
    <div className="text-center py-6" aria-label={ariaLabel}>
      <div className="flex items-baseline justify-center gap-2">
        <span className="text-5xl font-bold tabular-nums">
          {formattedXP}
        </span>
        <span className="text-2xl font-medium text-muted-foreground">
          XP{isPartial && '+'}
        </span>
      </div>
    </div>
  );
}
