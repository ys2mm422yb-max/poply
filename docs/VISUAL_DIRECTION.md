# Poply – Visual Direction

This is a standing quality target for every visual/game-feel pass.

## Core impression

Poply must look and feel like a deliberate mobile game, not a website with colored buttons. Functional placeholder visuals are not a finished state.

## Piece identity

- Piece identity must not depend on generic printed placeholder symbols such as a circle, triangle, plus or simple diamond inside identical squares.
- The main five colors should have distinct silhouettes/material character that remains readable even without the inner symbol.
- Pieces should feel soft, tactile, glossy and premium rather than flat UI controls.
- Selection must enhance a piece without covering it with a thick white box.
- Power pieces should look visibly more valuable and energetic than normal pieces while preserving their base color.

## Chain interaction

- The active connection is part of Poply's visual identity.
- It should inherit the active piece color, use a thin bright core plus a soft glow, and visually follow the player's finger.
- It must never resemble a thick white cable laid over the board.
- Selected pieces should glow/compress subtly rather than receive heavy white outlines.
- Diagonal connections remain valid, but the path must stay visually easy to follow.

## Effects

- Pops should use color-matched particles/rings and tactile scale timing.
- Long chains and powers should escalate feedback in a controlled way.
- Score feedback should feel integrated into the board rather than like debug text.
- Effects must not obscure the next playable state for too long.
- Sound/haptics and visual intensity should scale together where supported.

## Mobile screen composition

- The board is the hero and should occupy the strongest visual area.
- Header/HUD/progression must stay compact enough that the game is not pushed down the screen.
- Avoid large dead areas, floating utility text and controls that look detached from the game.
- Restart/settings utilities are secondary controls and should not compete with the board.
- Phone portrait, tablet portrait and tablet landscape should each feel intentionally composed.

## Quality gate

A visual pass is not complete merely because the CSS renders. Compare the actual mobile result against this document and `docs/END_GOAL.md`.

Reject or continue iterating on any state that still looks like:
- generic colored UI buttons,
- placeholder symbols,
- thick white chain/selection outlines,
- default particles/confetti,
- separate web cards stacked around a game board,
- visually wasted phone screen space,
- effects that are technically visible but not satisfying.
