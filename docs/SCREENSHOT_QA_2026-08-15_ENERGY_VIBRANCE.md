# Screenshot QA — Energy recharge vibrance

Date: 2026-08-15
Worker: `visual-automation`
PR: #71 — Visual: make Energy recharge planning feel authored
Start main: `7649b09d8c0b1ec1b10ba1830e7b5e6e2c476c68`
First accepted implementation head before this documentation commit: `d7f6b8e3421f278f44abe47dfbdc8c109e05216d`

## Why this pass existed
The new deterministic Energy planning detail was functionally strong but visually read like a large dark utility tooltip. On the accepted phone screenshots it was one more teal panel layered over a shell that had already gained stronger authored resource, Board and destination colors.

This pass changes presentation only. Energy math, refill timing, save state, Economy, Board, Orders, Place03, Storage, Daily, navigation and dynamic gameplay FX are unchanged.

## Collision / ownership check
Open work was re-read before implementation:
- PR #58 owns Place03/domain/session/Collection/Map files;
- PR #67 owns Storage presentation;
- PR #66 is documentation-only shell evidence;
- PR #55 owns dynamic gameplay FX/workflow/`aaa-motion.css`.

This pass stays only in `src/aaa-energy.css` and its existing deterministic regression test.

## Baseline evidence actually opened
From successful `main` Browser QA run `31858947325`, artifact `9239928660`:
- `24-energy-plan-390x844.png`
- `25-energy-plan-short-safari.png`
- `01-board-390x844.png`
- `04-board-short-safari.png`

Baseline finding: the Energy planner fitted correctly and remained readable, but its nearly monochrome teal material made the interaction feel like an application tooltip rather than an intentional recharge/planning moment in a colorful casual game.

## First implementation evidence actually opened
Exact implementation head: `d7f6b8e3421f278f44abe47dfbdc8c109e05216d`
- CI run `31860088082` — success
- Browser QA run `31860088087` — all substantive Mobile, Progression, Collection, Storage, Daily and Place Map steps passed before artifact upload
- artifact `9240300585` (`mobile-webkit-qa`), digest `sha256:3aee0cd2049a47c806e94c0409d5d2e8c6216395d206975521c7c02f0d5a0ea4`

Actually opened:
- `24-energy-plan-390x844.png`
- `25-energy-plan-short-safari.png`
- `01-board-390x844.png`
- `04-board-short-safari.png`

No tablet PNG is produced by the current artifact for this flow, so no tablet visual acceptance is claimed for this focused pass.

## Accepted visual findings
- The open Energy pill now visibly enters an illuminated recharge state instead of remaining visually identical to its closed state.
- Cyan reflected light and warm gold charge accents give the planner a specific Energy identity without inventing a new currency or fake progress mechanic.
- `+1 in 1:30` / `+1 in 1:29` is now the clear warm focal point; full-recharge estimate and offline rule stay readable but secondary.
- The restrained cyan→gold rail reads as material decoration, not as a misleading percentage meter.
- 390×844 and 390×720 both keep the planner fully inside the shell, above the customer/order strip and away from bottom navigation.
- The panel remains compact enough that the Board, active orders and restoration target are still understandable while it is open.
- No clipping, document scroll or required-control overlap is visible.

## Accepted / rejected versions
The first implementation version is accepted. No visual iteration was rejected in this pass.

## Remaining visual debt
Milestone B remains open globally. The next visual worker should re-read active PR ownership first. If #67 Storage is still active and #55 still owns dynamic FX, a useful independent screenshot-first candidate is the quiet lower Board atmosphere band or another unowned secondary surface; do not duplicate active Place03/Storage/FX work.

## Decision
Accept the implementation visually. This documentation commit creates a new exact PR head, so merge remains blocked until fresh normal CI + Browser QA succeed for that documented head and the required Energy screenshots are reopened from that final artifact.
