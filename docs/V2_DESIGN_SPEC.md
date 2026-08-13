# Poply V2 – First Playable Design Spec

The first playable is one continuous mobile game screen, not stacked web cards.

## Screen hierarchy
1. Place hero: bright seaside café that visibly improves as restoration milestones are purchased.
2. Resource rail: energy, coins and stars embedded into the hero.
3. Orders rail: three compact simultaneous orders with exact item progress and rewards.
4. Merge board: dominant 7×7 working surface.
5. Context strip: one-line interaction hint plus selected item identity.
6. Bottom navigation: Orders / Board / Place plus a secondary reset control during development.

## Art direction
- cheerful premium casual game with bright coastal palette and soft 3D illustrated assets
- warm cream board cells with tactile depth
- generated Poply production art for first item families and café scene; do not copy external reference artwork
- real controls and text stay code-native

## First item families
- Drinks: beans → cup → iced coffee → Poply mocha
- Bakery: wheat → flour → dough → croissant
- Sweet: milk → sugar → cream → muffin

Generators begin on the board:
- coffee machine → Drinks
- pantry crate → alternates Bakery and Sweet

## Interaction contract
- tap generator: consume 1 energy and spawn one base item into an empty cell
- drag item to empty cell: move without changing identity
- drag onto identical family+tier: both become exactly one next-tier item
- invalid drop: board remains unchanged and immediate feedback is shown
- max-tier items cannot merge further
- state saves after every successful action

## Meta loop
Orders consume exact requested items and pay coins + stars. Stars buy visible Place upgrades in order: Lichter → Theke → Terrasse.

The first slice proves the full loop: **generate → merge → serve → earn → build → see the Place improve**.

## Responsive contract
- phone portrait: one-column continuous screen, board dominates lower half
- tablet portrait: same hierarchy with larger art and board
- tablet landscape: Place hero becomes a left visual panel while orders and board remain playable on the right
- safe areas and reduced-motion preferences are respected
