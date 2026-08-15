# Screenshot QA — Board guest intent lanes

Date: 2026-08-15
Worker: `visual-automation`
Start `main`: `1d4a23d80eb81ca5829ee78b8d12b1a689a519f9`
Branch: `visual/board-job-intent-vibrance`
PR: #80

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

## First implementation exact-head QA
First reviewed implementation/documentation head: `ca1404f047191c7713a6faf7543f49f41aaa2b07`.
- CI run `31870346528` — success.
- Browser QA run `31870346497` — success; Mobile/Short Safari, Progression, Collection, Storage, Daily and Place Map all green.
- artifact `9243260974`, digest `sha256:287fac089dddca0fb08175bdfc71a83d14d29cc558cdc15db041c87074d9798d`.

Screenshots actually opened from that exact artifact:
- `01-board-390x844.png`
- `04-board-short-safari.png` (390×720)
- `03-orders-390x844.png`

## Visible findings / decision
**Version 1 accepted; no rejected visual iteration.**

- 390×844: the three guest jobs now read as active authored targets rather than three nearly identical petrol status cards. Warm, cool and pink/violet lanes are visible but still subordinate to the Board.
- Requested-item wells are materially brighter and easier to separate from the surrounding job surface.
- Avatar halos reinforce guest identity without adding a new widget or changing hit areas.
- 390×720: the same hierarchy survives with no visible clipping, no Board shrink and no primary-navigation collision.
- Full Orders regression screenshot remains unchanged in composition and readable; this pass does not leak into the service stage.
- The treatment is intentionally restrained: it adds purpose/color without making the guest strip look like three unrelated promotional banners.

## Final release gate
This acceptance documentation creates a new final PR head. Normal CI + full Browser QA must be green again on that exact documented head before merge. If the rendering differs unexpectedly, reopen the generated Board screenshots and reject rather than relying on this earlier acceptance.

After merge, exact-main CI, Browser QA and `Deploy canonical test build` must all succeed before the release is called live.
