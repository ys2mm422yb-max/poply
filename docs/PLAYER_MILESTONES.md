# Poply Player Milestones

Status: implementation contract for the progression-milestone slice.

## Player problem
Player XP/Level exists in the top bar, but it currently has no compact view explaining broader long-term accomplishments. The milestone shelf turns already-persisted play into visible goals without adding another currency, another main navigation tab or a duplicate achievement save system.

## Interaction
- Tap the existing `LV N` badge in the Poply header.
- A compact in-game progress sheet opens below the top bar.
- The sheet shows five milestones with explicit progress, progress bars and completed states.
- Close with the visible `×` action or tap the level badge again.
- Opening/closing the sheet does not mutate the game save.
- The sheet is an overlay and must stay above the bottom navigation without creating document scrolling at 390×844 or 390×720.

## Milestones
All progress is derived from existing persistent state:
1. **Erster Service** — serve 1 guest (`stats.orders`).
2. **Merge-Rhythm** — complete 25 merges (`stats.merges`).
3. **Place-Maker** — finish 6 restoration steps (`placeUpgrades`).
4. **Entdecker** — discover 12 item tiers (`discoveries` item keys only).
5. **Stammspieler** — reach Player Level 5, derived from `playerXp` through the canonical XP curve.

Progress display is capped at the target while raw persistent counters remain untouched.

## Fairness / state contract
- No streaks.
- No expiry.
- No claim button or hidden reward currency.
- No parallel `achievements` save field.
- No duplicate player-level state: the Level milestone always derives from canonical `playerXp`.
- Existing saves require no migration.

## QA contract
Deterministic tests verify:
- all milestone definitions derive from existing state;
- item discovery counts only item discovery keys;
- Level uses the canonical XP curve;
- completion and progress caps are deterministic.

Mobile WebKit progression QA must:
- keep existing order/restoration Level-Up flows green;
- seed deterministic completed progress through the existing save fields;
- open the real `LV` badge in WebKit;
- verify `5/5 Meilensteine` and five completed rows;
- verify opening the sheet does not mutate XP/merge counters;
- verify close interaction;
- validate and capture the sheet at 390×844 and 390×720.
