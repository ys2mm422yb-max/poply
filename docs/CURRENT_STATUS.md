# Poply current status

Updated: 2026-08-15

## Live baseline
Current production `main` is a persistent merge-and-build game with:
- persistent 7×7 merge Board / Werkbank;
- Place 01 · Café am Meer, Place 02 · Sonnenkai and Place 03 · Dachgarten with visible restoration progression;
- five six-tier item families and four generators, including Dachgarten's deterministic four-step harvest bonus;
- three simultaneous customer orders with deterministic Place-local difficulty bands;
- Coins, restoration Stars, fair regenerating Energy and Player XP/Levels;
- Collection/Discovery, persistent Storage + Coin expansion + explicit full/full recycling recovery;
- Daily Goals + Bonus Guest;
- Places world-map/revisit flow;
- Player milestones, titles, Place badges, next-Level reward/XP and Energy-capacity previews;
- local save/resume and migration safety;
- mandatory CI + Mobile WebKit + screenshot review + canonical Pages release gates.

Milestone B visual quality remains open globally and continues independently through screenshot-first visual PRs. GitHub Issue #42 is the durable cross-worker work log.

## Current product-automation slice — Collection family mastery
Start `main`: `ce44d34edc5146e9cebcacaa0068acc8282657cc`.
Branch: `feature/collection-family-mastery`.

Player problem:
Collection records every tier permanently, but completing an entire item chain currently has little additional payoff. The player should feel that reaching tier 6 closes a meaningful long-term goal without adding another disconnected achievement dashboard.

Implementation contract:
- mastery is derived entirely from real discovery keys; no new mastery save counter;
- visible ranks progress from `Unentdeckt` → `Entdecker` → `Kenner` → `Profi` → `Meister`;
- the first real runtime discovery that takes a family from 5/6 to 6/6 grants exactly 250 Coins;
- idempotent discovery prevents duplicate mastery payouts on repeat/reload;
- legacy/backfilled 6/6 families display `Meister` but migration grants no retroactive Coins;
- mastery status stays inside the existing Collection family focus;
- final-tier discovery extends the existing reveal with `FAMILIE GEMEISTERT` instead of opening another modal;
- deterministic tests and real Collection WebKit QA cover normal discovery, final-tier real merge, reward and reload at 390×844 / 390×720.

## Coordination
Current independent manual ownership: PR #97 / `feature/pwa-auto-updates` owns installed-app update/service-worker/release-marker work. This Collection slice deliberately avoids its service worker, manifest, Pages/deploy and Browser-QA workflow files.

No active Place 03 implementation PR exists; Place 03 functionality is already present in the live code and mandatory Place03 QA remains part of release verification.

## Next product priorities
1. Complete/release Collection family mastery if exact-head tests and screenshots accept it.
2. Re-read current `main`, open ownership and Issue #42 after release.
3. Continue economy/pacing simulation and data-driven configuration so five families/three Places remain achievable without grind walls.
4. Add deeper Collection/guest/world completion only when it strengthens the merge loop rather than becoming a generic profile dashboard.
5. Keep reliability, PWA/native readiness and screenshot-first visual work independent where scopes allow.

## Durable coordination rule
Every substantial worker run records in Issue #42: exact starting main, branch/PR/head, changed systems, test/run IDs, screenshots actually opened, visible findings, merge/deploy state, blockers and next free task.
