# Poply – First Complete Vertical Slice

Status: ACTIVE
Date: 2026-08-14

## Why this milestone exists
Recent releases materially improved the mobile presentation and QA discipline, but the product still feels like the same screen getting polished. The next release must create a product-level jump: discovery, unlocks, escalation and a real destination beyond the first restoration screen.

## Player promise
In one short first-session arc the player should experience:
1. generate and merge useful items;
2. fulfill customers for coins + restoration stars;
3. build visible parts of Café am Meer;
4. unlock genuinely new production/order content;
5. finish the first restoration arc;
6. unlock and enter a second Poply Place instead of reaching a dead end.

## Arc 1 – Café am Meer unlock beats
- Start: coffee + bakery production/order content.
- Lights: visual payoff, no new system yet.
- New Counter: unlock dessert/sweet production and dessert orders.
- Menu Wall: unlock advanced tier-4 order templates.
- Seating: increase max energy / production capacity as a meaningful gameplay reward.
- Sea Terrace: unlock premium evening order templates.
- Poply Sign: complete Place 01 and unlock Place 02.

Existing saves must not lose board value. Grandfathered items remain usable even when their family would not yet be newly generated.

## Place 02 – Harbor Pop-up
Working name: Hafen-Pop-up.
- Board persists so the player feels continuity.
- New place progression state starts separately from Place 01 completion.
- Order pool switches to Place-02-flavored jobs and starts with a visible new goal.
- Place screen must visibly identify Place 02; it may reuse the same core render architecture but must not present the first café as if nothing changed.
- This milestone only needs the opening beat of Place 02, not a full second six-upgrade campaign.

## Domain requirements
- Save schema supports current place/chapter and completed places without deleting valid V2 data.
- Generator output is progression-aware.
- Replacement orders are progression-aware; early players must not receive unavailable-family requirements.
- Build actions can return explicit unlock rewards for UI/game-feel presentation.
- First-place completion exposes a real `start next place` action rather than a permanent complete/no-op state.

## UI requirements
- Current mission mentions meaningful unlock rewards when relevant.
- Restoration success clearly reveals what was unlocked.
- Completed Place 01 gets a strong completion state with a CTA into Place 02.
- Board/Orders continue to work through the transition without reset.

## Browser QA requirements
Mandatory WebKit flow must cover:
- early generator output does not create locked sweet content;
- build Counter -> sweet becomes newly producible;
- order replacement after unlock can surface sweet content;
- complete Place 01 in a deterministic fixture;
- tap the real Place-02 CTA;
- verify chapter/save persists after reload;
- Board / Orders / Place remain functional after transition;
- capture screenshots before unlock, unlock reveal, completed Place 01 and Place 02 opening.

## Definition of Done
This milestone is complete only when a first-time player can feel a real progression arc, not just a prettier board. The product must visibly answer: “What did I unlock by restoring this place, and what am I working toward next?”
