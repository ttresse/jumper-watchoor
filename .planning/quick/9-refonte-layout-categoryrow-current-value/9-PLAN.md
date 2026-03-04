---
phase: quick-9
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/dashboard/category-row.tsx
autonomous: true
requirements: [QUICK-9]

must_haves:
  truths:
    - "Current value (volume/count) appears ABOVE next tier info"
    - "Current value has prominent visual styling (larger, bolder)"
    - "Next tier info remains muted/discrete"
  artifacts:
    - path: "src/components/dashboard/category-row.tsx"
      provides: "Vertically stacked value display with emphasis on current value"
  key_links: []
---

<objective>
Refonte du layout CategoryRow pour mettre en valeur la donnee courante.

Purpose: Ameliorer la hierarchie visuelle - la valeur actuelle doit etre plus visible que l'info "to next tier"
Output: CategoryRow avec valeur courante empilee au-dessus, stylisee plus proeminement
</objective>

<execution_context>
@/Users/ttresse/.claude/get-shit-done/workflows/execute-plan.md
@/Users/ttresse/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/components/dashboard/category-row.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Restructure value display with vertical stacking and visual emphasis</name>
  <files>src/components/dashboard/category-row.tsx</files>
  <action>
Modify the right side section (volume + next tier info) in CategoryRow:

1. **Vertical stacking**: Keep `flex-col` for the right side container (already there), but ensure current value is FIRST (top) and next tier info is SECOND (bottom) in the DOM order

2. **Emphasize current value** (volume/count span):
   - Change from `text-sm text-muted-foreground` to `text-base font-semibold text-foreground`
   - This gives: larger size (base vs sm), semi-bold weight, and full color (not muted)

3. **Keep next tier muted** (already `text-xs`, add explicit muted styling):
   - Keep `text-xs`
   - Ensure `text-muted-foreground` is applied to the next tier span
   - Add `opacity-80` for extra subtlety

4. **Alignment**: On the right side container, use `items-end` for right alignment on desktop, `items-start` on mobile (current behavior is fine)

Current structure:
```tsx
<div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3 text-sm text-muted-foreground">
  <span>{volume}</span>
  <span className="text-xs">{nextTierInfo}</span>
</div>
```

Target structure:
```tsx
<div className="flex flex-col items-start sm:items-end gap-0.5">
  <span className="text-base font-semibold text-foreground tabular-nums">
    {volume}
  </span>
  <span className="text-xs text-muted-foreground">
    {nextTierInfo}
  </span>
</div>
```

Note: Remove `sm:flex-row` from the right side - we want vertical stacking on ALL screen sizes for this section. The parent container already handles mobile/desktop layout.
  </action>
  <verify>
    <automated>npm run build</automated>
    <manual>Check CategoryRow displays: current value (e.g., "7 transactions", "$600") larger and bolder on top, "X to next tier" smaller and muted below</manual>
  </verify>
  <done>
    - Current value appears above next tier info (vertical stack)
    - Current value uses text-base font-semibold text-foreground (prominent)
    - Next tier info uses text-xs text-muted-foreground (discrete)
    - Layout works on both mobile and desktop
  </done>
</task>

</tasks>

<verification>
- Build passes without errors
- Visual hierarchy: current value prominent, next tier discrete
- Stacking: current value on top, next tier below
</verification>

<success_criteria>
CategoryRow displays values with correct visual hierarchy: prominent current value above muted next tier info
</success_criteria>

<output>
After completion, create `.planning/quick/9-refonte-layout-categoryrow-current-value/9-SUMMARY.md`
</output>
