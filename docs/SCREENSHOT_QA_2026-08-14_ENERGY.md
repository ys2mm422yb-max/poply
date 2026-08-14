# Screenshot QA — energy regeneration visibility

Date: 2026-08-14
Branch: `fix/energy-regeneration-visibility`
PR: #35
Browser: Playwright WebKit mobile QA

## Why this QA was required
The defect was not only missing regeneration logic. The player also could not see how energy returns. Therefore a green unit test is insufficient: the live phone header must visibly explain the refill rule without overlapping the brand, coins, stars or menu.

## Reviewed artifact
Workflow artifact: `mobile-webkit-qa` from the exact PR head used for this review.

### `01-board-390x844.png`
Accepted.
- Energy pill visibly shows `40/40` and `Auto · 2 Min`.
- Two-line energy presentation fits the existing top bar.
- No overlap with Poply branding, coin pill, star pill or menu.
- Header height remains unchanged and the Board is not pushed down.

### `04-board-short-safari.png`
Accepted.
- Same energy explanation remains readable in the shorter Safari viewport composition.
- No clipping or horizontal collision was introduced.

### `11-sonnenkai-board-fruit-spawn.png`
Accepted.
- After one Tropenbar generator use, energy visibly changes to `39/40`.
- The second line changes to a live `+1 in 2:00` countdown.
- The refill explanation remains legible in the Place-02/Sonnenkai board state.

## Acceptance result
PASS for this defect scope.

The energy resource now communicates both current quantity and recovery behavior in the primary HUD. This does not close the broader Milestone B visual-quality target; it only confirms that the energy fix is understandable and does not regress the mobile header composition.