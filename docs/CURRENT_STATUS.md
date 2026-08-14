# Poply current status

Updated: 2026-08-14

## Live baseline
`main` currently includes:
- Place 01 · Café am Meer and Place 02 · Sonnenkai;
- four six-tier item families and three generators;
- three active customer orders and two six-step restoration arcs;
- persistent 7×7 merge board;
- fair automatic energy regeneration with visible countdown;
- persistent Player XP + Level system;
- real Collection Book / Sammlung with persistent item, generator and Place discoveries;
- first-time item discovery XP and authored discovery reward moments;
- local save/resume + migrations;
- authored Board / Orders / Place / Sammlung views;
- sound, haptics, merge/delivery/reward/restoration feedback;
- CI + Mobile WebKit Browser QA + canonical Pages release gates.

Milestone B visual quality remains OPEN: Poply is materially larger and more coherent, but final AAA-casual presentation quality is not being claimed yet.

## Completed feature milestones
### E1 — Player XP + Level system — LIVE
Contract: `docs/PLAYER_PROGRESSION.md`
Screenshot QA: `docs/SCREENSHOT_QA_2026-08-14_PLAYER_PROGRESSION.md`

### E2 — Collection Book + discovery rewards — LIVE
Contract: `docs/COLLECTION_BOOK.md`
Screenshot QA: `docs/SCREENSHOT_QA_2026-08-14_COLLECTION.md`

E2 release passed exact-main CI, full Browser QA and canonical Pages deployment on `99b625efc64fbce68dcfbea59c0b1c55b96364a6`.

## Active implementation branch
`feature/storage-coin-utility`

### F1 — Storage tray + first meaningful Coin sink — IMPLEMENTED ON BRANCH, QA PENDING
Contract: `docs/STORAGE_SYSTEM.md`

Implemented:
- persistent item-only `storage` + `storageCapacity` inside the existing save;
- existing saves migrate to four empty slots without deleting any player value;
- exact identity-preserving Board → Storage and Storage → Board transfers;
- generators are never storable;
- full Storage / full Board failures preserve every item;
- stale capacity metadata expands to preserve stored items instead of deleting them;
- compact in-Board `Lager used/capacity` handle rather than a fifth main tab;
- temporary storage drawer with current slots and a horizontal Board-item selector;
- tap Board item in drawer to store; tap stored item to restore to the first free Board slot;
- Storage items are explicitly parked and must return to the Board before they count for customer orders;
- permanent Coin utility: 4→6 slots costs 200 Coins; 6→8 costs 450; F1 max 8;
- no Energy cost and no real-money path;
- deterministic inventory/migration/no-loss/Coin tests;
- dedicated Mobile WebKit Storage QA for real transfer, reload, restore, Coin upgrade, persistence and 390×844/390×720 fit.

Required before merge:
- exact-head normal CI green;
- exact-head full Browser QA green including Storage flow;
- self-review generated Storage screenshots for Board obstruction, tiny targets, nav overlap and cheap drawer presentation;
- fix any issue found, document screenshot acceptance, rerun exact final head;
- merge only after exact-head gates are green;
- exact-main CI + Browser QA + Pages deploy.

## Next milestone after F1
### G — Daily goals / fair return loop
- three understandable daily goals;
- one daily bonus customer/order;
- fair rewards using existing currencies/utility;
- no punitive streak loss;
- deterministic local-day reset and save/reload behavior;
- real Mobile WebKit QA and screenshot review.

## Following milestones
1. H — World map / Place selector.
2. I — Place 03 with genuinely new gameplay/content.

## Execution rule
Real gameplay/save/UX bugs take priority. Otherwise implement the highest-priority unfinished item in `docs/FEATURE_ROADMAP.md`. Every non-trivial release uses a fresh branch, deterministic tests, Mobile WebKit QA, screenshot self-review, exact-head PR checks and exact-main CI/Browser-QA/Pages deployment.
