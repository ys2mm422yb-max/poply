# Poply current status

Updated: 2026-08-15

## Live baseline
Current production `main` is a persistent merge-and-build game with:
- persistent 7×7 merge Board / Werkbank;
- Place 01 · Café am Meer and Place 02 · Sonnenkai with visible restoration progression;
- multiple six-tier item families and generators;
- three simultaneous customer orders with deterministic replacement difficulty bands;
- Coins, restoration Stars, fair regenerating Energy and Player XP/Levels;
- Collection/Discovery, persistent Storage + Coin expansion, Daily Goals + Bonus Guest;
- first Places world-map/revisit slice;
- Player milestone/title/reward-preview progression surfaces;
- local save/resume and migration safety;
- mandatory CI + Mobile WebKit + screenshot review + canonical Pages release gates.

Milestone B visual quality remains open globally and continues independently through screenshot-first visual PRs.

## Current product-automation slice — guaranteed full-board recovery
Start `main`: `6874efb534dd5539bb93703b0de4fc196f251328`.
Branch: `feature/storage-recycling-recovery`.

Player problem:
Storage normally relieves Board pressure, but the binding product rules require a fair escape when **both Board and Storage are completely full**. Previously the player could reach a deadlock with no legal way to create a Board vacancy.

Current implementation contract:
- Recycling is an explicit Storage mode, never hidden deletion.
- The player deliberately selects the stored item to recycle.
- The exact Coin return is visible before removal and deterministic by item tier.
- Only the selected stored item is removed; Board contents are untouched by recycling itself.
- Recycling frees one Storage slot; moving a chosen Board item into that slot then creates exactly one playable Board vacancy.
- The recovered state and Coin reward must persist after reload.
- No ads, purchase, new currency, random loss, forced item choice or generator recycling.
- Deterministic domain tests plus real Storage WebKit QA cover the full Board + full Storage path at 390×844 and 390×720.

## Coordination
GitHub Issue #42 is the durable cross-worker work log.

Current non-overlap facts at this slice start:
- former Place03 PR #58 is closed and unmerged, so its previous `aaa-session.js`/game ownership is released;
- visual Collection material work landed independently after this branch was created and does not touch the Storage/session files in this slice;
- open PR #66 is documentation-only shell-chrome history and does not overlap this work.

## Place 03
PR #58 (`Milestone I: Place 03 Dachgarten`) was closed unmerged on 2026-08-15. Place 03 remains future product work; no autonomous worker should assume that draft branch is part of the live baseline.

## Next product priorities
1. Complete/release guaranteed Board-full + Storage-full recovery if exact-head tests and screenshots accept it.
2. Re-read current `main` and open ownership after release.
3. Re-plan Place 03 from then-current `main` rather than reviving the stale closed draft wholesale.
4. Continue deeper Collection/achievement/economy balancing without disconnected dashboard systems.

## Durable coordination rule
Every substantial worker run records in Issue #42: exact starting main, branch/PR/head, changed systems, test/run IDs, screenshots actually opened, visible findings, merge/deploy state, blockers and next free task.
