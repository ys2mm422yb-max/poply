# Poply Guest Loyalty

Status: product slice in `feature/guest-loyalty-collection`.

## Player problem
Orders currently pay immediate resources, but the recurring customer portraits do not create durable relationship progress. Guest loyalty turns normal serving into a second long-term reason to complete orders without adding a detached profile dashboard or a new currency.

## Contract
- The three existing original customer portraits are persistent Poply guests: Mika, Nora and Sam.
- Guest identity follows the same deterministic order sequence already used for portrait selection.
- Only a successfully served normal order or Daily Bonus Guest increments that guest.
- Saves persist only per-guest visit counts in `guestVisits`; no separate claim flags are required.
- Legacy saves start at zero guest visits because old aggregate order counts cannot prove which guest was served. Migration grants no retroactive Coins.

## Loyalty milestones
- 0 visits: `Neu`
- 1 visit: `Bekannt` and +25 Coins
- 5 visits: `Stammgast` and +100 Coins
- 12 visits: `Lieblingsgast` and +250 Coins

Rewards happen automatically on the exact visit transition and therefore cannot be claimed twice by reload. The reward is deliberately modest relative to later orders and exists as a completion nudge, not a grind wall.

## Presentation
Guest loyalty stays inside the existing Collection page. A compact `STAMMGÄSTE` row shows all three portraits, current loyalty title, visit count, next milestone and reward. There is no fifth navigation tab and no new dashboard.

## QA
Deterministic coverage verifies deterministic guest mapping, legacy migration, milestone rewards and idempotent persisted counts. Mobile WebKit QA serves a real ready order, verifies the matching guest only increments, verifies exact Coins, opens Collection, captures 390×844 and 390×720 screenshots, checks no document scroll/navigation overlap, reloads, and verifies no duplicate reward.
