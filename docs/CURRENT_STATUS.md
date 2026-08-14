# Poply current status

Updated: 2026-08-14

## Active product target
Poply now runs two progress tracks in parallel:

1. **Production-quality track** — Milestone B remains OPEN until real mobile/browser screenshots look like a premium commercial casual game rather than a polished prototype.
2. **Playable-growth track** — Vertical Slice 02 is ACTIVE so the game itself grows instead of repeatedly polishing the same first-screen loop.

## Current branch
`vertical-slice/place-02-sunset`

Binding milestone document:
`docs/VERTICAL_SLICE_02_SUNSET.md`

## Current product milestone
Build the first real chapter transition:

`Café am Meer complete → Place 02 Sonnenkai unlocked → new Tropenbar generator → new fruit merge chain → new jobs → second restoration arc`.

This is deliberately larger than another layout/polish pass.

## Existing foundation that must remain stable
- clean AAA shell; no legacy V2 live-layer stack;
- Board / Place / Orders are real functional views;
- 7x7 persistent merge board and deterministic save flow;
- service flow and `Jetzt servieren` browser regression;
- mandatory WebKit Mobile Browser QA + screenshot artifact;
- authored Place-01 scene, six visible Place-01 restorations, item/customer/game-feel work already shipped.

## Still open
- Milestone B visual quality is not accepted yet and continues after/alongside this vertical slice.
- Place 02 must be genuinely playable, not a teaser card.
- Existing saves must migrate without loss.
- This branch must add deterministic domain tests and real browser interaction QA for the unlock transition before merge.
