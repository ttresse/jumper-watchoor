# Phase 1: Foundation & Data Layer - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning (REFONTE - migration Covalent -> LiFi API)

<domain>
## Phase Boundary

Users can input a wallet address and fetch their complete LiFi transaction history via the LiFi Analytics API (`li.quest/v2/analytics/transfers`). This phase replaces the previous Covalent-based multi-chain scanning approach with a single unified API that provides pre-processed transaction data including USD values.

**Key change from previous approach:**
- Before: Scan 60+ chains via Covalent, filter LiFi txs, decode events
- After: Single API call to LiFi Analytics, all data pre-processed

</domain>

<decisions>
## Implementation Decisions

### API Integration
- Use LiFi Analytics API: `GET li.quest/v2/analytics/transfers?wallet={address}`
- Handle cursor-based pagination via `next` token in response
- No API key required (public endpoint)
- Retry failed requests automatically 2-3 times before showing error
- If pagination error occurs mid-load, retry that specific page

### Wallet Input UX
- Single input field that accepts paste or typed address
- Validation feedback displayed inline below the input field
- Scan requires explicit button click (not auto-triggered on valid input)
- Remember last scanned wallet in localStorage, pre-fill on return visits
- Pre-filled address requires user action (click button) to start scan - no auto-scan on page load

### Progress Display
- Show live counter during load: "Loading... 150 transactions found"
- Counter increments as each pagination page is fetched
- Cancel button available during load
- If cancelled, discard all data (no partial results)
- Results appear only after complete load (no streaming preview)

### Error Handling
- Automatic retry (2-3 attempts) before showing error to user
- Error message displayed in place of results area (not toast/banner)
- Clear "Retry" button in error state
- If wallet has no LiFi transactions: simple text message "No LiFi transactions found for this wallet"

### Initial State
- Minimal design: input field + "Jumper Points Tracker" as text title
- No logo, no heavy branding
- No example/demo wallets
- Interface in English

### Claude's Discretion
- Exact retry logic and timing
- Loading spinner/animation alongside counter
- Color palette and typography
- Spacing and layout details
- Input placeholder text wording

</decisions>

<specifics>
## Specific Ideas

- The LiFi Analytics API provides `amountUSD` directly - no need for historical price lookups
- Response includes `sending.chainId` and `receiving.chainId` for bridge/swap classification
- Transaction status available via `status` and `substatus` fields

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-data-layer*
*Context gathered: 2026-03-04*
*Note: This replaces previous Covalent-based context. Existing Phase 1 plans (01-01 through 01-04) need to be regenerated.*
