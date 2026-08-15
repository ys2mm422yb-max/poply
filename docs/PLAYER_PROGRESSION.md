# Poply player progression

Status: Milestone E1 implementation contract.

## Purpose
Poply needs a persistent progression track that continues beyond the current customer order and current Place. Player Level is that account-wide track. It must reward meaningful play without turning the game into an arbitrary grind or power race.

## XP sources
E1 awards XP only for meaningful completed outcomes:
- **Customer order delivered:** `40 + 10 × requested tier complexity` XP. Harder orders therefore pay more XP.
- **Restoration built:** **140 XP**.
- **New Place unlocked by a restoration:** restoration XP plus **100 bonus XP**.

Generating or merely moving items does not give XP. This avoids rewarding repetitive tapping instead of progress.

## Level curve and rewards
- Level 1 → 2 requires **120 XP**.
- Every next level requires 60 XP more than the previous level.
- XP is stored as one lifetime total; the current level and progress bar are derived from that total.
- Crossing a level awards **100 Coins per level crossed**.
- Any level-up event also refills **Energy to the current maximum**. It never creates overflow Energy and does not stack above the cap when multiple levels are crossed at once.
- XP gains that do not cross a level do not alter Energy or its regeneration clock.

The Energy refill is deliberately a fair play-continuation reward: a meaningful progression moment should not immediately strand the player behind an empty Energy bar. It adds no new currency, claim button, ad, purchase hook, expiration or scarcity mechanic.

## Permanent Energy capacity milestones
Player Level also creates a small long-term utility reward without adding another progression currency:
- baseline Max Energy: **40**;
- Level **5**: **45 Max Energy**;
- Level **10**: **50 Max Energy**;
- Level **15**: **55 Max Energy**.

The capacity is derived from the canonical Player Level. There is no claim button and no separately persisted capacity-upgrade inventory. A Level-up that crosses one of these milestones increases `maxEnergy` first and then the existing Level-up refill fills to the new cap. Existing custom/higher caps are never reduced.

The purpose is more flexible return play: a progressed player can accumulate a slightly larger fair play session while offline. The regeneration rate itself does not accelerate, and no purchase/ad/temporary booster is attached to the capacity increase.

## Existing-save migration
Existing players must never be reset to Level 1 with zero recognition. Saves without `playerXp` receive fair retroactive XP based on already completed meaningful progress:
- 60 XP per previously delivered order;
- 140 XP per already completed restoration.

Board, Coins, Stars, Energy, Places, Orders and stats remain unchanged. Existing saves do not receive retroactive Energy refills merely because their derived Level is above 1; the refill occurs only on a newly crossed level during play.

If an existing save is already Level 5/10/15+ but still carries the old 40-point cap, load-time progression reconciliation raises only `maxEnergy` to the earned canonical capacity. Current Energy and `energyUpdatedAt` remain unchanged. This avoids both player-value loss and a free retroactive refill. A higher existing/custom cap is preserved rather than reduced.

## Player-facing UI
- The Poply logo area shows a compact `LV N` badge.
- A thin XP progress rail sits at the bottom of the existing top bar without increasing the Board screen height.
- Completing an XP action shows a short `+XP` chip.
- The existing progress sheet previews the next Level, exact XP remaining and the deterministic `+100 Coins · Energie voll` reward.
- When the **next** Level is a capacity milestone, the same preview also communicates `MAX +5`; no extra page, tab or claim flow is introduced.
- Crossing a normal level shows a restrained level-up reveal with the new Level, Coin reward and `Energie voll` confirmation.
- Crossing Level 5/10/15 additionally names `Max-Energie +5` in that same reveal.
- Progress, earned capacity and the refilled Energy survive reload; the level-up reveal does not replay on reload.

## QA contract
Deterministic tests cover the level curve, migration, order difficulty scaling, restoration bonus, single/multi-level Coin rewards, Energy refill capping, capacity derivation at Levels 5/10/15, no-downgrade save reconciliation and the no-level-up Energy invariant.

Mobile WebKit QA must additionally:
- verify the level badge does not overlap the existing resource HUD at 390 px width;
- seed low Energy, prepare a real order just before Level 5 and verify the existing progress sheet previews `MAX +5`;
- deliver that real order and verify Player Level 5, persisted **45/45 Energy**, +100 Coins and `Max-Energie +5` in the level-up reveal;
- capture and inspect that Level-5 reveal at **390×844 and 390×720**;
- reload and verify the larger capacity persists;
- verify a pre-existing Level-5 save with `40` max reconciles to `45` without changing its current Energy or granting a retroactive refill;
- retain the real restoration Level-up regression and milestone/progress-sheet screenshots;
- fail on visible viewport/nav overlap, document scrolling or relevant page/console errors.

## Next dependency
Milestone E2 — Collection Book — reuses this progression layer for first-discovery rewards. Future progression additions must continue using the single canonical XP/Level system rather than introducing disconnected progression tracks.
