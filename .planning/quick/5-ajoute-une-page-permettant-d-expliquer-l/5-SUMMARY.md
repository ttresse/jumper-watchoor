---
phase: quick-5
plan: 01
subsystem: documentation
tags: [ui, explanation, xp]
key-files:
  created:
    - src/app/how-it-works/page.tsx
  modified:
    - src/app/page.tsx
decisions:
  - Static page (no 'use client') for better performance
  - Import tiers.json directly for accurate values
  - Format thresholds nicely ($100, $1K, $10K, $500K)
  - Consistent link styling with existing "Scan a different wallet" link
metrics:
  duration: 1 min
  completed: 2026-03-04
---

# Quick Task 5: How It Works Page Summary

Added a simple, concise page explaining how Jumper XP is calculated with four category sections and tier tables.

## Commits

| Commit | Message |
|--------|---------|
| 2b6ecb9 | feat(quick-5): create How It Works page explaining XP calculation |
| 49935bf | feat(quick-5): add How does XP work link to main page |

## What Was Built

### /how-it-works Page (`src/app/how-it-works/page.tsx`)

- **Title:** "How XP Works"
- **Intro:** "Jumper rewards you with XP each month based on your activity"
- **Four category sections:** Transactoor, Bridgoor, Swapoor, Chainoor
- Each section shows:
  - Category name and description
  - Tier table with thresholds and XP values
- **Notes:** Monthly calculation, Jumper-only transactions
- **Back link:** Returns to main tracker

### Main Page Link (`src/app/page.tsx`)

- Added "How does XP work?" link below tagline
- Visible when no wallet is selected
- Styled consistently with existing links

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- [x] src/app/how-it-works/page.tsx exists (102 lines)
- [x] src/app/page.tsx contains "how-it-works" link
- [x] Commit 2b6ecb9 exists
- [x] Commit 49935bf exists
- [x] Build passes
