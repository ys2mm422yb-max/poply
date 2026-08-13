# Poply

Poply is a mobile-first connect-and-pop puzzle game focused on intuitive same-colour chains, fast sessions, satisfying power moments, clear progression and broad appeal.

## Product direction

- Touch a piece and drag through adjacent matching colours; diagonal connections are allowed.
- Release a chain of at least three matching pieces to pop it.
- Longer chains create stronger rewards: Blast at 5+, Prism at 7+.
- Easy to understand in seconds, difficult to master.
- Short rounds with immediate feedback and strong chain moments.
- Universally appealing visual identity; not targeted specifically at one gender.
- Own identity: no candy theme and no copying protected Candy Crush assets, levels, branding or presentation.
- Fair engagement: fun, flow and progression instead of deceptive loss manipulation or pay-to-win pressure.

## Technical direction

- Frontend/game client lives only in this repository: `ys2mm422yb-max/poply`.
- Poply backend/database lives only in its dedicated Neon project.
- Other projects, repositories and databases are strictly out of scope.
- Core game rules are framework-independent JavaScript so they can be tested deterministically.
- Dependencies stay minimal until a concrete need justifies them.
- One responsive web implementation targets iOS/Android phones and tablets and remains suitable for later app-store packaging.

## Canonical test build

Poply uses one permanent test URL for all testable builds:

`https://ys2mm422yb-max.github.io/poply/`

No rotating preview URLs are to be used as the normal testing workflow.

## Current milestone

Playable connect-and-pop core:

1. Same-colour drag chains with visible connection path
2. Orthogonal and diagonal linking
3. Minimum three-piece chain validation
4. Collapse/refill after pops
5. Blast and Prism power pieces
6. Score, moves, level progression and results
7. Idle hints and automatic no-move reshuffle
8. Automated core regression tests
9. Stable GitHub Pages deployment path

See `PROJECT_RULES.md` for binding project rules, `docs/END_GOAL.md` for the standing quality target and `docs/PRODUCT_VISION.md` for the product vision.
