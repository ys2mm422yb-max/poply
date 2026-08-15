# Screenshot QA — Orders service-counter anchor

Date: 2026-08-15
PR: #89 — `Visual: ground Orders with a service counter`
Start main: `7fb7e91eb1d998d2043e6a25112bfac51decabd3`
First accepted implementation head: `8a8ea0c5f24ab9e89c8bec2cc79eba161f62cee7`

## Baseline evidence
Exact-main Browser QA:
- run `31874405711`
- artifact `9244359943`

Actually opened before implementation:
- `03-orders-390x844.png`
- `06-orders-short-safari.png`
- context: `01-board-390x844.png`, `04-board-short-safari.png`, `30-item-discovery-reveal.png`, `22-player-milestones-390x844.png`, `50-daily-goals-ready.png`

### Baseline finding
Orders already had stronger guest/reward colors than earlier builds, but the selected service stage still read as content floating inside one large gradient panel. The area around the guest, requirement, rewards and disabled delivery action had weak physical grounding. The disabled `Liefern` control also read like a broad utility bar rather than part of a game scene.

## Implementation
The pass stays outside active Place03 ownership and does not change order logic or markup:
- adds `src/aaa-orders-counter.css` as a late visual polish layer;
- converts the pre-existing decorative lower service glow into a stable counter/table plane using gradients and one top highlight;
- explicitly keeps the decorative plane `pointer-events:none`;
- gives the waiting delivery state an intentional inactive material instead of a flat dead bar;
- keeps Reduced Motion explicit and unchanged;
- loads the independent sheet after `aaa.css` from `index.html`.

Deterministic contract coverage in `tests/aaa-customers.test.js` verifies the late load order, interaction-safe overlay, disabled action treatment and Reduced Motion contract.

## First implementation evidence
Exact PR head `8a8ea0c5f24ab9e89c8bec2cc79eba161f62cee7`:
- CI run `31875524323` — success
- Browser QA run `31875524248` — success
- artifact `9244648625`

Actually opened:
- `03-orders-390x844.png`
- `06-orders-short-safari.png`

### 390×844 finding
Accepted. The selected order now sits on a readable lower service/counter plane. Guest portrait, requirement card, Coins/Stars and restoration-purpose strip still dominate the interaction; the new plane adds spatial grounding rather than another card. The disabled delivery action is visibly inactive but no longer looks like an unrelated generic utility control. Bottom navigation and footnote remain separate and readable.

### 390×720 finding
Accepted. The same counter cue compresses cleanly on the short Safari-like viewport. No document scroll, control clipping or bottom-navigation overlap is introduced. The requirement, reward blocks, restoration purpose and full-width delivery action remain readable.

## Version decision
Version 1 is accepted. No visual iteration was needed after opening the generated screenshots. The pass is intentionally restrained: it solves one spatial-grounding defect without adding gameplay decoration or competing with the active dynamic-FX / Place03 work.

## Final release gate
This documentation commit creates a new final PR head. Merge is allowed only after normal CI + full Mobile WebKit Browser QA are green on that exact documented head and the final 390×844 / 390×720 Orders screenshots are opened again. After merge, exact-main CI, Browser QA and canonical Pages deployment must also succeed.
