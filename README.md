# Poply

Poply is a mobile-first Match-3 game focused on fast sessions, satisfying combos, clear progression and broad appeal.

## Product direction

- Easy to understand in seconds, difficult to master.
- Short rounds with immediate feedback and strong combo moments.
- Universally appealing visual identity; not targeted specifically at one gender.
- Own identity: no candy theme and no copying protected Candy Crush assets, levels, branding or presentation.
- Fair engagement: fun, flow and progression instead of deceptive loss manipulation or pay-to-win pressure.
- Start small, prove the core loop, then add level goals, special pieces, progression, daily challenges and cloud saves.

## Technical direction

- Frontend/game client lives only in this repository: `ys2mm422yb-max/poply`.
- Poply backend/database lives only in its dedicated Neon project.
- Other projects, repositories and databases are strictly out of scope.
- Core game rules are framework-independent JavaScript so they can be tested deterministically.
- Dependencies stay minimal until a concrete need justifies them.

## Canonical test build

Poply uses one permanent test URL for all testable builds:

`https://ys2mm422yb-max.github.io/poply/`

No rotating preview URLs are to be used as the normal testing workflow.

## Current milestone

Foundation / playable core prototype:

1. Match detection
2. Adjacent swaps
3. Invalid-swap rejection
4. Cascades
5. Combo scoring
6. Automated core tests
7. Stable GitHub Pages deployment path

See `PROJECT_RULES.md` for binding project rules and `docs/PRODUCT_VISION.md` for the product vision.
