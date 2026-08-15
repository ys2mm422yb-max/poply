# Poply – Feature Roadmap

Status: ACTIVE · updated 2026-08-15.
Durable coordination: GitHub Issue #42.

Poply grows on two parallel tracks: real product/gameplay depth and screenshot-driven production quality. Neither track may overwrite active work from the other.

## Live product baseline
Already live before the current reliability slice:
- persistent 7×7 merge Board / Werkbank;
- four established six-tier item families across Café am Meer and Sonnenkai;
- multiple generators;
- three simultaneous customer orders with deterministic replacement-order difficulty bands;
- exact delivery consumption + Coins + restoration Stars;
- two visible restoration arcs;
- fair regenerating Energy plus persistent Player XP/Levels;
- Collection / Discovery;
- persistent Storage with permanent Coin expansion;
- Daily Goals + fair Bonus Guest;
- first Places world-map/revisit slice;
- Player milestone/title/reward-preview progression surfaces;
- local save/resume and migration safety;
- CI + Mobile WebKit + screenshot self-review + canonical Pages release gates.

## Completed milestones
### E — Player XP + Level — LIVE
Persistent XP, deterministic level curve, XP from core progression actions and visible deterministic reward previews.

### E2 — Collection Book + discovery — LIVE
Persistent discoveries, silhouettes, one-time discovery progression and family presentation.

### F1 — Storage + first permanent Coin sink — LIVE
4 starting slots, identity-safe Board ↔ Storage transfer, generators excluded, permanent Coin-funded capacity expansion.

### G — Daily Goals + fair return loop — LIVE
Three deterministic daily goals plus one Bonus Guest, no streak punishment, forced ad or new currency.

### H — World Map / Places first slice — LIVE
Café and Sonnenkai map presentation with safe completed-Place revisit and independent progress display.

### J — Player progression depth — LIVE / continuing
Long-term milestones, cosmetic titles, next-Level reward/XP preview and related non-grindy progression cues are integrated into the existing Level sheet rather than a disconnected profile dashboard.

### K1 — Replacement-order difficulty bands — LIVE
Replacement orders scale from visible restoration progress rather than opaque hidden adjustment.

## Active product slice — F2 guaranteed Board recovery
Branch: `feature/storage-recycling-recovery`.
Start main: `6874efb534dd5539bb93703b0de4fc196f251328`.

Player problem:
Storage solves normal Board pressure, but a full Board plus full Storage can otherwise create a hard deadlock. Binding project rules require a fair recovery tool.

Contract:
- explicit Storage Recycling mode;
- player chooses exactly which stored item is removed;
- deterministic tier-based Coin value is shown before removal;
- no random deletion, hidden loss, purchase, ad, new currency or forced item choice;
- recycling removes exactly one selected stored item and frees one Storage slot;
- storing one chosen Board item into that new slot creates exactly one Board vacancy;
- exact item identity, Coin reward and recovered layout persist after reload;
- deterministic tests plus full Storage WebKit QA at 390×844 and 390×720.

## Place 03 — reopen later from fresh main
Former PR #58 (`Milestone I: Place 03 Dachgarten`) is closed and unmerged. Its old branch is not an active integration source.

The product target still wants a genuinely distinct third Place with new content and a meaningful gameplay wrinkle, but that work must be re-planned from then-current `main` after the reliability slice, not revived wholesale from a stale draft.

## Milestone B — visual production quality — OPEN in parallel
Current goals remain stronger color/material identity, better item/generator differentiation, more authored Board atmosphere, stronger merge/discovery/delivery/restoration effects and less dashboard-like presentation. Generated phone screenshots remain the acceptance evidence.

Visual workers must continue choosing files that do not overlap the active Storage/session reliability slice.

## J — Collection depth & achievements — continuing
Potential future slices:
- family mastery/completion;
- guest/customer collection;
- Place completion badges;
- non-grindy achievements;
- cosmetic-only milestone rewards when they add visible player value;
- no disconnected generic profile dashboard.

## K — Economy, balancing & configuration
- continue moving content/reward/generator/Place costs toward data-driven configuration;
- automated progression simulations;
- pacing targets for Energy, merges, orders, Stars, Coins and restoration;
- every currency must have a clear player purpose;
- no hidden rigging or dynamic difficulty that falsifies outcomes.

## L — Optional cloud/account layer
Only after local schema and progression are stable: local-first, conflict-safe sync, privacy-minimal account data.

## M — Events/live content
Only after base progression has enough depth. No punitive urgency, forced ads or pay-to-win.

## N — Native release readiness
Shared codebase, PWA/native packaging, iPhone/iPad/Android device matrix, app assets, privacy, performance/battery/accessibility audits.

# Immediate build order
1. Finish guaranteed Board-full + Storage-full recovery through exact-head deterministic + Mobile WebKit QA and screenshot review.
2. Verify exact merged `main` with normal CI, Browser QA and canonical Pages.
3. Re-read current main/open ownership and re-plan Place 03 from fresh main.
4. Continue screenshot-first visual/effects work independently.
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
Every worker reads current `main`, all open PRs and Issue #42 before writes. Active changed-file overlap means choose another task. Every substantive run writes a final Issue #42 handoff with start main, branch/PR/exact head, files/systems, tests/run IDs, screenshots actually opened, visual findings, merge/deploy state, blockers and next free work.

# Release rule
`fresh branch from current main → implementation → deterministic tests → Mobile WebKit QA → screenshot self-review → exact-head green → merge → exact-main CI + Browser QA + Pages deploy`.

Canonical build only:
`https://ys2mm422yb-max.github.io/poply/`
