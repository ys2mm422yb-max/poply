# Poply current status

Updated: 2026-08-15

## Live baseline
`main` includes Place 01 · Café am Meer, Place 02 · Sonnenkai, the Places world-map/revisit slice, four six-tier item families, three generators, three active customer orders, two six-step restoration arcs, persistent 7×7 Board, Energy regeneration, Player XP/Levels, Collection, Storage, fair Daily Goals/Bonus Guest, local save/resume, authored Board/Orders/Place/Sammlung views and mandatory CI + Mobile WebKit + Pages gates.

Start `main` for the current product-automation run: `194d5b150f9fd4912de4e8f74e3842f7308b72a3`.

Milestone B visual quality remains OPEN. Visual/evidence work is isolated in its own PR(s) recorded in Issue #42 and must not be overwritten by product work.

## Completed feature milestones
- E1 Player XP + Level — LIVE.
- E2 Collection Book + discovery — LIVE.
- F1 Storage + Coin expansion — LIVE.
- G Daily Goals + fair Bonus Guest — LIVE via PR #43.
- H first World Map / safe Place revisit slice — LIVE via PR #48.
- K1 replacement-order difficulty bands — LIVE.

## Active product-reliability slice
### F2 — Board recovery via confirmed item recycling — IN PROGRESS
Contract: `docs/STORAGE_SYSTEM.md`.
Branch: `feature/board-recovery-recycling`.
Cross-worker log: GitHub Issue #42.

Why this interrupts Place 03:
- the binding product rules require every full-Board state to remain fairly recoverable;
- Storage alone does not solve the case where both Board and Storage are full;
- this is a core gameplay/reliability gap, so it outranks content expansion.

Current F2 slice:
- normal Board items gain an explicit recycle action inside the existing Lager drawer;
- every destructive recycle requires confirmation;
- generators cannot be recycled;
- exactly one item is removed and a small deterministic tier-based Coin return is granted;
- recycling touches neither Storage nor Energy;
- Board-full + Storage-full states can free one Board cell without save reset or hidden deletion;
- real WebKit flow verifies recycle interaction, persistence and 390×844 / 390×720 layout.

Release gate remaining: exact-head CI + Browser QA, generated screenshot review, fixes if needed, merge, then exact-main CI + Browser QA + canonical Pages deploy.

## Parallel work
- Visual/evidence PR #55 owns real-time merge/discovery/generator effect capture; F2 deliberately avoids those effect files.
- The abandoned branch `feature/place-03-moon-garden` contains no PR and is not an active workstream; the actual product branch is `feature/board-recovery-recycling`.

## Next
1. Finish and release F2 Board recovery.
2. Continue screenshot-driven color/effects production independently.
3. I — Place 03 with genuinely new content/gameplay.
4. J/K — collection depth, achievements and economy/balancing.

## Autonomous-work rule
Issue #42 is mandatory durable memory for manual/product/visual workers. Every substantial release uses a fresh branch, deterministic tests, Mobile WebKit QA, screenshot self-review, exact-head merge gates and exact-main release gates.
