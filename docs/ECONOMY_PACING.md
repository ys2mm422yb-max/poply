# Poply Economy & Pacing Contract

Status: ACTIVE · 2026-08-15
Scope: deterministic balancing model for the current three-Place game.

## Why this exists
Poply now has enough interconnected systems that balancing by feel alone is unsafe. Order requirements, Energy, generator topology, restoration Stars, Coins, Storage upgrades, Player Levels and Collection rewards all affect pacing. This contract gives every future balance change a reproducible baseline before values are changed.

This is a **model and regression guard**, not hidden dynamic difficulty. Runtime outcomes remain exactly determined by the visible order requirements and existing generator rules.

## What the model counts
A tier-L item requires `2^(L-1)` tier-1 equivalents.

Generator topology is modeled explicitly:
- Kaffeemaschine / coffee: 1 Energy per base unit.
- Tropenbar / fruit: 1 Energy per base unit.
- Vorratskiste / bakery + sweet: deterministic alternation; the conservative phase-safe cost is `2 × max(required bakery base units, required sweet base units)`.
- Gewächshaus / herb: deterministic sequence `L1, L1, L1, L2`; every four taps yield five base-unit equivalents. The simulation uses the exact cycle, not a random average.

The model intentionally does **not** pretend every produced side item is wasted. Pantry bakery/sweet requirements are pooled because both families share one alternating generator. It also does not credit unrelated pre-existing Board inventory, Daily rewards, Energy Reserve or lucky stockpiles; this keeps the baseline stable and comparable.

## Current baseline
The deterministic chapter simulation repeatedly serves the order selected by the real restoration-based difficulty band and immediately spends Stars on the next available upgrade.

| Place | Orders to finish | Theoretical Energy | Coins earned | Stars left |
| --- | ---: | ---: | ---: | ---: |
| Café am Meer | 15 | 228 | 1,745 | 3 |
| Sonnenkai | 16 | 286 | 3,195 | 5 |
| Dachgarten | 20 | 288 | 4,800 | 0 |

This gives the intended broad shape: later Places take more completed orders, while Dachgarten's explicit greenhouse harvest bonus prevents raw Energy cost from simply scaling linearly forever.

### Difficulty-band effort
Energy per restoration Star (lower = faster restoration):

| Place | Starter | Growing | Established |
| --- | ---: | ---: | ---: |
| Café am Meer | 1.67 | 3.38 | 5.82 |
| Sonnenkai | 1.43 | 2.67 | 4.57 |
| Dachgarten | 1.43 | 2.13 | 3.70 |

The increasing effort inside each Place is intentional and transparent because difficulty bands advance only with visible restoration progress. The current Coast established band is the tightest pacing point and should be watched closely in real play evidence; future reward/cost tuning should use this report rather than changing isolated numbers by feel.

## Hard regression guards
`src/aaa-economy.js` and `tests/aaa-economy.test.js` currently enforce:
- no modeled single order above 64 Energy;
- established-band average never above 7.25 Energy per restoration Star;
- full restoration completes inside chapter-specific order windows:
  - Coast: 12–18 orders;
  - Sunset: 13–20 orders;
  - Garden: 16–24 orders;
- exact current baseline totals remain intentional until a balance PR explicitly updates both the values and this contract.

A future content addition that violates these guards must either be rebalanced or update the contract with an explicit player-facing reason and new simulation evidence. Tests must not simply be weakened to make a PR green.

## Running the audit
```sh
node scripts/economy-sim.mjs
```

The command prints a machine-readable JSON report and exits non-zero when a pacing guard fails.

## Fairness rules
- no hidden outcome manipulation;
- no fake near-misses or dynamic difficulty that changes produced items behind the player's back;
- no punitive Daily streak or scarcity pressure;
- paid systems, if ever introduced later, may not be required to escape an intentionally broken Energy or Board economy;
- every currency must keep a visible player purpose.

## Next balancing work
Use this model for the next Milestone-K slices:
1. evaluate Coast late-order Star/Coins efficiency against real player/browser traces;
2. model Storage expansion and Collection/Level/Loyalty Coin inflows together so permanent sinks remain useful without becoming mandatory grind;
3. centralize more reward/cost configuration only when the runtime migration can be kept simple and deterministic;
4. add long-run simulation for mixed three-order choice, retained inventory and Energy Reserve without turning the model into opaque live difficulty logic.
