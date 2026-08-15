# Screenshot QA — authored global shell chrome

Date: 2026-08-15
Worker: `visual-automation`
Primary implementation PR: #65 — Visual: make Poply's global game chrome feel authored
Start main: `4dff55996708cc22c52d02db211a9433c55d8454`
Final implementation PR head: `665639b0faa2968e725696d6ec34d3297c177cca`
Merged main commit: `7d32be5e6a6dc469f894ed443a351db252ed6cdc`

## Why this pass existed
The latest accepted game surfaces were materially more authored, but the fixed topbar/resources and bottom navigation still read as flat dark application chrome. Nearly every shell element shared the same navy/teal material and the active destination treatment stayed generic green, so the frame felt disconnected from the brighter Place and Orders surfaces.

The intended change was presentation-only. Exact-head QA additionally exposed a real short-Safari viewport robustness issue, fixed without changing acceptance criteria: WebKit can briefly retain a stale `visualViewport` height after an in-page resize, so the app shell is now constrained never to exceed the actual `100vh` layout viewport.

No navigation structure, gameplay, save state, Daily system, Place03 logic, economy or dynamic gameplay FX behavior was changed.

## Collision / ownership check
Open work was re-read before implementation:
- PR #64 owned player title/progression presentation;
- PR #58 owned Place03/domain/session/View/Collection/Map/import integration;
- PR #55 owned dynamic gameplay FX/workflow/`aaa-motion.css`.

The pass stayed in independent integration-shell CSS and one unowned deterministic test file.

## Baseline evidence actually opened
From successful start-`main` Browser QA run `31852707592`, artifact `9238043760`:
- `01-board-390x844.png`
- `04-board-short-safari.png`
- `02-place-390x844.png`
- `05-place-short-safari.png`
- `03-orders-390x844.png`

Baseline finding: layout and touch geometry were healthy, but the topbar/resource strip and bottom nav were visually flatter and more dashboard-like than the authored game surfaces between them.

## First visual implementation
Exact implementation head: `beb98be421b9e291a96768f0cba0d5103f23e17f`
- CI run `31854704308` — success
- Browser QA run `31854704305` — success
- artifact `9238681350`, digest `sha256:a3b1366f39d6f4b01d881c65bfc176afe132ea9a7ad3a771575d3767b36477ac`

Actually opened and visually accepted:
- `01-board-390x844.png`
- `04-board-short-safari.png`
- `02-place-390x844.png`
- `05-place-short-safari.png`
- `03-orders-390x844.png`
- `06-orders-short-safari.png`

The first visual design itself was accepted; no visual styling iteration was rejected.

## Exact-head QA issue discovered after documentation
Documentation-only head `2cbd9553a56212addccbdb6fd76ea160d8a0c3c6` reproduced a Storage QA failure twice at 390×720 in Browser QA run `31854887591`.

The failure metrics showed the real layout viewport at 720px while `.app-shell` and navigation still measured to 844px. The product code had not changed from the previously green visual implementation; the repeated result therefore exposed a WebKit short-viewport synchronization weakness rather than a styling regression.

The acceptance test was not weakened. The shell was hardened with `.app-shell{max-height:100vh}` so a temporarily stale custom viewport height can never extend the game shell past the real layout viewport.

## Final PR-head verification
Final exact PR head: `665639b0faa2968e725696d6ec34d3297c177cca`
- CI `31855217951` — success
- Browser QA `31855217946` — success
- artifact `9238841744`, digest `sha256:e9e033c6c82381569cf3bf50d68a34aa87f758703039140560ed27b0eb4d05ca`
- Storage 390×720 passed again; Daily and Place Map suites also completed successfully.

Final screenshots actually opened and accepted:
- `01-board-390x844.png`
- `04-board-short-safari.png`
- `02-place-390x844.png`
- `05-place-short-safari.png`
- `03-orders-390x844.png`
- `06-orders-short-safari.png`
- `42-storage-short-safari.png`

No tablet PNG is produced by the current `mobile-webkit-qa` artifact for this flow, so no tablet visual acceptance is claimed for this focused pass.

## Accepted visual findings
### Topbar / resources
- Energy, Coin and Star have distinct but restrained material identities instead of three nearly identical dark pills.
- Gold and pink resource accents remain readable without overpowering the game surface.
- The topbar carries subtle cool/warm reflected light while preserving the existing phone geometry and contrast.
- Menu and brand remain clear and do not crowd the resource strip.

### Bottom navigation
- Place, Aufträge, Board and Sammlung carry distinct destination color cues.
- The active destination uses its own accent instead of one generic green treatment.
- Active text/icon contrast remains strong and inactive labels remain readable.
- Navigation height, touch footprint and safe-area behavior are unchanged.

### Required phone sizes
- 390×844 Board/Place/Orders stay inside the one-screen shell with no new clipping or overlap.
- 390×720 Board/Place/Orders retain the same fit; bottom navigation remains reachable and no document scroll is introduced.
- Storage 390×720 now explicitly remains within the real viewport after the WebKit resize sequence.
- The richer chrome supports rather than competes with the brighter Place and Orders surfaces.

## Merge and post-merge release verification
PR #65 was squash-merged with exact-head protection into:
`7d32be5e6a6dc469f894ed443a351db252ed6cdc`

Exact merged-main gates:
- Main CI `31855414133` — success
- Main Browser QA `31855414124` — success, including mobile, progression, Collection, Storage, Daily and Place Map suites
- `Deploy canonical test build` `31855414136` — success
- actual `Deploy to GitHub Pages` job — success

Canonical published build:
`https://ys2mm422yb-max.github.io/poply/`

## Accepted / rejected versions
- Visual styling version at `beb98be...`: accepted.
- Documentation-only exact head `2cbd9553...`: blocked because repeated Storage 390×720 QA exposed stale WebKit viewport height; not merged.
- Final robust version `665639b...`: accepted and merged after exact-head CI + full Browser QA + screenshot review.

## Remaining visual debt
Milestone B remains open globally. The next free visual pass should continue strengthening authored color/material identity in a scope that does not overlap active Place03, player-title or dynamic-FX work. A useful next screenshot-first candidate is Storage/Collection secondary-surface material differentiation once current ownership permits it.

## Decision
Accepted, merged and published. The shell is more colorful and game-like without changing touch geometry, and the exact-head QA-found 390×720 viewport defect is fixed rather than hidden.
