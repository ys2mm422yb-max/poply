# Poply current status

Updated: 2026-08-15

## Live baseline
Current production baseline on `main` includes:
- persistent 7×7 merge Board / Werkbank;
- Place 01 · Café am Meer and Place 02 · Sonnenkai with six restoration steps each;
- four six-tier item families and three generators;
- three simultaneous customer orders with deterministic replacement difficulty bands;
- Coins, restoration Stars, fair regenerating Energy, Player XP/Levels;
- Collection/Discovery, persistent Storage + Coin expansion, Daily Goals + Bonus Guest;
- first Places world-map/revisit slice;
- local save/resume and migration safety;
- mandatory CI + Mobile WebKit + screenshot review + canonical Pages release gates.

Start `main` for the current product-automation run: `194d5b150f9fd4912de4e8f74e3842f7308b72a3`.

Milestone B visual quality remains OPEN globally.

## Active parallel work
### PR #55 — dynamic gameplay FX evidence
Visual/evidence worker scope. Owns dynamic FX capture/workflow/motion files. Product automation must not overlap it.

### PR #58 — Milestone I Place 03 · Dachgarten
Manual product scope. Currently owns Place03 domain/UI/art integration including `src/aaa-session.js`, `src/v2-game.js`, Collection and Place/Map files. Product automation must not start competing Place03 or touch those active files.

### Product automation — Player Milestone shelf
Branch: `feature/progression-milestones`.
Contract: `docs/PLAYER_MILESTONES.md`.

This slice was selected only after collision checking found that the initially investigated Board-recovery implementation would overlap PR #58 through `src/aaa-session.js`.

Scope:
- existing `LV N` badge becomes an intentional progress entry point;
- compact overlay shows five long-term milestones derived from existing persistent progress;
- no new currency, tab, claim state or duplicate achievement save data;
- Level completion derives from canonical `playerXp` rather than a second stored level field;
- deterministic tests and real WebKit progression QA cover interaction and 390×844 / 390×720 layout.

## Parked / not active
`feature/board-recovery-recycling` and the earlier misnamed `feature/place-03-moon-garden` have no PR and are not active implementation scopes. Board-recovery remains a valid future reliability task, but it must be rebased/rebuilt only after the active `aaa-session.js` owner is clear.

## Next product priorities after active PRs land
1. Finish/release the independent Player Milestone shelf if exact-head QA accepts it.
2. Integrate/verify Place 03 through PR #58 without parallel duplication.
3. Revisit guaranteed Board-full + Storage-full recovery on a fresh post-Place03 branch.
4. Continue deeper Collection/achievement/economy balancing only after current slices are released.

## Durable coordination
GitHub Issue #42 is the mandatory cross-worker work log. Every substantial worker run records exact starting main, branch/PR/head, changed systems, test/run IDs, screenshots actually opened, visual findings, merge/deploy state, blockers and the next free task.
