# Screenshot QA — Daily reward identity

Date: 2026-08-15
Worker: `visual-automation`
PR: #68 — Visual: give Daily goals distinct reward identities
Start main: `7d32be5e6a6dc469f894ed443a351db252ed6cdc`

## Why this pass existed
Daily Goals was already functional and mobile-safe, but the three goal rows were visually near-identical dark-teal checklist cards. The surface read more like utility UI than an authored casual-game reward moment.

This pass changes presentation only. Daily state, rollover, goals, target counts, claims, Bonus Guest consumption/rewards, geometry and reduced-motion behavior are unchanged.

## Collision / ownership check
Open work was re-read before implementation:
- PR #67 owns Storage presentation;
- PR #64 owns player-title/progression presentation;
- PR #58 owns Place03 + Collection/Map/session/view integration;
- PR #55 owns dynamic gameplay FX/workflow/`aaa-motion.css`;
- PR #66 is documentation-only shell follow-up.

The pass stays in `src/aaa-daily.css` plus deterministic `tests/aaa-daily.test.js` coverage.

## Baseline evidence actually opened
From successful `main` Browser QA run `31855414124`, artifact `9238902022`:
- `50-daily-goals-ready.png` — 390×844
- `52-daily-short-safari.png` — 390×720

Baseline finding: fit and readability were healthy, but all three goals used essentially the same material/icon/progress treatment, so Daily lacked hierarchy and authored reward color.

## First implementation — rejected
Exact head: `27e48a46079af3a33f38fdf4b0f3839dab3c9976`
- CI `31856666974` — success
- Browser QA `31856666969` — success
- artifact `9239254805`

Actually opened:
- `50-daily-goals-ready.png`
- `52-daily-short-safari.png`

The gold/coral/aqua separation worked, and the claimed short-phone state looked good. However, completed-but-unclaimed goals at 390×844 had a harsh white vertical inset. Root cause was `currentColor` inheriting white text color in the completion shadow. That version was rejected despite green tests.

## Accepted implementation
Exact implementation head before this documentation commit: `c3af41739b7ac98476d71eb9ea30d218a7924389`
- CI `31856837105` — success
- Browser QA `31856836999` — success
- artifact `9239317569`
- artifact digest `sha256:19520c2946e2dab8786c6c175f508afad91ebdb48f1d62e39d427136331910d7`

Actually opened:
- `50-daily-goals-ready.png` — 390×844
- `52-daily-short-safari.png` — 390×720

No tablet screenshot is produced for the Daily flow in the current `mobile-webkit-qa` artifact, so no tablet visual acceptance is claimed for this focused pass.

## Accepted visual findings
### Ready state — 390×844
- Goal 1 now has warm gold material, mark, progress and reward button.
- Goal 2 has coral/pink identity.
- Goal 3 has aqua identity.
- The three rows remain one coherent family but are no longer interchangeable dark cards.
- The accidental white completion edge is gone; each row keeps its own restrained colored left accent.
- Bonus Guest has richer warm/coral/aqua reflected light while remaining clearly secondary to the three goals.
- Labels, reward amounts, Serve button and close control retain strong contrast.

### Completed state — 390×720
- Claimed goals converge into a clear green completion material while retaining distinct gold/coral/aqua marks.
- `Eingesammelt` remains readable and no row becomes visually noisy.
- Bonus Guest completed state remains clear.
- Toast, sheet, bottom navigation and close control fit without overlap or document scrolling.

## Decision
Accepted visually after one rejected iteration. This documentation commit creates a new exact PR head, so merge remains blocked until fresh normal CI + full Browser QA are green on that documented head and the required Daily screenshots are reopened to confirm the render is unchanged.

## Remaining visual debt
Milestone B remains open. Active ownership currently blocks Storage, player progression, Place03/Collection/Map and dynamic FX. The next free visual pass must re-read Issue #42/open PRs and choose a non-overlapping screenshot-first weakness rather than duplicating those scopes.
