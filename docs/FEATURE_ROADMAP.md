# Poply – Feature Roadmap

Status: ACTIVE · updated 2026-08-15.
Durable coordination: GitHub Issue #42.

Poply grows on two parallel tracks: real product/gameplay depth and screenshot-driven production quality. Neither track may overwrite active work from the other.

## Live product baseline
Already live before the current Guest loyalty slice:
- persistent 7×7 merge Board / Werkbank;
- five established six-tier item families across Café am Meer, Sonnenkai and Dachgarten;
- four generators, including Dachgarten's deterministic 4-step harvest bonus;
- three simultaneous customer orders with deterministic Place-local difficulty bands;
- exact delivery consumption + Coins + restoration Stars;
- three visible restoration arcs;
- fair regenerating Energy plus persistent Player XP/Levels and permanent Energy-capacity milestones;
- Collection / Discovery with family mastery and one-time final-tier mastery rewards;
- persistent Storage with permanent Coin expansion and explicit full-Board/full-Storage recovery;
- Daily Goals + fair Bonus Guest;
- Places world map/revisit flow;
- Player milestone/title/Place-badge/reward-preview progression surfaces;
- automatic installed-PWA update handling;
- local save/resume and migration safety;
- CI + Mobile WebKit + screenshot self-review + Place03 QA + canonical Pages release gates.

## Completed milestones
### E — Player XP + Level — LIVE
Persistent XP, deterministic level curve, XP from core progression actions, level rewards and visible deterministic reward/Energy-capacity previews.

### E2 — Collection Book + family mastery — LIVE / deepening
Persistent discoveries, silhouettes, one-time discovery XP, family-specific presentation and complete-family mastery across five families.

### F1/F2 — Storage + fair Board recovery — LIVE
Persistent Storage, permanent Coin-funded capacity expansion and explicit deterministic Recycling so Board 49/49 + Storage 4/4 cannot become a hard deadlock.

### G — Daily Goals + fair return loop — LIVE
Three deterministic daily goals plus one Bonus Guest, no streak punishment, forced ad or new currency.

### H — World Map / Places — LIVE
Café, Sonnenkai and Dachgarten map presentation with safe revisit/travel behavior and independent progress display.

### I — Place 03 · Dachgarten — LIVE
Distinct herb family, Gewächshaus generator with visible deterministic 4-step harvest bonus, own six-step restoration arc, Place-local orders, Collection/Map integration and dedicated WebKit QA.

### J — Player progression depth — LIVE / continuing
Long-term milestones, cosmetic titles, Place badges, next-Level reward/XP preview and Collection family mastery are integrated into existing game surfaces rather than a disconnected profile dashboard.

### K1 — Replacement-order difficulty bands — LIVE
Replacement orders scale from visible restoration progress within the active Place rather than opaque hidden adjustment.

### N1 — Installed PWA auto-update path — LIVE
The installed web app can detect a newer canonical release while preserving the local Poply save and offline fallback.

## Active product slice — J3 Guest loyalty collection
Branch: `feature/guest-loyalty-collection-v2`.
PR: #99.
Start main: `cabfb7797b5e8647d24499e5eb9c02f1a846dfa4`.

Player problem:
Orders pay immediate resources, but recurring guests currently do not leave durable relationship progress.

Contract:
- the three existing original portraits become persistent Mika, Nora and Sam identities;
- deterministic order sequence continues to choose the matching portrait/guest;
- only successful normal-order or Daily Bonus Guest service increments the matching visit count;
- legacy saves do not invent retroactive guest history or rewards;
- ranks: `Neu`, `Bekannt` at 1, `Stammgast` at 5, `Lieblingsgast` at 12 visits;
- exact milestone transitions grant +25 / +100 / +250 Coins once;
- no new currency, claim button, streak or fifth main tab;
- compact loyalty progress lives inside Collection;
- deterministic tests plus real service/reload WebKit QA at 390×844 and 390×720.

## Milestone B — visual production quality — OPEN in parallel
Continue stronger color/material identity, authored Board/Orders/Place atmosphere, tactile merge/discovery/delivery/restoration feedback and less dashboard-like presentation. Generated phone screenshots remain acceptance evidence.

Visual workers must choose files that do not overlap an active product branch.

## J — Collection depth & achievements — continuing
Potential later slices:
- broader world/Place completion records;
- non-grindy achievements that arise from normal play;
- cosmetic-only recognition when it adds visible player value;
- no disconnected generic profile dashboard.

## K — Economy, balancing & configuration
Next high-value systems work:
- move content/reward/generator/Place costs toward more centralized data-driven configuration;
- automated progression simulations across all five families / three Places;
- pacing targets for Energy, merges, orders, Stars, Coins and restoration;
- check that Storage expansion, family mastery, guest loyalty, level rewards and restoration together create useful but not inflationary Coins;
- every currency must keep a clear player purpose;
- no hidden rigging or dynamic difficulty that falsifies outcomes.

## L — Optional cloud/account layer
Only after local schema/progression and installed-app update behavior are stable: local-first, conflict-safe sync with privacy-minimal account data.

## M — Events/live content
Only after base progression has enough depth. No punitive urgency, forced ads or pay-to-win.

## N — Native/PWA release readiness
Shared codebase, reliable installed-web-app updates, later native packaging, iPhone/iPad/Android device matrix, app assets, privacy, performance/battery/accessibility audits.

# Immediate build order
1. Finish Guest loyalty through exact-head deterministic + Mobile WebKit QA and screenshot review.
2. Verify exact merged `main` with normal CI, Browser QA, Place03 QA and canonical Pages.
3. Re-read current main/open ownership and choose the next non-overlapping K/J product slice.
4. Continue screenshot-first visual/effects work independently.
5. Continue PWA/native-readiness infrastructure independently where scopes do not overlap.

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
`fresh branch from current main → implementation → deterministic tests → Mobile WebKit QA → screenshot self-review → exact-head green → merge → exact-main CI + Browser QA + Place03 QA + Pages deploy`.

Canonical build only:
`https://ys2mm422yb-max.github.io/poply/`
