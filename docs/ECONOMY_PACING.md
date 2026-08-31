# Poply Economy & Pacing Contract

Status: ACTIVE · 2026-08-29
Scope: deterministic balancing model for the current three-Place game.

## Why this exists
Poply now has enough interconnected systems that balancing by feel alone is unsafe. Order requirements, Energy, generator topology, restoration Stars, Coins, Storage upgrades, Player Levels, Collection rewards and Guest Loyalty all affect pacing. This contract gives every future balance change a reproducible baseline before values are changed.

This is a **model and regression guard**, not hidden dynamic difficulty. Runtime outcomes remain exactly determined by the visible order requirements and existing generator rules.

## What the model counts
A tier-L item requires `2^(L-1)` tier-1 equivalents.

Generator topology is modeled explicitly:
- Kaffeemaschine / coffee: 1 Energy per base unit.
- Tropenbar / fruit: 1 Energy per base unit.
- Vorratskiste / bakery + sweet: deterministic alternation; the conservative phase-safe cost is `2 × max(required bakery base units, required sweet base units)`.
- Gewächshaus / herb: deterministic sequence `L1, L1, L1, L2`; every four taps yield five base-unit equivalents. The simulation uses the exact cycle, not a random average.

The model intentionally does **not** pretend every produced side item is wasted. Pantry bakery/sweet requirements are pooled because both families share one alternating generator. It also does not credit unrelated pre-existing Board inventory, Daily rewards, Energy Reserve, Recycling, Service Specials, Service Calls, Guest Dynamics, Place Powers or lucky stockpiles; this keeps the baseline stable and conservative.

For the core Coin journey, the simulator now additionally counts only deterministic progression income implied by the modeled route:
- starting Coins from the canonical initial state;
- base Coins on the modeled orders;
- Player-Level Coins from order XP, restoration XP and item discoveries that are required to make the modeled order tiers;
- Guest Loyalty milestone Coins from those modeled services;
- Family Mastery Coins only when the modeled order route necessarily reaches the final tier of that family;
- the canonical permanent Storage expansion sink from 4 → 6 → 8 slots.

Optional extra Coin sources stay excluded on purpose. This makes the Storage check a floor, not an optimistic best case.

## Current chapter baseline
The deterministic chapter simulation repeatedly serves the order selected by the real restoration-based difficulty band and immediately spends Stars on the next available upgrade.

| Place | Orders to finish | Theoretical Energy | Base order Coins | Stars left |
| --- | ---: | ---: | ---: | ---: |
| Café am Meer | 15 | 218 | 1,767 | 3 |
| Sonnenkai | 16 | 286 | 3,195 | 5 |
| Dachgarten | 20 | 288 | 4,800 | 0 |

The Café values above replace the stale `228 Energy / 1,745 Coins` documentation from the original economy slice. The later first-session/order-pool work intentionally changed the real deterministic Coast route; the tests had already protected the current `218 / 1,767` values, but this contract had not been synchronized.

This keeps the intended broad shape: later Places take more completed orders, while Dachgarten's explicit greenhouse harvest bonus prevents raw Energy cost from simply scaling linearly forever.

### Difficulty-band effort
Energy per restoration Star (lower = faster restoration):

| Place | Starter | Growing | Established |
| --- | ---: | ---: | ---: |
| Café am Meer | 1.67 | 3.38 | 5.82 |
| Sonnenkai | 1.43 | 2.67 | 4.57 |
| Dachgarten | 1.43 | 2.13 | 3.70 |

The increasing effort inside each Place is intentional and transparent because difficulty bands advance only with visible restoration progress. The current Coast established band is the tightest pacing point and should be watched closely in real play evidence; future reward/cost tuning should use this report rather than changing isolated numbers by feel.

## Core Coin journey + permanent Storage sink
Canonical Storage expansion remains:
- 4 → 6 slots: 200 Coins;
- 6 → 8 slots: 450 Coins;
- full permanent expansion: 650 Coins total.

The integrated deterministic floor is:

| Checkpoint | Orders served | Modeled Level | Starting + order Coins | Level Coins | Loyalty Coins | Mastery Coins | Core Coins total | After full Storage |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Café complete | 15 | 9 | 1,867 | 800 | 375 | 500 | 3,542 | 2,892 |
| Sonnenkai complete | 31 | 13 | 5,062 | 1,200 | 375 | 750 | 7,387 | 6,737 |
| Dachgarten complete | 51 | 17 | 9,862 | 1,600 | 1,125 | 1,000 | 13,587 | 12,937 |

The modeled XP at full three-Place completion is 9,310: 5,110 from orders, 1,480 from order-required item discoveries and 2,720 from restorations. The route necessarily completes Bakery, Sweet, Fruit and Herb families; Coffee reaches tier 5 on this conservative route, so no Coffee Mastery reward is assumed.

Interpretation: permanent Storage is a meaningful early Coin sink, but it is not a mandatory grind wall under the deterministic core route. Even if the player buys both Storage expansions by the end of Café am Meer, the modeled floor remains positive without crediting Daily or conditional bonus systems. This is an affordability guard, not a recommendation that every player should buy Storage immediately.

## Hard regression guards
`src/aaa-economy.js` and `tests/aaa-economy.test.js` now enforce:
- no modeled single order above 64 Energy;
- established-band average never above 7.25 Energy per restoration Star;
- full restoration completes inside chapter-specific order windows:
  - Coast: 12–18 orders;
  - Sunset: 13–20 orders;
  - Garden: 16–24 orders;
- exact current chapter baseline totals remain intentional until a balance PR explicitly updates both the values and this contract;
- Storage costs are read from the same canonical runtime configuration as the Storage system;
- full 4 → 8 Storage expansion must remain affordable from the deterministic core Coin floor by Café completion.

A future content addition that violates these guards must either be rebalanced or update the contract with an explicit player-facing reason and new simulation evidence. Tests must not simply be weakened to make a PR green.

## Running the audit
```sh
node scripts/economy-sim.mjs
```

The command prints a machine-readable JSON report for chapter pacing plus the integrated core Coin journey and exits non-zero when a guard fails.

## Fairness rules
- no hidden outcome manipulation;
- no fake near-misses or dynamic difficulty that changes produced items behind the player's back;
- no punitive Daily streak or scarcity pressure;
- paid systems, if ever introduced later, may not be required to escape an intentionally broken Energy or Board economy;
- every currency must keep a visible player purpose.

## Next balancing work
Use this model for the next Milestone-K slices:
1. evaluate Coast late-order Star/Coins efficiency against real player/browser traces;
2. centralize more reward/cost configuration only when the runtime migration can be kept simple and deterministic;
3. add long-run simulation for mixed three-order choice, retained inventory and Energy Reserve without turning the model into opaque live difficulty logic;
4. only change live reward/cost values after the simulator and real browser evidence point to a specific player-facing pacing problem.
