# Poply energy system

Status: ACTIVE implementation target from 2026-08-14.

## Why this exists
The shipped Place-02 build showed an energy counter, but energy was only consumed by generators and never regenerated. The UI also gave the player no explanation of where new energy comes from. That is a gameplay and first-time-comprehension defect, not merely missing copy.

## Player-facing rule
- Maximum energy: **40**.
- Every generator tap costs **1 energy**.
- When below the cap, Poply restores **1 energy every 2 minutes**.
- Regeneration continues while the page/app is closed by using a persisted refill clock.
- Energy never regenerates above the cap.
- Spending from full energy starts a fresh two-minute refill interval.
- Spending while already below full does **not** reset the current refill countdown.

## Visibility contract
The top energy pill must always explain the system without a help page:
- at full energy it shows `Auto · 2 Min` below the current `40/40` value;
- below full it shows a live `+1 in M:SS` countdown;
- tapping the energy pill opens a compact planning detail with the live next-point timer and the estimated time until the **vollständige Aufladung**, e.g. `Voll in ca. 10 Min`;
- the detail explicitly says regeneration continues offline and can be closed by tapping the pill again;
- opening/closing the detail is state-neutral and never changes the refill clock, current energy or cap;
- when a point refills while the app is open, the value updates automatically and receives a short restrained refill pulse;
- accessibility text states that refill continues while Poply is closed and the pill is keyboard-operable.

A player must never have to guess whether energy is bought, earned from orders, reset by reopening the game, restored over time or how long a current deficit will take to refill.

## Save compatibility
The existing storage key remains unchanged. Old saves without an energy clock keep their current energy and receive a new refill clock at migration/session load. No board, coins, stars, orders, stats or Place progress may be reset.

## Fairness
This implementation adds no paid refill, ad gate, fake countdown, random refill or manipulative scarcity mechanic. The full-refill estimate is derived only from the same deterministic two-minute clock already used by regeneration. Future monetization changes require a separate explicit product decision and must not silently alter this rule.

## QA contract
Deterministic tests cover legacy clock initialization, partial intervals, offline elapsed time, cap behavior, refill timing after spending, the next-point label and exact full-recharge planning math. Mobile WebKit QA must tap the real energy pill, verify the detail at 390×844 and 390×720, assert it stays above navigation without document scrolling, and prove opening/closing does not mutate energy state. Normal CI and Mobile WebKit Browser QA remain required before merge and deployment.
