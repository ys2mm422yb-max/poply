# Café am Meer — Progression Payoff

Status: candidate on `fix/place-progression-payoff`.
Durable coordination: Issue #42.

## Why this exists
Real-device review after Guest-Life PR #171 showed that the Café systems are functionally connected but the emotional payoff is still too weak: stage 2/6 can read like the same café plus a counter and standing people, and the legacy animated `cafe-steam` geometry can render like moving smoke across the counter front.

This pass is not a new progression system. It deliberately extends the shipped contracts instead of rebuilding them:
- PR #127 — Café Scene V2 remains the authored six-stage scene foundation and build-camera/reveal system;
- PR #158 — all six upgrades keep their existing real gameplay benefits and costs;
- PR #166–#171 — Mika/Nora/Sam Guest-Life remains the only customer-life layer; no parallel NPC simulation is added;
- Board, Orders, rewards, Stars/Coins/XP/Energy, save schema and Neon are unchanged.

## Product contract
The player should be able to feel the Café becoming more complete without reading the build card. Restoration must change the visual weight of the world, not just its number.

### 0/6 → 1/6 · Lichter
The previously calmer shell gains clearly stronger warm light, bulb glow and under-eave illumination.

### 1/6 → 2/6 · Neue Theke
The counter becomes a stronger service focal point through material contrast, depth and cup detail. The ambiguous moving steam/smoke is visually suppressed. During a real stage-2/3 served-guest payoff, the cups and counter light up briefly instead.

### 2/6 → 3/6 · Menüwand
The menu board/canopy becomes a distinct new focal area with stronger authored contrast and highlights. The existing `Gastwahl` gameplay benefit remains unchanged.

### 3/6 → 4/6 · Sitzecke
Tables/chairs gain stronger foreground depth and material separation. Existing Guest-Life seating behavior remains the behavioural payoff: served recurring guests can now visibly settle into the built seating.

### 4/6 → 5/6 · Meerterrasse
The terrace reads as a warmer foreground destination with stronger deck/planter/service-cart separation. Existing terrace guest routing remains intact.

### 5/6 → 6/6 · Poply-Schild
The finished Café receives stronger sign/flag/celebration-light presence so completion reads as a destination, not one more small prop.

## Service-effect replacement
PR #171 correctly removed permanent generic smoke by tying `.cafe-steam` to a real service state. Real iPhone evidence still showed the animated steam paths in an ambiguous position across the counter front. This pass deliberately replaces the *visible* part of that contract:
- the legacy SVG `.cafe-steam` marker may remain in markup for backward compatibility/state tests;
- it is visually suppressed at all times;
- a real stage-2/3 served guest instead triggers a short cup/counter glow at the actual service point;
- no new timer, gameplay state or persistence field is introduced;
- Reduced Motion removes the new service/build animations.

## Acceptance
- normal deterministic CI green;
- existing Guest-Life, Place Scene V2, Purpose, Place Powers, PWA and Place03 regressions remain green;
- new static contract test proves the payoff layer loads after Guest-Life, hides ambiguous steam and includes all six authored upgrade beats;
- Scene V2 stage 0–6 screenshots at 390×844 and 390×720 are generated and actually opened;
- stage 2 must show no visible moving/white steam curves on the counter in idle or service screenshots;
- stage-to-stage changes must be visibly material, especially 1→2, 2→3, 3→4 and 4→5;
- no document scroll, dock overlap or text-size regression;
- exact-head four-gate acceptance before merge;
- after merge, exact-main CI/Browser/PWA/Place03 and canonical permanent-link release verification are required before calling it live.
