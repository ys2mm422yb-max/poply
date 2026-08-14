# Screenshot QA — Orders service vibrance

Date: 2026-08-15
Worker: `visual-automation`
PR: #60 — Visual: make Orders feel like a lit service stage
Start main: `6e01b1d5b353bc37566068b9663379678c08f97d`

## Baseline evidence
Opened from successful baseline Browser QA run `31845567414`, artifact `9235801226`:
- `03-orders-390x844.png`
- `06-orders-short-safari.png`

Baseline finding: the Orders hierarchy was functional and readable, but the selected service area read as one broad dark-teal slab. Customer, item and rewards lacked enough authored light/color separation.

## First implementation evidence
Exact implementation head before this documentation commit: `5262c4a8187e14cd386f9f72e7ec3ff9d3389c42`.
CI run `31848081646`: success.
Browser QA run `31848081578`: success.
Artifact `9236628515` downloaded and opened.

Actually opened:
- `03-orders-390x844.png`
- `06-orders-short-safari.png`
- `01-board-390x844.png` regression check
- `02-place-390x844.png` regression check

## Accepted visual findings
### Orders 390×844
- warm customer-side light and cool item/reward-side light break up the previous monochrome service slab;
- the requirement tile remains a bright tactile cream anchor;
- Coin reward reads gold while restoration Star reads pink/violet;
- selected guest is clearer without adding another panel layer;
- the existing service composition and bottom navigation remain intact.

### Orders 390×720
- the same color hierarchy survives the short Safari-like viewport;
- no clipping or overlap was introduced around requirement, rewards, purpose, delivery button, footnote or bottom navigation;
- the stage stays visually richer without consuming additional vertical space.

### Regression checks
- Board 390×844 keeps its one-screen Werkbank composition and existing family/generator treatment;
- Place 390×844 remains intact and keeps its brighter world-first hierarchy.

## Remaining visible debt
The three compact customer-choice cards still truncate order titles (`Morgenkaff…`, `Frisches G…`, `Kleine Pau…`). This predates the vibrance pass and remains a separate mobile-polish priority; it does not block this focused lighting/color change.

## Decision
First implementation version accepted visually. Merge remains blocked until this documentation commit's new exact head has fresh green normal CI + Browser QA and the final generated Orders screenshots are reopened/accepted.
