# Werkbank-Tausch

Status: Arbeitsblock 2 candidate · Issue #148.

## Player problem

The Board already supports production, merging, Storage, Recycling, Merge Flow and order guidance. Those systems do not provide a bounded way to correct an inconvenient mix of **already known** item families. The Werkbank-Tausch adds that one inventory decision without becoming another reward economy or permanent dashboard.

## Rule

- One trade becomes ready after **3 successful normal order deliveries**.
- Readiness does not stack. Extra services while ready do not bank another charge.
- Daily Bonus Guest deliveries do not progress this cadence.
- A ready trade converts one normal Board item into another family **at exactly the same tier**.
- The destination family/tier must already be discovered in the Collection.
- The source family itself is not a target and generators are never eligible.
- The item stays in the same Board cell. Board occupancy does not change.
- No Energy, Coins, Stars, XP, discovery or mastery reward is produced by the trade.
- After a successful trade the charge is consumed and the next 3-service cadence begins at 0.

This is deterministic. There is no timer, random target, new currency, streak loss or hidden difficulty adjustment.

## Save compatibility

`ensureBoardTradeState()` adds `boardTradeState` lazily to existing saves with:

```js
{ serviceProgress: 0, ready: false, uses: 0 }
```

Old `stats.orders` values are intentionally ignored, so upgrading an existing save never creates a retroactive free trade. No save-version bump is required because the state is additive and normalized on load.

## Mobile UI contract

The charging state adds no permanent Board panel. Only when a usable trade is ready does a compact `↔ TAUSCH` action appear in the existing Werkbank title line.

Starting the action:
1. highlights only Board items with at least one legal already-discovered same-tier destination;
2. temporarily disables normal Board drag for the explicit selection mode;
3. opens a compact modal sheet after source selection;
4. lists only legal target families with the same-tier item name/art;
5. allows cancel/Escape without consuming the charge.

Outside explicit trade mode, drag, generator taps and Item Guidance retain their existing behavior.

## QA contract

`tests/aaa-board-trade.test.js` covers normalization, 3-service cadence, non-stacking readiness, discovered-target eligibility, generator rejection, exact 1:1 transformation and resource invariance.

`scripts/board-trade-qa.mjs` is part of mandatory Browser QA and exercises 390×844 and 390×720 with physical-iPhone safe insets:
- ready action;
- legal source highlighting;
- target sheet and discovery gate;
- real same-tier swap;
- charge consumption;
- reload persistence;
- no page scroll or dock overlap.

Canonical screenshots are `320-board-trade-source-*`, `321-board-trade-targets-*` and `322-board-trade-complete-*`. They must be opened and reviewed on the accepted exact PR head before merge.

No Neon/backend dependency is introduced.
