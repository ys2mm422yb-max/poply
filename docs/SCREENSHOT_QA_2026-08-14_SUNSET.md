# Screenshot QA — Sonnenkai Vertical Slice

Date: 2026-08-14
Branch: `vertical-slice/place-02-sunset`
PR: #34
QA owner: Poply implementation workflow, not the product owner.

## Purpose
This file records the self-QA performed on the automatically generated WebKit screenshots for Vertical Slice 02. The product owner should not need to discover these routine regressions manually.

## Automated interaction coverage
The Mobile WebKit QA on the PR head performs all of the following itself:
- loads Board / Place / Orders at 390×844;
- repeats the core surfaces at a 390×720 short-Safari viewport;
- performs the existing real `Jetzt servieren` regression and verifies item consumption, coins, stars, replacement order and persisted state;
- seeds a deterministic state immediately before the final Place-01 restoration;
- clicks the real final `Bauen` control;
- verifies `Café am Meer` transitions to `Place 02 · Sonnenkai`;
- verifies exactly one `Tropenbar` generator is unlocked;
- taps the Tropenbar and verifies one energy is spent and a tier-1 fruit item is generated;
- builds the first Sonnenkai restoration (`Lampions`);
- reloads and verifies Place-02 state and generator persistence;
- checks navigation and visible-viewport containment with no console errors.

## Screenshot set
Generated artifacts:
- `09-before-sonnenkai-unlock.png`
- `10-sonnenkai-unlocked-place.png`
- `11-sonnenkai-board-fruit-spawn.png`
- `12-sonnenkai-first-restoration.png`

## Self-QA iterations
### Iteration 1 — rejected
The first successful Browser-QA artifact exposed a large dark letterbox/dead zone above both Place scenes. Functionality was green but visual acceptance failed.

Action: attempted a cover-style scene fill before merge.

### Iteration 2 — rejected
The cover-style fill removed the dead zone but over-zoomed the authored SVG. The café façade became severely cropped and the Place lost environmental context.

Action: rejected the change before merge. Restored the full authored scene composition and changed the host background to continue each Place's sky palette through the SVG letterbox area.

### Iteration 3 — accepted for the vertical-slice gate
The final artifact keeps the complete building/deck composition visible while extending the Place-01 daylight sky and Place-02 sunset sky into the spare hero area. The result no longer reads as an accidental black/teal blank block and no longer sacrifices the scene to an excessive crop.

Sonnenkai now visibly reads as a distinct new chapter:
- coral/purple sunset atmosphere;
- darker sea/deck material;
- `POPLY PLACE 02 · ABENDKÜSTE` identity;
- distinct `Sonnenkai` title;
- independent 0/6 journey;
- first material restoration (`Lampions`) visibly appears after building;
- new Tropenbar generator is visible on the workbench;
- new fruit production is functionally generated.

## Known visual gaps — still OPEN
This QA accepts the release as a **real product-growth vertical slice**, not as final AAA art acceptance.

Milestone B remains open because:
- Sonnenkai still needs richer environmental micro-detail, props, lighting and depth;
- the base building silhouette is deliberately related to Place 01 and should diverge further as production art matures;
- the fruit spawn screenshot is captured during the existing dispense/landing animation, so the newly spawned item is visually smaller in that exact artifact frame; the underlying state and final animation target are correct;
- world scenes can gain more character animation and ambient life later;
- overall Place production quality still needs further iteration against real iPhone screenshots.

## Acceptance decision
**Vertical Slice 02 may merge only if the final exact PR head has both normal CI and Browser QA green.**

This acceptance means: `the game genuinely grows into a second playable chapter and the generated screenshots contain no blocker-level layout/interaction defect.`

It does **not** mean: `Milestone B / AAA visual quality is complete.`
