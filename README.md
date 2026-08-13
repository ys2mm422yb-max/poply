# Poply

Poply is being redesigned as a mobile-first **merge-and-build casual game** with a persistent board, item evolution, generators, orders and visible place restoration/progression.

## Direction reset

As of 2026-08-13, the former connect-and-pop chain prototype is no longer the active product direction. It remains useful as technical history for responsive behavior, CI, deployment, local persistence and effect helpers, but future product work targets the V2 merge game defined in `docs/GAME_DIRECTION_V2.md`.

## New product loop

1. Generate base items.
2. Merge two identical same-tier items into a higher-tier item.
3. Discover deeper item chains.
4. Complete several visible customer/task orders.
5. Earn coins and progression resources.
6. Restore/build/style the current Poply place.
7. Unlock new generators, item families, systems and places.
8. Return later to the same persistent board and world.

## Poply identity

Poply should sit in the broad merge/meta casual genre without copying one specific existing game.

- original Poply world, art, item chains, characters and UI,
- first vertical slice may use a cozy café/food-place theme because orders and item chains are intuitive there,
- later Poply Places can use different themes rather than locking the whole game to one restaurant forever,
- broad, modern appeal without strongly gender-coded presentation,
- fair engagement based on discovery and visible progress rather than hidden manipulation.

## Technical direction

- Frontend/game client lives only in `ys2mm422yb-max/poply`.
- Poply backend/database lives only in its dedicated Neon project.
- Other projects, repositories and databases are strictly out of scope.
- Domain logic should be deterministic and separated from UI.
- Item families, tiers, generators, orders and place progression should be data-driven.
- Local-first play and save/resume come before cloud features.
- One responsive codebase targets iOS/Android phones and tablets and remains suitable for later app-store packaging.

## Canonical test build

Poply uses one permanent test URL:

`https://ys2mm422yb-max.github.io/poply/`

No rotating preview URLs are the normal testing workflow.

## Immediate V2 milestone

The next playable build should prove:
- persistent merge grid,
- identical-item merge evolution,
- 3 item families,
- 2 generators,
- 3 simultaneous orders,
- order delivery/rewards,
- one visible place with several restoration steps,
- local save/resume,
- polished mobile merge interaction,
- phone/tablet responsive layouts,
- deterministic merge/order/progression/persistence tests.

See `PROJECT_RULES.md`, `docs/GAME_DIRECTION_V2.md`, `docs/END_GOAL.md`, `docs/PRODUCT_VISION.md`, `docs/NEXT_STEPS.md` and `docs/VISUAL_DIRECTION.md` for the active standing direction.
