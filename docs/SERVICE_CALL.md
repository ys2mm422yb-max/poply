# Service-Ruf

Status: **LIVE** · PR #132 · Issue #131 · 2026-08-16.

Accepted implementation head: `3d08523b65c73fdf2beaac9ff460ac62d31e213c`.
Production merge commit: `8cdeeab8f1c50c97a83c8b569bda9bddce0564c6`.

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

## Release acceptance
The accepted exact head passed:
- CI `31940477484`;
- Browser QA `31940477492`;
- PWA Update QA `31940477487`;
- Place 03 QA `31940477536`.

Accepted Browser artifact: `9261945619`.
The following screenshots were actually opened and reviewed before merge:
- `110-service-call-ready-390x844.png`;
- `111-service-call-stock-ready-390x844.png`;
- `112-service-call-success-390x844.png`;
- `113-service-call-ready-390x720.png`.

The first technically green 390×720 candidate was manually rejected because the fixed bottom navigation partly covered the `Liefern` action. The final accepted version compacts only the short-phone Ruf state and the dedicated WebKit gate now asserts that `Liefern` remains fully above `.main-nav`.

The exact production merge commit then passed the release gate again:
- CI `31940888464`;
- Browser QA `31940888460`;
- PWA Update QA `31940888461`;
- Place 03 QA `31940888448`;
- canonical Pages deploy `31940888456`.

The full post-merge Browser QA completed successfully through Service-Ruf, Café Powers, Café Scene V2, migration, Energy, Collection, Storage, Daily, Place Map, Place03 and screenshot upload.
