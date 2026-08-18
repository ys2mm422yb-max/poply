# Real-device UI hierarchy

This slice follows physical iPhone screenshots from production after the mobile layout-stability release. Geometry was stable, but the screenshots exposed repeated status surfaces and one remaining real layering defect in Orders.

## Real-device findings
- Orders / Service-Ruf ready showed faint underlying `Liefern` text through the Direkt/Nachschub decision controls.
- Orders repeated Service-Ruf in a large top strip and again inside the selected order.
- After choosing Direkt, the Orders hero still said `Wähle deinen nächsten Auftrag`, even though the guest was already committed.
- Board repeated active Ruf, restoration target and three equally loud guest cards before the workbench.
- Place repeated `Meerterrasse` in both a scene badge and the objective tray.
- Core views used too many similarly weighted rounded/glowing status cards.

## Product hierarchy contract
### Orders — Ruf ready
The Service-Ruf is optional. The ready decision is therefore a direct Orders grid row between the guest queue and the normal selected order. It is never layered inside or over the delivery card. Normal delivery remains visible and usable.

Orders does not render a separate top Service-Ruf strip. The ready row is the single Ruf decision surface.

### Orders — Ruf active
The main Orders hero becomes contextual and names the committed guest. The selected order contains one compact Ruf status with mode/progress/bonus. There is no duplicate top Ruf strip.

### Board
Board keeps one compact Ruf strip because Ruf progress matters while generating/merging. The restoration mission and non-focused guests become secondary so the workbench remains the dominant play surface. Board square geometry continues to be owned by `aaa-layout-stability.js`.

### Place
The objective tray remains the sole next-upgrade message. The duplicate scene `ALS NÄCHSTES` badge is removed. The accepted Café-first composition remains intact.

## QA contract
`scripts/mobile-layout-stability-qa.mjs` now reproduces four physical-device-like states at both 390×844 and 390×720 with 47px top / 34px bottom installed-iPhone safe areas:
1. Place Meerterrasse 10/11;
2. Orders Daily + Service-Ruf ready;
3. Orders Service-Ruf Direkt active;
4. Board with that active Ruf.

The gate requires no duplicate Orders strip, no nested ready Ruf panel, no Ruf/delivery overlap, contextual active hero copy, one compact active status, exact square Board geometry and a minimum useful workbench size. It generates eight canonical screenshots for manual visual review.

Automated green is necessary but not sufficient. The exact-head screenshots must be opened and reviewed before merge.

## Non-goals
No gameplay balance, rewards, upgrade costs, economy, save schema/version, Service-Ruf semantics, Neon or backend behavior changes.