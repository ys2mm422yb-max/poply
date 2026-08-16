# Poply – Feature Roadmap

Status: ACTIVE · updated 2026-08-16.
Durable coordination: GitHub Issue #42.

Poply grows on two parallel tracks: real product/gameplay depth and screenshot-driven production quality. Neither track may overwrite active work from the other.

## Live product baseline
Current production includes:
- persistent 7×7 merge Board / Werkbank;
- five established six-tier item families across Café am Meer, Sonnenkai and Dachgarten;
- four generators, including Dachgarten's deterministic harvest bonus;
- authored First Session with immediate first serve/build payoff, combo orders and anti-repeat replacement selection;
- three simultaneous customer orders with deterministic Place-local difficulty bands and Place-stage content unlocks;
- exact delivery consumption + Coins + restoration Stars;
- fair regenerating Energy plus persistent Player XP/Levels and permanent Energy-capacity milestones;
- visible purpose loop across Board, Orders and Place, including actionable CTA, next-build blueprint and post-build next goal;
- Collection / Discovery with family mastery and one-time final-tier mastery rewards;
- persistent Storage with permanent Coin expansion and deterministic full/full recovery;
- contextual Daily Goals + fair Bonus Guest;
- Places world map/revisit flow;
- all three six-step restoration arcs;
- persistent Mika/Nora/Sam Guest Loyalty with automatic milestone rewards;
- tactical Merge Flow generator boosts;
- optional Service Specials that change short-term play without blocking service;
- persistent Café upgrade powers: Abendservice, Vorbereitung and Gastwahl;
- Café am Meer Scene V2 with authored foreground/midground/background depth, larger restoration transformations, ambient life and build-camera payoff;
- automatic installed-PWA update handling, iOS safe-area protection and save recovery;
- local-first save/resume and migration safety;
- CI + Mobile WebKit + screenshot self-review + Place03 QA + PWA Update QA + canonical Pages release gates.

## Completed gameplay / progression milestones
### B1 — first major visual/game-feel passes — LIVE, quality continues
Stronger family identity, effects, authored Place atmosphere and mobile screenshot-first QA are live. Milestone B remains open as a continuing quality bar.

### E — Player XP + Level — LIVE
Persistent XP, deterministic level curve, XP from core progression actions, level rewards and visible deterministic reward/Energy-capacity previews.

### E2 — Collection Book + family mastery — LIVE
Persistent discoveries, silhouettes, one-time discovery XP, family-specific presentation and complete-family mastery across five families.

### F1/F2 — Storage + fair Board recovery — LIVE
Persistent Storage, permanent Coin-funded capacity expansion and explicit deterministic Recycling so Board 49/49 + Storage 4/4 cannot become a hard deadlock.

### G — Daily Goals + fair return loop — LIVE / improved
Contextual deterministic daily goals plus one Bonus Guest, no streak punishment, forced ad or new currency.

### H — World Map / Places — LIVE
Café, Sonnenkai and Dachgarten map presentation with safe revisit/travel behavior and independent progress display.

### I — Place 03 · Dachgarten — LIVE
Distinct herb family, Gewächshaus generator with visible deterministic harvest bonus, own six-step restoration arc, Place-local orders, Collection/Map integration and dedicated WebKit QA.

### J — Player progression depth — LIVE / continuing
Long-term milestones, titles, Place badges, next-Level reward/XP preview, Collection family mastery and Guest Loyalty are integrated into existing game surfaces instead of a disconnected profile dashboard.

### K1 — Replacement-order difficulty bands — LIVE
Replacement orders scale from visible restoration progress within the active Place rather than opaque hidden adjustment.

### O — Purpose + First Session rebuild — LIVE
Issues #107/#109 and PRs #108/#110/#113 established the stronger causal loop:
- merge → serve → visible build → gameplay unlock → richer order → stronger build → living Place;
- first service finances the first visible restoration;
- direct visible order repetition is avoided;
- Board CTA leads to playable work while Stars are missing and to building when ready;
- generated 390×844 / 390×720 screenshots are part of the acceptance contract.

### P — Guest/service decision depth — LIVE first layer
The 2026-08-15/16 sequence added real gameplay consequences instead of more passive dashboards:
- PR #116: Guest Loyalty on current main;
- PR #119: untouched legacy starter-save migration;
- PR #121: Merge Flow lets three successful merges arm a chosen generator boost;
- PR #123: optional Service Specials reward Merge-Serie, fresh-item and Flow-Tipp play styles;
- PR #125: Café upgrades unlock persistent Abendservice, Vorbereitung and Gastwahl powers.

### Q — Café am Meer Scene V2 — LIVE
PR #127 rebuilt Place 01 as a living 2.5D scene with materially larger stage transformations, real foreground depth, ambient motion and build-camera payoff. Acceptance included all stages 0–6 at 390×844 and 390×720, a real completed-Café revisit state and reject/fix iterations for visible QA defects.

Accepted PR head: `9133ef954d51671b306b0d485dea15f336dee447`.
Release merge commit: `3112b6d5e049539bd3d2ed9c3b75f6039ab9c72b`.

## Current ownership
No product feature PR or feature issue is currently open. Issue #42 is the single durable coordination/work-log issue.

Any new work must start by re-reading exact current `main`, open PRs and #42, then claim a non-overlapping scope on a fresh branch.

## Milestone B — visual production quality — OPEN continuously
Continue stronger color/material identity, authored Board/Orders/Place atmosphere, tactile merge/discovery/delivery/restoration feedback and less dashboard-like presentation.

Priority visual questions:
- does every restoration step feel materially different and desirable, not merely technically visible?
- does the world look alive even when the player is not tapping?
- are characters/items/world more visually dominant than status panels and explanatory copy?
- are reward moments readable and satisfying without visual noise?
- does 390×720 remain a first-class one-screen target?

A green browser test is never sufficient. Generated phone screenshots must be opened and accepted.

## Next gameplay-depth candidates
Prefer mechanics that create a new decision inside the existing loop rather than another passive progression panel.

Strong candidate:
- temporary Board/service events that alter short-term choices for a few actions or one guest cycle;
- deterministic, visible, optional/fair where appropriate;
- no new currency and no hidden outcome rigging;
- must interact cleanly with Merge Flow, Service Specials and Café powers instead of duplicating them.

Other later J/world-completion slices remain valid only when they create a concrete decision, motivation or visible reward.

## K — Economy, balancing & configuration — HIGH VALUE NEXT
Next systems work:
- move content/reward/generator/Place costs toward centralized data-driven configuration;
- automate progression simulations across all five families / three Places;
- define pacing targets for Energy, merges, orders, Stars, Coins and restoration;
- check that Storage expansion, family mastery, level rewards, loyalty and new service powers remain useful but not inflationary;
- detect grind walls and dead zones in first session, mid-Place and inter-Place transitions;
- every currency must keep a clear player purpose;
- no hidden rigging or dynamic difficulty that falsifies outcomes.

## L — Optional cloud/account layer — LATER
Only after local schema/progression and installed-app behavior are stable: local-first, conflict-safe sync with privacy-minimal account data. No backend is required for the current game loop.

A Neon project named `Poply` currently exists but is not integrated into the repository/runtime and contains no application tables. Treat backend adoption as a future explicit product/architecture decision, not as an implicit dependency.

## M — Events/live content — LATER
Only after base progression has enough depth and pacing data. No punitive urgency, forced ads or pay-to-win.

## N — Native/PWA release readiness — CONTINUING INFRASTRUCTURE
Maintain the shared codebase and installed-web-app update path. Later work includes native packaging, iPhone/iPad/Android device matrix, app assets, privacy, performance, battery and accessibility audits.

# Immediate build order
1. Re-read current `main`, open PRs and #42; create a fresh issue/branch for the next chosen slice.
2. Prefer a short-term Board/service decision mechanic if it materially deepens play without duplicating Flow/Specials/Powers.
3. Continue screenshot-first Milestone B visual/game-feel improvements on remaining weak surfaces.
4. Continue K economy/pacing/configuration simulation so progression decisions remain evidence-based.
5. Keep PWA/save reliability healthy in parallel where scopes do not overlap.

# Feature-selection rule
Before adding a feature, answer:
- What player problem does it solve?
- What new decision, motivation or reward does it create?
- Does it connect to the core loop rather than sit as a disconnected menu?
- Can it be tested deterministically?
- Can it fit the mobile shell without returning to web-dashboard UI?

If those answers are weak, do not build it yet.

# Autonomous coordination rule
Every worker reads current `main`, all open PRs and Issue #42 before writes. Active changed-file overlap means choose another task. Every substantive run writes a final Issue #42 handoff with start main, branch/PR/exact head, files/systems, tests/run IDs, screenshots actually opened, visible findings, merge/deploy state, blockers and next free task.

# Release rule
`fresh branch from current main → implementation → deterministic tests → Mobile WebKit QA → screenshot self-review → exact-head green → merge → exact-main CI + Browser QA + Place03 QA + PWA Update QA + Pages deploy`.

Canonical build only:
`https://ys2mm422yb-max.github.io/poply/`
