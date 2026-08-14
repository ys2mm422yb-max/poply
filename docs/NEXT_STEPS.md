# Poply – Next Steps

Updated: 2026-08-14.

The original V2 foundation roadmap has largely been completed: Poply now has a persistent merge board, six-tier item families, generators, active orders, two playable Places, visible restoration, game-feel feedback, save/resume, fair energy regeneration and mandatory Browser QA.

The active feature-growth plan is now:
`docs/FEATURE_ROADMAP.md`

The active visual/architecture quality contract remains:
`docs/AAA_REBUILD_PLAN.md`

## Current priority
Poply must stop behaving like a strong vertical slice and start behaving like a real long-term game.

The next implementation order is:

1. **Milestone E1 — Player XP + Level system**
   - persistent XP and level;
   - XP from orders/restoration;
   - visible level progress;
   - level-up reward moment;
   - migration + deterministic tests + Browser QA.

2. **Milestone E2 — Collection Book + discoveries**
   - every discovered item tier recorded;
   - silhouettes for undiscovered tiers;
   - first-discovery feedback/reward;
   - generator and Place discoveries.

3. **Milestone F1 — Storage + Coin utility**
   - persistent storage tray;
   - fair capacity expansion;
   - first meaningful non-pay-to-win Coin sink;
   - safe board-full recovery tools.

4. **Milestone G — Daily goals / return loop**
   - three fair daily goals;
   - daily bonus customer;
   - useful rewards without punitive streak mechanics.

5. **Milestone H — World map / Place selector**
   - Café am Meer and Sonnenkai as real destinations;
   - completion/progress per Place;
   - authored path toward future Places.

6. **Milestone I — Place 03**
   - only after the above systems exist;
   - new production theme and gameplay wrinkle, not merely higher numbers.

## Parallel quality work
Milestone B remains OPEN. New features may not become an excuse for cheap UI, weak art, dead space, broken mobile layout or web-dashboard presentation. Every feature must integrate into the authored mobile game shell.

## Later systems
After the immediate sequence:
- deeper collection/achievements;
- economy and balancing tools;
- data-driven content pipeline;
- cloud save/account layer using Poply's dedicated backend only when the local schema is stable;
- themed events/live content;
- native iOS/iPadOS/Android packaging and store readiness.

## Permanent execution rule
Fix real gameplay/save/UX defects first. Otherwise take the highest-priority unfinished milestone from `docs/FEATURE_ROADMAP.md`. Do not spend a release only renaming markers, moving margins or adding another visual override.

Every non-trivial release must follow:
`fresh branch from main → implementation → deterministic tests → Mobile WebKit QA → screenshot self-review → PR exact-head green → merge → exact-main CI + Browser QA + Pages deploy`.

Canonical test URL remains:
`https://ys2mm422yb-max.github.io/poply/`
