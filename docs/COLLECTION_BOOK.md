# Poply Collection Book

Status: Milestone E2 implementation contract.

## Purpose
Items should not disappear into a merge loop without leaving a sense of ownership. The Collection Book turns every first-time tier into permanent account progress and makes future tiers visible as goals without fully spoiling them.

## Persistent discovery model
The existing save receives a `discoveries` array. Discovery keys are stable and content-oriented:
- `item:<family>:<tier>`
- `generator:<generator-id>`
- `place:<place-id>`

No separate storage key or backend is introduced.

## Existing-save migration
Migration may only backfill content the existing save demonstrates the player has reached:
- if a board contains tier N of a family, tiers 1…N are considered discovered because that item could only have been produced through those lower tiers;
- generators physically present on the board are discovered;
- Café am Meer is always known;
- a completed Place 01 records Sonnenkai and Tropenbar;
- active orders do **not** reveal requested tiers, because a request is not proof the player has created the item.

Migration itself grants no discovery XP. Existing value is preserved and future content is not spoiled.

## Runtime discovery rule
After migration, discovery comes from real player actions only:
- generating an item records it if it is genuinely new;
- merging two items and producing a new tier records the resulting tier;
- unlocking Sonnenkai records the new Place and Tropenbar generator.

The first item discovery pays XP through the existing Player Progression system:
`20 + tier × 10 XP`.

The same discovery never pays twice.

## Collection view
`Sammlung` becomes a real fourth main navigation destination only because the feature is actually implemented.

The first version contains:
- overall item discovery count out of 24;
- four family selectors: Getränke, Backstube, Süßes, Sonnenfrüchte;
- six tier cards for the selected family;
- discovered tiers show their authored art and name;
- undiscovered tiers show dark silhouettes and `???` rather than full names;
- compact world-discovery records for Places and generators;
- no vertical document scrolling on the 390×844 or 390×720 Mobile WebKit layouts.

## First-discovery presentation
A genuinely new item tier receives a short authored discovery reveal showing:
- item art;
- `NEU ENTDECKT`;
- real item name and tier;
- one-time XP reward.

If the discovery also crosses a Player Level, the discovery moment completes first and the Level-Up reveal follows. The two rewards must not fight for the same visual moment.

## QA contract
Deterministic tests cover:
- initial/backfilled discoveries;
- no future-tier leakage;
- one-time discovery and one-time XP;
- completed Place 01 generator/Place migration;
- deterministic family/overall counts;
- Collection view locked/discovered rendering and real navigation markup.

Mobile WebKit QA must:
- start from a deterministic fresh save;
- perform a **real pointer merge** of the two starting coffee items;
- verify tier 2 discovery + 40 XP is persisted;
- capture the discovery reveal;
- open the actual Collection tab;
- verify the coffee tier is known and fruit remains six silhouettes;
- capture Collection at 390×844 and 390×720;
- reload and verify discovery + XP remain saved.

## Next dependency
Milestone F1 adds persistent storage and the first meaningful Coin sink. Storage should use Collection knowledge for labels/art but must not create a second inventory/discovery truth source.
