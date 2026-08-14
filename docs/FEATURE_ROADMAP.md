# Poply – Feature Roadmap

Status: ACTIVE · updated 2026-08-15.
Durable coordination: GitHub Issue #42.

Poply grows on two parallel tracks: real product/gameplay depth and screenshot-driven production quality. Neither track may overwrite active work from the other.

## Live product baseline
Already live before the current parallel slices:
- persistent 7×7 merge Board / Werkbank;
- four six-tier item families across Café am Meer and Sonnenkai;
- three generators;
- three simultaneous customer orders with deterministic replacement-order difficulty bands;
- exact delivery consumption + Coins + restoration Stars;
- two six-step restoration arcs;
- fair regenerating Energy;
- Player XP + Levels;
- Collection / Discovery;
- persistent Storage with permanent Coin expansion;
- Daily Goals + fair Bonus Guest;
- first Places world-map/revisit slice;
- local save/resume and migration safety;
- CI + Mobile WebKit + screenshot self-review + canonical Pages release gates.

## Completed milestones
### E1 — Player XP + Level — LIVE
Persistent XP, deterministic level curve, XP from orders/restoration/discovery, Coin rewards on crossed levels, reload-safe presentation.

### E2 — Collection Book + discovery — LIVE
Persistent item/generator/Place discoveries, silhouettes, one-time discovery XP and reveal.

### F1 — Storage + first permanent Coin sink — LIVE
4 starting slots, identity-safe Board ↔ Storage transfer, generators excluded, upgrades 4→6 for 200 Coins and 6→8 for 450 Coins.

### G — Daily Goals + fair return loop — LIVE via PR #43
Three deterministic daily goals plus one Bonus Guest, no streak punishment, no forced ad, no new currency.

### H — World Map / Places first slice — LIVE via PR #48
Café and Sonnenkai map presentation with safe completed-Place revisit and independent progress display. Active gameplay Place switching remains deferred until all generator/order semantics can be preserved safely.

### K1 — Replacement-order difficulty bands — LIVE
Replacement orders scale from visible restoration progress rather than an opaque global sequence.

## Active parallel slices
### Milestone I — Place 03 · Dachgarten — ACTIVE in PR #58
Manual product worker owns the current Place03 files and integration.

Target:
- genuinely distinct third Place;
- new item family and producer behavior;
- six restoration beats;
- new orders;
- clear fair gameplay wrinkle rather than only higher numbers;
- Collection/Map integration, migration safety and dedicated browser evidence.

No other worker may start a competing Place03 implementation while PR #58 is open.

### J1 — Player Milestone shelf — ACTIVE product-automation slice
Contract: `docs/PLAYER_MILESTONES.md`.
Branch/PR state is logged in Issue #42.

Player value:
The existing XP Level badge becomes a useful long-term progress entry point instead of a number with no explanation.

Scope:
- tap existing `LV N` badge to open a compact progress sheet;
- five milestones: first service, 25 merges, six restoration steps, 12 item discoveries, Level 5;
- all progress derives from already-persisted counters/state;
- no new currency, claim flow, expiration, streak or duplicate achievement save field;
- Level milestone derives from canonical `playerXp`;
- overlay must fit 390×844 and 390×720 without moving or covering primary navigation;
- opening/closing must not mutate save state.

Why this is safe in parallel:
- it does not touch PR #58 Place03 domain/session/Collection/Map files;
- it does not touch PR #55 dynamic-FX workflow/motion scope;
- it uses the already-installed Player UI surface and existing progression QA.

### Milestone B — visual production quality — OPEN in parallel
Current goals remain stronger color/material identity, better item/generator differentiation, more authored Board atmosphere, stronger merge/discovery/delivery/restoration effects and less dashboard-like presentation. Generated phone screenshots remain the acceptance evidence.

## Parked reliability follow-up — Board recovery beyond Storage
Binding rules require full-board states to remain fairly recoverable. Storage solves most pressure but a future fresh slice should explicitly solve the Board-full + Storage-full deadlock without item loss, hidden deletion or monetization pressure.

An exploratory branch exists but has **no PR and is not active** because its required session integration overlaps current Place03 work. Rebuild it from then-current `main` only after the active session owner is clear.

## J — Collection depth & achievements
After J1 and Place03:
- family mastery/completion;
- guest/customer collection;
- Place completion badges;
- non-grindy achievements;
- cosmetic-only milestone rewards if they add visible value;
- no disconnected generic profile dashboard.

## K — Economy, balancing & configuration
- continue moving content/reward/generator/Place costs toward data-driven configuration;
- automated progression simulations;
- pacing targets for Energy, merges, orders, Stars, Coins and restoration;
- every currency must have a clear player purpose;
- no hidden rigging/dynamic difficulty that falsifies outcomes.

## L — Optional cloud/account layer
Only after local schema and progression are stable: local-first, conflict-safe sync, privacy-minimal account data.

## M — Events/live content
Only after base progression has enough depth. No punitive urgency, forced ads or pay-to-win.

## N — Native release readiness
Shared codebase, PWA/native packaging, iPhone/iPad/Android device matrix, app assets, privacy, performance/battery/accessibility audits.

# Immediate build order
1. Finish independent exact-head gates for the active J1 milestone shelf.
2. Let PR #58 continue Place03 without duplicate/overlapping edits.
3. Continue visual/effects work independently through screenshot-first PRs.
4. After Place03/session ownership clears, implement guaranteed Board-full + Storage-full recovery on a fresh main branch.
5. Continue deeper J/K content/economy work.

# Feature-selection rule
Before adding a feature, answer:
- What player problem does it solve?
- What new decision, motivation or reward does it create?
- Does it connect to the core loop rather than sit as a disconnected menu?
- Can it be tested deterministically?
- Can it fit the mobile shell without returning to web-dashboard UI?

If those answers are weak, do not build it yet.

# Autonomous coordination rule
Every worker reads current `main`, all open PRs and Issue #42 before writes. Active changed-file overlap means choose another task. Every substantive run writes a final Issue #42 handoff with start main, branch/PR/exact head, files/systems, tests/run IDs, screenshots actually opened, visible findings, merge/deploy state, blockers and next free work.

# Release rule
`fresh branch from current main → implementation → deterministic tests → Mobile WebKit QA → screenshot self-review → exact-head green → merge → exact-main CI + Browser QA + Pages deploy`.

Canonical build only:
`https://ys2mm422yb-max.github.io/poply/`
