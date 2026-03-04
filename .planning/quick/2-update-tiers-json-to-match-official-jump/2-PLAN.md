---
phase: quick
plan: 2
type: execute
wave: 1
depends_on: []
files_modified:
  - src/config/tiers.json
  - src/lib/tiers-types.ts
  - src/lib/points-types.ts
  - src/lib/points.ts
  - src/lib/next-tier.ts
  - src/components/dashboard/category-row.tsx
autonomous: true
requirements: [QUICK-2]
must_haves:
  truths:
    - "Tier thresholds match official Jumper points table"
    - "XP values match official Jumper points table"
    - "No tier name fields exist in code or types"
    - "Chainoor has only 2 tiers (2 chains = 10xp, 9 chains = 30xp)"
  artifacts:
    - path: "src/config/tiers.json"
      provides: "Updated tier configuration with official values"
    - path: "src/lib/tiers-types.ts"
      provides: "TierLevel type without name field"
  key_links:
    - from: "src/lib/points.ts"
      to: "src/config/tiers.json"
      via: "tier lookup"
      pattern: "findQualifyingTier"
---

<objective>
Update tiers.json and all dependent code to match the official Jumper points system.

Purpose: Replace placeholder tier values with actual Jumper thresholds and XP values, and remove tier names (no longer part of official system).

Output: Updated tier configuration matching official Jumper points table.
</objective>

<context>
@.planning/STATE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update tiers.json with official values</name>
  <files>src/config/tiers.json</files>
  <action>
Replace entire tiers.json content with official Jumper values:

TRANSACTOOR (transaction count) - 6 tiers:
- threshold: 50, xp: 50 (was 500)
- threshold: 35, xp: 40
- threshold: 20, xp: 33
- threshold: 10, xp: 25
- threshold: 5, xp: 18
- threshold: 1, xp: 10

BRIDGOOR (USD volume) - 6 tiers:
- threshold: 500000, xp: 50
- threshold: 100000, xp: 44
- threshold: 50000, xp: 33
- threshold: 10000, xp: 25
- threshold: 1000, xp: 18
- threshold: 100, xp: 10

SWAPOOR (USD volume) - 6 tiers (same as BRIDGOOR):
- threshold: 500000, xp: 50
- threshold: 100000, xp: 44
- threshold: 50000, xp: 33
- threshold: 10000, xp: 25
- threshold: 1000, xp: 18
- threshold: 100, xp: 10

CHAINOOR (unique chains) - 2 tiers ONLY:
- threshold: 9, xp: 30 (max)
- threshold: 2, xp: 10

IMPORTANT changes:
1. REMOVE the "name" field from every tier object (no more "Grand Degen", "Novice", etc.)
2. Update descriptions to remove "(placeholder values - real Jumper thresholds TBD)"
3. Tiers MUST be sorted descending by threshold (highest first) for first-match-wins logic
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>tiers.json contains official Jumper values without name fields</done>
</task>

<task type="auto">
  <name>Task 2: Update types and logic to remove tierName</name>
  <files>src/lib/tiers-types.ts, src/lib/points-types.ts, src/lib/points.ts, src/lib/next-tier.ts</files>
  <action>
Update TierLevel in tiers-types.ts:
- REMOVE `name: string` field from interface
- Update JSDoc to reflect new structure

Update CategoryPoints in points-types.ts:
- REMOVE `tierName: string | null` field from interface
- Remove JSDoc comment about tierName

Update points.ts:
- In calculateTierXP: Change return type to just `{ xp: number }`, remove tierName handling
- In calculateCategoryXP: Remove tierName from return object

Update next-tier.ts:
- In NextTierInfo interface: REMOVE `tierName: string` field and its JSDoc
- In getNextTierInfo function: REMOVE `tierName: nextTier.name` from return object
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>All types and functions compile without tierName references</done>
</task>

<task type="auto">
  <name>Task 3: Update UI to remove tier badge display</name>
  <files>src/components/dashboard/category-row.tsx</files>
  <action>
In CategoryRow component:
- REMOVE the conditional tier badge rendering:
  ```tsx
  {category.tierName && (
    <Badge variant="secondary">{category.tierName}</Badge>
  )}
  ```
- REMOVE the import for Badge component (unless used elsewhere)
- In nextTierInfo display: Remove `{nextTierInfo.tierName}` reference and update text:
  - Was: `{nextTierInfo.distance.toLocaleString()} {nextTierInfo.unit} to {nextTierInfo.tierName}`
  - Now: `{nextTierInfo.distance.toLocaleString()} {nextTierInfo.unit} to next tier`
  </action>
  <verify>
    <automated>npm run build 2>&1 | tail -20</automated>
  </verify>
  <done>UI compiles and displays correctly without tier names</done>
</task>

</tasks>

<verification>
- `npm run build` completes without errors
- `npx tsc --noEmit` passes type checking
- No references to `tierName` or `tier.name` remain in codebase
</verification>

<success_criteria>
1. tiers.json contains official Jumper values (thresholds, XP) without name fields
2. Chainoor has exactly 2 tiers (2 chains = 10xp, 9 chains = 30xp)
3. All TypeScript types updated - no tierName fields
4. All functions updated - no tierName logic
5. UI updated - no tier badge display
6. Build passes without errors
</success_criteria>

<output>
After completion, create `.planning/quick/2-update-tiers-json-to-match-official-jump/2-SUMMARY.md`
</output>
