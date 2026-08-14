# Poply – AAA-Casual Rebuild Plan

Status: ACTIVE from 2026-08-14. This document is the execution contract for the current rebuild.

## Why this rebuild exists
The V2 merge loop proved the product direction, but the live UI accumulated many corrective CSS/runtime layers. Real iPhone screenshots exposed recurring layout overlap, empty focused views, inconsistent visual hierarchy and fragile navigation. Further patch stacking is prohibited.

A second failure mode also became visible: repeatedly polishing the same Board / Orders / Place slice can improve screenshots without making Poply feel like a growing game. From this point forward Poply advances on two coordinated tracks: production quality and playable product growth.

## Product promise
Poply is an original premium-feeling merge-and-build casual game. Every short board action feeds a clear long-term purpose: fulfill customer jobs, earn restoration progress, visibly transform a Poply Place, unlock genuinely new content, move into a new Place, repeat.

## Rebuild rules
1. One authored application shell. The canonical page loads one active stylesheet entry and one active app entry module. Old V2 polish/focus/runtime layers are legacy and are not loaded by the live shell.
2. One state gateway. Loading, migration and saving live in one module. No bootstrap-versus-recovery scripts that rewrite the same save in sequence.
3. Board, Place and Orders are real working views. A visible primary tab must always open meaningful gameplay.
4. Board is the default gameplay view and remains usable without vertical page scrolling on phone portrait.
5. Place is an authored progression/world screen, not a full-height stretched background image or status dashboard.
6. Orders is a focused service screen, not a stack of generic form cards.
7. Existing valid saves are preserved. New systems migrate old state without deleting player value.
8. New starts remain deterministic enough for automated QA and must not encourage accidental over-merging.
9. Real WebKit browser QA and screenshot artifacts are mandatory for meaningful visible or interaction changes.

## Two-track progress model
### Track A — Production quality
Milestone B remains OPEN until real mobile screenshots look like a polished commercial casual game. Board, Orders and Place continue to improve in art cohesion, world depth, hierarchy, motion and emotional payoff.

### Track B — Playable growth
Large product milestones may advance in parallel when they add a complete, tested gameplay loop without reintroducing architecture debt. This prevents Poply from endlessly polishing one prototype screen while the game itself stands still.

Current Track-B milestone: `docs/VERTICAL_SLICE_02_SUNSET.md`.

## Visual quality bar
Target: high-end commercial casual-game presentation, not enterprise/web-card UI.

Required traits:
- a consistent authored Poply art language across world, items, generators, guests and HUD;
- clear hierarchy: world/progression -> active jobs -> board items;
- empty grid cells visually recede; items and generators dominate;
- generator, item tier, order requirement and reward states remain readable at phone size;
- restrained borders; depth from lighting/material/shadow rather than nested rectangles;
- no emoji as primary production art;
- no giant dead zones;
- no low-resolution scene stretched beyond a controlled crop;
- motion supports merge, delivery and restoration moments without delaying play;
- Place reads as a living game world, not a flat diagram;
- Orders read as character service jobs with purpose/reward, not form rows;
- real iPhone and generated WebKit screenshots are acceptance gates.

## Core gameplay loop
1. Tap a generator to create a low-tier item.
2. Move items or merge two identical family+tier items.
3. Active jobs request real board items.
4. Deliver only when all requirements are present.
5. Delivery consumes exactly those items and grants coins + restoration stars.
6. The current restoration target shows how many stars are available/needed.
7. Build the target; stars are spent and the Place visibly advances.
8. Finishing a restoration arc unlocks genuinely new content rather than ending in the same loop forever.

## Milestone A – Foundation — DONE
- Clean authored shell and state gateway.
- Functional Board / Place / Orders switching.
- Persistent 7x7 merge board.
- Save migration and deterministic core domain.
- Regression gates preventing old live-layer stack from returning.

## Milestone B – Production art & restoration — OPEN
Already shipped: authored coastal world foundation, six visible Place-01 restoration steps, six-tier item families, authored item/generator art, authored guests, focused service flow, material workbench, game-feel hooks and WebKit self-QA.

Still required:
- increase environmental depth, lighting, material richness and emotional restoration payoff;
- continue removing prototype/dashboard language from the remaining screens;
- make Place, Board and Orders feel like one authored premium game on real iPhone screenshots;
- keep this milestone OPEN until screenshot quality is genuinely convincing.

## Milestone C – Game feel — FUNCTIONALLY COMPLETE, POLISH CONTINUES
- Merge anticipation/snap/tier reveal.
- Generator dispense animation.
- Item-to-order delivery flight and reward collection.
- Restoration reveal/scene transition.
- Sound/haptic hooks with reduced-motion support.

## Milestone D1 – Second playable Place — ACTIVE
Binding spec: `docs/VERTICAL_SLICE_02_SUNSET.md`.

Goal:
`Café am Meer complete → Sonnenkai unlock → new Tropenbar generator → new fruit chain → new jobs → second six-step restoration arc`.

This milestone is allowed to progress while Milestone B remains visually open because it is a complete tested vertical slice, not cosmetic scope creep.

## Later depth
After D1 and continued B-quality work:
- balance order progression and generator output;
- fair board-pressure tools only when real play proves they are needed;
- collection only when it adds useful progression;
- additional Places/areas through the same tested chapter architecture.

## Definition of Done for any visible release
A release is not ready unless:
- normal PR CI and mandatory Mobile Browser QA are green on the exact head;
- generated screenshot artifacts are inspected for visible/interaction changes when tooling permits;
- main CI, main Browser QA and canonical Pages deploy succeed on the exact merged commit;
- Board/Place/Orders work, not merely highlight;
- phone portrait uses the visible viewport correctly;
- no old shell CSS/runtime layer is loaded by index.html;
- no obvious overlap, clipped navigation, giant empty card/image area or dead control exists;
- a player can state the current purpose in one sentence;
- the release either visibly improves production quality or adds a real playable system/loop.

## Progress rule
Do not spend a release only renaming build markers, moving margins or adding another override stylesheet. Each milestone must remove debt, add a real system, improve game readability, or materially advance production quality.
