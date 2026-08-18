# Poply – Mobile Browser QA Policy

Status: BINDING from 2026-08-14; cross-screen installed-phone layout gate added 2026-08-18.

## Why this exists
A real iPhone report exposed that the visible `Jetzt servieren` button did nothing even though unit/markup tests were green. Later real-device screenshots exposed a second class of defects: valid game states could individually pass feature QA while dynamic Place, Daily, Service-Ruf and Board surfaces overlapped or disappeared under the bottom navigation.

These classes of defect must be caught by Poply itself before the owner becomes the routine QA tester.

## Mandatory interaction and layout QA
For user-visible or interactive releases, run the repository's mobile WebKit QA before merge. The QA must use the real rendered application and real DOM interaction, not only source assertions.

Minimum coverage for the current product:
- open Board, Place and Aufträge through the real primary navigation;
- capture rendered screenshots for those views;
- exercise both a normal 390×844 mobile viewport and a deliberately short 390×720 Safari-like visible viewport;
- explicitly reproduce installed-iPhone safe areas (currently 47px top and 34px bottom) and require the app shell/dock to budget them;
- assert the app shell/navigation remains inside the visible viewport and normal Board play does not require document scrolling;
- run the dedicated cross-screen layout gate for Place Meerterrasse 10/11, Orders with Daily + Service-Ruf, and Board with Service-Ruf;
- require all visible direct layout rows to remain ordered without overlap;
- require Service-Ruf to be the single selected-card focus layer rather than visually competing with hidden Special/reward layers;
- require the 7×7 Board workbench to remain an exact square inside the real remaining Board track;
- prepare a deterministic synthetic ready order through the real persisted game state;
- tap the real `Jetzt servieren` button in WebKit;
- verify exact item consumption, coin reward, star reward, order replacement, order statistics and persisted state;
- verify navigation still works after delivery;
- fail on page/console errors relevant to the flow;
- upload screenshots and a machine-readable QA report even when the interaction test fails.

## Visual review gate
A green automated interaction/layout test is necessary but not sufficient for visible releases.

Before merging a meaningful visual/UI change, the autonomous worker must inspect the latest generated screenshots itself when tooling permits. Obvious clipping, giant dead zones, overlapping content, broken hierarchy, unreadable labels, distorted Board geometry or non-game/web-dashboard presentation are defects to fix without waiting for the owner to report them.

Real owner screenshots remain the highest-confidence device evidence, but they are a quality input and acceptance signal—not the normal mechanism for discovering basic interaction/layout defects.

## Current workflow
- Workflow: `.github/workflows/browser-qa.yml`
- Core runner: Playwright WebKit in GitHub Actions
- Base interaction script: `scripts/browser-qa.mjs`
- Installed safe-area script: `scripts/standalone-safe-area-qa.mjs`
- Cross-screen layout script: `scripts/mobile-layout-stability-qa.mjs`
- Artifact: `mobile-webkit-qa`
- Layout contract details: `docs/MOBILE_LAYOUT_STABILITY.md`

The Browser QA workflow runs for pull requests and pushes to `main`.

## Release contract
For relevant releases:
1. exact PR head: normal CI green;
2. exact PR head: Browser QA green, including installed safe-area and cross-screen layout gates;
3. exact PR head: relevant PWA / Place gates green;
4. inspect generated mobile screenshots for meaningful UI changes;
5. merge only the exact accepted head;
6. exact merged `main`: normal CI green;
7. exact merged `main`: Browser QA green;
8. exact merged `main`: relevant PWA / Place gates green;
9. exact merged `main`: canonical Pages deploy succeeds;
10. only then call the release live.

WebKit automation approximates iOS Safari rendering/interaction but does not replace final physical-device evidence for platform-specific browser chrome, vibration/haptics or OS-level behaviors.