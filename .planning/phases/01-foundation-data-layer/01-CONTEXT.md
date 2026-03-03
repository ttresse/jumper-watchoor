# Phase 1: Foundation & Data Layer - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can input a wallet address and see multi-chain scanning progress across 60+ chains. This phase delivers wallet input with validation, parallel chain scanning with rate limiting (4 RPS), and progressive loading UI. Transaction classification, points calculation, and full dashboard are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Wallet Input UX
- Single input field that accepts paste or typed address
- Auto-validate when input reaches 42 characters (full EVM address length)
- Inline validation feedback displayed below the input field
- Scan starts automatically when address is valid — no button click required
- Remember last scanned wallet in localStorage, pre-fill on return visits
- Pre-filled address requires user action (click/enter) to start scan — no auto-scan on page load

### Progress Display
- Single progress bar with counter: "Scanning... 24/60 chains"
- As chains with transactions are found, show per-chain results below progress bar: "Arbitrum: 3 txns", "Optimism: 7 txns"
- Cancel button available during scan — user can abort and see partial results or start over

### Error Handling
- Silent skip failed chains during scan, continue with remaining chains
- Show collapsible warning banner at end: "3 chains failed" with expand to see which chains + retry button
- Partial results are usable — user can view what was fetched and retry failed chains separately
- If ALL chains fail (network down, API issue): full-screen error with clear explanation + prominent retry button

### Initial State
- Minimal design: input field + brief tagline "Enter wallet to see your Jumper points"
- No demo/example wallets — require user's own address
- App name "Jumper Points Tracker" as text only — no heavy branding or logo

### Claude's Discretion
- Exact progress bar styling and animation
- Tagline wording refinement
- Color palette and typography
- Spacing and layout details

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-data-layer*
*Context gathered: 2026-03-03*
