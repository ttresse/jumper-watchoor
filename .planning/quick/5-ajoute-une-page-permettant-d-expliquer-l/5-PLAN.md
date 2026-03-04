---
phase: quick-5
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/how-it-works/page.tsx
  - src/app/page.tsx
autonomous: true
requirements: [QUICK-5]

must_haves:
  truths:
    - "User can navigate to /how-it-works page"
    - "User can see explanation of XP categories (Transactoor, Bridgoor, Swapoor, Chainoor)"
    - "User can see tier thresholds and XP values for each category"
    - "User can return to main page from explanation page"
  artifacts:
    - path: "src/app/how-it-works/page.tsx"
      provides: "XP calculation explanation page"
      min_lines: 40
  key_links:
    - from: "src/app/page.tsx"
      to: "/how-it-works"
      via: "Link component"
      pattern: "href.*how-it-works"
---

<objective>
Create a simple, concise page explaining how Jumper XP is calculated.

Purpose: Users can understand the four XP categories and their tier thresholds.
Output: New /how-it-works route with clear XP breakdown.
</objective>

<context>
@src/config/tiers.json — Current tier configuration (thresholds and XP values)
@src/app/page.tsx — Main page where link will be added
@src/app/layout.tsx — Root layout structure
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create How It Works page</name>
  <files>src/app/how-it-works/page.tsx</files>
  <action>
Create a new page at src/app/how-it-works/page.tsx that explains XP calculation.

Structure (simple and concise per user request):
1. Title: "How XP Works"
2. Brief intro: "Jumper rewards you with XP each month based on your activity"
3. Four category sections, each showing:
   - Category name (Transactoor, Bridgoor, Swapoor, Chainoor)
   - What it measures (transactions, bridge volume, swap volume, chains)
   - Tier table with thresholds and XP values from tiers.json

Use existing Tailwind classes from the project (muted-foreground, card styles).
Import tiers data from @/config/tiers.json for accurate values.
Add a "Back to tracker" link at the bottom.

Keep it static (no 'use client' needed) for better performance.
Use simple table or grid layout for tier display.
Format USD thresholds nicely ($100, $1K, $10K, $500K).
  </action>
  <verify>
    <automated>cd /Users/ttresse/Projects/freelance/jumper-watcher && npm run build 2>&1 | head -30</automated>
    <manual>Visit /how-it-works and verify content displays correctly</manual>
  </verify>
  <done>Page renders with all four XP categories and their tier tables</done>
</task>

<task type="auto">
  <name>Task 2: Add link from main page</name>
  <files>src/app/page.tsx</files>
  <action>
Add a "How does XP work?" link to the main page.

Position: In the header area, below the tagline, visible when no wallet is selected.
Use Next.js Link component.
Style: text-sm text-muted-foreground hover:text-foreground underline (same as existing "Scan a different wallet" link).

Import Link from 'next/link'.
  </action>
  <verify>
    <automated>cd /Users/ttresse/Projects/freelance/jumper-watcher && npm run build 2>&1 | head -30</automated>
    <manual>Visit / and verify link appears, clicking navigates to /how-it-works</manual>
  </verify>
  <done>Main page shows "How does XP work?" link that navigates to /how-it-works</done>
</task>

</tasks>

<verification>
- Build passes: `npm run build`
- Both pages render without errors
- Navigation works in both directions
</verification>

<success_criteria>
- /how-it-works page displays all four XP categories with tier tables
- Main page has visible link to explanation page
- Content is simple and concise (not overwhelming)
</success_criteria>

<output>
After completion, create `.planning/quick/5-ajoute-une-page-permettant-d-expliquer-l/5-SUMMARY.md`
</output>
