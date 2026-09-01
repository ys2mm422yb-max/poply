# Poply Economy & Pacing Contract

Status: ACTIVE · 2026-08-31
Scope: deterministic balancing model for the current three-Place game.

## Why this exists
Poply now has enough interconnected systems that balancing by feel alone is unsafe. Order requirements, Energy, generator topology, restoration Stars, Coins, Storage upgrades, Player Levels, Collection rewards, Guest Loyalty and the three simultaneous order choices all affect pacing. This contract gives every future balance change a reproducible baseline before values are changed.

This is a **model and regression guard**, not hidden dynamic difficulty. Runtime outcomes remain exactly determined by the visible order requirements and existing generator rules.

## What the model counts
A tier-L item requires `2^(L-1)` tier-1 equivalents.

Generator topology is modeled explicitly:
- Kaffeemaschine / coffee: 1 Energy per base unit.
- Tropenbar / fruit: 1 Energy per base unit.
- Vorratskiste / bakery + sweet: deterministic alternation; the conservative phase-safe cost is `2 × max(required bakery base units, required sweet base units)`.
- Gewächshaus / herb: deterministic sequence `L1, L1, L1, L2`; every four taps yield five base-unit equivalents. The simulation uses the exact cycle, not a random average.

The model intentionally does **not** pretend every produced side item is wasted. Pantry bakery/sweet requirements are pooled because both families share one alternating generator. It also does not credit unrelated pre-existing Board inventory, Daily rewards, Energy Reserve, Recycling, Service Specials, Service Calls, Guest Dynamics, Place Powers or lucky stockpiles; this keeps the baseline stable and conservative.

For the core Coin journey, the simulator counts only deterministic progression income implied by the modeled route:
- starting Coins from the canonical initial state;
- base Coins on the modeled orders;
- Player-Level Coins from order XP, restoration XP and item discoveries required to make the modeled order tiers;
- Guest Loyalty milestone Coins using the same `order.sequence` → guest assignment as real service delivery;
- Family Mastery Coins only when the modeled route necessarily reaches the final tier of a family;
- the canonical permanent Storage expansion sink from 4 → 6 → 8 slots.

Optional extra Coin sources stay excluded on purpose.

## Two different pacing views
The audit now keeps two intentionally different models instead of treating one simplified route as the whole game.

### 1. Isolated chapter reference
The original deterministic chapter model repeatedly asks what one replacement order would look like at the current restoration stage, then immediately spends Stars on the next upgrade. This remains useful for template, generator and difficulty-band regressions.

It does **not** model the live three-order queue, visible player choice, anti-repeat selection or carry-over orders between Places.

| Place | Orders to finish | Theoretical Energy | Base order Coins | Stars left |
| --- | ---: | ---: | ---: | ---: |
| Café am Meer | 15 | 218 | 1,767 | 3 |
| Sonnenkai | 16 | 286 | 3,195 | 5 |
| Dachgarten | 20 | 288 | 4,800 | 0 |

These values remain a protected isolated reference. They must no longer be described as the literal player route.

### Difficulty-band effort
Isolated Energy per restoration Star (lower = faster restoration):

| Place | Starter | Growing | Established |
| --- | ---: | ---: | ---: |
| Café am Meer | 1.67 | 3.38 | 5.82 |
| Sonnenkai | 1.43 | 2.67 | 4.57 |
| Dachgarten | 1.43 | 2.13 | 3.70 |

The increasing effort inside each Place is intentional and transparent because difficulty bands advance only with visible restoration progress. The Coast established band remains the tightest isolated template pool.

### 2. Rolling three-order runtime trace
The runtime trace starts from the real authored opening and keeps the actual three simultaneous orders alive for the full world route. Each modeled service:
1. chooses one of the three visible orders using an explicit deterministic policy;
2. calls the real `fulfillOrder()` path, so the replacement uses the current stage and the shipped **best-effort** anti-repeat rule;
3. only then spends available Stars through the real `buildNextUpgrade()` path;
4. preserves the other two visible orders, including carry-over orders when a new Place unlocks.

The anti-repeat contract is intentionally best effort, not an impossible uniqueness guarantee. Replacement selection avoids the just-served title and the other visible titles whenever the active stage pool contains an unblocked alternative. If a later Place/stage pool is narrower than the three-slot queue requires, the deterministic fallback may repeat a title because no unique candidate exists. The audit therefore distinguishes **avoidable repeat violations** from **forced pool-exhaustion repeats**.

The trace seeds only the exact requested items so domain fulfillment can run. Their production cost is still charged through the theoretical Energy model; seeded test items are not free inventory credit.

Three reference policies expose how meaningful the visible choice actually is:
- `fifo`: serve the oldest visible order first;
- `restoration-efficient`: choose the lowest Energy per Star, then lower Energy;
- `coin-conservative`: choose the lowest immediate base-Coin reward, then lower Energy. This is the conservative Coin reference used by the integrated core journey; it is a deterministic stress route, not a mathematical proof of the absolute minimum possible Coins.

| Policy | Café · orders / Energy / Coins | Sonnenkai delta | Dachgarten delta | Full world · orders / Energy / Coins |
| --- | --- | --- | --- | --- |
| FIFO | 15 / 180 / 1,611 | 14 / 290 / 2,845 | 20 / 317 / 4,890 | 49 / 787 / 9,346 |
| Restoration-efficient | 16 / 160 / 1,603 | 15 / 238 / 2,805 | 20 / 266 / 4,515 | 51 / 664 / 8,923 |
| Coin-conservative | 16 / 152 / 1,464 | 16 / 238 / 2,735 | 21 / 273 / 4,495 | 53 / 663 / 8,694 |

All three traces have **zero avoidable anti-repeat violations** and keep exactly three visible orders. FIFO records 9 forced pool-exhaustion repeats in later narrow pools; restoration-efficient and coin-conservative record 0. Those forced repeats are reported as a content-variety signal, not mislabeled as an anti-repeat regression.

This changes the interpretation of late Café pressure. In the FIFO trace, the final Café service selects the 48-Energy `Sonnenuntergang`, but the same visible queue still contains `Croissant & Kaffee` at 18 Energy and `Süßer Nachmittag` at 20 Energy. A hard order can therefore be visible without being the player's only route forward. Balance decisions must evaluate the queue, not just the hardest template or isolated band average.

The policies also change what becomes expensive later: aggressively consuming the cheapest current option can leave a harder queue behind. That is expected choice behavior, not hidden difficulty.

## Core Coin journey + permanent Storage sink
Canonical Storage expansion remains:
- 4 → 6 slots: 200 Coins;
- 6 → 8 slots: 450 Coins;
- full permanent expansion: 650 Coins total.

The integrated core journey now uses the **coin-conservative rolling runtime trace** and the real order-sequence guest assignment:

| Checkpoint | Orders served | Modeled Level | Starting + order Coins | Level Coins | Loyalty Coins | Mastery Coins | Core Coins total | After full Storage |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Café complete | 16 | 9 | 1,564 | 800 | 375 | 0 | 2,739 | 2,089 |
| Sonnenkai complete | 32 | 13 | 4,299 | 1,200 | 625 | 0 | 6,124 | 5,474 |
| Dachgarten complete | 53 | 16 | 8,794 | 1,500 | 1,125 | 500 | 11,919 | 11,269 |

The modeled XP at full three-Place completion is 9,100: 5,060 from orders, 1,320 from order-required item discoveries and 2,720 from restorations. On this conservative route Bakery and Sweet reach family mastery; Coffee, Fruit and Herb reach tier 5.

The previous 3,542-Coin Café estimate from the isolated route was useful as a deterministic reference but was too strong to call a literal Coin floor after the First Session work introduced a persistent three-order queue and player choice. The corrected runtime-aware conservative Café estimate is 2,739 Core Coins. The Storage conclusion still holds with substantial room: buying both permanent Storage expansions leaves 2,089 Coins at Café completion even before Daily or conditional bonus systems are credited.

That is evidence **against** changing live reward or Storage values now. The model needed to become more faithful before the economy needed to become richer.

## Hard regression guards
`src/aaa-economy.js` and `tests/aaa-economy.test.js` now enforce:
- no modeled selected order above 64 Energy;
- isolated established-band average never above 7.25 Energy per restoration Star;
- isolated and rolling routes complete inside the chapter-specific order windows:
  - Coast: 12–18 orders;
  - Sunset: 13–20 orders;
  - Garden: 16–24 orders;
- the rolling traces keep exactly three visible orders;
- any **avoidable** anti-repeat violation fails the audit, while forced pool-exhaustion repeats are counted and reported separately;
- the exact isolated chapter baseline remains intentional until a balance PR explicitly updates both the values and this contract;
- Storage costs are read from the same canonical runtime configuration as the Storage system;
- full 4 → 8 Storage expansion must remain affordable under the coin-conservative rolling route by Café completion.

A future content addition that violates these guards must either be rebalanced or update the contract with an explicit player-facing reason and new simulation evidence. Tests must not simply be weakened to make a PR green.

## Running the audit
```sh
node scripts/economy-sim.mjs
```

The command prints:
- the isolated chapter reference;
- concise FIFO, restoration-efficient and coin-conservative rolling traces;
- visible-choice pressure plus separate avoidable-repeat / forced-repeat counts;
- the conservative integrated Coin/XP/Storage journey;
- guard failures, if any.

It exits non-zero when a guard fails.

## Fairness rules
- no hidden outcome manipulation;
- no fake near-misses or dynamic difficulty that changes produced items behind the player's back;
- no punitive Daily streak or scarcity pressure;
- paid systems, if ever introduced later, may not be required to escape an intentionally broken Energy or Board economy;
- every currency must keep a visible player purpose.

## Next balancing work
Use the runtime-aware model for the next Milestone-K slices:
1. compare late-Café queue pressure with a real WebKit/player trace before changing Star or Coin rewards;
2. add retained-inventory and Energy Reserve assumptions as explicit alternate scenarios, not hidden live difficulty;
3. treat forced pool-exhaustion repeats as a separate content-variety signal instead of disguising them as an economy problem;
4. centralize more reward/cost configuration only when the runtime migration can be kept simple and deterministic;
5. only change live reward/cost values after both the simulator and real play evidence point to a specific player-facing pacing problem.
