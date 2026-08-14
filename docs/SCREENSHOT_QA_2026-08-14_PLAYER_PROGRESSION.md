# Screenshot QA — Player progression E1

Date: 2026-08-14
Milestone: E1 — Player XP + Level system
Viewport: Mobile WebKit 390×844

## Screens reviewed
- `20-player-level-up-order.png`
- `21-player-level-up-restoration.png`
- standard Board / Place / Orders screenshots from the same Browser-QA run

## Findings and iterations
### First candidate
The first functional build passed CI and WebKit, but screenshot review found two presentation defects:
1. the order level-up screenshot caught the reveal during its low-opacity entrance and looked weak;
2. restoration completion and Level-Up were initially allowed to occupy the screen at the same time.

That candidate was rejected despite green functional tests.

### Accepted candidate
The reward sequence now preserves one clear moment at a time:
- order delivery/reward resolves first, then the level-up reveal appears;
- restoration reveal resolves first, then the level-up reveal appears;
- Browser QA asserts that restoration and level-up reveals are not simultaneously visible;
- QA captures the order level-up after the overlay reaches its representative full state.

## Accepted mobile observations
- `LV 2` / `LV 3` badge fits beside the Poply wordmark without touching Energy/Coins/Stars.
- The XP rail uses the existing topbar edge and does not increase Board height.
- Level-Up is readable against both Orders and Place scenes.
- Coin reward copy is clear and not confused with the normal order reward.
- Existing Energy timer remains readable.
- Bottom navigation remains inside the visible viewport.
- The new feature does not add vertical document scrolling to the Board view.

## Remaining visual debt
E1 is accepted as a progression-system release, not as completion of visual Milestone B. The Level-Up card can later receive richer authored particles/light/audio when the broader premium art pass reaches account progression. No additional decorative work is required before E2 because the current treatment is clear, restrained and does not damage the mobile composition.
