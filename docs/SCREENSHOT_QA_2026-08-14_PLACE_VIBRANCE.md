# Screenshot QA — Place vibrance / identity pass

Date: 2026-08-14
PR: #51 — Visual: give each Place a distinct light and journey identity
Start `main`: `48b187be90102ba3008a3cf54ffc03f7553437a8`
First visually reviewed implementation head: `7d98c6d8b011cceeae031b46343ec3234c1fd942`

## Baseline evidence actually opened
Successful `main` Browser QA run `31843463634`, artifact `9235106258` (`mobile-webkit-qa`):
- `02-place-390x844.png`
- `05-place-short-safari.png` — 390×720
- `12-sonnenkai-first-restoration.png`

Baseline finding: both Places had strong and different authored world scenes, but the restoration surface immediately below the world reverted to nearly the same dark petrol language. Journey progress/current/done states therefore looked like generic dashboard UI instead of a continuation of the Place identity. The world was also fully static despite the visual direction allowing small performance-safe environmental motion.

## First implementation evidence actually opened
Successful exact-head Browser QA run `31843940723`, artifact `9235274130` on `7d98c6d8b011cceeae031b46343ec3234c1fd942`:
- `02-place-390x844.png`
- `05-place-short-safari.png` — 390×720
- `12-sonnenkai-first-restoration.png`
- `60-place-map-390x844.png` — regression check for the newly shipped world map

## Visible findings
### Café am Meer — 390×844
- World art remains the dominant focal point and headline contrast stays strong.
- The lower restoration surface now carries a restrained aqua light pool instead of reading as a uniform petrol slab.
- `Places / Weltkarte`, journey progress and the current milestone visually belong to the cool coastal palette.
- The cream next-goal card remains the brightest actionable element, so the extra color does not flatten hierarchy.

### Café am Meer — 390×720
- No clipping, document-scroll requirement, navigation overlap or lost build control was introduced.
- The compact layout still fits inside the Safari-like viewport.
- Added color remains visible without turning the short screen into a dense gradient stack.

### Sonnenkai restoration
- The warm sunset world now continues into the meta surface through violet/coral/amber accents.
- Completed and current milestones are no longer generic green/gold copies of the coast presentation.
- The warm journey progress line and map-launch border create a clear Place-02 identity while the existing goal card remains readable.
- Restoration reveal, XP feedback, toast and bottom navigation remain legible and separated.

### World-map regression check
- `60-place-map-390x844.png` remains readable and unclipped.
- The focused Place styling does not leak into or destabilize the map sheet composition.

## Motion / performance contract
Ambient world light uses only a pseudo-element with opacity/transform animation. `prefers-reduced-motion: reduce` disables the ambient animation and journey transition; a deterministic regression test protects these hooks.

## Decision
**Version 1 accepted.** No screenshot-driven rejection/second visual iteration was required.

The acceptance is visual only for implementation head `7d98c6d8…`. This documentation commit creates a new final PR head, so normal CI and Mobile WebKit Browser QA must be green again on that exact final head before merge. No Board/Discovery/Reward files owned by the parallel color/FX work were changed.
