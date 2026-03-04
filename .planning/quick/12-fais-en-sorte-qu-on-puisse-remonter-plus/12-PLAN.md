---
phase: quick-12
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/dashboard/xp-dashboard.tsx
autonomous: true
requirements: [QUICK-12]

must_haves:
  truths:
    - "User can navigate back to any month since Jan 2022 (LiFi launch)"
    - "Current month is always shown as default when dashboard loads"
    - "Navigation arrows work correctly at boundaries"
  artifacts:
    - path: "src/components/dashboard/xp-dashboard.tsx"
      provides: "Extended month navigation beyond 12 months"
      contains: "getAllAvailableMonthKeys"
  key_links:
    - from: "src/components/dashboard/xp-dashboard.tsx"
      to: "src/lib/month-utils.ts"
      via: "getAllAvailableMonthKeys import"
      pattern: "getAllAvailableMonthKeys"
---

<objective>
Allow navigating back more than 1 year in month history.

Purpose: Currently the dashboard is hardcoded to show only the last 12 months. Users with longer LiFi history cannot view their older data. The infrastructure already supports fetching any month back to Jan 2022 (getAllAvailableMonthKeys exists), but the UI is constrained.

Output: Dashboard allows navigation to any month from Jan 2022 to current month.
</objective>

<execution_context>
@/Users/ttresse/.claude/get-shit-done/workflows/execute-plan.md
@/Users/ttresse/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/dashboard/xp-dashboard.tsx
@src/lib/month-utils.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Extend month navigation to all available months</name>
  <files>src/components/dashboard/xp-dashboard.tsx</files>
  <action>
Update xp-dashboard.tsx to use all available months instead of just 12:

1. Change import: Add `getAllAvailableMonthKeys` alongside existing imports from month-utils
2. Replace `getLastNMonthKeys(12)` with `getAllAvailableMonthKeys()` in the useMemo
3. Update default monthIndex from hardcoded `11` to `allMonthKeys.length - 1` (computed dynamically)
4. Update `goToNextMonth` bound from `11` to `allMonthKeys.length - 1`
5. Update `canGoNext` check from `monthIndex < 11` to `monthIndex < allMonthKeys.length - 1`
6. Update `isCurrentMonth` check from `monthIndex === 11` to `monthIndex === allMonthKeys.length - 1`
7. Update `isPartialXP` calculation: change `loadedMonthKeys.size < 12` to `loadedMonthKeys.size < allMonthKeys.length`

Note: The getAllAvailableMonthKeys function already exists in month-utils.ts and returns all months from Jan 2022 to current. The prefetch manager also already uses this function, so background prefetching will work automatically for all months.
  </action>
  <verify>
    <automated>npm run build</automated>
    <manual>Run app, verify can navigate back past 12 months to any month since Jan 2022</manual>
    <sampling_rate>run after this task commits</sampling_rate>
  </verify>
  <done>
    - Navigation shows all months from Jan 2022 to current
    - Left arrow disabled only at Jan 2022
    - Right arrow disabled only at current month
    - Default view is still current month
    - Build passes without errors
  </done>
</task>

</tasks>

<verification>
- `npm run build` passes
- App loads with current month as default
- Can navigate backwards past 12 months
- Can reach Jan 2022 (first available month)
- Cannot navigate before Jan 2022 (left arrow disabled)
- Cannot navigate past current month (right arrow disabled)
</verification>

<success_criteria>
User can navigate to any month from January 2022 to current month using the month navigation arrows in the dashboard.
</success_criteria>

<output>
After completion, create `.planning/quick/12-fais-en-sorte-qu-on-puisse-remonter-plus/12-SUMMARY.md`
</output>
