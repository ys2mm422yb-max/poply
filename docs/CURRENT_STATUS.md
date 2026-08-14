# Poply current status

Updated: 2026-08-15

## Production baseline after Milestone I release
`main` includes:
- persistent 7×7 merge Board / Werkbank;
- Place 01 · Café am Meer, Place 02 · Sonnenkai and Place 03 · Dachgarten, each with six authored restoration steps;
- five six-tier item families and four generators;
- Dachgarten `Gewächshaus` with a visible deterministic four-production harvest cycle; every fourth successful production yields herb tier 2, with no randomness or hidden weighting;
- three simultaneous customer orders with Place-local deterministic replacement difficulty bands;
- Coins, restoration Stars, fair regenerating Energy, Player XP/Levels and the persistent Player Milestone shelf;
- Collection/Discovery with 30 item tiers plus generator/Place discoveries;
- persistent Storage + permanent Coin expansion;
- Daily Goals + fair Bonus Guest;
- three-Place World Map with sequential unlocks and safe revisit/preview;
- local save/resume and migration safety;
- mandatory CI + Mobile WebKit + dedicated Place03 WebKit + screenshot review + canonical Pages release gates.

Milestone B visual quality remains OPEN globally: presentation can keep improving, but current feature work may not regress into dark dashboard/web-app styling.

## Current release evidence
Milestone I implementation is tracked in PR #58 and `docs/PLACE_03_DACHGARTEN.md`.
The accepted release must preserve Player Milestone shelf commit `6e01b1d5b353bc37566068b9663379678c08f97d` and pass all exact-head and exact-main gates logged in Issue #42.

## Active independent work
### PR #55 — dynamic gameplay FX evidence
Independent visual/evidence scope. It owns dynamic FX workflow/motion files and must be integrated only from current `main` without overwriting Place03.

## Next product priorities
1. Guarantee fair Board-full + Storage-full recovery on a fresh post-Place03 branch without deleting items or requiring monetization.
2. Deepen Collection/achievements/Guest Book using existing persistent progress instead of a disconnected profile dashboard.
3. Continue economy/balancing/configuration work and automated progression simulation.
4. Continue screenshot-driven color/effects polish where real captures show weak reward or environmental feedback.
5. Keep cloud/account work deferred until local progression/content schema is stable.

## Backend
No Place03 backend migration is required. Poply remains local-first; dedicated Poply Neon stays reserved for the later cloud/account layer.

## Durable coordination
GitHub Issue #42 is the mandatory cross-worker work log. Every substantial worker run records exact starting `main`, branch/PR/head, changed systems, test/run IDs, screenshots actually opened, visible findings, merge/deploy state, blockers and the next free task.
