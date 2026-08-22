# Guest-Life · Café am Meer

Status: candidate on `visual/guest-life-arrivals`.
Start main: `50bb09023f9035bc08d68cfdad36bae1974d2c14`.
Durable coordination: GitHub Issue #42.

## Purpose
Guest-Life turns an already real service result into a visible Place consequence. A served Mika, Nora or Sam can be seen entering Café am Meer and moving toward a location that exists in the current restoration stage instead of appearing only as a static recurring guest later.

This is a visual/game-feel extension of the existing guest layer, not a new management system.

## Preflight / preserved contracts
The implementation deliberately extends, rather than replaces:
- PR #143 — authored living Café guests, furniture-aware layering and idempotent Place decoration;
- PR #156 — Mika/Nora/Sam identity, loyalty-backed recurring guests and existing seated regular poses;
- PR #160 — Service Moments remain the service-priority mechanic; Guest-Life adds no second timer/event game.

The shipped 1→6 sequence remains intact. Orders, rewards, loyalty thresholds, Service-Ruf, Service Specials, Place Powers and restoration costs are unchanged.

## Runtime contract
Successful real services emit one transient `poply:guest-served` event containing the already-resolved guest identity:
- normal customer delivery uses the existing `recordGuestService` result;
- Daily Bonus Guest uses the same existing guest result.

`aaa-guest-life-ui.js` keeps only a runtime in-memory queue (maximum three unique recent identities). It does not write to the save and does not introduce a timestamp, timer state, RNG roll or new schema.

When Café am Meer is visible, the next queued guest follows one deterministic authored route from the right-hand approach into the scene.

## Restoration-aware destinations
The destination is derived only from already-built Café scene groups:
- stage 0–1: entrance / front of Café;
- stage 2–3 (`Neue Theke` built): service counter;
- stage 4+ (`Sitzecke` built): the guest moves to the exact left/right recurring-guest seat already assigned by the existing Place-life layer;
- stage 5+ (`Meerterrasse` built): the existing third/background regular slot can become the terrace destination.

No general-purpose pathfinding, collision simulation, customer queue AI or hidden occupancy system is introduced.

## Identity and settling
For a seated arrival, the existing recurring-guest pose for the same identity is temporarily hidden while the walking figure is visible. At the end of the route the walker disappears and the existing authored Mika/Nora/Sam seated pose is revealed with a short settle motion.

This preserves the canonical identity/loyalty rendering from PR #156 instead of duplicating a second persistent guest representation.

## Reduced Motion
With `prefers-reduced-motion: reduce`:
- no travel animation is created for a seated guest;
- the correct final recurring-guest state remains visible;
- non-seated destinations use a static figure rather than walking motion.

## Explicit non-goals
- no Coins/Stars/XP/Energy changes;
- no loyalty/reward changes;
- no new persistence or save version;
- no RNG, timer/FOMO or event cooldown;
- no new menu or navigation;
- no automatic screen switch after delivery;
- no backend/Neon;
- no changes to Sonnenkai/Dachgarten guest choreography in this first slice.

## Acceptance
The existing recurring-guest WebKit gate is extended rather than replaced. Required evidence:
1. normal real Nora order is actually delivered through the rendered Orders control;
2. saved loyalty increments through the pre-existing guest system;
3. on entering Café am Meer, Nora has a visible walking arrival and deterministic destination tied to the built furniture;
4. after travel, the existing recurring Nora pose is visible with the new visit count;
5. stage-2 Café routes to the counter instead of an unavailable seat;
6. Reduced Motion creates no travel animation;
7. 390×844 and 390×720 stay above the dock and do not document-scroll;
8. arrival and settled screenshots at both heights are actually opened and visually reviewed before merge.

Canonical new screenshots:
- `352-guest-arrival-390x844.png`
- `352-guest-arrival-390x720.png`
- `353-guest-seated-390x844.png`
- `353-guest-seated-390x720.png`
