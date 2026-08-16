# Poply current status

Updated: 2026-08-16

## Current production baseline
Current verified product release main is `8cdeeab8f1c50c97a83c8b569bda9bddce0564c6`, the merge commit of PR #132 (Service-Ruf). A documentation-only release-sync PR follows this commit so the durable status text matches the shipped product; it does not change runtime/gameplay/save/economy/backend behavior.

Production includes:
- persistent 7×7 merge Board / Werkbank;
- Place 01 · Café am Meer, Place 02 · Sonnenkai and Place 03 · Dachgarten with six-step restoration progression;
- five six-tier item families and four generators, including Dachgarten's deterministic harvest bonus;
- authored First Session with immediate first serve/build payoff, combo orders, anti-repeat selection and Place-stage content pools;
- three simultaneous customer orders with deterministic Place-local difficulty bands;
- Coins, restoration Stars, fair regenerating Energy and Player XP/Levels;
- visible purpose loop across Board, Orders and Place, including next-build blueprint and actionable next-step CTA;
- Collection/Discovery with family mastery and one-time final-tier mastery rewards;
- persistent Storage + Coin expansion + explicit full/full recycling recovery;
- contextual Daily Goals + Bonus Guest;
- Places world-map/revisit flow;
- persistent Mika/Nora/Sam Guest Loyalty with automatic one-time milestone rewards;
- migration of untouched legacy starter orders into the rebuilt First Session without rewriting progressed saves;
- tactical Merge Flow: successful merges charge a player-chosen generator boost;
- optional Service Specials that reward different short-term play styles without blocking normal delivery;
- persistent Café upgrade powers: Abendservice, Vorbereitung and Gastwahl;
- **Service-Ruf**: deterministic optional next-guest commitment with Direkt / Nachschub tradeoff;
- Café am Meer Scene V2 with authored 2.5D depth, larger stage transformations, living-world motion, build-camera payoff and real completed-state revisit QA;
- Place Screen V3 with Café-first hierarchy, compact restoration objective/progress and world map reduced to a scene utility;
- automatic installed-PWA update path, same-origin service-worker behavior and iOS standalone safe-area protection;
- previous-valid LocalStorage backup / corrupt-save recovery;
- mandatory deterministic CI + Mobile WebKit + screenshot review + Place03/PWA QA + canonical Pages release gates.

## Recently shipped sequence
- PR #116 — Guest Loyalty rebuild;
- PR #119 — untouched legacy starter-save migration;
- PR #121 — tactical Merge Flow generator boosts;
- PR #123 — optional Service Specials;
- PR #125 — persistent powers from Café upgrades;
- PR #127 — Café am Meer Scene V2;
- PR #128 — release/status documentation sync;
- PR #130 — Place Screen V3 café-first hierarchy cleanup;
- PR #132 — Service-Ruf tactical next-guest decision.

### Place Screen V3 release
Accepted head: `9a75722705830140d78b1812d06281374d3e95d3`.
Production merge commit: `3b6754b04b12902d25960884bedbc13e7d7c3853`.
Its 14 Café stage screenshots at 390×844 / 390×720 were actually opened and accepted before merge, and exact-main CI, Browser QA, PWA Update QA, Place03 QA and canonical Pages deployment passed after merge.

### Service-Ruf release
Accepted head: `3d08523b65c73fdf2beaac9ff460ac62d31e213c`.
Production merge commit: `8cdeeab8f1c50c97a83c8b569bda9bddce0564c6`.

Service-Ruf is deterministic and optional:
- every 3 resolved normal services, choose one waiting guest;
- **Direkt**: chosen guest must be next for a modest Coin bonus;
- **Nachschub**: 2 successful generator actions first, then that same guest next for a larger Coin bonus;
- another delivery or an early Nachschub target delivery expires only the optional bonus and never blocks normal service;
- no timer/FOMO, new currency, hidden RNG, base-order rebalance or Neon dependency.

Accepted Browser artifact: `9261945619`. Four Service-Ruf phone screenshots were actually opened/reviewed before merge: ready 390×844, Nachschub 2/2 Board 390×844, success 390×844 and ready 390×720. The first technically green 390×720 candidate was manually rejected because the fixed bottom navigation partly covered `Liefern`; the accepted version fixed this and added an explicit Browser QA no-nav-overlap assertion.

Exact accepted-head gates:
- CI `31940477484`;
- Browser QA `31940477492`;
- PWA Update QA `31940477487`;
- Place 03 QA `31940477536`.

Exact production-main release gates:
- CI `31940888464`;
- Browser QA `31940888460`;
- PWA Update QA `31940888461`;
- Place 03 QA `31940888448`;
- canonical Pages deploy `31940888456`.

Authoritative mechanic details: `docs/SERVICE_CALL.md`.

## Save/backend status
The shipped game remains local-first. Runtime save/resume uses `localStorage` with a previous-valid backup and migration safety; no cloud database is required by the current game loop.

A Neon project named `Poply` exists separately, but it is not wired into the repository/runtime and contains no application tables. Do not introduce a backend dependency implicitly; cloud/accounts remain a later explicit product decision.

## Current product priorities
1. Start the next product slice only if it creates a genuinely new decision/reward and does not duplicate Merge Flow, Service Specials, Café powers or Service-Ruf.
2. Continue screenshot-first visual/game-feel production quality across remaining weaker surfaces while preserving the 390×720 one-screen contract.
3. Continue economy/pacing/configuration work so Energy, Coins, Stars, rewards and chapter pacing remain evidence-based and regression-safe.
4. Keep PWA/update/save reliability healthy as infrastructure.
5. Cloud/accounts, live events and native packaging remain later phases, not current blockers.

## Durable coordination rule
Every substantial worker run records in Issue #42: exact starting `main`, branch/PR/head, changed systems, test/run IDs, screenshots actually opened, visible findings, merge/deploy state, blockers and next free task.

A green assertion is not visual acceptance. Any visual change must still be reviewed from generated 390×844 and 390×720 GitHub Actions screenshots before merge.
