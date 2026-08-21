# Orders Stage V2

Arbeitsblock 3 / Issue #151 is a screenshot-first visual and game-feel pass for the selected Orders service task. It does not change order mechanics, rewards, progression, persistence, or backend architecture.

## Player-facing intent

Orders should feel like a small living service counter rather than one large petrol dashboard. The selected order now reflects the actual requested item families into the existing stage, counter plane, guest portrait, and purpose strip. A bakery + coffee order therefore carries a warmer bakery key light and coffee secondary reflection; other family combinations use the same deterministic mapping.

The decoration is derived only from the selected order already present in `currentOrders`. It does not write gameplay state and does not influence which order appears or what it pays.

## Visual contract

- `aaa-orders-stage-v2.js` reads the selected `data-service-order`, derives the first two distinct known requirement families, and decorates the existing Orders DOM idempotently.
- `aaa-orders-stage-v2.css` owns only the new reflected-light/set-dressing layer and stronger ready/delivery/reward feedback.
- The existing `.service-card:after` counter/table plane remains the single counter geometry owner; Stage V2 recolors and deepens it rather than creating another layout surface.
- Decorative lamps, glints, reward rings, and rays are `pointer-events:none` and never become controls.
- Ready state may increase visual intensity but does not change readiness semantics.
- Delivery/reward effects attach to the existing `fx-order-deliver`, `service-reward-origin`, and `fx-reward-arrive` hooks; Coin/Star values and delivery timing remain unchanged.
- Reduced Motion disables all new Stage V2 animations and leaves only static authored light.
- No new navigation, permanent dashboard, currency, RNG, timer/FOMO, save field, save-version bump, backend, or Neon dependency.

## Acceptance evidence

The mandatory WebKit gate is `scripts/orders-stage-v2-qa.mjs`. On both 390×844 and 390×720 with physical-iPhone safe insets it must capture:

- `330-orders-stage-missing-*` — selected bakery/coffee order with one item missing;
- `331-orders-stage-ready-*` — the same selected order fully prepared;
- `332-orders-stage-reward-*` — real delivery during the existing Coin/Star arrival payoff.

The QA rejects document scroll, dock overlap, wrong family decoration, missing stage set dressing, wrong delivery enabled state, and missing reward-arrival hooks. A green run is still not visual acceptance: all six exact-head screenshots must be opened and reviewed before merge, with findings recorded in the PR and Issue #42.
