# Poply purpose loop

## Player promise
Poply is not a board-cleanup game. The Board is the workshop that powers a visible world.

The intended causal loop is:

**Merge → serve guests → earn Stars/Coins/XP → build the current Place → visibly transform the world → reveal the next restoration / generator / Place → repeat.**

A player should be able to answer these three questions within roughly two seconds during normal play:
1. What is my next meaningful goal?
2. How close am I?
3. What will visibly change or unlock after I reach it?

## Reference-game learning
The 2026-08-15 user reference screenshots are used only as product inspiration. The useful pattern is not their art, characters, UI layout or monetization. The useful pattern is their motivation hierarchy:
- the board is a means to complete larger tasks;
- the world/home surface is a destination that changes;
- the primary task is always obvious;
- short timers/events/deals create side choices without hiding the main direction;
- rewards constantly point toward another visible action.

Poply keeps its own authored visual identity and does not copy reference assets or layout.

## Runtime contract
`src/aaa-purpose.js` is the deterministic source for the current meaningful goal. It derives purpose only from existing Place restoration state. There is no new currency, save counter, quest tab or backend table.

The goal model exposes:
- current Place and restoration step;
- current upgrade label/story;
- Stars held / Stars required / Stars missing;
- build readiness;
- the exact next `Danach` payoff: next restoration, next Place + generator/content unlock, or world completion.

`src/aaa-purpose-ui.js` projects that same model into existing surfaces:
- Board: compact `NÄCHSTES ZIEL`, distance and `Danach`; the CTA routes to Place instead of silently building from the Board;
- Orders: the selected order states how many Stars it contributes to the current build and how many remain afterward;
- Place: the exact next authored SVG restoration group is shown as a low-opacity blueprint before purchase;
- Place build: the exact newly built SVG group receives a focused payoff highlight;
- reward/progression feedback: Star rewards and Level progression reconnect to the same current goal vocabulary.

## Place preview rule
The preview never invents a placeholder rectangle or generic mockup. It renders the exact authored next restoration group from the existing Place SVG art and marks only that group as a preview. This contract applies to all 18 restoration steps across Café am Meer, Sonnenkai and Dachgarten.

## Mobile / accessibility contract
- preserve the one-screen Board at 390×844 and 390×720;
- no document scrolling introduced by purpose UI;
- Place goal story must remain readable instead of being text-clamped;
- Reduced Motion keeps previews/highlights static but readable;
- normal Place build remains the only action that spends Stars.

## QA
`tests/aaa-purpose.test.js` covers deterministic goal selection, readiness, next-Place teasers and world completion.

`scripts/purpose-qa.mjs` proves the real WebKit flow:
- Board goal → Place navigation;
- authored pre-build preview;
- readable `Danach` teaser;
- real build → exact built-element highlight → next preview;
- Orders contribution wording;
- 390×844 and 390×720 no-scroll screenshots.
