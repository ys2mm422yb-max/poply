# Poply – Game Direction V2

Date of reset: 2026-08-13

This document replaces the former connect-and-pop product direction. The existing connect-and-pop build is a historical prototype and may be reused for technical learnings, responsive behavior, effects, persistence, CI and deployment infrastructure, but it is no longer the intended core game.

## Reference direction

The owner wants Poply to move toward the broad product structure seen in successful merge-and-meta casual games: a persistent merge board, generators, item evolution chains, orders, rewards and visible world/venue progression.

This is a genre and product-structure reference only. Poply must not copy another game's protected characters, art, UI composition, exact item chains, exact level data, story, names, sounds or branded presentation.

## Poply's new core promise

Poply should be a relaxing but highly replayable mobile merge game where every action contributes to a visible longer-term goal.

The player should:
1. open a persistent merge board,
2. generate useful base items,
3. merge two identical items into a higher-tier item,
4. complete customer/task orders,
5. earn coins, reputation and upgrade resources,
6. use those rewards to restore, build or style a Poply place,
7. unlock new item families, generators, characters and places,
8. return because both the board and the world keep evolving.

The addictive/replayable feeling should come from discovery, collection, short goals, item evolution, board optimization and visible progress — not from hidden loss rigging or coercive monetization.

## Working world concept: Poply Places

Poply is not limited to one restaurant forever. The meta-game is a journey through distinctive places that can each introduce their own item families, visuals and mini-systems.

A first vertical slice can use a cozy food/café-style place because it naturally demonstrates orders, ingredients and upgrades. Later chapters can expand into other original Poply places such as a beach bar, bakery, garden market, creative studio, festival stand or other themes that fit the same merge foundation.

This lets the game keep the satisfying structure of a merge/restaurant game without becoming a direct copy of one specific title.

## Core merge rules

- The default board is persistent between sessions.
- The player moves items freely between open cells.
- Two identical items of the same family and tier merge into the next tier.
- A merge should be immediate, tactile and visually satisfying.
- Higher tiers should visibly feel more valuable and exciting.
- Generators create base items or low-tier items from one or more item families.
- Generators themselves can later have upgrade tiers.
- The board must communicate mergeability clearly without excessive tutorial text.
- Full-board pressure may create interesting decisions, but the player must have fair tools such as storage/inventory and item selling/removal.

## Orders and goals

Orders are the main short-term objective layer.

- Several orders can be visible at once.
- Orders request one or more specific evolved items.
- Completing an order consumes/delivers those items and grants rewards.
- Rewards may include coins, reputation/XP, renovation stars/materials and occasional chest/event progress.
- Order difficulty should scale through item depth and combinations, not only inflated numbers.
- Early orders should teach the item chains naturally.

## Place restoration / progression

The merge board alone is not the final product. A visible meta-world is mandatory.

- Completing orders earns progress toward restoring or upgrading the current place.
- Players spend earned progression resources on visible improvements.
- Improvements should visibly change the scene, not only increment a stat.
- Major restoration milestones unlock new areas, item families, generators, story beats or a new Poply place.
- Decoration choice can be introduced later, but the first version should prioritize clear visible transformation over a large decoration catalog.

## Item-chain design

Item families should be data-driven and easy to expand.

Example structure for an early café-like vertical slice:
- Produce: seed/berry -> fruit -> prepared fruit -> premium dish component
- Drinks: water -> soda -> juice -> specialty drink
- Bakery: grain -> flour -> dough -> baked item -> premium dessert
- Service: napkin -> tray -> table set -> premium service set

These are examples only, not fixed final chains. Poply should create its own coherent item families and art.

## Generators and processing

Generators are long-term anchors on the board.

- Tap/click a generator to create an item.
- Early prototype should not require aggressive energy gating; core fun must be proven first.
- Optional cooldowns, charges or a fair energy system may be introduced later only if they improve pacing rather than simply stopping play.
- Specialized processing stations can transform items (for example, combine/prepare/craft) once the basic merge loop is proven.

## Retention layers

Add only after the core board/order/meta loop is fun:
- daily orders/challenges,
- streak rewards without harsh punishment,
- themed events,
- collection album / discovery book,
- chests and timed rewards,
- seasonal place cosmetics,
- optional cloud save and cross-device progress.

## Platform target

One codebase must support:
- iPhone,
- iPad,
- Android phones,
- Android tablets,
- portrait as the primary orientation,
- intentional tablet layouts rather than stretched phone UI.

The canonical development/test URL remains:
`https://ys2mm422yb-max.github.io/poply/`

Later, the same codebase should be suitable for packaging for the iOS App Store and Google Play.

## Vertical-slice target

The first new playable V2 should contain:
- a persistent merge grid,
- 3 item families,
- 2 generators,
- at least 6 tiers in the main item families,
- 3 simultaneous orders,
- order delivery/rewards,
- coins + one progression resource,
- one visible place scene with 5–8 restoration steps,
- local save/resume,
- clear onboarding through play,
- polished merge animation, sound-ready hooks and haptics where supported,
- phone/tablet responsive layout,
- deterministic tests for merge rules, orders, progression and persistence.

## Success test

The V2 direction is working when a first-time player can:
- understand that two identical items merge,
- discover higher tiers without explanation from outside the game,
- complete an order,
- see a meaningful place improvement,
- understand what they want to work toward next,
- and feel motivated to make 'just a few more merges'.
