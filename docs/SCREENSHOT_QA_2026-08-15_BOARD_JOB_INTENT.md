# Screenshot QA — Board guest intent lanes

Date: 2026-08-15
Worker: `visual-automation`
Start `main`: `1d4a23d80eb81ca5829ee78b8d12b1a689a519f9`
Branch: `visual/board-job-intent-vibrance`

## Why this pass exists
The latest successful exact-main WebKit screenshots show that the Board itself and its spare portrait atmosphere are now authored, but the three compact guest jobs immediately above the Board still read as repeated dark status cards. They communicate state, yet visually underplay the actual player intent: these are the three targets that give the Board a purpose.

## Baseline evidence actually opened
Successful exact-main Browser QA run `31869331978`, artifact `9242999981`:
- `01-board-390x844.png`
- `04-board-short-safari.png` (390×720)
- `03-orders-390x844.png`
- `06-orders-short-safari.png` (390×720)

Baseline findings:
- Board geometry and lower workbench atmosphere are clean at both phone heights.
- The three compact jobs remain substantially darker and more card-like than their customer/product/reward meaning warrants.
- Orders already has stronger warm/cool service rhythm, so this pass must not restyle the full Orders screen.
- No clipping or document-scroll defect was visible in the baseline.

## Focused implementation
Only the compact Board guest strip is changed:
- guest 1 receives a warm amber/teal light lane;
- guest 2 receives a cool sky/teal light lane;
- guest 3 receives a pink/violet/teal light lane;
- avatar halos reinforce those lanes;
- requested-item wells become brighter cream material surfaces;
- reward/status/ready feedback gains restrained contrast.

The pass does **not** change Board geometry, touch targets, order logic, save state, economy, generators, Place 03, Collection, Daily, Storage or the full Orders service stage. No new motion is introduced, so Reduced Motion behavior is unchanged.

## Acceptance gate
Before merge, exact PR head must have normal CI + full Browser QA green. The generated exact-head artifact must be opened again at minimum for:
- `01-board-390x844.png`
- `04-board-short-safari.png`

Reject/iterate if the job strip becomes noisy, competes with the Board, reduces requested-item clarity, clips at 390×720, or looks like three unrelated promotional cards rather than coherent game targets.

Final run IDs, exact head, accepted/rejected iterations and screenshot findings are appended after exact-head visual review.
