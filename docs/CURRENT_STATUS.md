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
- Player Milestone shelf behind the existing Level badge;
- local save/resume and migration safety;
- mandatory CI + Mobile WebKit + screenshot review + canonical Pages release gates.

Start `main` for the current product-automation run: `6e01b1d5b353bc37566068b9663379678c08f97d`.

Milestone B visual quality remains OPEN globally.

## Active parallel work
### PR #55 — dynamic gameplay FX evidence
Visual/evidence worker scope. Owns dynamic FX capture/workflow/motion files. Product automation must not overlap it.

### PR #58 — Milestone I Place 03 · Dachgarten
Manual product scope. Owns Place03 domain/UI/art integration including `src/aaa-session.js`, `src/v2-game.js`, Collection and Place/Map files. Product automation must not start competing Place03 or touch those active files.

### PR #60 — Orders service-stage lighting
Visual scope. Owns Orders service presentation in `src/aaa-service.css`; product automation does not overlap it.

### Product automation — next-level reward preview
Branch: `feature/level-reward-preview`.
Contract: `docs/PLAYER_MILESTONES.md`.

Scope:
- reuse the existing `LV N` progress sheet rather than adding another menu/tab;
- show next Level, exact XP remaining and the existing deterministic `+100 Coins` Level reward;
- derive everything from canonical `playerXp` and `LEVEL_REWARD_COINS`;
- no save migration, claim state, new currency or duplicated reward schedule;
- deterministic unit coverage and real WebKit fit checks at 390×844 / 390×720;
- opening/closing remains save-neutral.

## Parked / not active
`feature/board-recovery-recycling` and the earlier misnamed `feature/place-03-moon-garden` have no PR and are not active implementation scopes. Board-recovery remains a valid future reliability task, but it must be rebuilt only after the active `aaa-session.js` owner is clear.

## Next product priorities after active PRs land
1. Finish/release the independent next-level reward preview if exact-head QA accepts it.
2. Integrate/verify Place 03 through PR #58 without parallel duplication.
3. Revisit guaranteed Board-full + Storage-full recovery on a fresh post-Place03 branch.
4. Continue deeper Collection/achievement/economy balancing only after current slices are released.

## Durable coordination
GitHub Issue #42 is the mandatory cross-worker work log. Every substantial worker run records exact starting main, branch/PR/head, changed systems, test/run IDs, screenshots actually opened, visual findings, merge/deploy state, blockers and the next free task.
