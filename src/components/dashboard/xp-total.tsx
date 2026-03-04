/**
 * Total XP hero section.
 *
 * Per CONTEXT.md: "big number + 'XP' label only (no extra decoration)"
 * Shows the total XP for the selected month prominently at top of dashboard.
 */

interface XPTotalProps {
  /** Total XP value to display */
  totalXP: number;
}

/**
 * Format number with thousands separator (without XP suffix).
 * Uses same formatter logic as format.ts but returns raw number.
 */
const xpFormatter = new Intl.NumberFormat('en-US');

/**
 * Display total XP as a large centered number.
 *
 * @param props - Component props
 * @param props.totalXP - Total XP value
 */
export function XPTotal({ totalXP }: XPTotalProps) {
  return (
    <div className="text-center py-6">
      <div className="flex items-baseline justify-center gap-2">
        <span className="text-5xl font-bold tabular-nums">
          {xpFormatter.format(totalXP)}
        </span>
        <span className="text-2xl font-medium text-muted-foreground">XP</span>
      </div>
    </div>
  );
}
