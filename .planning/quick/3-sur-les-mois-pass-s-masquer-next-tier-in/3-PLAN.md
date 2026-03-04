---
phase: quick
plan: 3
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/dashboard/xp-dashboard.tsx
  - src/components/dashboard/category-row.tsx
autonomous: true
requirements: [QUICK-3]
must_haves:
  truths:
    - "Past months do not show 'X to next tier' info"
    - "Past months have visual indicator that data is frozen"
    - "Current month (index 11) still shows next tier info"
  artifacts:
    - path: "src/components/dashboard/category-row.tsx"
      provides: "Conditional next tier display"
    - path: "src/components/dashboard/xp-dashboard.tsx"
      provides: "Past month detection and visual treatment"
  key_links:
    - from: "src/components/dashboard/xp-dashboard.tsx"
      to: "src/components/dashboard/category-row.tsx"
      via: "isCurrentMonth prop"
      pattern: "isCurrentMonth.*monthIndex"
---

<objective>
Hide next tier progression info on past months and add visual indicator for frozen historical data.

Purpose: Past months cannot change (data is frozen), so showing "X to next tier" is misleading. Users should clearly see the difference between current month (actionable) and past months (historical record).
Output: Dashboard that only shows next tier info for current month, with grey treatment on past months
</objective>

<execution_context>
@/Users/ttresse/.claude/get-shit-done/workflows/execute-plan.md
@/Users/ttresse/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/components/dashboard/xp-dashboard.tsx
@src/components/dashboard/category-row.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Hide next tier info and add grey overlay for past months</name>
  <files>
    src/components/dashboard/xp-dashboard.tsx
    src/components/dashboard/category-row.tsx
  </files>
  <action>
1. In xp-dashboard.tsx:
   - Add `isCurrentMonth` boolean: `const isCurrentMonth = monthIndex === 11;`
   - Pass `isCurrentMonth` to each CategoryRow component
   - Wrap the category rows container with conditional styling: when `!isCurrentMonth`, apply a semi-transparent grey overlay or muted opacity (e.g., `opacity-60` class on the container)

2. In category-row.tsx:
   - Add `isCurrentMonth?: boolean` to CategoryRowProps interface (optional, defaults to true for backwards compatibility)
   - Conditionally render next tier info only when `isCurrentMonth !== false`:
     ```tsx
     {isCurrentMonth !== false && nextTierInfo && (
       <span className="text-xs">...</span>
     )}
     ```

The grey overlay should be subtle enough to read but clearly indicate "this data is historical and cannot change". Use Tailwind opacity or a semi-transparent background.
  </action>
  <verify>
    <automated>npm run build</automated>
    <manual>Navigate to dashboard, go to a past month - should NOT show "X to next tier" and should have muted/grey appearance</manual>
  </verify>
  <done>
    - Past months (index 0-10) show no "X to next tier" text in any category row
    - Past months have visual grey/muted treatment indicating frozen data
    - Current month (index 11) still shows "X to next tier" with normal styling
  </done>
</task>

</tasks>

<verification>
- Build passes: `npm run build`
- Manual: Load dashboard, navigate to past month, confirm no next tier info and grey overlay visible
- Manual: Return to current month, confirm next tier info appears and styling is normal
</verification>

<success_criteria>
- Next tier info hidden on all past months
- Past months have visible grey/muted indicator
- Current month behavior unchanged
- No TypeScript errors
</success_criteria>

<output>
After completion, create `.planning/quick/3-sur-les-mois-pass-s-masquer-next-tier-in/3-SUMMARY.md`
</output>
