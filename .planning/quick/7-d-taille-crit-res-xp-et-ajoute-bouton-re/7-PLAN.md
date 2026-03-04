---
phase: quick-7
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/how-it-works/page.tsx
  - src/config/tiers.json
autonomous: true
requirements: [QUICK-7]

must_haves:
  truths:
    - "User sees detailed criteria descriptions explaining how each category is calculated"
    - "User can navigate back to tracker from top of page"
    - "Back button at top is prominent and easy to find"
  artifacts:
    - path: "src/app/how-it-works/page.tsx"
      provides: "Enhanced XP explanation page with detailed descriptions and top navigation"
    - path: "src/config/tiers.json"
      provides: "Category descriptions with detailed calculation explanations"
  key_links:
    - from: "src/app/how-it-works/page.tsx"
      to: "/"
      via: "Link component at top of page"
      pattern: "href=\"/\""
---

<objective>
Enhance the How It Works page with more detailed category descriptions and add a back button at the top.

Purpose: Users need clearer explanations of how each XP category is calculated, and easier navigation back to the tracker from the top of the page (not just bottom).

Output: Updated how-it-works page with detailed descriptions and top navigation.
</objective>

<context>
@src/app/how-it-works/page.tsx
@src/config/tiers.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update category descriptions with detailed calculation explanations</name>
  <files>src/config/tiers.json</files>
  <action>
Update the description field for each category in tiers.json to provide more detailed explanations:

- transactoor: "Total number of transactions made through Jumper each month"
- bridgoor: "Total USD value of cross-chain bridges via Jumper each month"
- swapoor: "Total USD value of token swaps via Jumper each month"
- chainoor: "Number of unique source chains used for transactions each month"

These descriptions explain WHAT is measured and that it's calculated monthly.
  </action>
  <verify>cat src/config/tiers.json | grep description</verify>
  <done>Each category has a clear, detailed description explaining the calculation criteria</done>
</task>

<task type="auto">
  <name>Task 2: Add back button at top of page and enhance layout</name>
  <files>src/app/how-it-works/page.tsx</files>
  <action>
Modify the how-it-works page to add a prominent back button at the top:

1. Add a back link at the very top of the page content, BEFORE the header:
   - Use a flex row with items-center
   - Include an arrow icon (← or use ArrowLeft from lucide-react)
   - Text: "Back to tracker"
   - Style: text-sm with hover effect, positioned at top-left

2. Keep the existing back link at the bottom for users who scroll down

3. The top back button should be styled as:
   - Link with arrow: "← Back to tracker"
   - Use text-muted-foreground hover:text-foreground
   - Aligned left (not centered like the bottom one)

Structure:
```
<main>
  <div className="w-full max-w-lg space-y-8">
    {/* Top navigation */}
    <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
      ← Back to tracker
    </Link>

    {/* Header */}
    ...

    {/* Rest of content */}
    ...

    {/* Bottom link - keep existing */}
  </div>
</main>
```
  </action>
  <verify>npm run build 2>&1 | grep -E "(error|Error)" || echo "Build successful"</verify>
  <done>Back button appears at top of page, allowing easy navigation without scrolling</done>
</task>

</tasks>

<verification>
- npm run build passes without errors
- Category descriptions in tiers.json are detailed and explain monthly calculation
- Back link visible at top of how-it-works page
- Page still renders correctly with all category tables
</verification>

<success_criteria>
- Each category description clearly explains what is measured and how
- Back to tracker link present at top of page (in addition to bottom)
- Page builds and renders correctly
</success_criteria>

<output>
After completion, create `.planning/quick/7-d-taille-crit-res-xp-et-ajoute-bouton-re/7-SUMMARY.md`
</output>
