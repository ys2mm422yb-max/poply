# Poply current status

Updated: 2026-08-14

## Live baseline
`main` currently includes:
- Place 01 · Café am Meer;
- playable Place 02 · Sonnenkai;
- four six-tier item families and three generators;
- three active customer orders;
- two six-step restoration arcs;
- persistent 7×7 merge board;
- automatic fair energy regeneration: 40 max, +1 every 2 minutes below cap, including offline time;
- visible energy countdown in the HUD;
- local save/resume + migrations;
- authored Board / Orders / Place views;
- sound, haptics, merge/delivery/reward/restoration feedback;
- CI + Mobile WebKit Browser QA + canonical Pages release gates.

The energy defect is fixed and live. Milestone B visual quality remains OPEN: the current product is substantially more coherent, but it is not being claimed as final AAA-casual visual quality.

## Product phase
Poply now moves from **vertical-slice foundation** into **feature depth and long-term progression**.

Binding feature-growth roadmap:
`docs/FEATURE_ROADMAP.md`

Existing rebuild/quality contract:
`docs/AAA_REBUILD_PLAN.md`

Energy contract:
`docs/ENERGY_SYSTEM.md`

## Next implementation milestone
### Milestone E1 — Player XP + Level system
Goal: meaningful play must advance a persistent player-level track beyond the current Place/order.

Planned first slice:
- persistent XP + player level in the existing save;
- XP from customer orders and restoration milestones;
- visible level progress without overcrowding the Board screen;
- level-up reward moment;
- deterministic migration and tests;
- Browser-QA coverage + self-reviewed phone screenshots;
- architecture prepared for Collection Book unlocks in E2.

## Following milestones
1. E2 — Collection Book + item discovery rewards.
2. F1 — Storage tray + first meaningful Coin sink.
3. G — Daily goals / fair return loop.
4. H — World map / Place selector.
5. I — Place 03 with genuinely new gameplay/content.

## Product tracks
1. **Production-quality track** — continue world, order, board, animation and art quality toward premium commercial casual-game presentation.
2. **Playable-growth track** — add real systems and long-term progression rather than repeatedly restyling the same screens.
3. **Clarity/fairness track** — every currency, timer, unlock and limitation must visibly explain how it works.

## Execution rule
Real gameplay/save/UX bugs take priority. Otherwise implement the highest-priority unfinished item in `docs/FEATURE_ROADMAP.md`. Every non-trivial release uses a fresh branch, deterministic tests, Mobile WebKit QA, screenshot self-review, exact-head PR checks and exact-main CI/Browser-QA/Pages deployment.
