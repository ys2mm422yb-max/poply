# Place Scene V2 — Café am Meer

Status: active visual rebuild for Issue #126.

## Goal
Make the first Place read as a living 2.5D world rather than a flat illustrated card. The authored SVG remains the source of truth, but depth, scale, lighting, motion and build staging must make restoration visibly transform the world.

## Visual contract
- explicit background, ground, midground and foreground depth planes;
- volumetric Café shell with side/plinth/roof depth cues;
- contact shadows and light separation for near objects;
- every restoration stage adds a materially sized authored scene group;
- terrace extends into the foreground as a perspective plane;
- seating and service objects occupy the foreground with stronger scale;
- subtle environmental/guest motion only where it reinforces life;
- exact built group receives the build reveal while the camera performs a restrained push;
- `prefers-reduced-motion` disables authored motion without hiding content.

## Acceptance
- deterministic Scene V2 unit tests;
- Mobile WebKit screenshots for stages 0–6 at 390×844 and 390×720;
- no document scroll or clipped Place controls;
- manual screenshot review is required before merge;
- reject stages that still look flat, unchanged or visually incidental;
- exact-head CI + Browser QA + Place03 + PWA green before merge;
- exact-main CI + Browser QA + Place03 + PWA + canonical Pages green after merge.
