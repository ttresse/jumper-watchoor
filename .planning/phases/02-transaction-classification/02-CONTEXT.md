# Phase 2: Transaction Classification - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Parse LiFi transactions to identify bridge vs swap, verify completion status, and aggregate by month. Users can see their LiFi transactions classified as bridges or swaps with monthly aggregation. This phase transforms raw transaction data into classified, aggregated data that Phase 3 uses for XP calculation.

</domain>

<decisions>
## Implementation Decisions

### Classification Logic
- Compare source chain ID to destination chain ID from decoded LiFi contract events
- Different chain IDs = bridge, same chain ID = swap
- If destination chain ID is missing or unavailable, treat as swap (conservative approach)
- Decode LiFi contract event logs to get accurate source/destination chain IDs
- CHAINOOR tracking: count source chain only (not destination from bridges)

### Status Verification
- Use Covalent's `tx_succeeded` field to detect failed/reverted transactions
- Trust source transaction success only — no cross-chain verification for bridge destinations
- Exclude zero-value transactions (gas-only, failed calls with no token movement)
- Failed/reverted transactions do not count toward TRANSACTOOR

### Monthly Boundaries
- Use UTC timezone for all transaction bucketing
- Mark current (partial) month as "In Progress" to distinguish from completed months
- Limit aggregation to last 12 months of history
- Show all months in the 12-month range, including months with zero activity

### Output Structure
- Store both original raw transaction data and derived classification fields
- Monthly aggregates organized as Map keyed by YYYY-MM format (fast lookup)
- Classification runs after all chains complete scanning (not streaming/progressive)
- Track classification errors: store list of transactions that couldn't be parsed

### Claude's Discretion
- Exact LiFi event ABI and parsing implementation
- Error handling for malformed event data
- Memory optimization for large transaction sets
- Internal data structure for tracking classification state

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

*Phase: 02-transaction-classification*
*Context gathered: 2026-03-04*
