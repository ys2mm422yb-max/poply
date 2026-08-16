# Place Screen V4 — Café First

## Problem
The shipped Place Screen V3 still reads like a stacked mobile dashboard on 390px phones. The objective surface is too large, missing-star state looks disabled/broken, unlock/after copy is cramped, and progress chrome competes with the authored café scene.

## V4 changes
- café scene receives roughly 70%+ of the Place viewport;
- map remains a small utility on the scene;
- next-upgrade UI is one compact action tray;
- missing stars no longer leave a disabled grey Build button: the primary CTA routes directly to Orders;
- real Build remains available when the goal is ready;
- restoration journey is reduced to one thin progress line;
- unlock and next-place promise stay readable without ellipsis on 390×720;
- authored next-upgrade preview nodes remain in the DOM for progression/QA semantics but are no longer painted as translucent ghost objects over the café scene;
- gameplay values, save format, economy and backend architecture are unchanged.

## QA contract
The existing 14-stage Scene V2 WebKit screenshot gate now also checks the V4 hierarchy at 390×844 and 390×720, including active missing-star CTA behavior and bottom-navigation clearance. Stage 4 deliberately seeds the original critical Meerterrasse state at **10/11 stars** and requires the exact `Noch 1 Stern` status plus active `1 ★ in Aufträgen holen` CTA. Visual screenshots must be manually reviewed before merge.

The dedicated Place03 WebKit gate continues to fail on all real console/page/network errors. It ignores only the exact localhost WebKit service-worker pageerror `sw.js due to access control checks`, which can occur after a fully successful Place03 flow and is unrelated to application behavior.
