# Poply current status

Updated: 2026-08-15

## Current production baseline
Current production `main` is `19a43e897c54c8b21d447c107162dcaa8c80c73b` and contains:
- persistent 7×7 merge Board / Werkbank;
- Place 01 · Café am Meer, Place 02 · Sonnenkai and Place 03 · Dachgarten with visible restoration progression;
- five six-tier item families and four generators, including Dachgarten's deterministic four-step harvest bonus;
- authored First Session: an immediate first serve/build payoff, real opening combo orders, anti-repeat replacement selection and Place-stage order pools;
- three simultaneous customer orders with deterministic Place-local difficulty bands;
- Coins, restoration Stars, fair regenerating Energy and Player XP/Levels;
- visible purpose loop across Board, Orders and Place, including next-build blueprint and actionable next-step CTA;
- Collection/Discovery with family mastery and one-time final-tier mastery rewards;
- persistent Storage + Coin expansion + explicit full/full recycling recovery;
- contextual Daily Goals + Bonus Guest without two permanently fixed daily tasks;
- Places world-map/revisit flow;
- materially richer Café am Meer restoration stages with authored workers/guests/steam/light/terrace life and Reduced Motion support;
- Place 01 upgrades that unlock broader gameplay/order content as well as visible scene changes;
- Player milestones, titles, Place badges, next-Level reward/XP and Energy-capacity previews;
- automatic installed-PWA update path, absolute same-origin service-worker registration and iOS standalone safe-area protection;
- previous-valid LocalStorage backup / corrupt-save recovery;
- local save/resume and migration safety;
- mandatory CI + Mobile WebKit + screenshot review + Place03/PWA QA + canonical Pages release gates.

The First Session rebuild is complete: Issue #109 is closed; PR #110 shipped the seven-block rebuild and PR #113 closed the final post-merge ready-order copy defect from #111.

Latest exact-main verification for `19a43e897c54c8b21d447c107162dcaa8c80c73b`:
- CI `31898264006` — success;
- Browser QA `31898264009` — success;
- Place 03 QA `31898264011` — success;
- PWA Update QA `31898263997` — success;
- canonical deploy `31898264018` — success.

GitHub Issue #42 remains the durable cross-worker work log.

## Open product ownership
PR #99 `Guests: add persistent loyalty collection progression` is still open, but it is **not merge-ready**.

Current audit against `main`:
- PR #99 head: `a1e0d1c4b392f11d62e9b30139079646f6e36927`;
- merge base: `cabfb7797b5e8647d24499e5eb9c02f1a846dfa4`;
- it has diverged from current `main` and is 8 commits behind / 11 commits ahead;
- its stale diff touches `aaa-session.js`, Collection, Browser QA, `sw.js` and PWA update tests and would overwrite newer First-Session/PWA behavior if merged blindly.

Therefore #99 must be closed/replaced by a fresh current-main implementation if Guest Loyalty is retained. The useful product contract can be preserved; the stale branch implementation cannot be merged as-is.

## Current product priorities
1. Resolve stale PR #99 safely: preserve only the Guest Loyalty product contract and rebuild it from current `main` without reverting newer code.
2. Continue Milestone B visual production quality: stronger authored game-world presence, color/material identity, motion and reward payoff while reducing dashboard-like UI.
3. Continue K economy/pacing/configuration: centralized tuning data, progression simulations and clear currency purpose across all three Places.
4. Only then broaden Collection/world completion where it strengthens the merge → serve → build → world-change loop.
5. Cloud/accounts, live events and native packaging remain later phases, not current blockers.

## Durable coordination rule
Every substantial worker run records in Issue #42: exact starting main, branch/PR/head, changed systems, test/run IDs, screenshots actually opened, visible findings, merge/deploy state, blockers and next free task.

A green assertion is not visual acceptance. Any visual change must still be reviewed from generated 390×844 and 390×720 GitHub Actions screenshots before merge.
