# Screenshot QA — authored global shell chrome

Date: 2026-08-15
Worker: `visual-automation`
PR: #65 — Visual: make Poply's global game chrome feel authored
Start main: `4dff55996708cc22c52d02db211a9433c55d8454`
First accepted implementation head before this documentation commit: `beb98be421b9e291a96768f0cba0d5103f23e17f`

## Why this pass existed
The latest accepted game surfaces were materially more authored, but the fixed topbar/resources and bottom navigation still read as flat dark application chrome. Nearly every shell element shared the same navy/teal material and the active destination treatment stayed generic green, so the frame felt disconnected from the brighter Place and Orders surfaces.

This pass changes presentation only. No shell dimensions, navigation structure, gameplay, save state, Daily system, Place03 logic, economy or dynamic gameplay FX are changed.

## Collision / ownership check
Open work was re-read before implementation:
- PR #64 owns player title/progression presentation;
- PR #58 owns Place03/domain/session/View/Collection/Map/import integration;
- PR #55 owns dynamic gameplay FX/workflow/`aaa-motion.css`.

The pass stays in independent integration-shell CSS and one unowned deterministic test file.

## Baseline evidence actually opened
From successful `main` Browser QA run `31852707592`, artifact `9238043760`:
- `01-board-390x844.png`
- `04-board-short-safari.png`
- `02-place-390x844.png`
- `05-place-short-safari.png`
- `03-orders-390x844.png`

Baseline finding: layout and touch geometry were healthy, but the topbar/resource strip and bottom nav were visually flatter and more dashboard-like than the authored game surfaces between them.

## First implementation evidence actually opened
Exact implementation head: `beb98be421b9e291a96768f0cba0d5103f23e17f`
- CI run `31854704308` — success
- Browser QA run `31854704305` — success
- artifact `9238681350` (`mobile-webkit-qa`), digest `sha256:a3b1366f39d6f4b01d881c65bfc176afe132ea9a7ad3a771575d3767b36477ac`

Actually opened:
- `01-board-390x844.png`
- `04-board-short-safari.png`
- `02-place-390x844.png`
- `05-place-short-safari.png`
- `03-orders-390x844.png`
- `06-orders-short-safari.png`

No tablet PNG is produced by the current `mobile-webkit-qa` artifact for this flow, so no tablet visual acceptance is claimed for this focused pass.

## Accepted visual findings
### Topbar / resources
- Energy, Coin and Star now have distinct but restrained material identities rather than three nearly identical dark pills.
- Gold and pink resource accents are readable without overpowering the game surface.
- The topbar gains subtle cool/warm reflected light while preserving the existing 56px phone geometry and contrast.
- Menu and brand remain clear and do not crowd the resource strip.

### Bottom navigation
- Place, Aufträge, Board and Sammlung now carry distinct destination color cues.
- The active destination uses its own accent instead of one generic green treatment.
- Active text/icon contrast remains strong and inactive labels remain readable.
- Navigation height, touch footprint and safe-area behavior are unchanged.

### Required phone sizes
- 390×844 Board/Place/Orders stay inside the one-screen shell with no new clipping or overlap.
- 390×720 Board/Place/Orders retain the same fit; bottom navigation remains fully reachable and no document scroll is introduced.
- The richer chrome supports rather than competes with the brighter Place and Orders surfaces.

## Accepted / rejected versions
The first implementation version is accepted. No visual iteration was rejected in this pass.

## Remaining visual debt
Milestone B remains open globally. The next free visual pass should continue strengthening authored color/material identity in a scope that does not overlap active Place03, player-title or dynamic-FX work. A useful next screenshot-first candidate is Storage/Collection secondary-surface material differentiation once current ownership permits it.

## Decision
Accept the implementation visually. This documentation commit creates a new exact PR head, so merge remains blocked until fresh normal CI + Browser QA succeed for that documented head and representative required screenshots are reopened to confirm the render is unchanged.
