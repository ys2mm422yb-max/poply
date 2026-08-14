# Poply – Feature Roadmap

Status: ACTIVE · updated 2026-08-15.
Durable coordination: GitHub Issue #42.

Poply grows on two parallel tracks: real product/gameplay depth and screenshot-driven production quality. Neither track may overwrite active work from the other.

## Live product baseline after Milestone I
- persistent 7×7 merge Board / Werkbank;
- five six-tier item families across Café am Meer, Sonnenkai and Dachgarten;
- four generators, including Dachgarten's deterministic `Gewächshaus` harvest cycle;
- three simultaneous customer orders with Place-local deterministic replacement difficulty bands;
- exact delivery consumption + Coins + restoration Stars;
- three six-step restoration arcs;
- fair regenerating Energy;
- Player XP + Levels + long-term Player Milestone shelf;
- Collection / Discovery with 30 item tiers plus generator/Place discoveries;
- persistent Storage with permanent Coin expansion;
- Daily Goals + fair Bonus Guest;
- three-Place World Map with sequential unlocks and safe revisit/preview;
- local save/resume and migration safety;
- CI + Mobile WebKit + dedicated Place03 WebKit + screenshot self-review + canonical Pages release gates.

## Completed milestones
### E1 — Player XP + Level — LIVE
Persistent XP, deterministic level curve, XP from orders/restoration/discovery, Coin rewards on crossed levels and reload-safe presentation.

### E2 — Collection Book + discovery — LIVE
Persistent item/generator/Place discoveries, silhouettes, one-time discovery XP and reveal.

### F1 — Storage + first permanent Coin sink — LIVE
4 starting slots, identity-safe Board ↔ Storage transfer, generators excluded, upgrades 4→6 for 200 Coins and 6→8 for 450 Coins.

### G — Daily Goals + fair return loop — LIVE via PR #43
Three deterministic daily goals plus one Bonus Guest, no streak punishment, forced ad or new currency.

### H — World Map / Places first slice — LIVE via PR #48
Safe completed-Place revisit/preview with independent progress display; now extended through Place03.

### I — Place 03 · Dachgarten — LIVE via PR #58
Distinct rooftop-greenhouse Place with:
- new six-tier herb family;
- new `Gewächshaus` producer;
- visible deterministic four-step harvest cycle where every fourth successful production yields tier 2;
- six authored restoration beats;
- own order difficulty bands;
- Collection and three-Place World Map integration;
- migration/no-loss guarantees;
- dedicated real WebKit release flow and 390×844/390×720 visual acceptance.

### J1 — Player Milestone shelf — LIVE via PR #59
The existing Level badge is an intentional long-term progress entry point with five milestones derived from already-persisted progress; no duplicate achievement save state or claim currency.

### K1 — Replacement-order difficulty bands — LIVE
Replacement orders scale from visible restoration progress rather than an opaque global sequence.

## Milestone B — visual production quality — OPEN in parallel
Continue only where screenshots show real weakness: stronger material/color identity, clearer generator differentiation, richer merge/discovery/delivery/restoration feedback and environmental life without decorative noise. Reduced Motion and one-screen Board remain binding.

Independent PR #55 currently owns dynamic gameplay-FX evidence/workflow/motion files. Do not overwrite that scope; integrate only from then-current `main` after its own visual acceptance.

## Next reliability milestone — guaranteed Board recovery
Binding rules require full-board states to remain fairly recoverable. Storage solves most pressure, but the next fresh product slice should explicitly solve **Board-full + Storage-full** without item loss, hidden deletion, randomness or monetization pressure.

Acceptance should include deterministic deadlock-state tests and real mobile recovery flow before merge.

## J2 — Collection depth / Guest Book / achievements
After Place03:
- family mastery/completion;
- guest/customer collection;
- Place completion badges;
- non-grindy achievements derived from canonical progress;
- cosmetic-only milestone rewards where they add visible value;
- no disconnected generic profile dashboard.

## K — Economy, balancing & configuration
- continue moving content/reward/generator/Place costs toward data-driven configuration;
- automated progression simulations across all three Places;
- pacing targets for Energy, merges, orders, Stars, Coins and restoration;
- every currency must have a clear player purpose;
- no hidden rigging/dynamic difficulty that falsifies outcomes.

## L — Optional cloud/account layer
Only after local schema and progression are stable: local-first, conflict-safe sync, privacy-minimal account data using Poply's dedicated backend.

## M — Events/live content
Only after base progression has enough depth. No punitive urgency, forced ads or pay-to-win.

## N — Native release readiness
Shared codebase, PWA/native packaging, iPhone/iPad/Android device matrix, app assets, privacy, performance/battery/accessibility audits.

# Immediate build order
1. Land/verify Milestone I Place03 through exact-head and exact-main release gates.
2. Resolve/integrate independent dynamic FX PR #55 only after its own screenshot acceptance.
3. Build guaranteed Board-full + Storage-full recovery on a fresh current-main branch.
4. Continue deeper Collection/Guest Book/achievements.
5. Continue economy simulation/configuration before broad content scaling.

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
`fresh branch from current main → implementation → deterministic tests → Mobile WebKit QA → screenshot self-review → exact-head green → merge → exact-main CI + Browser QA + feature-specific QA + Pages deploy`.

Canonical build only:
`https://ys2mm422yb-max.github.io/poply/`
