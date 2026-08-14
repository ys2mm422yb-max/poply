# Screenshot QA — Storage F1

Date: 2026-08-14
Milestone: F1 — Storage tray + first meaningful Coin sink
Viewport acceptance: Mobile WebKit 390×844 and 390×720

## Screens reviewed
- `40-storage-item-stored.png`
- `41-storage-expanded.png`
- `42-storage-short-safari.png`
- existing Board / Orders / Place / Sammlung screenshots from the same exact-head Browser-QA run

## Accepted observations
### Storage interaction
- `Lager 1/4` and `Lager 0/6` are readable directly in the Werkbank header.
- The drawer is visually part of the Board rather than a fifth app section.
- Stored item art remains recognizable and exact tier badges remain visible.
- The Board-item source row clearly excludes generators; only normal merge items appear as storable choices.
- `Von der Werkbank` copy explains that parked items must return to the Board before they count for orders.
- Closing the drawer is obvious and reachable.

### Coin utility
- 4→6 expansion is visually connected to Storage, not to a generic Shop.
- Cost `200` is clear next to the Coin icon.
- After buying the expansion the HUD drops from 300 to 100 Coins and the handle/drawer update to 0/6.
- The following 450-Coin expansion is disabled when the player cannot afford it, with no accidental spend.

### Mobile composition
- At 390×844 the drawer overlays only the lower workbench area and never the bottom navigation.
- At 390×720 the drawer compresses successfully, remains above navigation and does not create document scrolling.
- Bottom navigation stays fully visible and tappable.
- The transient toast may overlap the drawer copy briefly after an action, but it does not hide any required control and disappears automatically.

## Self-review decisions
The drawer intentionally obscures part of the Board while open. This is accepted because Storage is a temporary workbench tool, the Board state remains unchanged behind it, and the close action is always visible. A permanent reduction of Board size was rejected in the feature design because it would damage the One-Screen core loop even when Storage is not being used.

No visual blocker was found that justifies delaying F1. Milestone B remains OPEN globally; F1 acceptance only confirms that Storage is safe, understandable and mobile-compatible.
