---
phase: quick-6
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/dashboard/category-row.tsx
autonomous: true
requirements: [QUICK-6]
must_haves:
  truths:
    - "Next tier distance for USD categories shows $ prefix (e.g., '$401 to next tier')"
    - "Next tier distance for count categories shows unit suffix (e.g., '5 transactions to next tier')"
  artifacts:
    - path: "src/components/dashboard/category-row.tsx"
      provides: "Harmonized dollar display using $ instead of USD suffix"
  key_links:
    - from: "src/components/dashboard/category-row.tsx"
      to: "src/lib/format.ts"
      via: "formatUSD for USD unit values"
      pattern: "formatUSD\\(.*distance"
---

<objective>
Harmonize dollar display in CategoryRow to use $ prefix instead of "USD" suffix.

Purpose: Consistency - volume already shows "$600" but next tier shows "401 USD to next tier"
Output: All USD amounts displayed with $ prefix
</objective>

<execution_context>
@/Users/ttresse/.claude/get-shit-done/workflows/execute-plan.md
@/Users/ttresse/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/dashboard/category-row.tsx
@src/lib/format.ts
@src/lib/next-tier.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update CategoryRow to format USD distances with $ prefix</name>
  <files>src/components/dashboard/category-row.tsx</files>
  <action>
    In the next tier info display section (around line 59-64), change the rendering logic:

    CURRENT (line 61):
    ```tsx
    {nextTierInfo.distance.toLocaleString()} {nextTierInfo.unit} to next tier
    ```

    NEW:
    ```tsx
    {nextTierInfo.unit === 'USD'
      ? `${formatUSD(nextTierInfo.distance)} to next tier`
      : `${nextTierInfo.distance.toLocaleString()} ${nextTierInfo.unit} to next tier`}
    ```

    This uses the existing `formatUSD` import (already imported on line 8) to format USD values with $ prefix, while keeping the current format for count-based categories (transactions, chains).

    Result:
    - bridgoor/swapoor: "$401 to next tier" (was "401 USD to next tier")
    - transactoor: "5 transactions to next tier" (unchanged)
    - chainoor: "2 chains to next tier" (unchanged)
  </action>
  <verify>
    <automated>npx tsc --noEmit && npm run lint</automated>
    <manual>Run app, check CategoryRow displays "$X to next tier" for bridgoor/swapoor categories</manual>
  </verify>
  <done>USD distances display as "$401 to next tier" instead of "401 USD to next tier"</done>
</task>

</tasks>

<verification>
- TypeScript compiles without errors
- Lint passes
- Visual check: bridgoor/swapoor show "$X to next tier"
- Visual check: transactoor/chainoor still show "X unit to next tier"
</verification>

<success_criteria>
All USD amounts in the dashboard use $ prefix consistently:
- Volume: "$600" (already works)
- Next tier: "$401 to next tier" (fixed)
</success_criteria>

<output>
After completion, create `.planning/quick/6-harmoniser-affichage-dollar-utiliser-par/6-SUMMARY.md`
</output>
