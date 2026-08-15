# Screenshot QA — authored bottom navigation game dock

Date: 2026-08-15
Worker: `visual-automation`
PR: #86 — Visual: turn bottom navigation into a game dock
Run start main: `d84f421859090b84993d8fca3538efc93d46e321`
Fresh implementation base after concurrent main advance: `d5078aaf94fd7c272424202a34c8f5337dfe6f81`
First accepted implementation head before this documentation commit: `cbbd1153656a659f4f7b563ac9aa3c9e8d6a2fa0`

## Why this pass existed
The current Board, Orders, Daily and Place surfaces are materially more authored and colorful, but the persistent bottom navigation still read as generic application chrome. The active destination became one broad dark rounded card with a thin status bar, while inactive destinations stayed flat. Because the navigation is visible on every primary screen, that dashboard-style selection weakened the surrounding game presentation.

This pass changes shell presentation only. It does not change navigation semantics, shell row height, safe areas, gameplay, save data, economy, Place03, world-life or progression logic.

## Collision / ownership check
Open PRs were read before work:
- #58 owns Place03/session/view/Collection/Map integration;
- #83 owns the Place world-life layer;
- #85 owned the milestone/progression sheet and merged while this run was active;
- #66 is documentation-only.

The first branch was deliberately abandoned when `main` advanced. The accepted implementation was rebuilt from the then-current `main` `d5078aaf94fd7c272424202a34c8f5337dfe6f81` on `visual/nav-game-dock-v2` rather than merging a stale base.

## Baseline evidence actually opened
From successful main Browser QA run `31872603101`, artifact `9243873065`:
- `01-board-390x844.png`
- `04-board-short-safari.png` (390×720)
- `03-orders-390x844.png`
- `06-orders-short-safari.png` (390×720)
- representative Daily and Collection screenshots for shell consistency.

Baseline finding: core surfaces were healthy and increasingly game-like, but the active bottom destination still looked like a large selected app card.

## Accepted implementation evidence actually opened
Exact implementation head: `cbbd1153656a659f4f7b563ac9aa3c9e8d6a2fa0`
- CI run `31872969627` — success
- Browser QA run `31872969600` — success
- artifact `9243968348` (`mobile-webkit-qa`), digest `sha256:23fd6da4af581440958d45bd7d304928af2b89459410a3b3343fb780ccabe39e`

Actually opened:
- `01-board-390x844.png`
- `04-board-short-safari.png` (390×720)
- `03-orders-390x844.png`
- `06-orders-short-safari.png` (390×720)

No tablet PNG is produced by the current shared mobile artifact for this primary flow, so no tablet visual acceptance is claimed for this focused phone-chrome pass.

## Accepted visual findings
- The navigation now reads as one continuous game dock rather than four adjacent app cards.
- Active selection is concentrated on a compact icon pedestal, destination-colored halo and slim top signal instead of a large filled rectangle.
- Place, Aufträge, Board and Sammlung retain restrained Aqua, Orange, Green and Violet identities without competing with the Board/Orders focal content.
- Inactive destinations remain readable; the active label is visibly stronger.
- The whole tab remains the touch target; the icon pedestal is presentation only.
- The existing 58px phone shell row, safe-area padding and bottom reachability are unchanged.
- Both 390×844 and 390×720 remain one-screen compositions with no new clipping, overlap or document scroll.
- Orders footnote, delivery stage and Board atmosphere remain visually separated from the persistent dock.
- Reduced Motion remains globally enforced; this pass does not depend on animation to communicate selection.

## Accepted / rejected versions
- The original first branch `visual/nav-game-dock` was not carried forward after `main` advanced; it was intentionally replaced by a fresh branch from the new main rather than treated as an accepted release candidate.
- The first rendered implementation on the fresh branch is visually accepted. No screenshot-driven CSS revision was required after Browser QA.

## Decision
Visual implementation accepted. This documentation commit creates a new exact PR head, so merge remains blocked until normal CI + Browser QA are green again for that documented head and the required phone screenshots are reopened to confirm the render is unchanged.

Milestone B remains open globally. The next visual worker must rebuild its queue from current main/open PRs and choose another non-overlapping screenshot-first weakness.
