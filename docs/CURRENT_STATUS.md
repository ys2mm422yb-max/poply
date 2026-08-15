# Poply current status

Updated: 2026-08-15

## Live baseline
Current production baseline on `main` includes:
- persistent 7×7 merge Board / Werkbank;
- Place 01 · Café am Meer and Place 02 · Sonnenkai with six restoration steps each;
- four six-tier item families and three generators;
- three simultaneous customer orders with deterministic replacement difficulty bands;
- Coins, restoration Stars, fair regenerating Energy, Player XP/Levels;
- deterministic next-Level XP + `+100 Coins` reward preview in the existing Level sheet;
- Collection/Discovery, persistent Storage + Coin expansion, Daily Goals + Bonus Guest;
- first Places world-map/revisit slice;
- Player Milestone shelf plus earned cosmetic title ladder (`Neu dabei` through `Poply-Profi`) behind the existing Level badge;
- local save/resume and migration safety;
- mandatory CI + Mobile WebKit + screenshot review + canonical Pages release gates.

Latest released product main from PR #64: `979ab8373378fd90677e1db091d87af6f6816c9b`.

PR #64 release evidence:
- exact PR head `84c63cb68334402e5ce429e41e51dc6cedea3ad2`;
- CI `31853119654` success;
- Browser QA `31853119614` success;
- screenshots opened: `22-player-milestones-390x844.png`, `23-player-milestones-short-safari.png`;
- merged main CI `31856707931` success;
- merged main Browser QA `31856707941` success;
- canonical Pages deploy `31856707943` success.

Milestone B visual quality remains OPEN globally.

## Active parallel work
### PR #55 — dynamic gameplay FX evidence
Visual/evidence worker scope. Owns dynamic FX capture/workflow/motion files. Product automation must not overlap it.

### PR #58 — Milestone I Place 03 · Dachgarten
Manual product scope. Owns Place03 domain/UI/art integration including `src/aaa-session.js`, `src/v2-game.js`, Collection and Place/Map files. Product automation must not start competing Place03 or touch those active files.

### PR #67 — Storage authored material identity
Visual scope. Owns `src/aaa-storage-tray.css` and `tests/aaa-storage-ui.test.js`.

### PR #68 — Daily reward identities
Visual scope. Owns `src/aaa-daily.css` and `tests/aaa-daily.test.js`.

### PR #66 — shell QA documentation follow-up
Documentation-only visual release record; no product/runtime scope.

## Newly completed product progression
### Next-level reward preview — LIVE
The Level sheet now answers the immediate motivation question with target Level, exact XP remaining and the existing deterministic `+100 Coins` reward. No new save field, claim flow or duplicate reward schedule.

### Cosmetic player titles — LIVE via PR #64
Milestone completion now visibly changes player identity through a derived six-step title ladder. No title inventory, new currency, grind loop or migration is introduced.

## Parked / not active
`feature/board-recovery-recycling` and the earlier misnamed `feature/place-03-moon-garden` have no PR and are not active implementation scopes. Board-recovery remains a valid future reliability task, but it must be rebuilt only after the active `aaa-session.js` owner is clear.

## Next product priorities after active ownership clears
1. Integrate/verify Place 03 through PR #58 without parallel duplication.
2. Rebuild guaranteed Board-full + Storage-full recovery from the then-current `main` after Place03/session ownership clears.
3. Continue deeper Collection/guest/Place achievement depth and economy/configuration work without creating a disconnected profile dashboard.

## Durable coordination
GitHub Issue #42 is the mandatory cross-worker work log. Every substantial worker run records exact starting main, branch/PR/head, changed systems, test/run IDs, screenshots actually opened, visual findings, merge/deploy state, blockers and the next free task.
