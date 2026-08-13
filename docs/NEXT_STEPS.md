# Poply – Next Steps

This roadmap replaces the old connect-and-pop roadmap after the 2026-08-13 product reset.

## Phase 0 – Freeze the legacy prototype
- Do not spend more time polishing the old chain/connect gameplay.
- Keep useful infrastructure: GitHub Pages, CI, responsive/PWA learnings, local persistence patterns and reusable effect/sound/haptic helpers.
- Remove/deprecate old chain-specific assumptions as V2 replaces them.

## Phase 1 – V2 domain foundation
1. Define data models for item families/tiers, generators, board items, orders, rewards, restoration steps and player progress.
2. Implement deterministic pure logic for movement, valid identical-item merges, tier evolution, board occupancy, order requirement checks and reward application.
3. Add unit tests before UI complexity.

## Phase 2 – First persistent merge board
4. Build a portrait-first persistent board with drag/tap movement.
5. Two identical items merge into one higher tier with no accidental item loss.
6. Create polished merge snap/reveal animation.
7. Add basic board-space handling and one safe sell/remove action.
8. Persist the board locally and restore it exactly after reload.

## Phase 3 – Item art and generators
9. Create an original Poply full-screen visual concept and production item-art pass before final UI polishing.
10. Start with 3 coherent item families and at least 6 meaningful tiers in the main chains.
11. Add 2 clearly different generators.
12. Make generator output, charges and cooldown behavior understandable/testable.
13. Keep aggressive energy gating out of the first playable proof.

## Phase 4 – Orders and rewards
14. Show 3 simultaneous orders.
15. Orders request actual board items.
16. Delivering an order consumes only the required items.
17. Reward immediately with coins + one meta-progression resource.
18. Add new-order generation with controlled difficulty.
19. Early order sequence doubles as onboarding.

## Phase 5 – Visible Poply Place
20. Build one original place scene.
21. Add 5–8 visible restoration/build steps.
22. Spend earned progression on those steps.
23. Each step visibly alters the scene.
24. Completion unlocks at least one new generator/item family or next area.

## Phase 6 – Cohesive game shell
25. Integrate board, orders, currencies and place scene as one mobile-game flow rather than stacked web cards.
26. Add clear transitions between Place view and Merge Board when needed.
27. Optimize phone portrait first.
28. Create intentional tablet portrait/landscape compositions.
29. Respect safe areas and touch ergonomics.

## Phase 7 – Feel / reward polish
30. Merge anticipation and snap.
31. Tier-up reveal.
32. Generator feedback.
33. Order-delivery animation.
34. Coin/resource collection.
35. Restoration/build reveal.
36. Sound/haptics hooks and reduced-motion behavior.

## Phase 8 – Content pipeline
37. Move item families, generators, orders and place steps into dedicated data/config files.
38. Add balancing tools/tests for order difficulty and progression pace.
39. Add inventory/storage once board pressure becomes meaningful.
40. Add locked/covered cells only if they create fun progression rather than clutter.

## Phase 9 – Retention, only after the core is strong
41. Daily orders/challenge.
42. Collection/discovery book.
43. Fair streak rewards.
44. Themed limited events.
45. Chests/timed rewards only if they add excitement rather than forced waiting.
46. Optional energy/cooldown economy only after playtests prove the core remains fun.

## Phase 10 – Online / backend
47. Neon-backed cloud save.
48. Optional identity/auth for cross-device sync.
49. Remote content configuration only when local data models are stable.
50. Privacy-conscious analytics if justified.

## Phase 11 – Release readiness
51. Installable PWA polish.
52. Native iOS/iPadOS + Android packaging from the same codebase.
53. Device QA across iPhone, iPad, Android phone and Android tablet.
54. Store screenshots, icons, privacy disclosures and metadata.

## Immediate implementation target
The next code milestone is **not another visual polish pass on the old game**.

It is a V2 vertical slice containing:
- persistent merge grid,
- identical-item merging,
- 3 item families,
- 2 generators,
- 3 simultaneous orders,
- delivery/rewards,
- one place with visible restoration steps,
- local save/resume,
- polished mobile interaction,
- tests for merge/order/progression/persistence.

## Permanent execution rule
At each meaningful release, first fix current gameplay/save/UX defects, then take the highest-priority unfinished V2 item. Do not drift back into the legacy connect-and-pop roadmap.

Canonical test URL remains:
`https://ys2mm422yb-max.github.io/poply/`
