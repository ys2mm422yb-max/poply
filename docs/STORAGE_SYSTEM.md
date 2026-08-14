# Poply Storage System

Status: Milestone F1 implementation contract.

## Purpose
Board space should create useful decisions without deleting player value or forcing purchases. Storage gives players a safe temporary home for useful items and gives Coins their first permanent utility.

## Storage rules
- Storage belongs to the **Board / Werkbank**. It is not a fifth main navigation tab.
- New/existing saves start with **4 storage slots**.
- Only normal merge items may be stored.
- Generators can never be stored, sold or displaced by the storage system.
- Storing removes exactly one chosen item from the Board and preserves the exact item id/family/tier in Storage.
- Restoring moves that exact stored item to the first free Board slot.
- If Storage is full, Board → Storage fails with no item loss.
- If the Board is full, Storage → Board fails with no item loss.
- No storage action consumes Energy.
- Storage items are intentionally **parked**, not active production items. In F1 they must be returned to the Board before they count toward a customer order. The drawer explains this explicitly rather than hiding the rule.

## Coin utility
Storage capacity is a permanent account upgrade:
- 4 → 6 slots costs **200 Coins**.
- 6 → 8 slots costs **450 Coins**.
- F1 maximum is **8 slots**.

Rules:
- upgrades are permanent and survive reload;
- Coins are spent exactly once on a successful upgrade;
- insufficient Coins never partially spend;
- reaching max capacity removes further purchase pressure;
- this is gameplay utility, not pay-to-win and has no real-money purchase path.

## Mobile interaction
The Board header contains a compact `Lager used/capacity` handle.

Opening it shows a temporary in-board drawer above the navigation:
- current Storage slots;
- tap a stored item to restore it;
- a horizontally scrollable `Von der Werkbank` item row;
- tap a Board item there to store that exact item;
- Coin capacity upgrade action;
- clear text that parked items must return to the Board for orders.

The drawer is an overlay inside the Board view, so opening Storage never adds normal document scrolling or moves the bottom navigation offscreen.

## Save migration
Existing saves receive:
- `storage: []`
- `storageCapacity: 4`

No existing Board item, Coin, Star, Energy, XP, discovery, order or Place progress is reset.

If future/legacy metadata claims a capacity lower than the number of valid stored items, migration expands capacity to preserve every valid stored item rather than deleting value.

## QA contract
Deterministic tests cover:
- existing-save migration;
- exact identity-preserving transfers;
- generator rejection;
- full-storage and full-board no-loss failures;
- permanent Coin spending and capacity limits;
- no deletion when capacity metadata is stale.

Mobile WebKit QA must:
- open the actual Lager drawer;
- confirm generators are not offered for storage;
- store a real starting Board item and verify exact id persistence;
- reload while the item is stored;
- restore the same item;
- buy the 4 → 6 expansion with 300 starting Coins and verify exactly 200 Coins are spent;
- verify capacity and Coin balance after reload;
- validate 390×844 and 390×720 layouts with the drawer open;
- capture screenshots for self-review.
