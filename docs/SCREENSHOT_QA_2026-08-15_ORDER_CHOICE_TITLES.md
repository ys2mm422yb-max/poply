# Screenshot QA — readable compact Orders titles

Date: 2026-08-15
Worker: `visual-automation`
PR: #63 — Visual: keep compact order titles readable
Start main: `7643d324f58bba867381459707030c8a0786a608`
Implementation head reviewed before this documentation commit: `a6db82e36f5c472ac686f6d78ae3f18b38ecdade`

## Why this pass existed
The accepted Orders vibrance pass left one specific mobile readability defect: all three compact customer/order cards ellipsized the actual order name (`Morgenkaff…`, `Frisches G…`, `Kleine Pau…`). The player could see which guest was selected, but had to guess the full order identity before opening it.

This pass changes presentation only. It does not change order generation, requirements, rewards, save state, economy, navigation, Place03, player progression or dynamic gameplay FX.

## Collision / ownership check
Open work was re-read before implementation:
- PR #55 owns dynamic-FX workflow/motion/Collection-QA files;
- PR #58 owns Place03/session/domain/Collection/Map/view integration;
- PR #62 owns player milestone/title presentation.

This focused pass stays in independent files and does not modify those active scopes.

## Baseline evidence actually opened
From successful `main` Browser QA run `31849148496`, artifact `9236957068`:
- `03-orders-390x844.png`
- `06-orders-short-safari.png`

Baseline finding: all three compact order names were visibly truncated on both required phone heights.

## Exact implementation evidence actually opened
Implementation head `a6db82e36f5c472ac686f6d78ae3f18b38ecdade`:
- CI run `31851599251` — success;
- Browser QA run `31851599281` — success;
- artifact `9237719795` (`mobile-webkit-qa`), digest `sha256:1e01bee4f112035d57429671c968601b768d6fb42d783d71ce1c5bc8791a2f05`.

Actually opened:
- `03-orders-390x844.png`;
- `06-orders-short-safari.png`.

No tablet PNG is produced by the current `mobile-webkit-qa` artifact for this flow, so no tablet visual acceptance is claimed for this focused pass.

## Accepted visual findings
### Orders 390×844
- `Morgenkaffee` is fully readable in the selected first card;
- `Frisches Gebäck` wraps cleanly to two compact lines instead of ellipsizing;
- `Kleine Pause` remains fully readable;
- avatar, selection state and `1 fehlt` status remain visible;
- the existing three-card row height and service-stage composition are unchanged;
- no new overlap with Daily ribbon, service stage or bottom navigation.

### Orders 390×720
- the same three titles remain readable on the short Safari-like viewport;
- two-line `Frisches Gebäck` still fits with the status line below it;
- touch cards retain their existing footprint;
- no document-scroll, clipping or nav collision is visible.

## Accepted / rejected versions
The first implemented presentation version is accepted. No visual iteration was rejected in this pass.

## Remaining visual debt
The Orders screen is now materially clearer, but Milestone B remains open globally. Future visual work should continue screenshot-first color/effect/game-feel improvements without reopening the compact-title problem or overlapping active Place03/dynamic-FX/player-title work.

## Decision
Accept the implementation visually. This documentation commit creates a new exact PR head, so merge remains blocked until fresh normal CI + Browser QA succeed for that documented head and the two Orders screenshots are reopened to confirm the render is unchanged.