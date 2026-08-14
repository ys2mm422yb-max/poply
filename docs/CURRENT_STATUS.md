# Poply current status

Updated: 2026-08-14

## Live baseline before PR #38 merge
`main` currently includes:
- Place 01 · Café am Meer and Place 02 · Sonnenkai;
- four six-tier item families and three generators;
- three active customer orders and two six-step restoration arcs;
- persistent 7×7 merge board;
- fair automatic energy regeneration with visible countdown;
- persistent Player XP + Level system with fair existing-save migration;
- XP from orders/restorations, +100 Coin level rewards and sequenced level-up presentation;
- local save/resume + migrations;
- authored Board / Orders / Place views;
- sound, haptics, merge/delivery/reward/restoration feedback;
- CI + Mobile WebKit Browser QA + canonical Pages release gates.

Milestone B visual quality remains OPEN: Poply is materially larger and more coherent, but final AAA-casual presentation quality is not being claimed yet.

## Completed feature milestones
### E1 — Player XP + Level system — LIVE
Contract: `docs/PLAYER_PROGRESSION.md`
Screenshot QA: `docs/SCREENSHOT_QA_2026-08-14_PLAYER_PROGRESSION.md`

### E2 — Collection Book + discovery rewards — ACCEPTED ON PR HEAD
Contract: `docs/COLLECTION_BOOK.md`
Screenshot QA: `docs/SCREENSHOT_QA_2026-08-14_COLLECTION.md`

Accepted E2 behavior:
- persistent stable discovery keys for item tiers, generators and Places;
- fair save migration that backfills only demonstrated content and never requested-but-unbuilt order tiers;
- runtime discovery separated from migration so a genuinely new tier pays exactly once;
- first-discovery XP uses the existing Player Level system;
- authored `NEU ENTDECKT` reward with item/tier/XP;
- discovery reward completes before any Level-Up reward on the same action;
- real fourth `Sammlung` main navigation destination;
- 24-tier Collection Book across four families;
- known tiers use authored art/name, future tiers remain silhouettes with `???`;
- compact Place/generator discoveries;
- 390×844 and 390×720 Collection layouts fit without document scrolling;
- real pointer-merge WebKit QA verifies discovery, XP and reload persistence.

Self-QA note:
- the first functional discovery candidate was rejected because the card existed in DOM but had already reached opacity 0 in the screenshot;
- Browser QA was tightened to inspect geometry + opacity, turning the defect red;
- the final implementation uses explicit enter → full-visibility hold → exit phases and is screenshot-accepted.

Release gate remaining for E2:
- rerun exact final documented PR head CI + Browser QA;
- merge;
- exact-main CI + Browser QA + canonical Pages deploy.

## Next implementation milestone
### F1 — Storage tray + first meaningful Coin sink
Goal: make board space an intentional choice and make Coins useful without creating a paywall or soft-lock.

First slice:
- persistent item-only storage outside the 7×7 board;
- generators cannot be stored;
- start with four storage slots;
- safe Board → Storage and Storage → Board actions with exact item identity preserved;
- full storage/board actions fail without item loss;
- permanent capacity expansions paid with Coins, beginning with a clearly affordable first upgrade;
- storage stays part of the Board/workbench instead of becoming a fifth main navigation tab;
- save/reload and migration safety;
- deterministic domain tests + real Mobile WebKit transfer/upgrade QA + screenshot review.

## Following milestones
1. G — Daily goals / fair return loop.
2. H — World map / Place selector.
3. I — Place 03 with genuinely new gameplay/content.

## Execution rule
Real gameplay/save/UX bugs take priority. Otherwise implement the highest-priority unfinished item in `docs/FEATURE_ROADMAP.md`. Every non-trivial release uses a fresh branch, deterministic tests, Mobile WebKit QA, screenshot self-review, exact-head PR checks and exact-main CI/Browser-QA/Pages deployment.
