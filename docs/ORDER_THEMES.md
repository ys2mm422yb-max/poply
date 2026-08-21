# Thematic Orders

## Purpose
Arbeitsblock 2 makes orders read like understandable café moments rather than arbitrary item combinations.

## Contract
- Every normal and opening order carries a deterministic `theme` and a short `story`.
- Theme copy must explain the concrete required products without pretending raw preparation items are finished dishes.
- Compact Board order cards stay unchanged: guest, stars, item art and quantity only.
- Theme/story context belongs to the focused Orders service card where there is room to read it.
- Existing requirement sets and base Coin/Star rewards remain unchanged in this slice. The block improves semantic coherence without hidden balance inflation.
- No RNG, timers, new currency, save-version bump, Neon/backend dependency or PWA release-marker change.

## Theme vocabulary
- `coffee-break` — coffee-led solo pause.
- `breakfast-prep` — bakery/coffee breakfast preparation.
- `sweet-prep` — sweet preparation or afternoon treat.
- `date` — paired drink + bakery moment.
- `brunch` — larger bakery/coffee combination.
- `celebration` — highest-tier multi-family service.
- chapter-specific Sunset/Garden themes may use the same deterministic metadata contract.

## QA
The dedicated thematic-order WebKit gate must run at 390×844 and 390×720 and prove:
1. the focused order visibly shows one concise theme label and story;
2. the concrete requirement art/counts remain readable and tappable;
3. compact Board jobs do not gain theme microcopy;
4. no document scroll or Bottom Dock overlap is introduced.

Canonical screenshots:
- `340-thematic-order-focus-390x844.png`
- `340-thematic-order-focus-390x720.png`
- `341-thematic-order-board-390x844.png`
- `341-thematic-order-board-390x720.png`
