# Poply current status

Updated: 2026-08-14

## Live baseline
`main` includes Place 01 · Café am Meer, Place 02 · Sonnenkai, four six-tier item families, three generators, three active customer orders, two six-step restoration arcs, persistent 7×7 Board, Energy regeneration, Player XP/Levels, Collection, Storage, fair Daily Goals/Bonus Guest, local save/resume, authored Board/Orders/Place/Sammlung views and mandatory CI + Mobile WebKit + Pages gates.

Latest live `main` at H branch start: `f70758051bfd87fa9ae0a3d2d87b34880652d477`.

Milestone B visual quality remains OPEN. Manual visual work currently owns the Board/reward FX files recorded in Issue #42.

## Completed feature milestones
- E1 Player XP + Level — LIVE.
- E2 Collection Book + discovery — LIVE.
- F1 Storage + Coin expansion — LIVE.
- G Daily Goals + fair Bonus Guest — LIVE via PR #43.
- K1 replacement-order difficulty bands — LIVE on `f707580…`.

## Active implementation milestone
### H — World map / Place selector — IN PROGRESS
Contract: `docs/WORLD_MAP.md`.
Branch: `feature/world-map-selector-v2`.
Cross-worker log: GitHub Issue #42.

Current H slice:
- authored Places map entry inside Place rather than a new primary tab;
- known Places show current/completed/locked state and independent restoration progress;
- completed Café am Meer remains revisitable after Sonnenkai unlocks;
- selected Place renders an existing authored scene preview at that Place's own restoration stage;
- map visits do not mutate Board, Orders, currencies or meta progress;
- deterministic model tests + real Mobile WebKit QA at 390×844 and 390×720.

Release gate remaining: exact-head CI + Browser QA, generated screenshot review, fixes if needed, merge, then exact-main CI + Browser QA + canonical Pages deploy.

## Parallel work
- Manual worker: `visual/color-fx-production-1` owns Board/color/reward FX files until terminal handoff.
- H avoids those files and no longer overlaps the order-balancing work already merged into main.

## Next
1. Finish H first map/revisit slice.
2. Continue screenshot-driven color/effects production in parallel.
3. Define active-Place gameplay switching only if it can preserve orders/generators/progress safely.
4. I — Place 03.

## Autonomous-work rule
Issue #42 is mandatory durable memory for manual/product/visual workers. Every substantial release uses a fresh branch, deterministic tests, Mobile WebKit QA, screenshot self-review, exact-head merge gates and exact-main release gates.
