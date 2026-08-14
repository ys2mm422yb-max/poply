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
- local save/resume + migrations;
- authored Board / Orders / Place / Sammlung views;
- sound, haptics, merge/delivery/reward/restoration feedback;
- CI + Mobile WebKit Browser QA + canonical Pages release gates.

Latest live `main` before Milestone G release: `657ff1f79760a4564cda0ac7f03152a6236ef30a`.

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

## Active implementation milestone
### G — Daily goals / fair return loop — IN PROGRESS
Contract: `docs/DAILY_GOALS.md`
Active manual branch: `feature/daily-goals-v2`.
Cross-worker log: GitHub Issue #42.

Current implemented branch scope:
- deterministic local-day Daily state;
- three goals with guaranteed merge + serve and contextual generate/discover/restore third goal;
- real gameplay events wired into Daily progress;
- one-time Coin claims;
- deterministic Daily Bonus Guest using a real item requirement and existing Coins + Stars;
- no streak, no missed-day punishment and no new token;
- compact `HEUTE` ribbon in Orders and temporary Daily bottom sheet;
- dedicated Daily domain tests and a real WebKit flow covering merge, standard order, generator, all three claims, Bonus Guest and reload.

Still required before G may be called live:
- exact PR-head CI + Browser QA;
- generated Daily screenshots opened and visually reviewed by the worker;
- fix every functional or visible defect found;
- exact-head merge;
- exact-main CI + Browser QA + canonical Pages deploy;
- final GitHub Issue #42 handoff.

## Next implementation milestones
1. Visual/color/effects production pass from Issue #42 in parallel with feature growth.
2. H — World map / Place selector.
3. I — Place 03 with genuinely new gameplay/content.

## Autonomous-work rule
GitHub Issue #42 is the cross-worker durable work log. Manual work plus both Poply automations must record exact heads, PRs, files/systems, test/workflow IDs, screenshots actually opened, visible findings, merge/deploy state and next work there. A substantial autonomous session is not considered complete without its GitHub trace.

## Execution rule
Real gameplay/save/UX bugs take priority. Otherwise implement the highest-priority unfinished item in `docs/FEATURE_ROADMAP.md`. Every non-trivial release uses a fresh branch, deterministic tests, Mobile WebKit QA, screenshot self-review, exact-head PR checks and exact-main CI/Browser-QA/Pages deployment.
