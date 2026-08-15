# Screenshot QA — Player milestone trophy rail

Date: 2026-08-15
PR: #73 — Visual: turn completed milestones into a colorful trophy rail
Start main: `d16b0ccdda7ba69ec008ef251cf8a82149f651b4`
First reviewed implementation head: `0369db5c2013354a13f60e10ed2d4e3d12479d4b`

## Why this pass existed
The current Player Level / milestone sheet was functionally correct and fitted both required phone heights, but its five completed milestones still appeared as five nearly identical dark-green rounded cards with the same gold border/progress treatment. The repeated framing made the bottom half of the sheet look more like a dashboard/checklist than a rewarding game progression surface.

## Baseline evidence actually opened
From successful `main` Browser QA run `31861732485`, artifact `9240812415`:
- `22-player-milestones-390x844.png`
- `23-player-milestones-short-safari.png`

Visible baseline findings:
- all five completed milestones used almost identical dark-green card material;
- repeated rounded borders dominated the hierarchy;
- the new Place badges and Level reward felt more authored than the milestone list below;
- 390×720 remained functional, but the repetition made the compact sheet visually dense.

## Implementation
Presentation only in `src/aaa-player.css` plus deterministic visual-contract coverage in `tests/aaa-player-visual.test.js`.

Completed milestones now form a connected trophy rail:
- five restrained authored completion accents: warm orange, aqua, gold, violet and mint;
- a thin multicolor vertical progression line connects the completed medal marks;
- completed marks are circular medal-like elements instead of repeated rounded squares;
- completed rows drop the heavy repeated border and use lighter transparent accent washes;
- milestone title/status/progress color follows the local accent without changing content or progression state;
- short-phone compaction is preserved;
- Reduced Motion removes decorative glow shadow.

No gameplay, save, economy, milestone derivation, Place03, Storage, Collection/Map or dynamic FX behavior changed.

## First implementation evidence actually opened
Exact head `0369db5c2013354a13f60e10ed2d4e3d12479d4b`:
- CI run `31862749833` — success
- Browser QA run `31862749869` — success
- artifact `9241110507` (`mobile-webkit-qa`)

Opened:
- `22-player-milestones-390x844.png`
- `23-player-milestones-short-safari.png`

## Accepted visual findings
### 390×844
- the milestone section no longer reads as five cloned dashboard cards;
- the connected medal rail gives the eye one clear progression path;
- five accent colors create reward rhythm without overpowering the gold Level/Place hierarchy above;
- title, subtitle, completion label and progress bar stay readable;
- the sheet remains fully separated from Bottom Navigation.

### 390×720
- all five milestone rows remain visible and readable;
- the rail compacts cleanly without increasing the sheet height;
- no milestone text, progress bar or completion label clips;
- no document scroll or Bottom Navigation overlap was introduced;
- the brighter accents remain distinct without turning the compact sheet into visual noise.

## Version decision
First implementation accepted. No rejected visual iteration was required.

This documentation commit changes no runtime behavior. Final merge acceptance still requires normal CI + full Browser QA on the final documented PR head, followed by exact-main CI + Browser QA + canonical Pages deploy after merge.
