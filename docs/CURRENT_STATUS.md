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
- persistent Storage tray with 4 starting slots and Coin-funded permanent expansion to 6/8 slots;
- fair Daily Goals + Daily Bonus Guest with no streak punishment;
- local save/resume + migrations;
- authored Board / Orders / Place / Sammlung views;
- sound, haptics, merge/delivery/reward/restoration feedback;
- CI + Mobile WebKit Browser QA + canonical Pages release gates.

Latest live `main`: `d81b3f0109c643f03cc467193858ee27d381889c`.

Milestone B visual quality remains OPEN. Current user direction in GitHub Issue #42 is explicit: Poply still feels too dark and restrained and needs more authored color, stronger family identities, richer reward/merge/discovery/restoration effects, glows/light/particles where performance-safe, and less dark-dashboard feeling. Green tests alone do not close this visual work.

## Completed feature milestones
### E1 — Player XP + Level system — LIVE
Contract: `docs/PLAYER_PROGRESSION.md`
Screenshot QA: `docs/SCREENSHOT_QA_2026-08-14_PLAYER_PROGRESSION.md`

### E2 — Collection Book + discovery rewards — LIVE
Contract: `docs/COLLECTION_BOOK.md`
Screenshot QA: `docs/SCREENSHOT_QA_2026-08-14_COLLECTION.md`

### F1 — Storage tray + first meaningful Coin sink — LIVE
Contract: `docs/STORAGE_SYSTEM.md`
Screenshot QA: `docs/SCREENSHOT_QA_2026-08-14_STORAGE.md`

Accepted F1 behavior:
- persistent item-only storage inside the existing save;
- exact identity-preserving Board ↔ Storage transfers;
- generators cannot be stored;
- full Storage / Board failures preserve all items;
- compact in-Board storage handle rather than a fifth main tab;
- permanent Coin utility: 4→6 slots costs 200 Coins; 6→8 costs 450;
- dedicated real Mobile WebKit Storage QA at 390×844 and 390×720.

### G — Daily goals / fair return loop — LIVE
Contract: `docs/DAILY_GOALS.md`
Merged PR: #43.
Release main: `d81b3f0109c643f03cc467193858ee27d381889c`.

Accepted G behavior:
- deterministic local-day Daily state;
- guaranteed merge + serve goals and contextual third goal;
- real gameplay events progress Daily;
- one-time Coin claims;
- deterministic Bonus Guest with real Board-item consumption and existing Coins + Stars;
- no streak, no missed-day punishment and no extra token;
- compact `HEUTE` entry inside Orders;
- exact-head CI, Browser QA, screenshot acceptance and exact-main release gates all passed.

## Active implementation milestone
### H — World map / Place selector — IN PROGRESS
Contract: `docs/WORLD_MAP.md`.
Active automation branch: `feature/world-map-selector`.
Cross-worker log: GitHub Issue #42.

Current H slice:
- authored Places map entry inside the Place screen rather than a new primary tab;
- known Places show current/completed/locked state and independent restoration progress;
- completed Café am Meer remains revisitable after Sonnenkai unlocks;
- selected Place renders an authored scene preview at that Place's own restoration stage;
- map visits do not mutate Board, Orders, currencies or meta progress;
- dedicated deterministic model tests and real Mobile WebKit QA at 390×844 + 390×720.

Still required before H slice may be called live:
- exact PR-head normal CI + Browser QA;
- generated map screenshots opened and visually reviewed;
- fix every functional or visible defect found;
- exact-head merge;
- exact-main CI + Browser QA + canonical Pages deploy;
- final GitHub Issue #42 handoff.

## Parallel work
- Manual worker owns Board/color/reward FX files on `visual/color-fx-production-1` until terminal handoff.
- PR #45 owns replacement-order balancing in `src/v2-game.js`.
- H intentionally avoids those files/scopes.

## Next implementation milestones
1. Finish H first map/revisit slice.
2. Continue screenshot-driven color/effects production passes in parallel.
3. Extend H only if explicit active-Place gameplay switching can be added without order/generator progress loss.
4. I — Place 03 with genuinely new gameplay/content.

## Autonomous-work rule
GitHub Issue #42 is the cross-worker durable work log. Manual work plus both Poply automations must record exact heads, PRs, files/systems, test/workflow IDs, screenshots actually opened, visible findings, merge/deploy state and next work there. A substantial autonomous session is not considered complete without its GitHub trace.

## Execution rule
Real gameplay/save/UX bugs take priority. Otherwise implement the highest-priority unfinished item in `docs/FEATURE_ROADMAP.md`. Every non-trivial release uses a fresh branch, deterministic tests, Mobile WebKit QA, screenshot self-review, exact-head PR checks and exact-main CI/Browser-QA/Pages deployment.
