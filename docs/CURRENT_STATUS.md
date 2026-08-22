# Poply current status

Updated: 2026-08-22

## Current verified runtime baseline
Current verified runtime/gameplay baseline: `068164e82f0c5f4a13a7befadb1431af4ba07bef` (`Merge Arbeitsblock 6: Langzeitmotivation`). Documentation-only status-sync commits may follow this SHA without changing the shipped runtime tree.

The binding product sequence from Issue #42 is complete. Arbeitsblöcke 1 → 6 were implemented, tested, visually accepted on physical-iPhone dimensions and merged in order. There are no open Poply pull requests after the Block-6 merge.

## Completed Arbeitsblock 1 → 6 sequence

### 1 — Aufträge & aktuelle UI-Probleme — LIVE
PR #147, accepted head `86c4c7ff3135a7a1d9185ae330bb2e30683834a1`.

- compact Board order cards reduced to guest, Stars, concrete item art and quantity;
- overlapping reward/requirement geometry fixed, including the 390×720 short-height case;
- Service-Special/status microcopy removed from the tiny Board cards;
- tappable item guidance preserved;
- item name, provenance, generator and merge path plus `Generator auf Board zeigen` had already shipped in PR #143 and is part of the accepted Block-1 baseline;
- WebKit acceptance at 390×844 and 390×720, including manual screenshot review.

Accepted PR gates recorded in #147: CI #1491, Browser QA #602, PWA Update QA #329, Place03 QA #357.

### 2 — Aufträge sollen logisch Sinn ergeben — LIVE
PR #154, accepted head `c402d9df92300799a5de1a54f5576ce9f7934370`.

- deterministic authored order themes/stories across Opening, Coast, Sunset and Garden;
- misleading order names corrected without changing requirements;
- theme/story context lives in the focused Orders screen while compact Board cards remain minimal;
- no reward/economy/requirement inflation.

Accepted PR gates: CI #1525, Browser QA #636, PWA Update QA #363, Place03 QA #391. Both 390×844 and 390×720 thematic-order screenshots were manually opened and accepted.

### 3 — Gäste & Stammgäste — LIVE
PR #156, accepted head `13e117e1fa4f340c429b3b7e60feb573b55c380d`.

- Mika, Nora and Sam have stable personality/preference metadata;
- focused orders connect guest preference, loyalty rank and next loyalty payoff;
- served guests visibly return in the Place scene as recurring guests;
- existing loyalty milestones and reward values remain unchanged.

Accepted PR gates: CI #1535, Browser QA #646, PWA Update QA #373, Place03 QA #401. Four recurring-guest screenshots at 390×844 / 390×720 were manually accepted.

### 4 — Place-Ausbau mit echtem Gameplay-Nutzen — LIVE
PR #158, accepted head `3f726e96d518bd165d5a004e9e3723eb144ed8f3`.

- every Coast upgrade now communicates a concrete gameplay consequence;
- Lichter → Abendservice, Neue Theke → Vorbereitung, Menüwand → Gastwahl;
- Sitzecke and Meerterrasse communicate the real higher-tier order access they unlock;
- Poply-Schild communicates Sonnenkai + Sonnenfrüchte progression;
- build card and post-build pulse use the same canonical benefit source;
- no new currency, reward inflation or persistence schema.

Mandatory unit/browser coverage includes 390×844 and 390×720 and the late Coast upgrade states. Exact acceptance evidence is recorded in PR #158 and Issue #42.

### 5 — Lebendige Service-Momente — LIVE
PR #160, accepted head `5f7180fd4a642f8bd7016223cd18736eae3c7557`.

- deterministic authored moments from existing systems: Stammgast kommt, Kaffee-Tag, Sonnenuntergang-Service, Rush Hour;
- Service-Ruf remains the timing/commitment backbone; no second event timer and no hidden RNG;
- FLOW, Service-Ruf and Place Powers are reused instead of creating a separate minigame layer;
- moment recommendations temporarily change priorities without blocking base service.

Dedicated WebKit QA covers 390×844 / 390×720, Reduced Motion, one-screen/no-scroll and dock clearance. Seven `340–346` screenshots were manually opened and accepted; Issue #42 records the final artifact/report and zero open PRs before Block 6 started.

### 6 — Langzeitmotivation — LIVE
PR #162, accepted head `214dfc6ca6bfd4eac249e4970f5e00a2848cb3ff`; runtime merge `068164e82f0c5f4a13a7befadb1431af4ba07bef`.

- generator mastery derives only from existing generator `taps`: Neu → Vertraut → Geübt → Meister;
- no mastery currency/economy buff and no new persistence;
- Collection Book remains the only place where unknown item tiers appear as silhouettes/`???`; active orders always show concrete items;
- Daily Goals receive deterministic day/place story framing without reward changes, streaks or FOMO;
- fully restored world receives a visible 18/18 completion payoff with collection/mastery context;
- purely cosmetic Place-choice UI was explicitly rejected because it would add state/chrome without meaningful gameplay.

Final merge message records exact-head QA: CI #1563, Browser QA #674, PWA Update QA #401 and Place03 QA #427. Six `360–365` screenshots at 390×844 / 390×720 were part of the mandatory visual acceptance contract.

## Other important shipped foundations
Production also includes:
- persistent 7×7 merge Board / Werkbank;
- three Places with six-step restoration progression;
- five six-tier item families and four generators;
- authored First Session, deterministic Place-local order pools and anti-repeat behavior;
- Coins, restoration Stars, Energy and Player XP/Levels;
- Collection/Discovery, Storage and deterministic full/full recovery;
- Daily Goals + Bonus Guest;
- Guest Loyalty, Merge Flow, Service Specials and Service-Ruf;
- Café upgrade powers: Abendservice, Vorbereitung and Gastwahl;
- Café am Meer Scene V2 and later café-first Place hierarchy passes;
- automatic installed-PWA update handling, iOS safe-area protection and save recovery;
- mandatory deterministic CI + real WebKit QA + screenshot review + Place03/PWA gates.

## Save / backend status
The shipped game remains local-first. Runtime save/resume uses browser `localStorage` with previous-valid backup and migration safety.

A separate Neon project named `Poply` exists, but it is not wired into the repository/runtime. The completed Arbeitsblock 1→6 sequence intentionally made no Neon/backend schema changes. Do not introduce a backend dependency implicitly; cloud/accounts remain a later explicit product/architecture decision.

## Current product priorities after the completed sequence
1. Treat the 1→6 sequence as shipped baseline; do not reopen it without a concrete regression or new product requirement.
2. Continue screenshot-first visual/game-feel production quality on genuinely weaker surfaces while preserving 390×720 as a first-class target.
3. Continue economy/pacing/configuration simulation so Energy, Coins, Stars, order difficulty and restoration pacing remain evidence-based and regression-safe.
4. Keep PWA/update/save reliability healthy in parallel.
5. Cloud/accounts, live events and native packaging remain later phases.

## Durable coordination rule
Every substantial worker run records in Issue #42: exact starting `main`, branch/PR/head, changed systems, test/run IDs, screenshots actually opened, visible findings, merge/deploy state, blockers and next free task.

A green assertion is not visual acceptance. Any visual change must still be reviewed from generated 390×844 and 390×720 GitHub Actions screenshots before merge.
