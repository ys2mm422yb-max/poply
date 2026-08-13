# Poply – AAA-Casual Rebuild Plan

Status: ACTIVE from 2026-08-14. This document is the execution contract for the current rebuild.

## Why this rebuild exists
The V2 merge loop proved the product direction, but the live UI accumulated many corrective CSS/runtime layers. Real iPhone screenshots exposed recurring layout overlap, empty focused views, inconsistent visual hierarchy and fragile navigation. Further patch stacking is prohibited for this milestone.

## Product promise
Poply is an original premium-feeling merge-and-build casual game. Every short board action must feed a clear long-term purpose: fulfill customer jobs, earn restoration progress, visibly transform a Poply Place, unlock new content, repeat.

## Rebuild rules
1. One authored application shell. The canonical page loads one active stylesheet and one active app entry module. Old V2 polish/focus/runtime layers are legacy and are not loaded by the live shell.
2. One state gateway. Loading, migration and saving live in one module. No bootstrap-versus-recovery scripts that rewrite the same save in sequence.
3. Three real views only for this milestone: Board, Place, Orders. A visible primary tab must always open a meaningful working view.
4. Board is the default gameplay view and remains usable without vertical page scrolling on phone portrait.
5. Place is an authored progression screen, not a full-height stretched background image. The scene has a controlled art crop plus visible restoration roadmap/current target.
6. Orders is a dense job screen, not three oversized empty cards. Requirements, reward and restoration purpose are obvious at a glance.
7. Existing valid V2 saves are preserved. Known broken starter states are migrated once without deleting player value.
8. New starts use the deterministic domain start state; do not inject extra duplicate starter pairs that encourage accidental over-merging.

## Visual quality bar
Target: high-end commercial casual-game presentation, not enterprise/web-card UI.

Required traits:
- a consistent deep coastal/navy foundation with warm cream/gold reward accents;
- clear authored hierarchy: world/progression -> active jobs -> board items;
- empty grid cells visually recede; items and generators dominate;
- generator, item tier, order requirement and reward states remain readable at phone size;
- restrained borders; depth from lighting/material/shadow rather than nested rectangles;
- no emoji as primary production art;
- no giant dead zones;
- no low-resolution scene stretched beyond a controlled crop;
- motion supports merge, delivery and restoration moments without delaying play.

## Core gameplay loop
1. Tap a generator to create a low-tier item.
2. Move items or merge two identical family+tier items.
3. Active jobs request real board items.
4. Deliver only when all requirements are present.
5. Delivery consumes exactly those items and grants coins + restoration stars.
6. The current restoration target shows how many stars are available/needed.
7. Build the target; stars are spent and the Place visibly advances.
8. The next restoration target/order difficulty becomes the new purpose.

## Milestone A – Foundation (this branch)
- Replace layered live shell with one app shell + one stylesheet.
- Consolidate save load/migration/save.
- Build real Board / Place / Orders view switching.
- Keep 7x7 board interaction and existing domain logic.
- Preserve customer/item/hero assets while presenting the hero only at controlled size.
- Add regression tests that fail if old UI layers return to the live index.
- Add tests for state migration and functional view mapping.

## Milestone B – Production art & restoration
- Replace temporary/low-resolution Place scene with production-quality Poply scene art.
- Produce six visible restoration states (lights, counter, menu wall, seating, terrace, sign) rather than only progress text.
- Produce coherent item families with at least six meaningful tiers where balance supports it.
- Upgrade generator art and order/customer presentation to one art language.

## Milestone C – Game feel
- Merge anticipation/snap/tier reveal.
- Generator dispense animation.
- Item-to-order delivery flight and reward collection.
- Restoration reveal/scene transition.
- Sound/haptic hooks with reduced-motion support.

## Milestone D – Depth
- Balance order progression and generator output.
- Add fair board-pressure tools (storage/sell) only when needed.
- Collection system only when it is real and useful.
- New Place/area unlock after first restoration arc.

## Definition of Done for any visible release
A release is not ready unless:
- PR CI is green on the exact head;
- main CI and canonical Pages deploy succeed on the exact merged commit;
- Board/Place/Orders all work, not merely highlight;
- phone portrait uses the visible viewport correctly;
- no old shell CSS/runtime layer is loaded by index.html;
- no obvious overlap, ghost menu, clipped navigation or giant empty card/image area exists;
- a player can state the current purpose in one sentence: "I am making these items for these jobs so I can build this next part of the Place.";
- the screenshot is materially closer to a polished commercial casual game than the previous release, not just differently styled.

## Progress rule
Do not spend a release only renaming build markers, moving margins or adding another override stylesheet. Each milestone must remove debt, add a real system, improve game readability, or visibly advance production quality.
