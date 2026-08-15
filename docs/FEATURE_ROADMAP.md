# Poply – Feature Roadmap

Status: ACTIVE · updated 2026-08-15.
Durable coordination: GitHub Issue #42.

Poply grows on two parallel tracks: real product/gameplay depth and screenshot-driven production quality. Neither track may overwrite active work from the other.

## Live product baseline
Current production `main` includes:
- persistent 7×7 merge Board / Werkbank;
- five established six-tier item families across Café am Meer, Sonnenkai and Dachgarten;
- four generators, including Dachgarten's deterministic four-step harvest bonus;
- authored First Session with immediate first serve/build payoff, opening combo orders and anti-repeat replacement selection;
- three simultaneous customer orders with deterministic Place-local difficulty bands and Place-stage content unlocks;
- exact delivery consumption + Coins + restoration Stars;
- fair regenerating Energy plus persistent Player XP/Levels and permanent Energy-capacity milestones;
- visible purpose loop across Board, Orders and Place, including actionable CTA, next-build blueprint and post-build next goal;
- Collection / Discovery with family mastery and one-time final-tier mastery rewards;
- persistent Storage with permanent Coin expansion and explicit full-Board/full-Storage recovery;
- contextual Daily Goals + fair Bonus Guest;
- Places world map/revisit flow;
- all three six-step restoration arcs;
- materially richer and animated Café am Meer restoration stages with Reduced Motion support;
- Player milestone/title/Place-badge/reward-preview progression surfaces;
- automatic installed-PWA update handling, iOS safe-area protection and save-preserving recovery;
- local save/resume and migration safety;
- CI + Mobile WebKit + screenshot self-review + Place03 QA + PWA Update QA + canonical Pages release gates.

## Completed milestones
### B1 — first major visual/game-feel passes — LIVE, quality continues
Stronger family identity, effects, authored Place atmosphere and mobile screenshot-first QA are live. Milestone B remains open as a continuing quality bar, not as one unfinished feature.

### E — Player XP + Level — LIVE
Persistent XP, deterministic level curve, XP from core progression actions, level rewards and visible deterministic reward/Energy-capacity previews.

### E2 — Collection Book + family mastery — LIVE
Persistent discoveries, silhouettes, one-time discovery XP, family-specific presentation and complete-family mastery across five families.

### F1/F2 — Storage + fair Board recovery — LIVE
Persistent Storage, permanent Coin-funded capacity expansion and explicit deterministic Recycling so Board 49/49 + Storage 4/4 cannot become a hard deadlock.

### G — Daily Goals + fair return loop — LIVE / improved
Contextual deterministic daily goals plus one Bonus Guest, no streak punishment, forced ad or new currency. The First Session rebuild removed the old permanently repeated merge + serve pair.

### H — World Map / Places — LIVE
Café, Sonnenkai and Dachgarten map presentation with safe revisit/travel behavior and independent progress display.

### I — Place 03 · Dachgarten — LIVE
Distinct herb family, Gewächshaus generator with visible deterministic four-step harvest bonus, own six-step restoration arc, Place-local orders, Collection/Map integration and dedicated WebKit QA.

### J — Player progression depth — LIVE / continuing
Long-term milestones, cosmetic titles, Place badges, next-Level reward/XP preview and Collection family mastery are integrated into existing game surfaces rather than a disconnected profile dashboard.

### K1 — Replacement-order difficulty bands — LIVE
Replacement orders scale from visible restoration progress within the active Place rather than opaque hidden adjustment.

### O — Purpose + First Session rebuild — LIVE
Issues #107/#109 and PRs #108/#110/#113 established a stronger causal loop and opening experience:
- merge → serve → visible build → gameplay unlock → richer order → stronger build → living Place;
- the first real service finances the first visible restoration;
- direct visible order repetition is avoided;
- Place 01 upgrades materially alter the scene and unlock broader content;
- Board CTA leads to playable work while Stars are missing and to building when ready;
- generated 390×844 / 390×720 screenshots are part of the acceptance contract.

## Active product slice — #115 Guest Loyalty fresh rebuild
Historical PR #99 is closed without merge after a current-main audit. Its implementation branch diverged by 8 commits behind / 11 ahead and overlapped newer session/Collection/PWA work.

Issue #115 preserves only the useful product contract and requires a clean implementation from current `main`.

Contract to evaluate/build:
- normal serving should create lightweight durable guest relationship progress;
- Mika, Nora and Sam can progress through `Neu` → `Bekannt` → `Stammgast` → `Lieblingsgast`;
- milestone rewards are automatic and one-time, with no new currency, streak, claim loop or fifth navigation tab;
- legacy saves must not invent guest history or retroactive rewards;
- loyalty must reinforce the existing Orders → relationship → Collection/world loop rather than become another dashboard;
- the old #99 code is reference material only and must not overwrite current First-Session, Daily, purpose or PWA code;
- final UI must be accepted from current 390×844 and 390×720 GitHub Actions screenshots.

## Milestone B — visual production quality — OPEN continuously
Continue stronger color/material identity, authored Board/Orders/Place atmosphere, tactile merge/discovery/delivery/restoration feedback and less dashboard-like presentation.

Priority visual questions:
- does every restoration step feel materially different and desirable, not merely technically visible?
- does the world look alive even when the player is not tapping?
- are characters/items/world more visually dominant than status panels and explanatory copy?
- are reward moments readable and satisfying without visual noise?
- does 390×720 remain a first-class one-screen target?

A green browser test is never sufficient. Generated phone screenshots must be opened and accepted.

## J — Collection depth & achievements — continuing
Potential later slices:
- Guest Loyalty only if #115 survives fresh product/visual review;
- broader world/Place completion records;
- non-grindy achievements that arise naturally from normal play;
- cosmetic-only recognition when it creates visible player value;
- no disconnected generic profile dashboard.

## K — Economy, balancing & configuration — HIGH VALUE NEXT
Next systems work:
- move content/reward/generator/Place costs toward centralized data-driven configuration;
- automate progression simulations across all five families / three Places;
- define pacing targets for Energy, merges, orders, Stars, Coins and restoration;
- check that Storage expansion, family mastery, level rewards and future loyalty rewards remain useful but not inflationary;
- detect grind walls and dead zones in first session, mid-Place and inter-Place transitions;
- every currency must keep a clear player purpose;
- no hidden rigging or dynamic difficulty that falsifies outcomes.

## L — Optional cloud/account layer — LATER
Only after local schema/progression and installed-app behavior are stable: local-first, conflict-safe sync with privacy-minimal account data. No backend is required for the current game loop.

## M — Events/live content — LATER
Only after base progression has enough depth and pacing data. No punitive urgency, forced ads or pay-to-win.

## N — Native/PWA release readiness — CONTINUING INFRASTRUCTURE
Maintain the shared codebase and installed-web-app update path. Later work includes native packaging, iPhone/iPad/Android device matrix, app assets, privacy, performance, battery and accessibility audits.

# Immediate build order
1. Implement/evaluate #115 from fresh current `main`; do not reuse #99 wholesale.
2. Continue screenshot-first Milestone B visual/game-feel improvements, especially Place transformation and world life.
3. Start K economy/pacing/configuration simulation so progression decisions are evidence-based instead of guessed.
4. Choose later J/world-completion slices only when they create a concrete player decision, motivation or visible reward.
5. Keep PWA/native-readiness infrastructure healthy in parallel where scopes do not overlap.

# Feature-selection rule
Before adding a feature, answer:
- What player problem does it solve?
- What new decision, motivation or reward does it create?
- Does it connect to the core loop rather than sit as a disconnected menu?
- Can it be tested deterministically?
- Can it fit the mobile shell without returning to web-dashboard UI?

If those answers are weak, do not build it yet.

# Autonomous coordination rule
Every worker reads current `main`, all open PRs and Issue #42 before writes. Active changed-file overlap means choose another task. Every substantive run writes a final Issue #42 handoff with start main, branch/PR/exact head, files/systems, tests/run IDs, screenshots actually opened, visual findings, merge/deploy state, blockers and next free work.

# Release rule
`fresh branch from current main → implementation → deterministic tests → Mobile WebKit QA → screenshot self-review → exact-head green → merge → exact-main CI + Browser QA + Place03 QA + PWA Update QA + Pages deploy`.

Canonical build only:
`https://ys2mm422yb-max.github.io/poply/`
