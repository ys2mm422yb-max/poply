# Poply current status

Updated: 2026-08-16

## Current production baseline
The latest shipped gameplay/visual release is PR #127, merge commit `3112b6d5e049539bd3d2ed9c3b75f6039ab9c72b`. It contains the full current Poply product baseline:
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
- Café am Meer Scene V2 with authored 2.5D depth, materially larger stage transformations, living-world motion, build-camera payoff and real completed-state revisit QA;
- automatic installed-PWA update path, same-origin service-worker behavior and iOS standalone safe-area protection;
- previous-valid LocalStorage backup / corrupt-save recovery;
- mandatory deterministic CI + Mobile WebKit + screenshot review + Place03/PWA QA + canonical Pages release gates.

## Recently shipped sequence
The latest gameplay/visual depth sequence is complete:
- PR #116 — current-main Guest Loyalty rebuild;
- PR #119 — untouched legacy starter-save migration;
- PR #121 — tactical Merge Flow generator boosts;
- PR #123 — optional Service Specials;
- PR #125 — persistent powers from Café upgrades;
- PR #127 — Café am Meer Scene V2.

There are currently no open product pull requests or product feature issues. Issue #42 is the only open issue and remains the durable coordination/work log.

## Latest accepted visual and release evidence
Accepted Scene V2 head: `9133ef954d51671b306b0d485dea15f336dee447`.

Pre-merge acceptance:
- CI `31914022157` — success;
- Browser QA `31914022217` — success;
- Place 03 QA `31914022160` — success;
- PWA Update QA `31914022164` — success;
- Browser artifact `9254502284` — all 14 Café Scene V2 screenshots manually opened and accepted at 390×844 / 390×720 after reject/fix iterations.

Post-merge verification on exact release commit `3112b6d5e049539bd3d2ed9c3b75f6039ab9c72b`:
- CI `31914437255` — success;
- Browser QA `31914437232` — success;
- Place 03 QA `31914437491` — success;
- PWA Update QA `31914437200` — success;
- canonical Pages deploy `31914437244` — success.

## Save/backend status
The shipped game remains local-first. Runtime save/resume uses `localStorage` with a previous-valid backup and migration safety; no cloud database is required by the current game loop.

A Neon project named `Poply` exists separately, but as of this status sync it is not wired into the repository/runtime and contains no application tables. Do not introduce a backend dependency implicitly; cloud/accounts remain a later explicit product decision.

## Current product priorities
1. Choose the next gameplay-depth slice from fresh current `main`; a strong candidate is a temporary Board/service event that changes short-term decisions rather than another passive progression screen.
2. Continue screenshot-first visual/game-feel production quality across the remaining weaker surfaces while preserving the 390×720 one-screen contract.
3. Continue economy/pacing/configuration work so Energy, Coins, Stars, rewards and chapter pacing remain evidence-based and regression-safe.
4. Keep PWA/update/save reliability healthy as infrastructure.
5. Cloud/accounts, live events and native packaging remain later phases, not current blockers.

## Durable coordination rule
Every substantial worker run records in Issue #42: exact starting `main`, branch/PR/head, changed systems, test/run IDs, screenshots actually opened, visible findings, merge/deploy state, blockers and next free task.

A green assertion is not visual acceptance. Any visual change must still be reviewed from generated 390×844 and 390×720 GitHub Actions screenshots before merge.
