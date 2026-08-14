# Poply World Map / Place Selector

Milestone: H first shipping slice.

## Player problem
Poply already has two Places, but progression currently jumps from Café am Meer to Sonnenkai without a world-level overview. That makes completed work easy to forget and future expansion feel like disconnected screens.

## This slice
- Adds an authored `Places` map entry inside the existing Place screen; no fifth primary navigation tab.
- Shows every known Place with number, name, progress, locked/current/completed state and a route-like visual hierarchy.
- Completed Café am Meer remains revisitable after Sonnenkai unlocks.
- The selected Place opens a scene preview using the existing authored Place scene renderer at that Place's own restoration stage.
- The current Place is clearly identified.
- Locked destinations cannot be selected.
- Opening, switching preview, closing and reopening the map do not mutate Board items, orders, currencies, Daily state, Collection or restoration state.

## Deliberate scope boundary
This first H slice is a world/progression viewer and safe revisit surface. It does not change which chapter owns live orders or generators. A later H slice may add explicit active-Place switching only after its order/generator implications are defined and tested without losing progress.

## Deterministic coverage
`tests/aaa-place-map.test.js` verifies locked/current/completed states, independent per-Place progress and no state mutation.

`scripts/place-map-qa.mjs` verifies the real rendered Place navigation, map opening, completed Coast revisit, current Sunset progress, unchanged persisted game state, close behavior and viewport fit at 390×844 and 390×720.

## Release gate
Normal CI + full Mobile WebKit QA on exact PR head, manual opening of generated map screenshots, then exact-main CI + Browser QA + canonical Pages deploy after merge.
