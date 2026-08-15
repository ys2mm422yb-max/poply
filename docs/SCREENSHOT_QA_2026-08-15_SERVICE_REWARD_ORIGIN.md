# Screenshot QA — Service-sourced reward payoff

Date: 2026-08-15
Worker: `visual-automation`
PR: #100 — `Visual: source service rewards from the served guest`
Start main: `cabfb7797b5e8647d24499e5eb9c02f1a846dfa4`
First reviewed exact PR head: `55d7bdc8c7317f3a7cd9b843a8569a17f52fcb6b`
Browser QA: `31880419475` — success
Artifact: `mobile-webkit-qa` `9245904765`
Artifact digest: `sha256:ed982a570e4f1538355e6ab62a5797d70a767f3cc1b84535811d0700521f8ff1`

## Player-facing problem
The normal order flow already animated item delivery and Coin/Star travel, but the reward travel was sourced from the top Star HUD after rerender. That made the payoff read backwards: the interface looked as if rewards came from the HUD instead of the customer/service moment that earned them.

## Focused change
- Snapshot the served service card's real reward position before the order rerenders.
- Source Coin and Star travel from that preserved service position.
- Add a compact warm-gold / pink source pulse and distinct Coin/Star token colors.
- Keep the effect pointer-transparent and preserve Reduced Motion by disabling/hiding transient reward travel there.
- Do not change reward amounts, order requirements, save state, economy, touch geometry or progression semantics.

## Exact-head automated gates on first reviewed head
- CI `31880419476` — success.
- Browser QA `31880419475` — success.
- Place 03 QA `31880419471` — success.
- PWA Update QA `31880419480` — success.

## Screenshots actually opened
From artifact `9245904765`:
- `03-orders-390x844.png`
- `06-orders-short-safari.png` — 390×720
- `07-before-serve-short-safari.png` — real ready-order state immediately before tapping `Jetzt servieren`
- `08-after-serve-short-safari.png` — real settled state after delivery/reward persistence

## Visible findings
### 390×844
- Orders still keeps clear customer, requirement, Coin, Star, purpose and delivery hierarchy.
- No new clipping or bottom-navigation collision was introduced by the reward-origin layer.
- The service surface remains the visual source context for normal order rewards rather than the global HUD.

### 390×720
- The real ready state keeps `Jetzt servieren`, customer, required item and both rewards fully visible above the navigation.
- The real post-delivery state shows the correct settled resources (`+45 Coins`, `+2 Stars`, `+60 XP` represented by updated HUD/progression state) and the next order without overlap or document-scroll break.
- The source pulse and reward flights are deliberately transient; the current Browser-QA screenshots capture the stable before/after states rather than freezing the sub-second pulse. Source correctness is additionally locked by deterministic UI/game-feel tests that forbid the previous HUD-Star origin.

## Visual decision
**Accepted first implementation.** No visual iteration was rejected on the reviewed head. The new source treatment is restrained and does not compete with the green service CTA or customer portrait. The stable before/after screenshots show no regression on either required phone height.

## Synchronization note
`main` advanced after the first reviewed head through save-recovery PR #101. That commit touches only save-recovery files, but the final PR head must still be synchronized onto the new exact `main` and rerun through CI + Browser QA. This document becomes final only after those exact synchronized-head gates are green and the relevant screenshots are reopened.