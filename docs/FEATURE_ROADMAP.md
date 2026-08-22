# Poply – Feature Roadmap

Status: ACTIVE · updated 2026-08-22.
Durable coordination: GitHub Issue #42.

Poply grows on two parallel tracks: real product/gameplay depth and screenshot-driven production quality. Neither track may overwrite active work from the other.

## Live product baseline
Current verified runtime/gameplay baseline: `068164e82f0c5f4a13a7befadb1431af4ba07bef`. Documentation-only status-sync commits may follow this SHA without changing the shipped runtime tree.

Production includes:
- persistent 7×7 merge Board / Werkbank;
- five established six-tier item families across Café am Meer, Sonnenkai and Dachgarten;
- four generators, including Dachgarten's deterministic harvest bonus;
- authored First Session with immediate first serve/build payoff, combo orders and anti-repeat replacement selection;
- three simultaneous customer orders with deterministic Place-local difficulty bands and Place-stage content unlocks;
- exact delivery consumption + Coins + restoration Stars;
- fair regenerating Energy plus persistent Player XP/Levels and permanent Energy-capacity milestones;
- Collection / Discovery, persistent Storage and deterministic full/full recovery;
- contextual Daily Goals + Bonus Guest;
- Places world map/revisit flow and all three six-step restoration arcs;
- Mika/Nora/Sam Guest Loyalty with visible recurring guests in the Place scene;
- tactical Merge Flow generator boosts;
- optional Service Specials;
- persistent Café upgrade powers: Abendservice, Vorbereitung and Gastwahl;
- deterministic Service-Ruf for next-guest commitment with Direkt / Nachschub tradeoff;
- deterministic living Service Moments that reuse Service-Ruf, FLOW and Place Powers;
- item guidance from every needed item to source, generator, merge chain and direct Board highlight;
- compact Board order cards limited to guest, Stars, concrete item art and quantity;
- authored thematic order framing that explains why requirements belong together;
- concrete gameplay-benefit communication for Place upgrades;
- Generator Mastery derived from existing generator use, without a new economy layer;
- Daily story framing and a completed-world payoff;
- Café am Meer Scene V2 plus later café-first hierarchy/readability passes;
- automatic installed-PWA update handling, iOS safe-area protection and save recovery;
- local-first save/resume and migration safety;
- CI + Mobile WebKit + screenshot self-review + Place03 QA + PWA Update QA + canonical release gates.

## Completed binding sequence — Arbeitsblock 1 → 6 — LIVE
Issue #42 defined a strict six-block execution rule: each block starts only after the previous one is accepted and merged, with deterministic tests, exact-head CI/Browser/PWA/Place03 gates and manual 390×844 / 390×720 screenshot review.

### Block 1 — Orders clarity — LIVE
PR #147 · accepted head `86c4c7ff3135a7a1d9185ae330bb2e30683834a1`.

Compact Board orders now communicate guest, Stars, item art and quantity without overlapping microcopy. Item Guidance from PR #143 remains the canonical detail path for item name, origin, generator and merge chain plus direct Board highlighting.

### Block 2 — Thematic orders — LIVE
PR #154 · accepted head `c402d9df92300799a5de1a54f5576ce9f7934370`.

Authored order themes/stories make requirements coherent without changing requirements or economy. Context lives in the focused Orders surface, not the tiny Board cards.

### Block 3 — Guests & regulars — LIVE
PR #156 · accepted head `13e117e1fa4f340c429b3b7e60feb573b55c380d`.

Guest preferences, loyalty progress and next payoff are visible in focused service context; served guests return in the Place scene as recognizable recurring guests.

### Block 4 — Place upgrades with gameplay purpose — LIVE
PR #158 · accepted head `3f726e96d518bd165d5a004e9e3723eb144ed8f3`.

Every Coast upgrade now communicates a backed gameplay consequence. Build → visible scene change → gameplay benefit uses one canonical benefit source.

### Block 5 — Living service moments — LIVE
PR #160 · accepted head `5f7180fd4a642f8bd7016223cd18736eae3c7557`.

Deterministic Stammgast/Kaffee-Tag/Sonnenuntergang/Rush-Hour moments create temporary priorities by reusing Service-Ruf, FLOW and Place Powers. No second event timer, hidden RNG or disconnected minigame layer.

### Block 6 — Long-term motivation — LIVE
PR #162 · accepted head `214dfc6ca6bfd4eac249e4970f5e00a2848cb3ff` · runtime merge `068164e82f0c5f4a13a7befadb1431af4ba07bef`.

Generator Mastery uses existing taps, Collection owns unknown silhouettes, Daily Goals get deterministic story framing, and a fully restored world gets a strong completion payoff. No mastery currency, economy buff, new persistence, streak or FOMO layer.

The final merge records exact-head QA: CI #1563, Browser QA #674, PWA Update QA #401 and Place03 QA #427.

## Completed gameplay / progression milestones
### B1 — first major visual/game-feel passes — LIVE, quality continues
Stronger family identity, effects, authored Place atmosphere and mobile screenshot-first QA are live. Milestone B remains open as a continuing quality bar.

### E — Player XP + Level — LIVE
Persistent XP, deterministic level curve, XP from core progression actions, level rewards and visible deterministic reward/Energy-capacity previews.

### E2 — Collection Book + family mastery — LIVE
Persistent discoveries, silhouettes, one-time discovery XP and complete-family mastery across five families. Block 6 additionally adds Generator Mastery as identity/progress derived from existing generator use, without economy buffs.

### F1/F2 — Storage + fair Board recovery — LIVE
Persistent Storage, permanent Coin-funded capacity expansion and explicit deterministic Recycling so Board 49/49 + Storage 4/4 cannot become a hard deadlock.

### G — Daily Goals + fair return loop — LIVE / improved
Contextual deterministic daily goals plus one Bonus Guest, no streak punishment, forced ad or new currency. Block 6 adds day/place story framing without altering goals or rewards.

### H — World Map / Places — LIVE
Café, Sonnenkai and Dachgarten map presentation with safe revisit/travel behavior and independent progress display.

### I — Place 03 · Dachgarten — LIVE
Distinct herb family, Gewächshaus generator with visible deterministic harvest bonus, own six-step restoration arc, Place-local orders, Collection/Map integration and dedicated WebKit QA.

### J — Player progression depth — LIVE / continuing
Long-term milestones, titles, Place badges, next-Level reward/XP preview, Collection progress, Guest Loyalty and Generator Mastery are integrated into existing game surfaces instead of a disconnected profile dashboard.

### K1 — Replacement-order difficulty bands — LIVE
Replacement orders scale from visible restoration progress within the active Place rather than opaque hidden adjustment.

### O — Purpose + First Session rebuild — LIVE
The stronger causal loop remains the core product contract:
- merge → serve → visible build → gameplay unlock → richer order → stronger build → living Place;
- first service finances the first visible restoration;
- direct visible order repetition is avoided;
- Board CTA leads to playable work while Stars are missing and to building when ready;
- generated 390×844 / 390×720 screenshots are part of the acceptance contract.

### P — Guest/service decision depth — LIVE
Guest Loyalty, Merge Flow, Service Specials, Café powers, Service-Ruf, thematic orders, recurring guests and Service Moments now form one coherent guest/service layer without a separate meta-game.

### Q — Café am Meer Scene V2 — LIVE
Authored 2.5D scene depth, material restoration transformations, ambient life and build-camera payoff remain the visual baseline for Place 01.

## Current ownership
No product pull request is open after the Block-6 merge. Issue #42 remains the durable coordination/work-log issue. Any worker must re-read exact current `main`, open PRs and the latest Issue #42 comments before writes.

## Milestone B — visual production quality — OPEN continuously
Continue stronger color/material identity, authored Board/Orders/Place atmosphere, tactile merge/discovery/delivery/restoration feedback and less dashboard-like presentation.

Priority visual questions:
- does every restoration step feel materially different and desirable, not merely technically visible?
- does the world look alive even when the player is not tapping?
- are characters/items/world more visually dominant than status panels and explanatory copy?
- are reward moments readable and satisfying without visual noise?
- does 390×720 remain a first-class one-screen target?

A green browser test is never sufficient. Generated phone screenshots must be opened and accepted.

## Next gameplay-depth rule
The six-block sequence is shipped baseline. Do not add another system merely to have a new feature. A future slice must create a genuinely new decision, motivation or visible reward and must not duplicate:
- Merge Flow's generator boost decision;
- Service Specials' order-specific play-style challenges;
- Café powers' persistent restoration benefits;
- Service-Ruf's next-guest commitment;
- Service Moments' temporary service priorities;
- Generator Mastery's collection/identity role.

Keep future mechanics deterministic, visible and optional/fair where possible; avoid new currency, timer/FOMO or hidden outcome rigging. They must fit the mobile shell without returning Board/Orders to dashboard UI.

## K — Economy, balancing & configuration — HIGH VALUE NEXT
Next systems work:
- move content/reward/generator/Place costs toward centralized data-driven configuration;
- automate progression simulations across all five families / three Places;
- define pacing targets for Energy, merges, orders, Stars, Coins and restoration;
- check that Storage expansion, mastery, levels, loyalty and service systems remain useful but not inflationary;
- detect grind walls and dead zones in first session, mid-Place and inter-Place transitions;
- every currency must keep a clear player purpose;
- no hidden rigging or dynamic difficulty that falsifies outcomes.

## L — Optional cloud/account layer — LATER
Only after local schema/progression and installed-app behavior are stable: local-first, conflict-safe sync with privacy-minimal account data. No backend is required for the current game loop.

A Neon project named `Poply` exists separately but is not integrated into the repository/runtime. The completed Arbeitsblock 1→6 sequence intentionally required no Neon schema/application changes. Treat backend adoption as a future explicit product/architecture decision, not an implicit dependency.

## M — Events/live content — LATER
Only after base progression has enough depth and pacing data. No punitive urgency, forced ads or pay-to-win.

## N — Native/PWA release readiness — CONTINUING INFRASTRUCTURE
Maintain the shared codebase and installed-web-app update path. Later work includes native packaging, iPhone/iPad/Android device matrix, app assets, privacy, performance, battery and accessibility audits.

# Immediate build order
1. Preserve the shipped 1→6 baseline and fix only concrete regressions found by real-device QA.
2. Continue screenshot-first Milestone B visual/game-feel improvements on remaining weak surfaces.
3. Continue K economy/pacing/configuration simulation so progression decisions remain evidence-based.
4. Keep PWA/save reliability healthy in parallel where scopes do not overlap.
5. Choose a new gameplay slice only after re-reading fresh `main`, open PRs and Issue #42 and proving it adds a new decision axis.
6. Cloud/accounts, live events and native packaging remain later phases.

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
`fresh branch from current main → implementation → deterministic tests → Mobile WebKit QA → screenshot self-review → exact-head green → merge → exact-main CI + Browser QA + Place03 QA + PWA Update QA + canonical release verification`.
