# Poply current status

Updated: 2026-08-14

## Active product target
Poply advances on two coordinated tracks:

1. **Production-quality track** — Milestone B remains OPEN until real mobile/browser screenshots look like a premium commercial casual game rather than a polished prototype.
2. **Playable-growth track** — Vertical Slice 02 is IMPLEMENTED ON BRANCH and is now in exact-head CI / Browser-QA acceptance.

## Current branch
`vertical-slice/place-02-sunset`

Binding milestone document:
`docs/VERTICAL_SLICE_02_SUNSET.md`

## Implemented on this branch
- Place 01 remains the existing `Café am Meer` six-step arc.
- Completing `Poply-Schild` unlocks **Place 02 · Sonnenkai** instead of ending progression.
- Sonnenkai has its own authored sunset scene and six material restoration beats:
  Lampions → Saftbar → Lounge → Feuerstelle → Abendbühne → Sonnenkai-Schild.
- New six-tier `fruit` family:
  Limette → Fruchtmix → Smoothie → Tropen-Drink → Sunset-Bowl → Poply Paradise.
- New `Tropenbar` generator appears exactly once after Place-01 completion.
- New Sonnenkai order pool requests fruit together with existing families and pays higher rewards.
- Board / Orders / Place automatically follow the active chapter while retaining the same three-view architecture.
- Existing saves retain board, coins, stars, stats and Place-01 progress; completed Place-01 saves gain the Sonnenkai generator without a storage-key reset.
- Final Place-01 build has a dedicated `Place 02 freigeschaltet: Sonnenkai` reveal.
- Existing world restoration animation was corrected to target the current `.world-hero` architecture instead of the removed `.scene-card` surface.

## Automated acceptance added
- deterministic domain tests for chapter unlock, no duplicate generator, lossless migration, fruit generation/merge chain, sunset replacement orders and first Sonnenkai restoration;
- Mobile WebKit QA now performs the real final Place-01 build, checks the Place-02 transition, taps the Tropenbar, verifies fruit production, builds the first Sonnenkai restoration and reloads the save;
- screenshots are generated for pre-unlock, unlocked Sonnenkai, Sonnenkai board with fruit and first Sonnenkai restoration.

## Gate still open before merge
- normal PR CI on the exact branch head;
- Mobile Browser QA on the exact branch head;
- self-inspection of generated Sonnenkai screenshots;
- fix any browser, layout, state or visual regression found there before merge.

Milestone B visual acceptance remains OPEN regardless of whether this vertical slice passes. This branch represents product growth, not a claim that the visual quality target is finished.
