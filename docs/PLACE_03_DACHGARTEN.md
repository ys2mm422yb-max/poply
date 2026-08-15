# Place 03 — Dachgarten

Status: Milestone I implementation contract.

## Product role

Dachgarten is the first Place that proves Poply can expand beyond a simple content reskin. It must feel like a new chapter in the same game: a bright rooftop greenhouse above the city, a new production family, its own six-step restoration arc and one immediately understandable production rule.

## Unlock

- Place 03 unlocks only after all six Sonnenkai upgrades are complete.
- Existing saves that already completed Sonnenkai gain exactly one `garden-gen` when there is a free Board cell.
- Progression sync must never duplicate generators or delete/move player value.
- If the Board is full, no player item may be deleted to force the generator in; a later safe sync can add it after space exists.

## Item family — Dachgarten

Six deterministic merge tiers:

1. Minze
2. Kräuterbund
3. Kräutersirup
4. Garten-Spritz
5. Blüten-Glas
6. Poply Gartenfest

Unknown tiers remain silhouettes in Collection until actually discovered. First discovery uses the existing discovery XP/reward path.

## Generator — Gewächshaus

`garden-gen` costs one Energy per successful production.

Its new gameplay idea is a visible deterministic four-step harvest cycle:

- productions 1–3 spawn Minze (tier 1);
- production 4 spawns Kräuterbund (tier 2) as an `Erntebonus`;
- the cycle repeats from 1/4;
- the cycle is stored in the generator's existing persistent `taps` counter;
- no randomness, hidden weighting or dynamic difficulty is allowed;
- failed production because of a full Board or insufficient Energy must not consume Energy or advance the cycle.

The Board must visibly show the 4-step cycle and make `Erntebonus bereit` understandable before the fourth tap.

## Restoration arc

1. Glasdach — 12 Stars
2. Pflanzbeete — 14 Stars
3. Gartenbar — 16 Stars
4. Sitzinseln — 18 Stars
5. Lichterbogen — 21 Stars
6. Dachgarten-Schild — 24 Stars

Every step has a visible authored change in the Place scene. Completing the sixth step ends the currently authored world; it must not invent an unimplemented Place 04.

## Orders

Dachgarten uses its own starter/growing/established order bands based only on visible Dachgarten restoration progress. A very high global order sequence must never make a newly unlocked Dachgarten start with a tier-5/6 wall.

All Dachgarten order bands include the herb family so the new production chain has immediate purpose.

## World / Collection integration

- World Map contains Café am Meer, Sonnenkai and Dachgarten in sequence.
- Dachgarten stays locked until Sonnenkai is complete.
- Map previewing never mutates Board, resources, orders or save state.
- Collection contains five six-tier families (30 item discoveries total), plus Place 03 and Gewächshaus world discoveries.

## Visual direction

Dachgarten must not reuse the dark coast/sunset palette. Its authored identity is bright glass, rooftop sky, fresh greens, warm flower/yellow accents and city silhouettes. Reduced Motion remains mandatory. The 7×7 Board geometry and short-Safari no-scroll contract remain unchanged.

## Release acceptance

Before merge:

- full deterministic test suite passes on the exact final head;
- normal Mobile WebKit suites pass;
- dedicated Place 03 WebKit flow performs a real pointer tap on a bonus-ready Gewächshaus, verifies tier-2 spawn, Collection discovery, first restoration and World Map progress;
- 390×844 and 390×720 screenshots are actually opened and reviewed;
- no clipping, document scroll, Board shrink, pointer interception or cross-Place visual regression;
- after merge, exact-main CI, Browser QA and canonical Pages deploy must all pass.
