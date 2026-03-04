---
phase: quick-4
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/dashboard/category-row.tsx
autonomous: true
requirements: [QUICK-4]
must_haves:
  truths:
    - "Mobile view has clear visual hierarchy between category name and XP"
    - "Elements have adequate spacing (breathing room) on mobile"
    - "Current value and next tier info are visually separated on mobile"
  artifacts:
    - path: "src/components/dashboard/category-row.tsx"
      provides: "Improved mobile responsive layout"
      contains: "flex-col"
  key_links:
    - from: "CategoryRow"
      to: "Tailwind responsive classes"
      via: "sm: breakpoint prefixes"
      pattern: "sm:"
---

<objective>
Improve mobile layout of CategoryRow component for better visual hierarchy and breathing room.

Purpose: Current mobile view shows cramped elements - need clearer separation between category name/XP and volume/next tier info.
Output: Updated CategoryRow with improved responsive Tailwind classes for mobile.
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
  <name>Task 1: Improve CategoryRow mobile layout spacing and hierarchy</name>
  <files>src/components/dashboard/category-row.tsx</files>
  <action>
Update the CategoryRow component's Tailwind classes to improve mobile layout:

1. **Increase vertical gap on mobile:** Change `gap-1` to `gap-2` for more breathing room between stacked rows on mobile.

2. **Restructure left side for mobile:**
   - Make category name full-width on mobile (block display), XP below it
   - Use `flex-col sm:flex-row` on the left section
   - Category name: keep `font-semibold uppercase text-sm tracking-wide`
   - XP value: keep `text-lg font-bold tabular-nums`

3. **Restructure right side for mobile:**
   - Stack volume and next-tier info vertically on mobile
   - Use `flex-col sm:flex-row` with `items-start sm:items-center`
   - Add subtle visual separator or adjust spacing

4. **Visual hierarchy improvements:**
   - Add `py-4` (instead of `py-3`) for more vertical padding
   - Keep `sm:` variants for desktop horizontal layout

The result should show on mobile:
```
BRIDGOOR
120 XP
$1,234 volume
$500 to next tier
```

And on desktop (sm+) remain horizontal:
```
BRIDGOOR    120 XP    |    $1,234 volume    $500 to next tier
```
  </action>
  <verify>
    <automated>npm run build && npm run lint</automated>
    <manual>View dashboard on mobile viewport (375px) - category rows should have clear visual separation between elements</manual>
  </verify>
  <done>CategoryRow displays with improved vertical stacking on mobile: category name and XP on separate lines with adequate spacing, volume and next tier info clearly separated</done>
</task>

</tasks>

<verification>
- Build passes without errors
- Lint passes
- Mobile viewport (375px) shows clear visual hierarchy
- Desktop viewport maintains horizontal layout
</verification>

<success_criteria>
- CategoryRow has improved mobile layout with better spacing
- Category name and XP are visually separated on mobile
- Volume and next tier info are clearly distinguished
- Desktop layout remains functional with horizontal arrangement
</success_criteria>

<output>
After completion, create `.planning/quick/4-am-liorer-layout-mobile-des-category-row/4-SUMMARY.md`
</output>
