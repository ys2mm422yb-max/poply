# Poply Vertical Slice 02 — Sonnenkai

Status: ACTIVE
Owner: Poply product/code work in this repository only.

## Why this milestone exists
Recent releases materially improved the same Board / Orders / Place screens, but the product still ends after the first restoration arc. That creates the feeling of polishing one prototype instead of growing a real game. This milestone adds a real second playable phase so finishing Place 01 changes gameplay, not only art.

## Product promise
Finish `Café am Meer` → unlock `Place 02 · Sonnenkai` → receive a new production source and item family → serve new guest jobs → restore the new Place through a second six-step arc.

This is not a placeholder map card. The second Place must be playable.

## Scope
### Place 01 — Café am Meer
Keep the existing six-step arc and current saves intact.

### Place 02 — Sonnenkai
Unlock only after the final `Poply-Schild` upgrade of Place 01.

Second arc upgrades:
1. Lampions
2. Saftbar
3. Lounge
4. Feuerstelle
5. Abendbühne
6. Sonnenkai-Schild

### New production family
`fruit` six-tier chain:
1. Limette
2. Fruchtmix
3. Smoothie
4. Tropen-Drink
5. Sunset-Bowl
6. Poply Paradise

### New generator
`sunset-gen` / `Tropenbar` produces the new fruit family and is added exactly once when Place 02 unlocks.

### New jobs
Place 02 introduces jobs that use fruit together with existing coffee/bakery/sweet families. Orders must become visibly harder than the Place-01 opening jobs and pay proportionally higher coins/restoration stars.

## State and compatibility rules
- Existing saves keep all coins, stars, board items, stats and Place-01 progress.
- No save reset or storage-key replacement.
- Existing `placeUpgrades` remains the persistent ordered completion list for compatibility; Place 02 appends new unique upgrade ids.
- Place/chapter is derived from completed upgrades, not from a fragile independent flag.
- The Sonnenkai generator may be inserted only once and only after Place 01 completion.
- Existing active orders are never deleted just to enter the new chapter. New Place-02 orders enter through normal order replacement after deliveries.

## User-visible flow
1. Player builds the final Café-am-Meer upgrade.
2. Restoration reveal announces `Sonnenkai freigeschaltet`.
3. Place view becomes Place 02 with distinct sunset-world art and a new 0/6 journey.
4. Board contains the new Tropenbar generator.
5. New replacement orders begin requesting fruit items.
6. Player can generate, merge, serve and build the first Sonnenkai upgrade.
7. Save/reload preserves the second-place state.

## Visual direction
Sonnenkai must not be Café am Meer with a hue filter. It needs a distinct authored sunset identity: warm coral/gold sky, darker sea, open deck/bar silhouette, lanterns and evening atmosphere. It stays in the same Poply visual language but reads instantly as a new place.

## Required automated QA before merge
Normal tests plus Mobile Browser QA on the exact PR head.

Add deterministic coverage for:
- Place-01 completion unlocks Sonnenkai and exactly one Tropenbar generator.
- Existing save migration is lossless.
- Fruit items merge through all six tiers.
- Post-unlock replacement orders can include fruit.
- First Sonnenkai upgrade spends stars and advances only Sonnenkai progress.
- Browser QA can load a synthetic final-Place-01 state, build the final upgrade, observe Place 02, tap the new generator, navigate Board/Orders/Place and reload without losing the unlock.
- Capture screenshots for the unlocked Sonnenkai Place and its Board state.

## Definition of Done
This milestone is done only when a tester can truthfully say: `I finished the first café and the game opened a genuinely new playable chapter with new things to make and a new place to restore.`
