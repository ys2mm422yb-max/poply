# Poply Player Milestones

Status: live progression surface, extended by next-level reward preview, derived cosmetic player titles and derived Place completion badges.

## Player problem
Player XP/Level exists in the top bar, but a bare level number does not explain broader long-term accomplishments. The milestone sheet turns already-persisted play into visible goals, makes the next XP target/reward explicit and converts completed milestones and restored Places into visible cosmetic accomplishments without adding another currency, another main navigation tab or a duplicate achievement save system.

## Interaction
- Tap the existing `LV N` badge in the Poply header.
- A compact in-game progress sheet opens below the top bar.
- The sheet shows the player's current earned title.
- A compact `DEINE PLACES` shelf shows restoration badges earned from completed Places.
- The top reward strip shows the next Level, exact XP still required and the guaranteed `+100 Coins` level reward.
- The same sheet shows five milestones with explicit progress, progress bars and completed states.
- Close with the visible `×` action or tap the level badge again.
- Opening/closing the sheet does not mutate the game save.
- The sheet is an overlay and must stay above the bottom navigation without creating document scrolling at 390×844 or 390×720.

## Cosmetic player title ladder
Titles are presentation-only rewards. The rank is derived from the count of completed canonical milestones, so there is no claim button, title inventory or persisted title field.

0. **Neu dabei**
1. **Gastgeber**
2. **Merge-Kenner**
3. **Place-Macher**
4. **Entdecker**
5. **Poply-Profi**

The current title is also exposed in the existing Level badge accessibility label. The milestone sheet shows the next title until the maximum rank is reached, then displays `Höchster Titel erreicht`.

## Place completion badges
Place badges are also presentation-only rewards and derive directly from canonical `placeUpgrades`.

Current badges:
1. **Café am Meer** — earned only when all six Café restoration IDs are present.
2. **Sonnenkai** — unlocked after Café completion and earned only when all six Sonnenkai restoration IDs are present.

A badge can be locked, in progress or complete. In-progress badges show exact restoration steps completed. A completed badge visibly switches to `Abzeichen verdient`.

There is deliberately no `placeBadges` save field, claim action, reward currency or second completion counter. Reopening the player sheet reconstructs the same badge state from existing restoration progress. Place 03 can extend the same definition list after its active PR lands without changing the persistence contract.

## Next-level reward preview
The preview is fully derived from canonical `playerXp` through `playerProgress()`:
- target Level = current Level + 1;
- remaining XP = current level XP requirement minus current in-level XP;
- reward = existing `LEVEL_REWARD_COINS` (`100` Coins);
- progress bar reuses the canonical current-level ratio;
- no separate reward schedule, claim flag or duplicated XP field is persisted.

This is deliberately transparent: the player can see the next deterministic reward before deciding whether to complete another order/restoration step.

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
- No persisted player-title field; title always derives from completed milestones.
- No persisted Place-badge field; badges always derive from canonical restoration IDs.
- No duplicate player-level state: Level and next-level preview always derive from canonical `playerXp`.
- The shown Coin reward is the same deterministic reward already paid by `awardPlayerXp()`.
- Existing saves require no migration.

## QA contract
Deterministic tests verify:
- level curve and next-level preview derive from canonical XP;
- remaining XP and reward values are exact and deterministic;
- all milestone definitions derive from existing state;
- item discovery counts only item discovery keys;
- Level uses the canonical XP curve;
- completion and progress caps are deterministic;
- title rank is deterministic for fresh, partial and completed milestone states;
- Place badges derive only from canonical restoration IDs, unlock sequentially and never add save fields.

Mobile WebKit progression QA must:
- keep existing order/restoration Level-Up flows green;
- verify a fresh save exposes `Neu dabei` from the real Level badge;
- seed deterministic completed progress through existing save fields only;
- open the real `LV` badge in WebKit;
- verify `5/5 Meilensteine`, five completed rows and the `Poply-Profi` title;
- verify the Place shelf shows both earned Café and Sonnenkai badges in the fully restored seeded state;
- verify the next Level, remaining XP and `+100 Coins` reward copy;
- verify opening the sheet does not mutate XP/merge counters or create a `placeBadges` save field;
- verify close interaction;
- validate and capture the sheet at 390×844 and 390×720.
