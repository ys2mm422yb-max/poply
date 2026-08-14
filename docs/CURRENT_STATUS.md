# Poply current status

Updated: 2026-08-14

## Live baseline
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

## Product phase
Poply is in **feature depth and long-term progression** while production-quality work continues in parallel.

Binding roadmap:
`docs/FEATURE_ROADMAP.md`

## Completed feature milestone
### E1 — Player XP + Level system — LIVE
Contract: `docs/PLAYER_PROGRESSION.md`
Screenshot QA: `docs/SCREENSHOT_QA_2026-08-14_PLAYER_PROGRESSION.md`

## Active implementation branch
`feature/collection-book`

### E2 — Collection Book + discovery rewards — IMPLEMENTED ON BRANCH, QA PENDING
Contract: `docs/COLLECTION_BOOK.md`

Implemented:
- persistent stable discovery keys for item tiers, generators and Places;
- fair save migration that backfills only content demonstrated by the existing board/progression;
- migration does not grant retroactive discovery XP or reveal future order-requested tiers;
- runtime discovery is separate from migration so a genuinely new merged/generated tier pays exactly once;
- one-time item discovery XP through the existing Player Progression system;
- first-discovery authored reveal with item art/name/tier/XP;
- Level-Up waits until the discovery reveal finishes if both happen on the same action;
- real fourth `Sammlung` navigation destination;
- authored Collection Book with overall count, four family selectors, six tiers per family, names/art for discovered tiers and silhouettes/`???` for future tiers;
- compact Place/generator discovery records;
- dedicated collection/domain/rendering tests;
- dedicated Mobile WebKit QA performs a real pointer merge, checks discovery+XP persistence, opens Collection, checks locked fruit silhouettes, validates 390×844/390×720 fit and reloads the save.

Required before merge:
- exact-head CI green;
- exact-head Browser QA green including existing gameplay, Player Progression and new Collection QA;
- self-review generated `30–33` discovery/Collection screenshots;
- correct any overlap, cheap presentation, dead navigation or short-viewport issue;
- merge only after the corrected exact head is green;
- exact-main CI + Browser QA + canonical Pages deploy.

## Next milestone after E2
### F1 — Storage tray + first meaningful Coin sink
- small persistent storage outside the 7×7 board;
- move items between Board and Storage without loss;
- start with a fair limited capacity;
- Coins purchase permanent storage expansions, giving Coins a real non-pay-to-win purpose;
- safe full-board and reload behavior;
- deterministic storage tests + Mobile WebKit QA.

## Following milestones
1. G — Daily goals / fair return loop.
2. H — World map / Place selector.
3. I — Place 03 with genuinely new gameplay/content.

## Execution rule
Real gameplay/save/UX bugs take priority. Otherwise implement the highest-priority unfinished item in `docs/FEATURE_ROADMAP.md`. Every non-trivial release uses a fresh branch, deterministic tests, Mobile WebKit QA, screenshot self-review, exact-head PR checks and exact-main CI/Browser-QA/Pages deployment.
