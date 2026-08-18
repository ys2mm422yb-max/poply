# Mobile layout stability

This slice fixes a shared class of mobile layout regressions across Place, Aufträge and Board without changing gameplay, rewards, save schema, economy or backend architecture.

## Shared shell contract
- Installed iPhone/PWA mode budgets both safe areas: 47px top and 34px bottom are explicitly reproduced in WebKit QA.
- The bottom navigation owns its home-indicator safe area in the shell row; game views receive only the real remaining content track.
- Core game views use `min-width: 0`, `min-height: 0` and explicit dock clearance so children cannot silently push under the navigation.

## Place
The Café scene remains the primary surface. The objective/action tray is content-sized rather than a fixed clipped block, and the quiet `DEIN CAFÉ WÄCHST` rail must stay visibly above the dock at both 390×844 and 390×720.

The canonical regression state is Place 01 with four upgrades and 10/11 Stars for Meerterrasse. QA requires the exact missing-star status and active route back to Aufträge.

## Aufträge / Service-Ruf
Dynamic surfaces are real grid rows instead of implicit extra content:
- base Orders;
- Daily-only;
- Service-Ruf-only;
- Daily + Service-Ruf.

When Service-Ruf is ready/active, its panel is a direct child of the selected service card and owns a dedicated grid row between order context and the delivery CTA. Competing Service Special, reward-purpose and decorative pseudo layers are hidden in this temporary focus state so they cannot bleed through or overlap the call decision.

Guest-choice cards remain responsive and preserve enough title width for longer names such as `Frühstücksduo`.

## Board
The Board no longer derives its 7×7 workbench size from a fixed viewport subtraction. `aaa-layout-stability.js` measures the real remaining Board area after dynamic mission/customer/Service-Ruf rows and calculates one side from `min(available width, available height)`. That exact pixel side owns both width and height of the workbench.

This single-owner geometry prevents the WebKit distortions found during the rejected iterations where the Board rendered as 376×435, 376×392 or 313×329.

## Required QA
`scripts/mobile-layout-stability-qa.mjs` runs in the mandatory Browser QA workflow and generates six canonical screenshots:
- Place Meerterrasse 10/11 at 390×844 and 390×720;
- Orders Service-Ruf ready at 390×844 and 390×720;
- Board with Service-Ruf ready at 390×844 and 390×720.

The gate checks row ordering, no document scrolling, dock clearance, Service-Ruf focus layering and an exact square Board. Existing Guest Loyalty, Service-Ruf, Scene V2, Place03 and other Browser gates remain hard requirements; this new gate supplements rather than replaces them.

Automated green is not visual acceptance. Relevant generated screenshots must still be opened and inspected before merge.