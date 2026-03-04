---
phase: quick-10
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/ui/tooltip.tsx
  - src/components/dashboard/category-row.tsx
autonomous: true
requirements: [QUICK-10]

must_haves:
  truths:
    - "Hovering/tapping category name shows tooltip with explanation"
    - "Tooltip text explains what each category measures"
    - "Works on both desktop (hover) and mobile (tap)"
  artifacts:
    - path: "src/components/ui/tooltip.tsx"
      provides: "Radix-based tooltip component"
      min_lines: 20
    - path: "src/components/dashboard/category-row.tsx"
      provides: "Category row with tooltip integration"
      contains: "TooltipTrigger"
  key_links:
    - from: "src/components/dashboard/category-row.tsx"
      to: "src/config/tiers.json"
      via: "categoryDescriptions map"
      pattern: "categoryDescriptions"
---

<objective>
Add explanatory tooltips to the four XP category names in the dashboard.

Purpose: Help users understand what each category measures (transactions count, USD bridged, USD swapped, chains used).
Output: Category names become hoverable/tappable with tooltip descriptions.
</objective>

<execution_context>
@/Users/ttresse/.claude/get-shit-done/workflows/execute-plan.md
@/Users/ttresse/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/components/dashboard/category-row.tsx
@src/config/tiers.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add shadcn/ui Tooltip component</name>
  <files>src/components/ui/tooltip.tsx</files>
  <action>
Run `npx shadcn@latest add tooltip` to add the Tooltip component.

This will create src/components/ui/tooltip.tsx with:
- TooltipProvider (wrap app or local section)
- Tooltip (container)
- TooltipTrigger (element that triggers tooltip)
- TooltipContent (the popup content)

The project already has radix-ui v1.4.3 so no additional deps needed.
  </action>
  <verify>
    <automated>test -f src/components/ui/tooltip.tsx && grep -q "TooltipContent" src/components/ui/tooltip.tsx && echo "OK"</automated>
  </verify>
  <done>Tooltip component exists in src/components/ui/tooltip.tsx with TooltipProvider, Tooltip, TooltipTrigger, TooltipContent exports.</done>
</task>

<task type="auto">
  <name>Task 2: Integrate tooltips into CategoryRow</name>
  <files>src/components/dashboard/category-row.tsx</files>
  <action>
Update CategoryRow to show tooltip on category name hover/tap:

1. Import tooltip components:
   ```typescript
   import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
   ```

2. Add category descriptions map (matching tiers.json descriptions):
   ```typescript
   const CATEGORY_DESCRIPTIONS: Record<string, string> = {
     transactoor: 'Number of transactions via Jumper',
     bridgoor: 'USD volume bridged across chains',
     swapoor: 'USD volume swapped',
     chainoor: 'Number of unique chains used',
   };
   ```

3. Wrap the category name span in tooltip components:
   ```tsx
   <TooltipProvider delayDuration={100}>
     <Tooltip>
       <TooltipTrigger asChild>
         <span className="font-semibold uppercase text-sm tracking-wide sm:min-w-[100px] cursor-help border-b border-dotted border-muted-foreground/50">
           {category.categoryId}
         </span>
       </TooltipTrigger>
       <TooltipContent>
         <p>{CATEGORY_DESCRIPTIONS[category.categoryId]}</p>
       </TooltipContent>
     </Tooltip>
   </TooltipProvider>
   ```

4. Use `delayDuration={100}` for quick response (not annoying 300ms default).

5. Add visual affordance: `cursor-help` and dotted underline to signal interactivity.

6. Mobile-friendly: Radix tooltips work on touch (tap to open, tap elsewhere to close).
  </action>
  <verify>
    <automated>grep -q "TooltipTrigger" src/components/dashboard/category-row.tsx && grep -q "CATEGORY_DESCRIPTIONS" src/components/dashboard/category-row.tsx && echo "OK"</automated>
    <manual>Run `npm run dev`, hover over category names - tooltip should appear</manual>
  </verify>
  <done>
    - Hovering TRANSACTOOR shows "Number of transactions via Jumper"
    - Hovering BRIDGOOR shows "USD volume bridged across chains"
    - Hovering SWAPOOR shows "USD volume swapped"
    - Hovering CHAINOOR shows "Number of unique chains used"
    - Category names have dotted underline affordance
  </done>
</task>

</tasks>

<verification>
- Build passes: `npm run build`
- Tooltips render on hover without layout shift
- Mobile: tap category name shows tooltip, tap elsewhere dismisses
</verification>

<success_criteria>
All four category names in the dashboard display explanatory tooltips on hover/tap that describe what each category measures.
</success_criteria>

<output>
After completion, create `.planning/quick/10-ajouter-tooltips-explicatifs-sur-les-4-c/10-SUMMARY.md`
</output>
