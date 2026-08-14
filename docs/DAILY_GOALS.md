# Poply Daily Goals — Milestone G contract

Status: implementation active on `feature/daily-goals-v2`.
Date: 2026-08-14.
Coordination log: GitHub Issue #42.

## Player purpose
Daily Goals add a fair reason to return without turning Poply into a streak-pressure game. The loop must reuse the real core game rather than invent a disconnected checklist screen.

## First shipping slice
- one local-calendar Daily state saved inside the existing local save;
- exactly three daily goals;
- guaranteed merge goal;
- guaranteed serve goal;
- one contextual goal chosen from generate / discover / restore depending on current progression;
- progress only comes from real gameplay actions;
- completed goals pay existing Coins and can be claimed exactly once;
- one deterministic Daily Bonus Guest using a real item requirement;
- Bonus Guest consumes the exact required board item, pays existing Coins + restoration Stars and counts as a served guest;
- no new currency;
- no forced ad;
- no streak;
- no penalty or debt for a missed day;
- next local calendar day replaces the previous Daily set while preserving every unrelated player value.

## UX contract
Daily is not a fifth main navigation tab. Orders contains a compact `HEUTE` ribbon. Tapping it opens a temporary game-native bottom sheet containing the three goals and Bonus Guest.

The sheet must:
- keep Bottom Navigation visible and unobstructed;
- fit 390×844 and 390×720 Safari-like viewports without document scrolling;
- show goal progress / claim state clearly;
- show the Bonus Guest item, progress and reward clearly;
- remain secondary to the main Board / Orders / Place loop;
- use authored icons rather than emoji;
- respect reduced-motion rules shared by the AAA shell.

## Gameplay event wiring
The session layer owns Daily progression:
- generator success -> `generate`;
- successful merge -> `merge`;
- first-time item discovery -> `discover`;
- normal customer delivery -> `serve`;
- restoration build -> `restore`;
- Daily Bonus Guest delivery -> `serve` as a real served guest.

No UI-only checkbox may advance Daily progress.

## Persistence / safety
- existing saves gain today's Daily state without losing Board, Storage, Coins, Stars, XP, discoveries, orders or Place progress;
- Daily rollover changes only the Daily state;
- claims are idempotent;
- Bonus Guest delivery is idempotent;
- missing requirements never consume anything;
- Daily state survives reload.

## Required release evidence
- deterministic Node tests for migration, rollover, capped progress, one-time claims and one-time Bonus Guest reward/consumption;
- normal CI green on exact PR head;
- existing full Mobile WebKit QA green;
- dedicated Daily WebKit QA performing real merge, real standard order delivery, real generator action, three claims and real Bonus Guest delivery;
- screenshots for Daily ready state, Bonus Guest served state and 390×720 short Safari state;
- screenshots opened and reviewed by the worker before merge;
- exact-main CI + Browser QA + canonical Pages deploy after merge.

## Visual follow-up
Issue #42 records the current global visual direction: Poply still needs more color, authored light/effects and stronger reward moments. Daily may introduce a warmer yellow/orange accent, but the broader color/FX pass is a separate follow-up so this feature does not become an uncontrolled CSS rewrite.
