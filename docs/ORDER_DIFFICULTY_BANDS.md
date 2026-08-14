# Poply — Order difficulty bands

Date: 2026-08-14
Status: implementation candidate

## Player problem
Order replacement previously used the global `orderSequence` directly against a chapter's full template list. That was deterministic, but it could make a newly unlocked Place inherit a large sequence number from the previous Place and immediately rotate into a high-tier request. The result was technically valid but could create an avoidable production wall exactly when a new Place should feel welcoming.

## Rule
Replacement orders are now selected from a difficulty band driven by **visible restoration progress inside the current Place**.

### Café am Meer
- 0–1 restorations: `starter` — only tier-2 single-family requests.
- 2–3 restorations: `growing` — introduces tier-3/4 combinations.
- 4–6 restorations: `established` — deeper tier-3 through tier-6 combinations may appear.

### Sonnenkai
- 0–1 restorations: `starter` — Limettenpause / Sunset Smoothie range only.
- 2–3 restorations: `growing` — Deck-Brunch / Tropenabend enter rotation.
- 4–6 restorations: `established` — high-tier Golden Hour / Poply Paradise can enter rotation.

The global sequence still gives deterministic variety inside the active band. It no longer controls whether a freshly unlocked Place is allowed to jump straight into its hardest requests.

## Invariants
- Existing active orders are never rewritten by migration or normalization.
- Fulfillment still consumes exactly the requested items only after every requirement is satisfied.
- Coin and Star payouts of each template are unchanged.
- No hidden dynamic difficulty, loss rigging or purchase pressure is introduced.
- Difficulty is based only on visible Place restoration progress and is deterministic/testable.

## Tests
`tests/order-balance.test.js` covers:
- beginner Coast orders remain low-tier;
- Coast bands advance with restoration progress;
- a fresh Sonnenkai cannot inherit a late Coast sequence into a tier-5/6 wall;
- later Sonnenkai restoration unlocks deeper requests;
- fulfillment preserves exact consumption and rewards while using the appropriate replacement band.

## Follow-up
This is an isolated Milestone-K balancing improvement pulled forward while Milestone-G Daily work owns the shared session/UI files. Milestone H World Map / Place Selector remains the next larger product feature once the shared-file collision is clear.
