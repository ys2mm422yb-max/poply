# Poply – Visual Direction

Standing visual target for Poply V2.

## Core impression
Poply should feel like a polished premium casual mobile game with a warm, tactile, authored and broadly appealing style. The quality benchmark is top-tier commercial mobile game presentation: strong hierarchy, production-quality art, intentional animation, coherent materials and immediate clarity. "Technically clean" or "good web UI" is not enough.

## Original art direction
- Create a distinct Poply world and item-art language.
- Use reference games only to understand hierarchy and interaction patterns.
- Do not reproduce another game's characters, item illustrations, scenes, icons or exact UI composition.
- Final central game art should use production-quality assets, not placeholder shapes or emoji.
- Photo-like, illustrated and UI assets must feel as if they belong to one authored game world; reject visibly mixed asset styles.

## Purpose / task hierarchy
- The player must always understand why the current board actions matter.
- Active orders are jobs that earn the progression resource for the currently visible restoration goal.
- The next restoration target and its progress remain visible during normal play.
- A progression currency must have a visible destination; do not show abstract stars/points without explaining what they build.
- Requested board items should be identifiable without repeatedly opening menus.
- Merge-ready pairs may receive subtle guidance, but guidance must look like game art rather than debug outlines.
- Completing an order should visibly feed the restoration goal before the next task becomes the focus.

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
- Empty cells should recede visually so the player reads items and opportunities before reading the grid.
- Occupied/requested/merge-ready states should create useful hierarchy without turning the board into a field of outlines.
- Storage and utility controls remain secondary.

## Orders
- Orders should feel like real requests, not database rows.
- Requested items are shown mainly through their actual art.
- Rewards must explain their purpose: what the player earns and what it advances.
- Delivery gets a satisfying reward transition into the current restoration objective.
- On phones, order UI must not crush the board vertically.

## Poply Place / restoration
- The place scene is the emotional payoff layer.
- It needs visible before/after transformation and multiple build/restoration steps.
- The first place should have at least 5–8 meaningful restoration beats before completion.
- Restoration is never represented only by a number or progress bar.
- The first place may be food/café-inspired, but the art and layout must be original to Poply.

## HUD
- Keep currencies compact and consistently placed.
- Avoid large stat cards above the board.
- Prioritize current restoration goal, active orders and board state.
- Settings/restart/debug controls stay secondary.

## Motion priorities
1. merge snap + tier reveal,
2. generator dispense,
3. order delivery + reward travel into the restoration goal,
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
- the screen is dominated by empty beige cells or undifferentiated boxes,
- orders have no obvious connection to the next restoration goal,
- progression rewards feel abstract or purposeless,
- item tiers are unreadable,
- drag feedback looks like debug UI,
- restoration is only numbers,
- there is excessive dead space or clutter,
- the result looks like a website prototype rather than a commercial mobile game.

## Design workflow
For major V2 UI/art work, implement directly against this standing target and validate the real mobile render. Do not stop at a source-code or component-level review. If the live phone screenshot still reads as prototype quality, keep iterating before calling the visual pass finished.
