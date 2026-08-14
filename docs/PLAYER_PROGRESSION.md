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

## Level curve
- Level 1 → 2 requires **120 XP**.
- Every next level requires 60 XP more than the previous level.
- XP is stored as one lifetime total; the current level and progress bar are derived from that total.
- Crossing a level awards **100 Coins per level crossed**.

This first reward is intentionally simple and non-pay-to-win. Future milestones may attach real system unlocks to selected levels only after those systems actually exist.

## Existing-save migration
Existing players must never be reset to Level 1 with zero recognition. Saves without `playerXp` receive fair retroactive XP based on already completed meaningful progress:
- 60 XP per previously delivered order;
- 140 XP per already completed restoration.

Board, Coins, Stars, Energy, Places, Orders and stats remain unchanged.

## Player-facing UI
- The Poply logo area shows a compact `LV N` badge.
- A thin XP progress rail sits at the bottom of the existing top bar without increasing the Board screen height.
- Completing an XP action shows a short `+XP` chip.
- Crossing a level shows a restrained level-up reveal with the new level and Coin reward.
- Progress survives reload; the level-up reveal does not replay on reload.

## QA contract
Deterministic tests cover the level curve, migration, order difficulty scaling, restoration bonus and single/multi-level rewards.

Mobile WebKit QA must additionally:
- verify the level badge does not overlap the existing resource HUD at 390 px width;
- deliver a real prepared order and cross Level 1 → 2;
- verify saved XP, new level and +100 Coin level reward;
- reload and verify persistence;
- perform a real restoration and cross Level 2 → 3;
- create screenshots of both level-up moments.

## Next dependency
Milestone E2 — Collection Book — should reuse this progression layer for first-discovery rewards and selected level-gated unlocks. It must not introduce a disconnected second XP system.
