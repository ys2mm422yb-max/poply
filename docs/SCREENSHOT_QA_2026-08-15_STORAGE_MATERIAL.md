# Screenshot QA — Storage material pass

Date: 2026-08-15  
Worker: `visual-automation`  
PR: #67 — Visual: give Storage a warmer authored material identity  
Start main: `7d32be5e6a6dc469f894ed443a351db252ed6cdc`

## Why this pass existed
The Storage feature was already functional, compact and safe on short Safari, but the drawer still read as one mostly dark-teal utility panel. Empty slots, the drawer surface and the Board-item source rail used very similar materials, so Storage felt more like an application drawer than a tactile part of Poply's game world.

This pass changes presentation only. Storage behavior, capacity, Coin costs, Board transfer semantics, save data, order behavior and all other gameplay remain unchanged.

## Collision / ownership check
Open work was re-read before implementation:
- PR #64 owns player-title/progression presentation;
- PR #58 owns Place03/session/Collection/Map integration;
- PR #55 owns dynamic gameplay FX/workflow/motion;
- PR #66 is documentation-only shell follow-up.

This pass stays in `src/aaa-storage-tray.css` plus the existing Storage UI source-contract test.

## Baseline evidence actually opened
From successful `main` Browser QA run `31855414124`, artifact `9238902022`:
- `40-storage-item-stored.png`
- `42-storage-short-safari.png`
- comparison context: `31-collection-coffee.png`, `33-collection-short-safari.png`

Baseline finding: Storage was readable and fit correctly, but the drawer, empty slots and source choices shared nearly the same teal material. Gold was mostly a border/upgrade accent, so the surface lacked authored material hierarchy.

## First implementation evidence actually opened
Exact implementation head before this documentation commit: `171b1c89cd5335ca2a493dd8e1727cd3cb51ae79`
- CI run `31855959897` — success
- Browser QA run `31855959908` — success
- artifact `9239050277` (`mobile-webkit-qa`), digest `sha256:9c2ee1d7ea508ba63c7b1b673bc8c27235b788a4e503e8e965ebda3989492a5b`

Actually opened:
- `40-storage-item-stored.png`
- `41-storage-expanded.png`
- `42-storage-short-safari.png`

No tablet Storage PNG is produced by the current artifact, so no tablet visual acceptance is claimed for this focused pass.

## Accepted visual findings
- The drawer now has a warmer gold/aqua/coral reflected-light identity instead of one flat teal slab.
- A restrained top-edge light accent makes the drawer feel like a deliberate game object without adding a new card or changing geometry.
- Empty Storage slots are visibly cooler/aqua and recede; occupied stored items sit on brighter cream/gold material and become the obvious focal objects.
- The Board-source item rail gains small warm/cool/pink material variation, which improves rhythm without changing item art or interaction semantics.
- The Coin expansion control reads more clearly as a permanent upgrade action.
- `40-storage-item-stored.png` keeps Board context readable while making the drawer more authored.
- `41-storage-expanded.png` confirms six empty slots remain clean and understandable after expansion.
- `42-storage-short-safari.png` keeps the full drawer, close control, six slots, source row and bottom navigation reachable at 390×720. No document scroll or clipping is introduced.

## Accepted / rejected versions
The first implementation version is accepted. No visual iteration was rejected in this pass.

## Remaining visual debt
Milestone B remains open. Collection is still visually card/grid-heavy, but PR #58 currently owns Collection integration, so this worker deliberately did not touch it. Dynamic merge/discovery/generator FX remain owned by PR #55. The next free visual pass should be selected from current screenshots after those ownership constraints are re-read.

## Decision
Visual implementation accepted. This documentation commit creates a new exact PR head, so merge remains blocked until fresh normal CI + full Browser QA succeed on that documented head and the required Storage screenshots are reopened to confirm the render is unchanged.
