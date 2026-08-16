# Place Scene V2 — Café am Meer

Status: SHIPPED · PR #127 merged 2026-08-16.

## Goal
Make the first Place read as a living 2.5D world rather than a flat illustrated card. The authored SVG remains the source of truth, but depth, scale, lighting, motion and build staging must make restoration visibly transform the world.

## Shipped visual contract
- explicit background, ground, midground and foreground depth planes;
- volumetric Café shell with side/plinth/roof depth cues;
- contact shadows and light separation for near objects;
- every restoration stage adds a materially sized authored scene group;
- terrace extends into the foreground as a perspective plane;
- seating and service objects occupy the foreground with stronger scale;
- subtle environmental/guest motion only where it reinforces life;
- exact built group receives the build reveal while the camera performs a restrained push;
- `prefers-reduced-motion` disables authored motion without hiding content;
- completed 6/6 Café acceptance uses the real Places-map revisit state, not a synthetic hero-only state;
- the final `DANACH` teaser must remain fully readable at both canonical phone heights.

## Accepted exact-head evidence
Accepted PR head: `9133ef954d51671b306b0d485dea15f336dee447`.

- CI `31914022157` — success;
- Browser QA `31914022217` — success;
- Place 03 QA `31914022160` — success;
- PWA Update QA `31914022164` — success;
- Browser artifact `9254502284` manually opened and reviewed.

All 14 generated Scene V2 screenshots were opened: stages 0–6 at 390×844 and 390×720. Earlier green candidates were rejected for an artificial stage-6 state and for an ellipsized final `DANACH` teaser. The accepted set shows the real completed Café revisit and the full readable promise `Place 02: Sonnenkai · Tropenbar · Sonnenfrüchte` without overflow.

## Merge and post-merge verification
PR #127 merged as `3112b6d5e049539bd3d2ed9c3b75f6039ab9c72b`.

Exact release-main verification on that merge commit:
- CI `31914437255` — success;
- Browser QA `31914437232` — success;
- Place 03 QA `31914437491` — success;
- PWA Update QA `31914437200` — success;
- canonical Pages deploy `31914437244` — success.

Issue #126 is closed completed. Durable cross-worker handoff remains Issue #42.
