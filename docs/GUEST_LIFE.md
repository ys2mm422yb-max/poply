# Guest-Life · Café am Meer

Status: LIVE since PR #166. Reload-visibility hardening: PR #168. Active-order visibility: PR #169. Person-role cleanup is being verified on `fix/guest-life-person-contract`.
Durable coordination: GitHub Issue #42.

## Purpose
Guest-Life makes the active customer loop visible inside Café am Meer instead of restricting guest presence to Orders UI or a brief post-service effect.

Current active order guests can be seen approaching and waiting at a real Café location before their order is complete. After a real service, the same canonical Mika/Nora/Sam identity becomes a pending arrival and visibly moves toward a location that exists in the current restoration stage.

This is a visual/game-feel extension of the existing guest/order/loyalty layers, not a new management system.

## Preflight / preserved contracts
The implementation deliberately extends, rather than replaces:
- PR #143 — authored living Café guests, furniture-aware layering and idempotent Place decoration;
- PR #156 — Mika/Nora/Sam identity, loyalty-backed recurring guests and existing seated regular poses;
- PR #160 — Service Moments remain the service-priority mechanic; Guest-Life adds no second timer/event game;
- PR #167 — the permanent installed-PWA update path may reload the client after a canonical release;
- PR #168 — a just-served Guest-Life arrival survives that reload until it is visibly completed;
- PR #169 — active order guests are visible before service, including early Café stages without seating.

The shipped 1→6 sequence remains intact. Orders, requirements, rewards, loyalty thresholds, Service-Ruf, Service Specials, Place Powers and restoration costs are unchanged.

## Person-role contract
Every visible person in Café am Meer must have a player-readable reason to be there.

- The old anonymous permanent `cafe-barista` artwork is hidden once Guest-Life is active; the counter remains visible without a decorative person competing with real customers.
- Active order guests are canonical Mika/Nora/Sam identities derived from the existing `currentOrders` sequence mapping.
- Before `Neue Theke`, active guests approach and wait near the Café entrance.
- From `Neue Theke` onward, active guests approach and wait in a small authored counter queue instead of standing as remote scene decoration.
- Waiting guests briefly enter from the right-hand approach when the Place scene is rendered, then settle at the stage-aware waiting point.
- Waiting labels are intentionally more compact than arrival/regular labels so the person remains the visual focus.
- An identity already visible as a recurring guest or currently pending a served arrival is never duplicated as another waiting copy.
- Reduced Motion keeps the same visible waiting state but omits the entry travel.

The goal is not to simulate staff or a customer AI system. It is to make each rendered person correspond to an existing gameplay state.

## Active-order guests before service
When Café am Meer is visible, Guest-Life derives visible waiting identities directly from the existing `currentOrders` and canonical `guestForSequence` mapping.

- Up to two unique active-order guests are shown.
- This works at the early Café stages before `Sitzecke` exists.
- Waiting state is derived from existing order state and introduces no new gameplay persistence.
- Fixed authored positions are used; there is no pathfinding, collision simulation or hidden occupancy system.

## Post-service runtime contract
Successful real services emit one transient `poply:guest-served` event containing the already-resolved guest identity:
- normal customer delivery uses the existing `recordGuestService` result;
- Daily Bonus Guest uses the same existing guest result.

`aaa-guest-life-ui.js` keeps a maximum of three unique pending served identities. The queue is mirrored to the isolated UI-only key `poply-guest-life-pending-v1` so an automatic PWA/page reload between service and opening Place cannot erase the visible payoff. This marker is not part of `poply-v2-state-1`, carries no rewards/economy/progression data, introduces no gameplay save migration and is consumed after the guest has visibly completed the arrival.

A normal player does not need to switch tabs immediately. The pending arrival waits while Orders/Board remain open, survives a reload, and starts only when Café am Meer is actually visible.

When Café am Meer is visible, the next queued served guest follows one deterministic authored route from the right-hand approach into the scene. The walk is intentionally long enough to read on a phone, then pauses briefly at the destination before the authored seated pose takes over where seating exists.

## Restoration-aware destinations
The destination is derived only from already-built Café scene groups:
- stage 0–1: entrance / front of Café;
- stage 2–3 (`Neue Theke` built): service counter;
- stage 4+ (`Sitzecke` built): the guest moves to the exact left/right recurring-guest seat already assigned by the existing Place-life layer;
- stage 5+ (`Meerterrasse` built): the existing third/background regular slot can become the terrace destination.

No general-purpose pathfinding, collision simulation, customer queue AI or hidden occupancy system is introduced.

## Identity and settling
For a seated arrival, the existing recurring-guest pose for the same identity is temporarily hidden while the walking figure is visible. At the end of the route the walker pauses at the destination, disappears and the existing authored Mika/Nora/Sam seated pose is revealed with a short settle motion.

This preserves the canonical identity/loyalty rendering from PR #156 instead of duplicating a second persistent guest representation.

## Reduced Motion
With `prefers-reduced-motion: reduce`:
- active-order waiting guests remain visibly present but do not run the entry travel or idle animation;
- no travel animation is created for a seated served guest;
- the correct final recurring-guest state remains visible;
- the pending UI marker is consumed normally;
- non-seated served destinations use a static figure rather than walking motion.

## Explicit non-goals
- no Coins/Stars/XP/Energy changes;
- no order requirement or loyalty/reward changes;
- no gameplay save-schema or save-version change;
- no RNG, timer/FOMO or event cooldown;
- no new menu or navigation;
- no staff-management system;
- no automatic screen switch after delivery;
- no backend/Neon;
- no changes to Sonnenkai/Dachgarten guest choreography in this slice.

## Acceptance
Required evidence:
1. stage 1 still shows canonical active-order guests before service;
2. stage 2 shows the same active guests approaching and waiting in counter-aware positions;
3. the anonymous permanent `cafe-barista` is not visibly rendered at stage 2;
4. waiting identities come from real `currentOrders`, not a synthetic NPC list;
5. already-seated recurring guests and pending served identities are not duplicated as waiting guests;
6. normal real Nora service still increments existing loyalty and produces the reload-safe visible arrival;
7. stage-2 served guests route to the counter and later leave instead of becoming a permanent unnamed figure;
8. stage-4+ served guests still settle into their existing recurring seats;
9. Reduced Motion creates no waiting-entry or served travel animation and leaves the final state visible;
10. 390×844 and 390×720 stay above the dock and do not document-scroll;
11. stage-2 entry/waiting screenshots and the existing walking/arrived/settled screenshots are actually opened and visually reviewed before merge;
12. after merge, exact-main CI/Browser/PWA/Place03 and canonical permanent-link release verification must succeed before the change is called live.

New canonical person-role screenshots:
- `356-guest-life-entering-stage2-390x844.png`
- `356-guest-life-entering-stage2-390x720.png`
- `357-guest-life-waiting-stage2-390x844.png`
- `357-guest-life-waiting-stage2-390x720.png`

Existing Guest-Life screenshots remain regression evidence:
- `355-active-order-guests-place-390x844.png`
- `355-active-order-guests-place-390x720.png`
- `352-guest-arrival-390x844.png`
- `352-guest-arrival-390x720.png`
- `354-guest-arrived-390x844.png`
- `354-guest-arrived-390x720.png`
- `353-guest-seated-390x844.png`
- `353-guest-seated-390x720.png`