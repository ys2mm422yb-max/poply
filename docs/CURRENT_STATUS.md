# Poply current status

Updated: 2026-08-15

## Live baseline
Current production `main` is a persistent merge-and-build game with:
- persistent 7×7 merge Board / Werkbank;
- Place 01 · Café am Meer, Place 02 · Sonnenkai and Place 03 · Dachgarten with visible restoration progression;
- five six-tier item families and four generators, including Dachgarten's deterministic four-step harvest bonus;
- three simultaneous customer orders with deterministic Place-local difficulty bands;
- Coins, restoration Stars, fair regenerating Energy and Player XP/Levels;
- Collection/Discovery with family mastery and one-time final-tier mastery rewards;
- persistent Storage + Coin expansion + explicit full/full recycling recovery;
- Daily Goals + Bonus Guest;
- Places world-map/revisit flow;
- Player milestones, titles, Place badges, next-Level reward/XP and Energy-capacity previews;
- automatic installed-PWA update handling with save-preserving release checks;
- local save/resume and migration safety;
- mandatory CI + Mobile WebKit + screenshot review + canonical Pages release gates.

Milestone B visual quality remains open globally and continues independently through screenshot-first visual PRs. GitHub Issue #42 is the durable cross-worker work log.

## Current product-automation slice — Guest loyalty collection
Start `main`: `cabfb7797b5e8647d24499e5eb9c02f1a846dfa4`.
Branch: `feature/guest-loyalty-collection-v2`.
PR: #99.

Player problem:
Orders pay immediate resources, but recurring customer portraits currently leave no durable relationship progress. Normal serving should also build lightweight long-term attachment without adding another dashboard or currency.

Implementation contract:
- the three existing original guest portraits become Mika, Nora and Sam;
- guest identity follows the deterministic order/portrait sequence;
- only successfully served normal orders and Daily Bonus Guests increment loyalty;
- per-guest visits persist in `guestVisits`; legacy saves start at zero because aggregate historical orders cannot prove guest identity;
- loyalty ranks are `Neu` → `Bekannt` at 1 visit → `Stammgast` at 5 → `Lieblingsgast` at 12;
- exact milestone transitions automatically award +25 / +100 / +250 Coins once;
- loyalty stays as a compact `STAMMGÄSTE` row inside Collection, not a fifth navigation destination;
- deterministic tests plus real WebKit order service / Collection / reload QA cover 390×844 and 390×720.

## Coordination
PWA auto-update PR #97 merged while the first Guest-loyalty branch was being prepared. The product slice was therefore rebuilt fresh from new `main` `cabfb779...` rather than merging a stale branch. Guest loyalty does not alter service-worker, manifest, release-marker, package, Pages or PWA-update implementation files.

Collection family mastery #98 is already live and is the baseline for this Collection follow-up.

## Next product priorities
1. Complete/release Guest loyalty only if exact-head deterministic + Mobile WebKit QA and generated screenshots accept it.
2. Re-read current `main`, open ownership and Issue #42 after release.
3. Continue economy/pacing simulation and data-driven configuration so five families/three Places remain achievable without grind walls.
4. Broaden world/Place completion only when it strengthens the merge loop rather than becoming a generic profile dashboard.
5. Keep reliability, PWA/native readiness and screenshot-first visual work independent where scopes allow.

## Durable coordination rule
Every substantial worker run records in Issue #42: exact starting main, branch/PR/head, changed systems, test/run IDs, screenshots actually opened, visible findings, merge/deploy state, blockers and next free task.
