# Poply Storage + Board Recovery System

Status: Milestone F1 storage LIVE; F2 board-recovery recycling implementation contract.

## Purpose
Board space should create useful decisions without deleting player value or forcing purchases. Storage gives players a safe temporary home for useful items and gives Coins permanent utility. Recycling closes the remaining hard-deadlock case where both Board and Storage are full.

## Storage rules
- Storage belongs to the **Board / Werkbank**. It is not a fifth main navigation tab.
- New/existing saves start with **4 storage slots**.
- Only normal merge items may be stored.
- Generators can never be stored, recycled or displaced by the storage system.
- Storing removes exactly one chosen item from the Board and preserves the exact item id/family/tier in Storage.
- Restoring moves that exact stored item to the first free Board slot.
- If Storage is full, Board → Storage fails with no item loss.
- If the Board is full, Storage → Board fails with no item loss.
- No storage/recycling action consumes Energy.
- Storage items are intentionally **parked**, not active production items. They must be returned to the Board before they count toward a customer order.

## F2 — Fair Board recovery
A full Board must never become an unrecoverable save. The Lager drawer therefore exposes recycling for **normal Board items only**.

Rules:
- recycling is always a deliberate secondary action, separate from storing;
- the player must confirm before any item is removed;
- exactly one chosen Board item is removed;
- generators are never recyclable;
- Storage is not touched by recycling;
- the freed Board cell is immediately usable;
- the action persists through reload;
- a small deterministic Coin return softens the loss without making recycling an economy farming strategy.

Coin return by item tier:
- Tier 1 → **1 Coin**
- Tier 2 → **3 Coins**
- Tier 3 → **7 Coins**
- Tier 4 → **15 Coins**
- Tier 5 → **30 Coins**
- Tier 6 → **60 Coins**

These values are intentionally below normal order value. Recycling is a recovery/board-management tool, not a better alternative to serving guests.

## Coin utility
Storage capacity is a permanent account upgrade:
- 4 → 6 slots costs **200 Coins**.
- 6 → 8 slots costs **450 Coins**.
- maximum is **8 slots**.

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
- tap a Board item to store that exact item;
- a compact `↻ +Coins` action on each normal Board item for recovery;
- Coin capacity upgrade action;
- clear text that parked items must return to the Board for orders.

The recycle action always opens an explicit confirmation explaining that the item will be removed and how many Coins return. The drawer remains an overlay inside the Board view, so it must not create document scrolling or overlap bottom navigation.

## Save migration
Existing saves receive storage metadata when missing. Recycling adds no new required save field; it changes the already-persisted Board and Coin balance atomically through the normal save path.

No existing Board item, Coin, Star, Energy, XP, discovery, order or Place progress is reset.

If future/legacy metadata claims a capacity lower than the number of valid stored items, migration expands capacity to preserve every valid stored item rather than deleting value.

## QA contract
Deterministic tests cover:
- existing-save migration;
- exact identity-preserving transfers;
- generator rejection for storage and recycling;
- deterministic tier-based recycling values;
- exact one-item removal + exact Coin return;
- **Board full + Storage full → recycling succeeds and frees exactly one Board slot while Storage remains unchanged**;
- full-storage and full-board no-loss failures;
- permanent Coin spending and capacity limits;
- no deletion when capacity metadata is stale.

Mobile WebKit QA must:
- open the actual Lager drawer;
- confirm generators are not offered for storage or recycling;
- store/reload/restore a real starting Board item;
- buy the 4 → 6 expansion and verify exact Coin spend;
- trigger a real recycle action through the rendered `↻` control;
- accept the real confirmation dialog;
- verify exact item removal, exact Coin return and persistence after reload;
- validate 390×844 and 390×720 layouts with the drawer open;
- capture and self-review the recycle state screenshots.
