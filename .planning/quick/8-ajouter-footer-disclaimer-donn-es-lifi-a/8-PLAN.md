---
phase: quick-8
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/footer.tsx
  - src/app/layout.tsx
autonomous: true
requirements: [QUICK-8]
must_haves:
  truths:
    - "Footer is visible only when user scrolls to bottom of page"
    - "Footer displays 'Data from LiFi API' disclaimer"
    - "Footer displays 'Unofficial Jumper application' disclaimer"
    - "Footer styling is subtle/muted (not prominent)"
  artifacts:
    - path: "src/components/footer.tsx"
      provides: "Footer component with disclaimers"
      min_lines: 10
    - path: "src/app/layout.tsx"
      provides: "Root layout including footer"
      contains: "Footer"
  key_links:
    - from: "src/app/layout.tsx"
      to: "src/components/footer.tsx"
      via: "import and render"
      pattern: "import.*Footer"
---

<objective>
Add a footer with disclaimer information stating data source (LiFi API) and unofficial status.

Purpose: Legal/transparency disclaimer required for unofficial applications using third-party APIs
Output: Footer component visible when scrolling to bottom on all pages
</objective>

<execution_context>
@/Users/ttresse/.claude/get-shit-done/workflows/execute-plan.md
@/Users/ttresse/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/app/layout.tsx
@src/app/page.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Footer component with disclaimers</name>
  <files>src/components/footer.tsx</files>
  <action>
Create a simple Footer component:
- Use muted styling: text-muted-foreground, text-xs or text-sm
- Center-align the content
- Two lines of text:
  1. "Data provided by LiFi API"
  2. "This is an unofficial Jumper application"
- Add subtle separator (border-top or spacing) to distinguish from content
- Use semantic HTML: footer element
- Add padding for comfortable spacing (py-4 or py-6)
- Do NOT use fixed/sticky positioning - footer flows naturally with document
  </action>
  <verify>
    <automated>npx tsc --noEmit src/components/footer.tsx</automated>
  </verify>
  <done>Footer component exists with both disclaimer texts using muted styling</done>
</task>

<task type="auto">
  <name>Task 2: Add Footer to root layout</name>
  <files>src/app/layout.tsx</files>
  <action>
Modify layout.tsx:
- Import Footer from '@/components/footer'
- Add Footer AFTER Providers children in body
- Ensure layout structure allows footer to stay at bottom:
  - Wrap content in flex container: body gets flex flex-col min-h-screen
  - Children div gets flex-1 to push footer to bottom when content is short
  - Footer stays at natural bottom (not fixed)
  </action>
  <verify>
    <automated>npm run build 2>&1 | head -20</automated>
  </verify>
  <done>Footer renders on all pages, visible when scrolling to bottom</done>
</task>

</tasks>

<verification>
1. Run `npm run dev` and visit http://localhost:3000
2. Scroll to bottom - footer should be visible
3. Footer shows both disclaimer texts
4. Footer styling is subtle (muted colors, small text)
5. Visit /how-it-works - footer also appears
</verification>

<success_criteria>
- Footer component created with both disclaimers
- Footer renders on all pages via layout.tsx
- Footer is not sticky/fixed - only visible when scrolling
- Text is muted/subtle (disclaimer style)
- Build passes without errors
</success_criteria>

<output>
After completion, create `.planning/quick/8-ajouter-footer-disclaimer-donn-es-lifi-a/8-SUMMARY.md`
</output>
