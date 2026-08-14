# Poply – Mobile Browser QA Policy

Status: BINDING from 2026-08-14.

## Why this exists
A real iPhone report exposed that the visible `Jetzt servieren` button did nothing even though unit/markup tests were green. The delegated click handler was matching the app root's `data-view` state marker before reaching nested actions, so the view simply re-rendered and swallowed Serve/Build/Menu-style interactions.

This class of defect must be caught by Poply itself before the owner becomes the routine QA tester.

## Mandatory interaction QA
For user-visible or interactive releases, run the repository's mobile WebKit QA before merge. The QA must use the real rendered application and real DOM interaction, not only source assertions.

Minimum coverage for the current product:
- open Board, Place and Aufträge through the real primary navigation;
- capture rendered screenshots for those views;
- exercise both a normal 390×844 mobile viewport and a deliberately short 390×720 Safari-like visible viewport;
- assert the app shell/navigation remains inside the visible viewport and normal Board play does not require document scrolling;
- prepare a deterministic synthetic ready order through the real persisted game state;
- tap the real `Jetzt servieren` button in WebKit;
- verify exact item consumption, coin reward, star reward, order replacement, order statistics and persisted state;
- verify navigation still works after delivery;
- fail on page/console errors relevant to the flow;
- upload screenshots and a machine-readable QA report even when the interaction test fails.

## Visual review gate
A green automated interaction test is necessary but not sufficient for visible releases.

Before merging a meaningful visual/UI change, the autonomous worker should inspect the latest generated screenshots itself when tooling permits. Obvious clipping, giant dead zones, overlapping content, broken hierarchy, unreadable labels or non-game/web-dashboard presentation are defects to fix without waiting for the owner to report them.

Real owner screenshots remain the highest-confidence device evidence, but they are a quality input and acceptance signal—not the normal mechanism for discovering basic interaction/layout defects.

## Current workflow
- Workflow: `.github/workflows/browser-qa.yml`
- Runner: Playwright WebKit in GitHub Actions
- Script: `scripts/browser-qa.mjs`
- Artifact: `mobile-webkit-qa`

The Browser QA workflow runs for pull requests and pushes to `main`.

## Release contract
For relevant releases:
1. exact PR head: normal CI green;
2. exact PR head: Browser QA green;
3. inspect generated mobile screenshots for meaningful UI changes;
4. merge;
5. exact merged `main`: normal CI green;
6. exact merged `main`: Browser QA green;
7. exact merged `main`: canonical Pages deploy succeeds;
8. only then call the release live.

WebKit automation approximates iOS Safari rendering/interaction but does not replace final physical-device evidence for platform-specific browser chrome, vibration/haptics or OS-level behaviors.
