# Screenshot QA — Collection Book E2

Date: 2026-08-14
Milestone: E2 — Collection Book + discovery rewards
Viewport acceptance: Mobile WebKit 390×844 and 390×720

## Screens reviewed
- `30-item-discovery-reveal.png`
- `31-collection-coffee.png`
- `32-collection-locked-fruit.png`
- `33-collection-short-safari.png`
- existing Board / Place / Orders / Player-Level screenshots from the same exact-head Browser-QA run

## Rejected candidates
### Candidate 1 — functionally green, visually invisible discovery
The first Collection build passed functional WebKit checks, but self-review showed that the `NEU ENTDECKT` reward was effectively absent from the screenshot. Playwright `isVisible()` alone was insufficient.

The QA was tightened to inspect computed geometry, viewport position and opacity. This correctly turned the same presentation into a red Browser-QA run and proved the reward had reached `opacity: 0` while its DOM node still existed.

### Candidate 2 — timing race removed
The discovery card was changed from a single enter/hold/exit keyframe animation to explicit phases:
1. enter to full opacity;
2. stable fully-visible hold;
3. explicit leaving class;
4. DOM removal after the exit.

The reveal is now fixed to the viewport and its QA contract requires readable dimensions, useful top/bottom coordinates and >= 0.8 opacity at the screenshot moment.

## Accepted candidate
### Discovery moment
- Kaffeetasse art is large and readable.
- `NEU ENTDECKT`, real item name, tier and `+40 XP` form one clear reward moment.
- It does not collide with the resource HUD or bottom navigation.
- The underlying Board remains visually understandable and is not permanently displaced.

### Collection Book 390×844
- overall `4/24` discovery count is visible immediately;
- four families fit as one selector row;
- selected family shows six tiers in a readable 3×2 composition;
- known tiers use authored production art and real names;
- future tiers remain dark silhouettes with `???` and do not spoil names;
- Place/generator discovery strip remains compact;
- four-tab bottom navigation is readable and functional.

### Short Safari-style 390×720
- no vertical document scrolling;
- no clipped navigation;
- all six tier cards remain visible;
- world discovery strip remains visible;
- header/resources remain readable;
- the composition compresses instead of hiding core collection content.

## Remaining visual debt
Milestone B remains OPEN. The Collection screen is accepted for E2 because its hierarchy and interaction are coherent and mobile-safe, not because Poply has reached final AAA production art. Future global art polish may improve material richness and reward effects without changing the collection information architecture.
