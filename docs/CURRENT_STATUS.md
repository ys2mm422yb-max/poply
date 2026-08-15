# Poply current status

Updated: 2026-08-15

## Live baseline
Current production `main` is a persistent merge-and-build game with:
- persistent 7×7 merge Board / Werkbank;
- Place 01 · Café am Meer, Place 02 · Sonnenkai and Place 03 · Dachgarten with visible restoration progression;
- five six-tier item families and four generators, including Dachgarten's deterministic four-step harvest bonus;
- three simultaneous customer orders with deterministic Place-local progression;
- Coins, restoration Stars, fair regenerating Energy and Player XP/Levels;
- Collection/Discovery + family mastery, persistent Storage + Coin expansion + explicit full/full recycling recovery;
- contextual Daily Goals + Bonus Guest;
- Places world-map/revisit flow;
- Player milestones, titles, Place badges, next-Level reward/XP and Energy-capacity previews;
- visible purpose loop connecting Board → Orders → Place restoration;
- automatic installed-PWA update path, absolute same-origin service-worker registration and iOS standalone safe-area protection;
- previous-valid LocalStorage backup / corrupt-save recovery;
- local save/resume and migration safety;
- mandatory CI + Mobile WebKit + screenshot review + canonical Pages release gates.

Milestone B visual quality remains open globally and continues independently through screenshot-first visual work. GitHub Issue #42 is the durable cross-worker work log.

## Current manual product slice — first session rebuild
Issue: #109 `Product: make the first session varied, alive and worth rebuilding`.
PR: #110 `First session: make Poply varied, alive and worth rebuilding`.
Start `main`: `a8fdca6076884882e1beed332994a7140b465e55`.
Branch: `feature/first-session-alive`.
Screenshot-accepted implementation head before documentation closeout: `f71a2fb909f2594de293b1e33b1fd580f2c18ab6`.

Player problem:
The previous purpose work made the goal understandable but did not make the first minutes sufficiently varied or the Café sufficiently alive. Fresh players still saw repetitive simple jobs and too little visible world change for the effort spent restoring Place 01.

Implemented contract:
- fresh session starts with one 4-Star fast payoff plus two distinct two-family combo orders;
- replacement orders avoid both visible duplicates and the just-served title;
- Place 01 restoration stage unlocks broader Coast order pools and increasing complexity;
- each of the six Café upgrades now materially changes the authored scene;
- built Café elements include ambient life such as lighting, steam, barista/guest movement, planters and celebration details with Reduced Motion safety;
- Place upgrades expose concrete gameplay/content unlocks instead of being only cosmetic;
- Daily Goals rotate among contextual goal types and target variants instead of hard-coding the same merge + serve pair every day;
- Board purpose CTA routes to playable work while Stars are missing and changes to `Jetzt bauen` when ready;
- redundant Place progress/status surfaces and clipped selected-order status were removed;
- dedicated First-Session WebKit QA covers fresh Board, opening Orders, first service, first build, living stage 4, completed Café and 390×720 short Safari;
- service-worker registration uses absolute same-origin worker/scope URLs to avoid WebKit access-control resolution failures while preserving the separate PWA update contract.

Reference-game screenshots are motivation-architecture inspiration only. Poply does not copy their art, characters, layout or monetization.

## Visual acceptance
The implementation was not accepted from automated tests alone. GitHub-generated screenshots were opened repeatedly; visually bad green/near-green heads were rejected and fixed. Recorded findings include:
- blank Daily ribbon after full rerender;
- clipped duplicate `fehlt` pill;
- ellipsized Orders purpose copy;
- ellipsized Place unlock copy;
- dedicated WebKit service-worker registration failure.

Accepted implementation candidate `f71a2fb909f2594de293b1e33b1fd580f2c18ab6`:
- CI `31896742437` — success;
- Browser QA `31896742395` — success;
- Place 03 QA `31896742407` — success;
- PWA Update QA `31896742449` — success;
- Browser artifact `9250054999` reviewed, including First-Session screenshots `80`–`90` at 390×844 / 390×720.

## Coordination
Open PR #99 (`Guests: add persistent loyalty collection progression`) owns persisted guest/session/Collection loyalty state. The first-session rebuild deliberately avoids that persistence domain.

Neon/backend is not required for this slice.

## Next product priorities after #110
1. Observe real first-session play: whether combo choice and fast first build feel motivating rather than merely clearer.
2. Continue visual quality where it increases authored world payoff, not dashboard density.
3. Revisit the tall-screen Board lower atmospheric band only if a genuinely gameful use exists; do not stretch the fixed 7×7 touch grid or fill it with explanatory cards.
4. Continue economy/pacing simulation so later Places increase depth without grind walls.
5. Integrate deeper guest loyalty only through PR #99's owned persistence domain.

## Durable coordination rule
Every substantial worker run records in Issue #42: exact starting main, branch/PR/head, changed systems, test/run IDs, screenshots actually opened, visible findings, merge/deploy state, blockers and next free task.
