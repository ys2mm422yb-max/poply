# Poply current status

Updated: 2026-08-15

## Live baseline
Current production `main` is a persistent merge-and-build game with:
- persistent 7×7 merge Board / Werkbank;
- Place 01 · Café am Meer, Place 02 · Sonnenkai and Place 03 · Dachgarten with visible restoration progression;
- five six-tier item families and four generators, including Dachgarten's deterministic four-step harvest bonus;
- three simultaneous customer orders with deterministic Place-local difficulty bands;
- Coins, restoration Stars, fair regenerating Energy and Player XP/Levels;
- Collection/Discovery + family mastery, persistent Storage + Coin expansion + explicit full/full recycling recovery;
- Daily Goals + Bonus Guest;
- Places world-map/revisit flow;
- Player milestones, titles, Place badges, next-Level reward/XP and Energy-capacity previews;
- automatic installed-PWA update path and iOS standalone safe-area protection;
- previous-valid LocalStorage backup / corrupt-save recovery;
- local save/resume and migration safety;
- mandatory CI + Mobile WebKit + screenshot review + canonical Pages release gates.

Milestone B visual quality remains open globally and continues independently through screenshot-first visual PRs. GitHub Issue #42 is the durable cross-worker work log.

## Current manual product slice — visible purpose loop
Issue: #107 `Product: give Poply a clear purpose loop and visible next goal`.
PR: #108 `Purpose: make the next meaningful goal visible`.
Start `main`: `0be50bdb8c18f17b93ff406a65dcfc16f1ecd620`.
Branch: `feature/purpose-loop-visible-goal`.

Player problem:
Poply already contains the right systems, but their causal relationship is under-communicated. The player can merge, serve, collect Stars/Coins/XP and build Places without continuously seeing what those actions are building toward or what will visibly change next.

Implementation contract:
- one deterministic purpose model derives the current meaningful goal from existing Place restoration state;
- no new currency, quest tab, claim loop or backend state;
- Board shows the current restoration target, distance and `Danach`, and routes the player to the Place instead of silently building from the Board;
- Orders show how the selected Star reward contributes to the current restoration goal;
- Place renders the exact authored next SVG restoration group as a pre-build blueprint for all three Places / 18 steps;
- after a real build, the exact newly built group is highlighted and the next authored group becomes the preview;
- Place goal story text is not truncated;
- reward/progression feedback reconnects to the same current-goal vocabulary;
- deterministic tests plus dedicated real WebKit purpose QA cover 390×844 and 390×720.

Reference screenshots supplied by the user are treated as motivation-architecture inspiration only. Poply does not copy their art, characters, layout or monetization.

## Coordination
Open PR #99 (`Guests: add persistent loyalty collection progression`) owns guest/session/Collection loyalty state. Purpose-loop work deliberately avoids that domain.

Issue #103 (`Product: make Place upgrades worth chasing before and after build`) is the focused Place anticipation/payoff subset of #107 and should close with the purpose implementation once exact-head QA and visual acceptance pass.

Neon/backend is not required for this slice.

## Next product priorities
1. Finish #108 exact-head CI + Browser QA and open the generated purpose screenshots at 390×844 and 390×720.
2. Reject/fix any layout, hierarchy or payoff weakness before merge; a green browser assertion alone is not visual acceptance.
3. Merge #108 only after exact-head gates pass, then verify exact-main CI + Browser QA + Place03 QA + PWA Update QA + canonical Pages deploy.
4. Re-read PR #99 ownership and Issue #42 before taking the next product task.
5. Continue economy/pacing and visual quality only where they strengthen the core merge → serve → build → world-change loop.

## Durable coordination rule
Every substantial worker run records in Issue #42: exact starting main, branch/PR/head, changed systems, test/run IDs, screenshots actually opened, visible findings, merge/deploy state, blockers and next free task.
