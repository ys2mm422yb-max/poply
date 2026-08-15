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

## Existing-save migration
Existing players must never be reset to Level 1 with zero recognition. Saves without `playerXp` receive fair retroactive XP based on already completed meaningful progress:
- 60 XP per previously delivered order;
- 140 XP per already completed restoration.

Board, Coins, Stars, Energy, Places, Orders and stats remain unchanged. Existing saves do not receive retroactive Energy refills merely because their derived Level is above 1; the refill occurs only on a newly crossed level during play.

## Player-facing UI
- The Poply logo area shows a compact `LV N` badge.
- A thin XP progress rail sits at the bottom of the existing top bar without increasing the Board screen height.
- Completing an XP action shows a short `+XP` chip.
- The existing progress sheet previews the next Level, exact XP remaining and the deterministic `+100 Coins · Energie voll` reward.
- Crossing a level shows a restrained level-up reveal with the new Level, Coin reward and `Energie voll` confirmation.
- Progress and the refilled Energy survive reload; the level-up reveal does not replay on reload.

## QA contract
Deterministic tests cover the level curve, migration, order difficulty scaling, restoration bonus, single/multi-level Coin rewards, Energy refill capping and the no-level-up Energy invariant.

Mobile WebKit QA must additionally:
- verify the level badge does not overlap the existing resource HUD at 390 px width;
- seed low Energy, deliver a real prepared order and cross Level 1 → 2;
- verify saved XP, new Level, +100 Coin reward and persisted full Energy;
- reload and verify persistence;
- seed low Energy, perform a real restoration and cross Level 2 → 3;
- verify both level-up overlays communicate `Energie voll`;
- verify the existing next-Level sheet communicates the Energy refill and still fits at 390×844 and 390×720;
- create screenshots of both level-up moments and both progress-sheet phone heights.

## Next dependency
Milestone E2 — Collection Book — reuses this progression layer for first-discovery rewards. Future progression additions must continue using the single canonical XP/Level system rather than introducing disconnected progression tracks.
