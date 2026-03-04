---
phase: quick-7
plan: 01
subsystem: documentation
tags: [how-it-works, ux, navigation]
dependency-graph:
  requires: []
  provides: [detailed-category-descriptions, top-navigation]
  affects: [how-it-works-page]
tech-stack:
  added: []
  patterns: [static-page, html-entity-arrow]
key-files:
  created: []
  modified:
    - src/config/tiers.json
    - src/app/how-it-works/page.tsx
decisions:
  - Use HTML entity &larr; for left arrow (consistent with web standards)
  - Keep bottom link for scroll-down users
metrics:
  duration: 1 min
  completed: 2026-03-04T21:18:46Z
---

# Quick Task 7: Detailed Category Descriptions and Top Back Button

Enhanced How It Works page with detailed category calculation explanations and added top navigation back button for easier UX.

## Changes Made

### Task 1: Updated Category Descriptions (511001a)

Updated `src/config/tiers.json` with detailed descriptions explaining how each category is calculated:

| Category | Old Description | New Description |
|----------|----------------|-----------------|
| Transactoor | Transaction count | Total number of transactions made through Jumper each month |
| Bridgoor | Bridge volume in USD | Total USD value of cross-chain bridges via Jumper each month |
| Swapoor | Swap volume in USD | Total USD value of token swaps via Jumper each month |
| Chainoor | Unique chains used | Number of unique source chains used for transactions each month |

### Task 2: Added Top Back Button (3f0bdb7)

Modified `src/app/how-it-works/page.tsx` to add a back link at the top:

```tsx
{/* Top navigation */}
<Link
  href="/"
  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
>
  &larr; Back to tracker
</Link>
```

- Left-aligned at page top for immediate visibility
- Uses muted foreground with hover effect
- Existing bottom link preserved for scroll-down users

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- [x] npm run build passes without errors
- [x] Category descriptions in tiers.json are detailed and explain monthly calculation
- [x] Back link visible at top of how-it-works page
- [x] Page still renders correctly with all category tables

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 511001a | feat(quick-7): add detailed category descriptions explaining calculation criteria |
| 2 | 3f0bdb7 | feat(quick-7): add back button at top of how-it-works page |

## Self-Check: PASSED

- [x] src/config/tiers.json exists with updated descriptions
- [x] src/app/how-it-works/page.tsx exists with top navigation
- [x] Commit 511001a exists
- [x] Commit 3f0bdb7 exists
