# Poply – Next Steps

Updated: 2026-08-15.

Poply is now past the original vertical-slice phase. The live game structure includes persistent merging, three Places, five six-tier item families, four generators, Place-local orders, XP/Levels, long-term milestones, Collection, Storage, Daily Goals, World Map and authored restoration.

The active feature-growth plan is:
`docs/FEATURE_ROADMAP.md`

The active visual/architecture quality contract remains:
`docs/AAA_REBUILD_PLAN.md`

## What just changed
Milestone I adds **Place 03 · Dachgarten** as a real new gameplay chapter rather than a color swap:
- rooftop-greenhouse art direction;
- new herb merge family;
- new `Gewächshaus` producer;
- visible deterministic four-step Erntebonus cycle;
- six restoration beats;
- garden-specific order bands;
- Collection and World Map integration;
- dedicated WebKit release flow.

The Player Milestone shelf from PR #59 also remains part of the baseline and must never be lost during feature integration.

## Current priority order
1. **Finish exact-main release verification for Place03.**
   - CI;
   - complete normal Mobile WebKit suite;
   - dedicated Place03 WebKit flow;
   - canonical Pages deploy;
   - screenshot self-review.

2. **Guaranteed Board-full + Storage-full recovery.**
   - fair player-controlled recovery;
   - no item deletion/loss;
   - no random rescue;
   - no paywall/monetization pressure;
   - deterministic deadlock-state tests and real mobile flow.

3. **Collection / Guest Book / achievements depth.**
   - mastery/completion;
   - customer/guest collection;
   - Place completion badges;
   - non-grindy milestones derived from canonical progress.

4. **Economy and balancing simulation/configuration.**
   - simulate progression through all three Places;
   - verify Energy/Coins/Stars/order difficulty/restoration pacing;
   - move content balancing toward data-driven configuration.

5. **Continue visual production quality in parallel.**
   - only screenshot-driven improvements;
   - richer dynamic merge/generator/discovery/reward feedback where evidence shows weakness;
   - more environmental life without clutter;
   - Reduced Motion and mobile performance remain mandatory.

## Later systems
After local progression/reliability are stable:
- deeper content pipeline;
- optional cloud save/account layer through Poply's dedicated backend;
- fair themed events/live content;
- native iOS/iPadOS/Android packaging and store readiness.

## Permanent execution rule
Fix real gameplay/save/UX defects first. Otherwise take the highest-priority unfinished milestone from `docs/FEATURE_ROADMAP.md`. Do not spend a release only renaming markers, moving margins or stacking another visual override.

Every non-trivial release follows:
`fresh branch from main → implementation → deterministic tests → Mobile WebKit QA → feature-specific QA → screenshot self-review → PR exact-head green → merge → exact-main CI + Browser QA + feature-specific QA + Pages deploy`.

Canonical test URL remains:
`https://ys2mm422yb-max.github.io/poply/`
