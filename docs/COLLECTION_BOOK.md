# Poply Collection Book

Status: Milestone E2 LIVE; family mastery depth added 2026-08-15.

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
- completed Places unlock their next authored Place/generator discovery;
- active orders do **not** reveal requested tiers, because a request is not proof the player has created the item.

Migration itself grants no discovery XP or retroactive family-mastery Coins. Existing value is preserved and future content is not spoiled.

## Runtime discovery rule
After migration, discovery comes from real player actions only:
- generating an item records it if it is genuinely new;
- merging two items and producing a new tier records the resulting tier;
- unlocking a Place records its authored Place and generator discovery.

The first item discovery pays XP through the existing Player Progression system:
`20 + tier × 10 XP`.

The same discovery never pays twice.

## Family mastery
Every authored six-tier item family now has mastery derived directly from the existing discovery keys. There is **no separate mastery save counter**, claim button, streak or currency.

Visible mastery titles:
- 0/6: `Unentdeckt`
- 1/6: `Entdecker`
- 2–3/6: `Kenner`
- 4–5/6: `Profi`
- 6/6: `Meister`

The first real runtime discovery that completes 6/6 grants exactly **250 Coins** once. This reward is delivered by the same idempotent final-tier discovery transition, so reloading or rediscovering the already-known tier cannot pay it twice. Saves that are already 6/6 through legacy/backfill data show `Meister`, but migration itself does not mint retroactive Coins.

The mastery state stays inside the selected family header in Collection rather than creating another profile/dashboard screen. Before completion it shows remaining tiers and the future +250 Coin reward; after completion it records that the reward was earned.

## Collection view
`Sammlung` is a real fourth main navigation destination because the feature is actually implemented.

Current content contains:
- overall item discovery count out of 30;
- five family selectors: Getränke, Backstube, Süßes, Sonnenfrüchte, Dachgarten;
- six tier cards for the selected family;
- discovered tiers show authored art and name;
- undiscovered tiers show dark silhouettes and `???` rather than full names;
- compact family-mastery status in the existing family focus;
- compact world-discovery records for Café am Meer, Sonnenkai, Dachgarten and their generators;
- no vertical document scrolling on the 390×844 or 390×720 Mobile WebKit layouts.

## First-discovery presentation
A genuinely new item tier receives a short authored discovery reveal showing:
- item art;
- `NEU ENTDECKT`;
- real item name and tier;
- one-time XP reward.

When that tier completes a family, the same reveal also shows `FAMILIE GEMEISTERT` and the +250 Coin mastery reward. It does not spawn a separate modal. If the discovery also crosses a Player Level, existing progression sequencing remains authoritative.

## QA contract
Deterministic tests cover:
- initial/backfilled discoveries;
- no future-tier leakage;
- one-time discovery and one-time XP;
- Place/generator migration;
- deterministic family/overall counts;
- mastery ranks derived from discoveries;
- exactly-once +250 Coin reward on the real final-tier discovery transition;
- Collection view locked/discovered/mastered rendering and real navigation markup.

Mobile WebKit QA must:
- start from a deterministic fresh save;
- perform a **real pointer merge** of the two starting coffee items;
- verify tier 2 discovery + 40 XP is persisted;
- capture the discovery reveal;
- open the actual Collection tab and verify mastery progress;
- verify locked families remain silhouettes;
- capture Collection at 390×844 and 390×720;
- set up two real tier-5 coffee items, merge them through the real Board interaction to tier 6, and verify 6/6 completion;
- verify the mastery reveal visibly contains the one-time +250 Coin reward;
- verify Coins/mastery survive reload without duplication.

## Product role
Collection depth remains connected to the core merge loop: discovering and completing chains is the achievement. Future Collection work should prefer family/guest/world completion and meaningful cosmetic recognition over disconnected generic profile systems.
