# Poply – End Goal

This document is the standing target for autonomous development. It defines what "done well" means beyond individual tasks.

## Product target

Poply should feel like a polished, original, universally appealing casual connect-and-pop mobile game rather than a web prototype.

The intended player reaction is:
- instantly understands what to do without needing an explanation from outside the game,
- naturally drags through matching colours because the interaction makes visual sense,
- gets satisfying feedback from the first successful chain,
- clearly sees progress and the next objective,
- wants to play one more short level,
- experiences occasional strong "wow" moments from long chains and power effects.

## Core game feel

The core loop is direct same-colour chaining, not classic swap-Match-3.

- The player touches a piece and drags through adjacent pieces of the same colour.
- Horizontal, vertical and diagonal neighbours may be connected.
- Releasing a chain of at least three matching pieces pops it.
- The active chain must be clearly visible under the finger.
- Backtracking to the immediately previous piece should feel natural.
- Short/invalid chains should cancel cleanly without wasting a move.
- Five-piece chains create Blast power pieces.
- Seven-or-more-piece chains create stronger Prism power pieces.
- Power activations should visibly affect multiple cells and feel substantially stronger than a normal chain.
- Popped pieces should animate out, remaining pieces should fall, and new pieces should enter visibly rather than teleporting.
- Long chains should escalate feedback through motion, score pops, sound/haptics where supported and strong chain messaging.
- Hints should show a real same-colour path when the player is idle without taking control away.
- A board with no valid chain must safely reshuffle itself.

The interaction must never require the player to drag a purple piece onto a blue piece, or otherwise swap unrelated colours, to make progress.

## Visual target

- The board is the visual hero.
- HUD, progress, level identity and controls should read as one game system rather than disconnected cards.
- The visual style is modern, colorful, glossy/soft and broadly gender-neutral.
- The connection path itself is part of the visual identity and should look satisfying while the player drags.
- Effects should be energetic but not visually noisy enough to hide the board state.
- Every element should look intentional on an actual phone screen, not merely correct in source code.

## Level loop

The target loop is:
1. understand the goal immediately,
2. find and connect matching pieces,
3. build longer chains and powers,
4. see progress during play,
5. receive a clear win/lose result,
6. earn a simple performance rating,
7. continue directly to the next level.

The level system should expand beyond score-only goals with original mechanics and obstacles while preserving the same intuitive connect-and-pop interaction.

## Platform target

One shared Poply game implementation should support:
- iPhone / iOS Safari,
- iPad / iPadOS Safari,
- Android phones in modern Chromium browsers,
- Android tablets in modern Chromium browsers.

The canonical test build is always:
`https://ys2mm422yb-max.github.io/poply/`

The responsive design must intentionally cover:
- small/standard phone portrait,
- large phone portrait,
- tablet portrait,
- tablet landscape.

The web build should remain suitable for later packaging into iOS and Android app-store apps without rewriting the game separately for each platform.

## Quality gates

Before calling a meaningful iteration finished:
- game-logic tests relevant to the change pass,
- the core interaction path is usable and intuitive,
- the canonical test deployment succeeds,
- representative mobile/tablet layouts are checked when tooling permits,
- obvious defects found during implementation are fixed rather than deferred,
- the result is compared against this document and the question is asked: "Does this feel more obvious, more satisfying and more like a real polished game?"

If the answer is no, continue iterating.

## Development priorities

In order:
1. intuitive same-colour chain gameplay,
2. strong visual/animation feedback,
3. coherent mobile UI,
4. robust phone/tablet compatibility,
5. level progression and varied objectives,
6. saved progression/backend features,
7. retention systems that respect the player,
8. store packaging and release readiness.

Do not add complexity merely because it is common in mobile games. Every system must improve gameplay, clarity, progression or long-term maintainability.
