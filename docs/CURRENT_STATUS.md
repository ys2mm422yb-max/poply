# Poply current status

Updated: 2026-08-14

## Live baseline before PR #37 merge
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

Milestone B visual quality remains OPEN: the current product is substantially more coherent, but it is not being claimed as final AAA-casual visual quality.

## Product phase
Poply is in **feature depth and long-term progression** while production-quality work continues in parallel.

Binding feature-growth roadmap:
`docs/FEATURE_ROADMAP.md`

Existing rebuild/quality contract:
`docs/AAA_REBUILD_PLAN.md`

## Milestone E1 — Player XP + Level system — ACCEPTED ON PR HEAD
Binding contract:
`docs/PLAYER_PROGRESSION.md`

Screenshot acceptance:
`docs/SCREENSHOT_QA_2026-08-14_PLAYER_PROGRESSION.md`

Accepted implementation:
- persistent lifetime `playerXp` in the existing save;
- fair migration for existing players using completed orders/restorations without deleting value;
- deterministic growing level curve;
- XP from delivered customer orders with difficulty scaling;
- XP from completed restorations and bonus XP for a new-Place unlock;
- +100 Coin reward for every crossed player level;
- compact `LV N` HUD badge + non-layout-growing XP rail;
- short XP gain feedback and sequenced level-up reward reveal;
- level-up state persists and reveal does not replay on reload;
- deterministic unit tests;
- real Mobile WebKit order and restoration level-up flows;
- screenshot review rejected the first overlapping/faded reward presentation and accepted the corrected sequence.

Release gate remaining:
- exact final PR head CI + Browser QA;
- merge;
- exact merged-main CI + Browser QA + Pages deploy.

## Next implementation milestone
### E2 — Collection Book + discovery rewards
Goal: every new item tier, generator and Place becomes a persistent discovery instead of disappearing into the board loop.

Planned first slice:
- persist discovered family+tier entries in the existing save;
- backfill discoveries fairly from current board/progression without revealing items the player never reached;
- first-time tier creation produces one discovery event and XP/reward using the E1 progression system;
- authored Collection view with silhouettes for undiscovered tiers;
- generator and Place discovery records;
- real navigation only when the Collection view is implemented;
- reload/migration tests + Mobile WebKit discovery QA + screenshot review.

## Following milestones
1. F1 — Storage tray + first meaningful Coin sink.
2. G — Daily goals / fair return loop.
3. H — World map / Place selector.
4. I — Place 03 with genuinely new gameplay/content.

## Product tracks
1. **Production-quality track** — continue world, order, board, animation and art quality toward premium commercial casual-game presentation.
2. **Playable-growth track** — add real systems and long-term progression rather than repeatedly restyling the same screens.
3. **Clarity/fairness track** — every currency, timer, unlock and limitation must visibly explain how it works.

## Execution rule
Real gameplay/save/UX bugs take priority. Otherwise implement the highest-priority unfinished item in `docs/FEATURE_ROADMAP.md`. Every non-trivial release uses a fresh branch, deterministic tests, Mobile WebKit QA, screenshot self-review, exact-head PR checks and exact-main CI/Browser-QA/Pages deployment.
