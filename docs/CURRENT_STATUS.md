# Poply current status

Updated: 2026-08-14

## Live baseline
`main` currently includes the merged Vertical Slice 02 release:
- Place 01 · Café am Meer;
- playable Place 02 · Sonnenkai;
- Tropenbar generator and six-tier fruit chain;
- two six-step restoration arcs;
- automatic chapter-aware Board / Orders / Place views;
- exact-main CI, Mobile WebKit Browser QA and canonical GitHub Pages deployment passed on the Sonnenkai merge commit.

Milestone B visual quality remains OPEN. The current product is materially larger and more cohesive, but it is not being claimed as final AAA-casual visual quality.

## Active branch
`fix/energy-regeneration-visibility`

Binding system document:
`docs/ENERGY_SYSTEM.md`

## Active defect being fixed
The live build displays an energy resource and generators consume it, but the shipped domain has no automatic energy regeneration and the UI does not explain how energy returns. This is treated as a gameplay/comprehension defect.

## Implemented on this branch
- deterministic energy clock persisted inside the existing save object;
- **1 energy every 2 minutes** below the 40-energy cap;
- offline elapsed-time regeneration when Poply is reopened;
- no timer reset when spending while already below full;
- a fresh two-minute interval when spending from full;
- live top-bar text: `Auto · 2 Min` at full, otherwise `+1 in M:SS`;
- live on-screen energy value update when a refill arrives;
- accessible explanation that regeneration continues while Poply is closed;
- no paid refill, ad gate or storage-key reset.

## Required acceptance before merge
- energy unit tests and syntax checks green on the exact PR head;
- existing full test suite remains green;
- Mobile WebKit Browser QA green on the exact PR head;
- self-inspect the generated phone screenshots to confirm the extra timer line fits the real top bar without overlap or clipping;
- after merge, exact-main CI + Browser QA + canonical Pages deploy must all succeed.

## Product tracks
1. **Production-quality track** — continue world, order, board and motion quality toward premium commercial casual-game presentation.
2. **Playable-growth track** — continue adding meaningful progression and systems rather than repeatedly restyling the same screens.
3. **Clarity/fairness track** — every limiting resource or progression gate must visibly explain how it works; players must not have to infer hidden rules.