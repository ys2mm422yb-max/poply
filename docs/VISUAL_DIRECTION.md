# Poply – Visual Direction

Standing visual target for Poply V2.

## Core impression
Poply should feel like a polished casual mobile game with a warm, tactile, premium and broadly appealing style.

## Original art direction
- Create a distinct Poply world and item-art language.
- Use reference games only to understand hierarchy and interaction patterns.
- Do not reproduce another game's characters, item illustrations, scenes, icons or exact UI composition.
- Final central game art should use production-quality assets, not placeholder shapes or emoji.

## Item identity
- Item families need coherent visual evolution from tier to tier.
- Higher tiers should feel more valuable while remaining readable at phone size.
- Identical mergeable items should be obvious through art.
- Generators must look clearly different from generated items.

## Merge interaction
- Dragged items should feel attached to the finger.
- Valid merge targets react before release.
- Successful merge uses a short snap, compression, reveal and tier-up moment.
- Invalid drops return cleanly without punishment.
- Avoid debug-looking outlines or browser-default drag visuals.

## Board composition
- The merge board is the main working surface.
- Avoid nested web cards and excessive borders.
- Cells guide placement without overwhelming item art.
- Storage and utility controls remain secondary.

## Orders
- Orders should feel like real requests, not database rows.
- Requested items are shown mainly through their actual art.
- Rewards are visible but subordinate.
- Delivery gets a satisfying reward transition.
- On phones, order UI must not crush the board vertically.

## Poply Place / restoration
- The place scene is the emotional payoff layer.
- It needs visible before/after transformation and multiple build/restoration steps.
- Restoration is never represented only by a number or progress bar.
- The first place may be food/café-inspired, but the art and layout must be original to Poply.

## HUD
- Keep currencies compact and consistently placed.
- Avoid large stat cards above the board.
- Prioritize active orders, board state and current progression.
- Settings/restart/debug controls stay secondary.

## Motion priorities
1. merge snap + tier reveal,
2. generator dispense,
3. order delivery + reward collection,
4. restoration/build reveal,
5. major unlock.

Effects should be satisfying but quickly reveal the next playable state.

## Phone / tablet
- Phone portrait is primary.
- Respect safe areas and comfortable drag targets.
- Keep the board large enough for accurate touch.
- Tablets use extra space intentionally for orders/place context rather than simply stretching the phone UI.

## Reject / keep iterating if
- it still looks like the old connect-and-pop game,
- central art is generic placeholder shapes,
- UI looks like stacked web cards around a grid,
- item tiers are unreadable,
- drag feedback looks like debug UI,
- restoration is only numbers,
- there is excessive dead space or clutter.

## Design workflow
For major V2 UI/art work, create a coherent full-screen visual concept and matching game-asset direction first, then implement against it. Compare the final live render against the accepted concept before calling the pass finished.
