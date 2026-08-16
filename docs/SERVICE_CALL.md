# Service-Ruf

Status: candidate in PR #132 · Issue #131 · 2026-08-16.

## Player problem
Three guests wait at once, but existing tactical systems mostly change **how** the player merges or generates. Service-Ruf adds a small explicit sequencing decision: **which guest should be served next?**

## Rule
Service-Ruf is deterministic and optional.

- A new Ruf becomes available after 3 resolved normal services.
- The player chooses one currently waiting guest and one approach.
- **Direkt** — the chosen guest must be the next normal delivery. It pays a modest Coin bonus.
- **Nachschub** — perform exactly 2 successful generator actions first, then deliver that same chosen guest next. It pays a larger Coin bonus.
- Serving another guest first, or serving the chosen Nachschub guest before 2/2 generator actions, expires only the optional Ruf bonus.
- Normal service is never blocked and base order requirements/rewards are unchanged.
- There is no wall-clock timer, streak penalty, new currency or hidden RNG.

## Coin bonuses
Bonuses scale only with the existing visible order difficulty band.

| Difficulty | Direkt | Nachschub |
| --- | ---: | ---: |
| Opening | +30 | +50 |
| Starter | +35 | +55 |
| Growing | +45 | +70 |
| Established | +60 | +90 |

## Interaction with existing systems
Service-Ruf intentionally owns a different decision axis:

- **Merge Flow** — rewards successful merges with a chosen generator boost.
- **Service Specials** — reward Merge-Serie, Fresh and Flow behavior attached to an order.
- **Café powers** — persistent restoration unlocks such as Abendservice, Vorbereitung and Gastwahl.
- **Service-Ruf** — commits the player to the next guest, optionally trading 2 generator actions for a larger bonus.

All can coexist. Service-Ruf does not rewrite a Special, alter a Café power, change order generation, or consume a new resource.

## Persistence / migration
State is stored inside the existing local-first save as `serviceCallState` and normalized on load. Existing saves do not need a save-version bump and do not lose Coins, Stars, Energy, board items or orders.

Canonical fields:
- `nextAt`
- `orderId`
- `mode`
- `generatorProgress`
- `callsCompleted`
- `callsExpired`

If a legacy save has no Service-Ruf state, a safe state is derived from existing `stats.orders`. If an active target order no longer exists, the invalid target is cleared safely instead of blocking play.

## QA contract
Before merge:
- deterministic domain tests cover cadence, choice, generator progress, success, harmless expiry and migration;
- dedicated WebKit QA proves ready → choice → Nachschub 2/2 → successful target delivery plus harmless other-order expiry;
- canonical Service-Ruf screenshots at 390×844 and 390×720 must be generated and actually opened/reviewed;
- exact accepted head must pass CI, Browser QA, PWA Update QA and relevant Place gate.

After merge, the exact production `main` must pass the full release gate again, including canonical Pages deployment.
