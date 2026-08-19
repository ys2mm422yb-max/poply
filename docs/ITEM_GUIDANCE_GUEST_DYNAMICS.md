# Item guidance, living Place guests and dynamic service traits

This slice starts from production `main` `c50b3bf66fec757656571a80e375e52dad3fcefa` and adds player-facing production guidance plus a first lightweight guest/session decision layer.

## Item provenance

Every core item requirement can be resolved from the existing generator/family definitions. The guidance model exposes:

- required item name and tier;
- source generator;
- base item produced by that generator family;
- exact merge chain up to the requested tier;
- exact number of base units required (`2^(tier-1)`).

Examples:

- `Eiskaffee` → `Kaffeemaschine` → `Kaffeebohnen → Kaffeetasse → Eiskaffee` → 4 base beans.
- `Mehl` → `Vorratskiste` → `Weizen → Mehl` → 2 base wheat items.

Tapping a need opens this information without changing state. `Generator auf Board zeigen` routes to Board and temporarily highlights the matching generator. Generator info is a separate control and does not trigger production.

## Generator inspector

The inspector shows:

- generator name;
- produced families;
- the first known tiers in each family;
- current waiting orders that require one of those families;
- the existing one-Energy production rule.

This is explanatory UI only. Generator drop tables, energy cost, merge rules and item requirements are unchanged.

## Guest traits

The three recurring guests have deterministic service preferences once the Café's `Menüwand` restoration is complete:

| Guest | Trait | Qualifies when | Bonus |
|---|---|---|---:|
| Mika | Kombi-Fan | order contains at least two requirement entries | +10 Coins |
| Nora | Kaffee-Liebe | order contains Coffee | +10 Coins |
| Sam | Abwechslung | order contains at least two distinct families | +10 Coins |

Traits are derived from the existing recurring guest identity. They require no new save field. Before `Menüwand`, the traits remain mechanically locked: no dynamic Coin payout and no extra trait/day metadata is shown in the opening service UI. This preserves the established first-session economy and keeps the new decision layer tied to visible Place progress.

## Daily service condition

After `Menüwand`, each local calendar day deterministically selects one family from generators currently present/unlocked on the player's board. A matching delivered order grants +15 Coins.

Labels include `Kaffeezeit`, `Backstuben-Tag`, `Süßer Tag`, `Sonnenfrucht-Tag` and `Gartentag`.

This condition:

- is locked before `Menüwand`, so opening/tutorial rewards remain unchanged;
- creates no timer pressure;
- creates no new currency;
- does not change stars, XP, requirements or Service-Ruf semantics;
- cannot select a family whose generator is not currently available;
- combines additively with one qualifying guest trait for a maximum dynamic bonus of +25 Coins per delivered normal order.

The bonus is deliberately small: it creates a reason to choose between waiting guests without replacing existing order rewards or Service-Ruf.

## Living coast guests

At Café stage 4 and later, the old stiff foreground placeholder people are hidden and replaced by an additive SVG life layer:

- two primary authored guests positioned with the existing seating/table cluster rather than as free-floating foreground figures;
- bent legs, shoes and ground shadows make the sitting posture read against the café furniture;
- authored heads, hair, arms and distinct clothing;
- one guest has a subtle cup/sip loop;
- stage 5+ gains one quieter background visitor;
- all motion respects `prefers-reduced-motion`.

No Place restoration cost or stage requirement changes.

## QA contract

`scripts/item-guidance-place-life-qa.mjs` must pass at 390×844 and 390×720 with installed-iPhone safe-area simulation. Its fixture is already beyond `Menüwand`, matching the intended unlock state. It verifies:

1. a missing `Mehl` requirement is tappable and self-describing;
2. provenance sheet names `Mehl`, `Vorratskiste` and `Weizen`;
3. Board routing highlights `pantry-gen` above the dock;
4. generator inspector explains Backwaren/Süßes and relevant waiting order context;
5. unlocked guest trait and daily condition UI are present;
6. new Place guest layer is present while old stiff `.cafe-guest` figures are hidden;
7. eight canonical screenshots are emitted for manual review.

The unit suite also verifies that the opening state receives zero dynamic bonus and that completing `Menüwand` enables the mechanic without changing Stars.

Green automation is not visual acceptance. The final exact-head screenshots must be opened manually, especially the Place guest composition and the production sheet.
