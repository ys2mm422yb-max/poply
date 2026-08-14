# Screenshot QA — Mobile viewport composition

Date: 2026-08-14
PR: #40 — Mobile polish: turn spare viewport into game surface
Baseline main: `f696a5cd2d249362448df4c460526eddf51d02da`
First accepted implementation head before this documentation commit: `3547d860ec093e6442e058a1307072d957b2fd37`
Browser QA run reviewed: `31838659655`

## Why this pass existed
The latest successful `main` screenshots were technically green but visually exposed two composition defects:
- the square Board ended early on portrait phones and left a large pale webpage-like dead zone before bottom navigation;
- the selected Orders service card ended early and left a large empty dark block before its footnote/navigation;
- `Gleiche Items zusammenziehen` wrapped beside Board count + Storage and was visibly clipped.

The pass deliberately changes no gameplay, economy, save or progression rules. It only uses spare phone viewport as authored game surface.

## Exact screenshots opened and reviewed
From PR-head Mobile WebKit artifact `mobile-webkit-qa`:
- `01-board-390x844.png`
- `03-orders-390x844.png`
- `04-board-short-safari.png`
- `06-orders-short-safari.png`
- `08-after-serve-short-safari.png`
- `40-storage-item-stored.png`
- `42-storage-short-safari.png`

## Accepted findings
### Board 390×844
- `Werkbank` and `Gleiches mergen` stay on one clean line with `8/49` and `Lager 0/4` beside them.
- The previous clipped/wrapped instructional copy is gone.
- The remaining portrait height continues as the same deep teal workbench material instead of reverting to a large pale empty webpage zone.
- The 7×7 Board remains the same playable square size; the visual fix does not distort cells merely to consume height.
- Bottom navigation remains completely separate and visible.

### Board 390×720
- The same title hierarchy stays intact on the short Safari viewport.
- The workbench surface still reaches cleanly toward the navigation without introducing document scrolling.
- Generator and item touch targets are unchanged.

### Orders 390×844
- The selected guest now occupies one full remaining service stage instead of an auto-height card followed by dead space.
- Customer portrait, requirement, rewards, purpose and disabled/ready delivery action read as one coherent game interaction.
- The extra height is used for breathing room inside the service stage rather than creating another card or filler widget.

### Orders 390×720
- The service stage compresses without clipping the requirement, rewards, purpose or delivery control.
- The footnote and bottom navigation remain visible.
- The short viewport no longer has the large empty block that was visible on the baseline screenshot.

### Post-delivery state
- `08-after-serve-short-safari.png` confirms Coin/Star/XP reward feedback remains readable above the recomposed service stage.
- The delivery toast does not cover the bottom navigation or hide the next selected order.

### Storage regression check
- `40-storage-item-stored.png` and `42-storage-short-safari.png` confirm the Storage drawer still opens over the new workbench continuation without navigation overlap.
- Storage slots, Coin upgrade, close action and Board-item row remain reachable.
- The pre-existing transient toast overlap with explanatory drawer copy is short-lived and does not hide a required action; it is not introduced by this pass.

## Decision
Accepted for merge after exact final documented-head CI + Browser QA are green.

This closes one specific Milestone-B composition defect only. It does **not** claim Poply has reached final AAA/premium visual quality; future screenshot-first passes should continue removing web/dashboard cues and strengthening authored game feel.