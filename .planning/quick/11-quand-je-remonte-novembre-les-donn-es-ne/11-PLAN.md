---
phase: quick-11
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/classification.ts
  - src/hooks/useClassifiedTransactions.ts
autonomous: true
requirements: [BUG-001]

must_haves:
  truths:
    - "Navigating to November shows 0 XP for all categories (not empty state message)"
    - "Empty months display valid dashboard with zero values"
    - "Months with transactions still display correct XP values"
  artifacts:
    - path: "src/lib/classification.ts"
      provides: "createEmptyMonth export"
      exports: ["createEmptyMonth"]
    - path: "src/hooks/useClassifiedTransactions.ts"
      provides: "Empty month handling"
      contains: "createEmptyMonth"
  key_links:
    - from: "src/hooks/useClassifiedTransactions.ts"
      to: "src/lib/classification.ts"
      via: "import createEmptyMonth"
      pattern: "import.*createEmptyMonth.*from"
---

<objective>
Fix: Months with no transactions show "No Jumper transactions found" instead of 0 XP dashboard

The bug is in useMonthClassification - when transfers.length === 0, it returns null instead of an empty MonthlyAggregate. This causes the dashboard to show the "no transactions" message for any month without activity (like November if user had no Jumper activity that month).

Purpose: Empty months should display a valid dashboard with 0 XP across all categories, not an error-like empty state message.
Output: Fixed useMonthClassification that returns empty aggregate for empty months.
</objective>

<execution_context>
@/Users/ttresse/.claude/get-shit-done/workflows/execute-plan.md
@/Users/ttresse/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/hooks/useClassifiedTransactions.ts
@src/lib/classification.ts
@src/components/dashboard/xp-dashboard.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Export createEmptyMonth from classification.ts</name>
  <files>src/lib/classification.ts</files>
  <action>
    Export the existing createEmptyMonth function (currently private).

    Change line 47 from:
    ```typescript
    function createEmptyMonth(monthKey: string): MonthlyAggregate {
    ```
    to:
    ```typescript
    export function createEmptyMonth(monthKey: string): MonthlyAggregate {
    ```

    No other changes needed - the function already returns a properly structured empty MonthlyAggregate with all zero values and empty Set.
  </action>
  <verify>
    <automated>cd /Users/ttresse/Projects/freelance/jumper-watcher && npx tsc --noEmit</automated>
  </verify>
  <done>createEmptyMonth is exported and available for import</done>
</task>

<task type="auto">
  <name>Task 2: Fix useMonthClassification to return empty aggregate for empty months</name>
  <files>src/hooks/useClassifiedTransactions.ts</files>
  <action>
    Import createEmptyMonth from classification.ts:
    ```typescript
    import { aggregateByMonth, fillMonthRange, createEmptyMonth } from '@/lib/classification';
    ```

    Then fix the useMemo in useMonthClassification (around line 61-70):

    Current buggy logic:
    ```typescript
    const monthData = useMemo<MonthlyAggregate | null>(() => {
      if (isLoading || transfers.length === 0) return null;  // BUG: empty months return null
      // ...
    ```

    Fixed logic:
    ```typescript
    const monthData = useMemo<MonthlyAggregate | null>(() => {
      // Still return null while loading
      if (isLoading) return null;

      // For empty months, return empty aggregate (not null)
      // This allows UI to show 0 XP instead of "no transactions" message
      if (transfers.length === 0) {
        return createEmptyMonth(monthKey);
      }

      // Aggregate this month's transfers
      const monthMap = aggregateByMonth(transfers);

      // Get the aggregate for this month (should be exactly one entry)
      return monthMap.get(monthKey) ?? null;
    }, [transfers, isLoading, monthKey]);
    ```

    This ensures:
    - Loading state still returns null (skeleton shown)
    - Empty months return valid MonthlyAggregate with zeros
    - Months with data return aggregated data as before
  </action>
  <verify>
    <automated>cd /Users/ttresse/Projects/freelance/jumper-watcher && npm run build</automated>
  </verify>
  <done>Empty months return MonthlyAggregate with zeros instead of null</done>
</task>

<task type="auto">
  <name>Task 3: Manual verification - navigate to empty month</name>
  <files></files>
  <action>
    Start dev server and verify fix works:
    1. Run `npm run dev`
    2. Enter a wallet address that has some Jumper transactions
    3. Navigate back to November 2025 (or any month with no transactions)
    4. Verify it shows the dashboard with 0 XP for all categories (transactoor, bridgoor, swapoor, chainoor)
    5. NOT the "No Jumper transactions found for this month" message
  </action>
  <verify>
    <automated>cd /Users/ttresse/Projects/freelance/jumper-watcher && npm run build</automated>
    <manual>Navigate to empty month, confirm 0 XP dashboard displays instead of empty state message</manual>
  </verify>
  <done>Empty months display dashboard with 0 XP, not empty state message</done>
</task>

</tasks>

<verification>
- TypeScript compiles without errors
- Build succeeds
- Empty months show 0 XP dashboard (not "no transactions" message)
- Months with transactions still show correct XP values
</verification>

<success_criteria>
- Navigating to any month displays dashboard (never "no transactions" unless wallet has zero LiFi history)
- Empty months show 0 XP across all four categories
- Existing functionality preserved for months with transactions
</success_criteria>

<output>
After completion, create `.planning/quick/11-quand-je-remonte-novembre-les-donn-es-ne/11-SUMMARY.md`
</output>
