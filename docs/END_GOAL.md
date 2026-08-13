# Poply – End Goal

This document defines what "done well" means after the 2026-08-13 direction reset.

## Product target
Poply should feel like a polished, original merge-and-build mobile game with a persistent board and a visible world that grows because of the player's merges and completed orders.

The intended player reaction is:
- immediately understands that two identical items merge,
- enjoys discovering the next tier,
- always has a short-term order worth working toward,
- sees clear long-term progress outside the board,
- wants to make a few more merges because the next upgrade feels close,
- returns to discover new item families, generators and Poply places.

The former connect-and-pop chain game is not the target anymore.

## Core loop
1. Open the persistent board.
2. Generate useful base items.
3. Merge identical same-tier items into higher tiers.
4. Manage limited board space intelligently.
5. Complete visible orders/tasks.
6. Earn coins, reputation and/or restoration resources.
7. Spend progress on visible improvements to the current Poply place.
8. Unlock new chains, generators, systems and places.
9. Return later with the board and world still in the state the player left them.

## Merge feel
- Moving and merging must feel tactile and immediate.
- Valid merge targets should be easy to recognize while dragging.
- Successful merges should use satisfying movement, snap, scale, glow and sound/haptic hooks.
- High-tier discoveries should feel noticeably more valuable than low-tier merges.
- Invalid moves should be harmless and understandable.
- No item should disappear because of an ambiguous gesture.

## Board design
- The board is persistent, not reset after a short score level.
- Board space creates planning decisions without becoming unfair busywork.
- Generators are visually distinct from normal items.
- Important items can later be stored safely.
- Full-board states must remain recoverable through fair tools.
- Item chains and generator rules are data-driven and expandable.

## Orders
- Several orders can be visible simultaneously.
- Orders request clear item combinations.
- Completing an order visibly removes/delivers the correct items and immediately grants rewards.
- Early orders teach item evolution naturally.
- Later orders create planning by combining different item families and higher tiers.

## Meta-world / restoration
The merge board alone is not enough.

- Every meaningful session should move the visible Poply world forward.
- The player should restore/build/style a current place through multiple visible steps.
- Upgrades should materially change the scene rather than only increase numbers.
- Major milestones unlock new content and eventually new Poply places.
- Poply Places may include different original themes, so the game is not limited forever to one restaurant/café setting.

## Visual target
- Bright, tactile, warm and polished without looking childish or strongly gender-coded.
- High-quality item art is central; no generic placeholder shapes as final assets.
- Item tiers must remain readable on small phone screens.
- The merge board, orders and current place should share one coherent visual system.
- The meta scene should create emotional payoff and visible before/after transformation.
- Effects should be satisfying but never hide board state.

## Engagement target
Replayability comes from item discovery, collection/evolution chains, satisfying merges, board optimization, completing orders, visible restoration and unlocking new systems/places.

It must not depend on hidden loss rigging, fake near-wins, pay-to-win pressure or manipulative scarcity.

## Platform target
One shared implementation supports iPhone/iPad and Android phones/tablets. Portrait is primary; tablet layouts use the extra space intentionally.

Canonical test build:
`https://ys2mm422yb-max.github.io/poply/`

The same codebase should remain suitable for later iOS/Android native packaging.

## First strong vertical slice
Before adding events or monetization, Poply V2 should prove:
- persistent merge grid,
- at least 3 item families,
- at least 2 generators,
- meaningful multi-tier item evolution,
- 3 simultaneous orders,
- delivery and rewards,
- coins plus one progression resource,
- one visible Poply place with several restoration steps,
- local save/resume,
- polished merge feedback,
- phone/tablet responsive behavior,
- deterministic tests for merge/order/progression/persistence logic.

## Quality gates
A meaningful iteration is not finished until relevant game/domain tests pass, the main merge/order/progression path works, no known item-loss/save-loss defect remains, the canonical deployment succeeds, representative mobile/tablet layouts are checked when tooling permits, and obvious UX/visual defects found during implementation are fixed.

The recurring question is: **Does this make Poply feel more like a real persistent merge game with meaningful visible progression?**

If not, keep iterating.

## Development priority
1. persistent merge-board foundation,
2. item chains and generators,
3. orders and rewards,
4. visible place restoration,
5. save/resume reliability,
6. premium item/board/scene art and merge feel,
7. content pipeline and balancing,
8. retention systems,
9. optional cloud/backend features,
10. store packaging/release readiness.
