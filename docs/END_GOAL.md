# Poply – End Goal

This document is the standing target for autonomous development. It defines what "done well" means beyond individual tasks.

## Product target

Poply should feel like a polished, original, universally appealing casual Match-3 mobile game rather than a web prototype.

The intended player reaction is:
- instantly understands what to do,
- gets satisfying feedback from the first successful move,
- clearly sees progress and the next objective,
- wants to play one more short level,
- experiences occasional strong "wow" moments from cascades and power effects.

## Core game feel

- Swiping must feel immediate and predictable.
- Invalid swaps should visibly return, so the player understands what happened.
- Valid matches should animate through swap -> pop -> fall/refill -> cascade instead of teleporting to a final state.
- Four-piece matches create meaningful line-power pieces.
- Five-piece matches create stronger cross/blast power pieces.
- Activating powers should visibly affect multiple cells and feel substantially stronger than a normal match.
- Cascades should escalate feedback through motion, score pops, sound/haptics where supported and clear combo messaging.
- Hints should help an idle player without taking control away.

## Visual target

- The board is the visual hero.
- HUD, progress, level identity and controls should read as one game system rather than disconnected cards.
- The visual style is modern, colorful, glossy/soft and broadly gender-neutral.
- Effects should be energetic but not visually noisy enough to hide the board state.
- Every element should look intentional on an actual phone screen, not merely correct in source code.

## Level loop

The target loop is:
1. understand the goal immediately,
2. play short move-limited rounds,
3. create normal and power matches,
4. see progress during play,
5. receive a clear win/lose result,
6. earn a simple performance rating,
7. continue directly to the next level.

The level system should later expand beyond score-only goals with original mechanics and obstacles, while keeping the first levels easy to understand.

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
- the core interaction path is usable,
- the canonical test deployment succeeds,
- representative mobile/tablet layouts are checked when tooling permits,
- obvious defects found during implementation are fixed rather than deferred,
- the result is compared against this document and the question is asked: "Does this feel more like a real polished game and less like a prototype?"

If the answer is no, continue iterating.

## Development priorities

In order:
1. understandable and satisfying core gameplay,
2. strong visual/animation feedback,
3. coherent mobile UI,
4. robust phone/tablet compatibility,
5. level progression and varied objectives,
6. saved progression/backend features,
7. retention systems that respect the player,
8. store packaging and release readiness.

Do not add complexity merely because it is common in mobile games. Every system must improve gameplay, clarity, progression or long-term maintainability.
