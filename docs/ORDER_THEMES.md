# Thematic Orders

## Purpose
Arbeitsblock 2 makes orders read like understandable café moments rather than arbitrary item combinations.

## Contract
- Every authored Opening, Coast, Sunset and Garden order resolves through one deterministic presentation entry in `src/aaa-order-themes.js`.
- The mapping changes presentation only: visible title, concise theme label and a short explanation of why the concrete required products belong together.
- Raw or intermediate items are never presented as already-finished dishes. Examples: `Mehl` is described as preparation for baked goods; `Zucker` as preparation for a sweet component; `Fruchtmix` is not called a lime.
- Compact Board order cards stay unchanged in information density: guest, stars, item art and quantity/status only. Theme/story context belongs to the focused Orders service card where there is room to read it.
- Existing requirement sets, difficulty bands and base Coin/Star rewards remain unchanged in this block. The block improves semantic coherence without hidden balance inflation.
- The presentation mapping is not persisted into the save. Existing/legacy saves therefore inherit the corrected wording automatically without a save-version bump.
- No RNG, timers, new currency, Neon/backend dependency or PWA release-marker change.

## Authored corrections
The mapping deliberately fixes misleading legacy names without changing what the player has already produced:
- `Frisches Gebäck` + Mehl → `Backstuben-Start`: Mehl is preparation, not finished pastry.
- `Kleine Pause` + Zucker → `Süße Vorbereitung`.
- `Limettenpause` + Fruchtmix → `Fruchtmix-Pause`.
- `Minzgruß` + Kräuterbund → `Kräutergruß`.
- `Blütenkaffee` + Garten-Spritz/Poply Mocha → `Gartenkaffee`.

Higher-tier combinations retain their authored names when the required products already match the promise, e.g. `Croissant & Kaffee`, `Süßer Nachmittag`, `Golden Hour` and `Poply Gartenfest`.

## Theme vocabulary
- `coffee-break` — coffee-led solo pause.
- `breakfast-prep` — bakery/coffee breakfast preparation.
- `sweet-prep` — sweet preparation or afternoon treat.
- `date` — paired café/abend moment.
- `brunch` — larger bakery/drink combination.
- `celebration` — highest-tier multi-family service.
- `sunset` — Sonnenkai-specific fruit/drink moments.
- `garden` — Dachgarten-specific herb moments.

## QA
The dedicated thematic-order WebKit gate runs at 390×844 and 390×720 and proves:
1. the focused order visibly shows exactly one concise theme label and readable story;
2. the concrete requirement art/counts remain readable and tappable and still open item provenance;
3. compact Board jobs do not gain theme microcopy;
4. no document scroll or Bottom Dock overlap is introduced.

Canonical screenshots:
- `340-thematic-order-focus-390x844.png`
- `340-thematic-order-focus-390x720.png`
- `341-thematic-order-board-390x844.png`
- `341-thematic-order-board-390x720.png`
