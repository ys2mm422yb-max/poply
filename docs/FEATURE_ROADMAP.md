# Poply – Feature Roadmap

Status: ACTIVE · updated 2026-08-15.
Coordination / autonomous work log: GitHub Issue #42.

This document defines the product-growth order for Poply. Production quality and feature depth run in parallel: the game must become larger without returning to web/dashboard UI, and visual polish may not replace real gameplay progress.

## Live playable baseline
Already live on `main` before the current F2 reliability slice:
- persistent 7×7 merge Board / Werkbank;
- four six-tier item families across two Places;
- three generators including Sonnenkai/Tropenbar progression;
- three active customer orders;
- exact item consumption + Coins + restoration Stars;
- two Places with six restoration beats each;
- automatic fair Energy regeneration with visible countdown;
- persistent Player XP + Level system;
- Collection Book / Sammlung with item, generator and Place discoveries;
- discovery XP + authored discovery reward moment;
- persistent item Storage with 4 starting slots and permanent Coin-funded expansion to 6/8;
- fair Daily Goals + deterministic Daily Bonus Guest without streak punishment;
- replacement orders banded by visible Place restoration progress;
- World Map / Places overlay with safe completed-Place revisit;
- local save/resume and migrations;
- Board / Orders / Place / Sammlung navigation;
- sound, haptics, merge/delivery/reward/restoration feedback;
- deterministic CI + Mobile WebKit Browser QA + screenshot review + canonical Pages release gates.

This is now a meaningful multi-system vertical slice, not yet a full commercial game.

## Completed milestones
### E1 — Player XP + Level system — LIVE
- persistent XP and player level;
- XP from orders/restoration/discoveries;
- level-up Coin rewards;
- level-up presentation and reload safety.

### E2 — Collection Book + discovery rewards — LIVE
- persistent discoveries;
- family/tier silhouettes for unknown content;
- generator/Place discoveries;
- one-time discovery XP and reward moment.

### F1 — Storage tray + first meaningful Coin sink — LIVE
- item-only persistent Storage integrated with the Board;
- identity-safe Board ↔ Storage transfer;
- generators cannot be stored;
- 4 starting slots;
- permanent expansion 4→6 for 200 Coins and 6→8 for 450 Coins;
- no-loss/full-board/full-storage safety for transfer operations and real Mobile WebKit QA.

### G — Daily goals & fair return loop — LIVE
Contract: `docs/DAILY_GOALS.md`.
Merged PR: #43.

Shipped:
- deterministic local-calendar Daily state;
- exactly three goals using real actions;
- guaranteed merge + serve goals;
- contextual generate/discover/restore third goal;
- one-time Coin claims;
- one deterministic Daily Bonus Guest using a real Board item;
- Bonus Guest pays existing Coins + restoration Stars;
- no new token, no forced ad, no streak loss, no missed-day punishment;
- compact `HEUTE` entry inside Orders rather than another main tab;
- real WebKit flow for progress, claims, Bonus Guest and reload;
- accepted 390×844 and 390×720 screenshot review.

### H — World map / Poply Places progression — FIRST SLICE LIVE
Contract: `docs/WORLD_MAP.md`.
Merged PR: #48.

Shipped:
- authored Place map inside the existing Place screen, not another primary tab;
- Café am Meer and Sonnenkai shown as completed/current destinations;
- independent progress/completion per Place;
- completed Places can be revisited without changing live Board/meta state;
- authored scene preview at each Place's own restoration stage;
- locked/current/completed states remain explicit and deterministic;
- real WebKit map/revisit flow at 390×844 and 390×720.

Explicit active-Place gameplay switching remains deferred until order/generator semantics can preserve progress safely.

### K1 — Replacement-order difficulty bands — LIVE
- replacement orders are selected from deterministic bands based on visible restoration progress inside the current Place;
- freshly unlocked Sonnenkai no longer inherits a late global sequence into an immediate high-tier wall;
- existing active orders and payouts remain unchanged;
- no hidden dynamic difficulty or rigging.

## Active reliability milestone
### F2 — Guaranteed Board recovery via confirmed recycling — ACTIVE
Contract: `docs/STORAGE_SYSTEM.md`.
Active branch/PR is recorded in Issue #42.

Player problem:
Storage made Board management much safer, but a save with **Board full + Storage full** still had no guaranteed escape route. That violates the binding rule that full-board states remain recoverable.

Shipping contract:
- normal Board items expose a compact recycle action from the existing Lager drawer;
- recycling is never available for generators;
- every destructive action requires explicit confirmation;
- exactly one chosen item is removed;
- a small deterministic Coin return by tier is shown before confirmation and paid exactly once;
- no Energy cost, no hidden deletion, no Storage mutation;
- full Board + full Storage can always free one Board cell as long as a normal merge item exists;
- reload persists the freed slot and Coin return;
- deterministic unit tests plus real WebKit interaction and 390×844 / 390×720 screenshot acceptance.

Recycling is intentionally a recovery tool, not an economy shortcut. Its Coin return stays below the value of progressing through orders.

## Parallel production-quality track — Milestone B remains OPEN
GitHub Issue #42 contains the current user-facing visual direction and is binding for manual + automated visual work.

Current priority:
- Poply is still too dark / restrained / dashboard-like;
- introduce more authored color variety without losing hierarchy;
- stronger visual identity per item family and generator;
- warmer/colder Place contrast and brighter gameplay focal points;
- richer merge, discovery, delivery, level-up and restoration effects;
- performance-safe particles, glows, light sweeps and small environment motion;
- stronger Coin/Star/XP/reward moments;
- keep Reduced Motion support and one-screen Phone Board contract;
- visual changes must be accepted from generated 390×844 + 390×720 screenshots, not only by green tests.

## I — Place 03 & content expansion
Start after F2 is solid unless a more severe gameplay/save/release defect appears.

Requirements:
- own world/art direction;
- at least one genuinely new family or producer behavior;
- six meaningful restoration beats;
- new customer/order combinations;
- one fair readable gameplay wrinkle beyond higher numbers;
- migration + browser QA + screenshot acceptance.

## J — Collection depth & achievements
Candidates:
- item mastery/completion per family;
- guest book/customer collection;
- Place completion badges;
- non-grindy achievements;
- cosmetic rewards for meaningful milestones;
- profile/stat screen only when it contains genuinely useful progression.

## K — Economy, balancing & content configuration
Goal: make progression tunable before broad content scale.

Build:
- move order templates, rewards, generator output and Place costs into clearer data/config modules;
- automated progression simulations/tests;
- continue difficulty/pacing work beyond the shipped K1 order bands;
- pacing targets for Energy, merges, orders, Stars, Coins and restoration;
- audit every currency for a clear purpose;
- no hidden rigging or dynamic difficulty that falsifies outcomes.

## L — Cloud save / account layer
Only after local schema is stable.

Build:
- dedicated Poply cloud-save model;
- optional account/sign-in;
- conflict-safe sync;
- local-first offline behavior;
- privacy-minimal data.

## M — Events / live content
Only after the base progression is deep enough.

Candidates:
- themed limited order sets;
- temporary Place themes;
- fair event reward tracks;
- special customer stories;
- event-specific Collection pages.

No punitive urgency, forced ads or pay-to-win.

## N — Native release readiness
- installable PWA quality pass;
- iOS/iPadOS + Android packaging from the same codebase;
- device QA matrix;
- app icons, launch assets, store screenshots and metadata;
- privacy disclosures;
- performance/battery/network audits;
- accessibility/reduced-motion checks.

# Immediate build order
Unless a real gameplay/save/release bug takes priority:
1. **Finish F2 — guaranteed Board recovery.**
2. **Continue screenshot-driven color/effects production passes in parallel.**
3. **I — Place 03.**
4. **J/K — deeper collection, achievements, economy/balancing.**
5. **L/N — cloud/native release only when local product systems are stable.**

# Autonomous coordination rule
GitHub Issue #42 is the durable cross-worker memory.

Every manual/Product-Automation/Visual-Automation work session must record:
- worker;
- start `main` SHA;
- branch / PR / exact head;
- concrete files/systems changed;
- tests and workflow run IDs;
- generated screenshots actually opened;
- visible findings / rejected variants;
- merge/deploy state;
- next free task.

A substantial autonomous run is not complete without GitHub documentation.

# Feature-selection rule
Before adding a feature, answer:
- What player problem does it solve?
- What new decision, motivation or reward does it create?
- Does it connect to the core loop rather than sit as a disconnected menu?
- Can it be tested deterministically?
- Can it fit the current mobile shell without returning to web-dashboard UI?

If those answers are weak, do not build it yet.

# Release rule
Every non-trivial feature ships through:
`fresh branch from current main → implementation → deterministic tests → Mobile WebKit QA → screenshot self-review → PR exact-head green → merge → exact-main CI + Browser QA + Pages deploy`.

Canonical test URL remains:
`https://ys2mm422yb-max.github.io/poply/`
