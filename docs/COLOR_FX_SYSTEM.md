# Poply Color & FX System — Production Pass 1

Status: active implementation on `visual/color-fx-production-1`.
Date: 2026-08-14.
Coordination / screenshot findings: GitHub Issue #42.

## Why this exists
Real Mobile WebKit screenshots showed that Poply's structure is much stronger than the earlier prototype, but the visual language is still too restrained: large Board/Orders regions collapse into similar dark petrol values, production families do not own enough spatial color, and important reward moments feel clean rather than celebratory.

This pass is intentionally a **system**, not a pile of per-screen hotfixes.

## Static color ownership
`src/aaa-color.css` is one authored color-identity layer loaded after Mobile composition and before Motion. It does not replace layout or core component CSS.

It owns:
- ambient Board color pools;
- family-specific production pedestal materials;
- generator-specific color identity;
- family-specific merge/order cue color;
- subtle color rhythm across active Board job tickets.

Family direction:
- Coffee — warm coral / roasted amber;
- Bakery — honey / golden wheat;
- Sweet — rose / soft berry;
- Fruit — lime / fresh green with warm sunset support.

Generators must read as production landmarks rather than identical gold objects.

## Motion / effect ownership
`src/aaa-motion.css` remains the only gameplay-motion layer.

This pass strengthens:
- family-colored merge anticipation;
- merge ring + radial burst + rays;
- tier-up reveal saturation/brightness response;
- generator production pulse;
- item landing response;
- Coin and Star reward trails/arrival glow;
- restoration light sweep and badge color.

It also repairs the Café-am-Meer restoration feedback path: the UI applies `fx-restoration-reveal` to `.world-hero`; Place 01 must therefore have an authored `.place-coast .world-hero.fx-restoration-reveal` rule rather than relying on the obsolete `.scene-card` selector.

## Discovery ownership
`src/aaa-discovery.css` owns the discovery composition.

Each discovered family now changes the reveal palette. Discovery adds rays, sparkle points, a family-colored item ring and stronger item-pop response. It must feel like a meaningful first-time unlock rather than a generic notification card.

## Reduced motion
Every new animation must have a `prefers-reduced-motion: reduce` fallback. Static color identity remains; repeated breathing, sweep, burst and travel animations are disabled or collapsed.

## Screenshot gate
The Browser QA now includes `scripts/color-fx-qa.mjs`, which captures:
- `60-color-board-390x844.png` — static authored Board color;
- `61-color-merge-burst.png` — a real pointer merge during the active burst;
- `62-color-discovery-burst.png` — the resulting real first-time discovery;
- `63-color-board-short-safari.png` — 390×720 Board fit after the color pass.

The worker must actually open these images before merge. Green CSS/tests without visual inspection are not acceptance.

## Acceptance
- Board no longer reads as one broad petrol mass;
- Coffee/Bakery/Sweet/Fruit have visibly distinct production materials;
- generators are distinguishable by color before reading labels;
- a real merge produces a stronger, family-colored premium response;
- a first discovery looks celebratory and family-specific;
- Café-am-Meer restoration reveal visibly runs again;
- 390×844 and 390×720 retain the one-screen Board + Bottom Navigation contract;
- no regression to the legacy V2 patch stack.
