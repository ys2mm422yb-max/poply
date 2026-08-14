# Poply – Feature Roadmap

Status: ACTIVE from 2026-08-14.

This document defines the feature-growth order after the core merge/restoration loop, Place 01, Place 02 and the fair energy system became playable. It complements `AAA_REBUILD_PLAN.md`: production quality keeps improving, but Poply must now gain real systems and long-term depth instead of repeatedly polishing the same three screens.

## Current playable baseline
Already live:
- persistent 7×7 merge board;
- four six-tier item families across two chapters;
- three generators including Sonnenkai/Tropenbar progression;
- three active customer orders;
- exact item consumption + coins + restoration stars;
- two Places with six restoration beats each;
- automatic fair energy regeneration with visible countdown;
- local save/resume and migrations;
- Board / Orders / Place navigation;
- sound, haptics, delivery/reward/restoration feedback;
- deterministic CI + Mobile WebKit Browser QA + screenshot review.

This is a strong vertical-slice foundation, not yet a full game.

## Product gaps to close
The main missing pillars are:
1. **Player identity/progression** — there is no persistent player level, XP path or meaningful unlock cadence.
2. **Collection/discovery** — players create many item tiers but have no satisfying record of what they discovered.
3. **Coin utility** — coins are earned but currently have too little strategic purpose.
4. **Board-pressure tools** — no storage/inventory or intentional space-management layer yet.
5. **Daily/repeatable goals** — no reason to return beyond continuing the current order/restoration loop.
6. **World structure** — two Places exist, but no authored map/place-select progression layer yet.
7. **Content pipeline/balancing** — content still needs stronger data-driven difficulty and pacing controls before many more Places are added.
8. **Cloud/release systems** — cross-device save, analytics, native packaging and store readiness remain later work.

# Priority milestones

## Milestone E – Player progression & discovery — NEXT
Goal: every meaningful action should advance the player beyond the current Place.

Build:
- persistent Player Level + XP;
- XP from orders, restoration milestones and major discoveries;
- visible level-up reward moment;
- an authored **Sammlung / Collection Book** that records every discovered item family+tier;
- undiscovered tiers show silhouettes/hints rather than full spoilers;
- generator and Place discoveries join the collection;
- level milestones unlock systems/content instead of arbitrary power spikes;
- first useful Coin sink introduced here or in Milestone F;
- save migration for all existing players;
- collection/XP browser QA and reload tests.

Acceptance:
- a player can answer “what am I progressing toward besides this current order?”;
- creating a new tier for the first time produces a satisfying discovery event;
- level progress survives reload and never loses existing value.

## Milestone F – Board strategy, storage & coin utility
Goal: board space becomes an intentional game decision without becoming frustrating.

Build:
- small persistent storage/tray outside the 7×7 board;
- start with a fair limited capacity, expandable through gameplay;
- Coins become useful for permanent non-pay-to-win utility such as selected storage expansions or producer improvements;
- safe sell/remove flow with clear confirmation/value;
- better board-full guidance;
- producer information panel showing output family and energy cost;
- controlled generator upgrades only if they create understandable value;
- deterministic board-pressure scenarios in QA.

Rules:
- never delete valuable items accidentally;
- no forced purchase to recover from a full board;
- board pressure should create choices, not soft-locks.

## Milestone G – Daily goals & return loop
Goal: give players a reason to return without manipulative streak pressure.

Build:
- three daily goals chosen from understandable actions (merge, deliver, discover, restore);
- one daily bonus customer/order;
- daily reward track with Coins/Energy/utility rewards;
- missed days do not destroy a long streak or punish the player;
- clear local-day reset rules and tests;
- optional weekly milestone only after the daily loop feels good.

Avoid:
- fake countdown urgency;
- punitive streak loss;
- forced ads or pay gates.

## Milestone H – World map / Poply Places progression
Goal: turn the two vertical slices into the beginning of a real world.

Build:
- authored Places map / chapter selector;
- Café am Meer and Sonnenkai visible as completed/current destinations;
- completion stars/progress per Place;
- revisit completed Places without losing current progress;
- clear unlock requirements for future Places;
- preview of the next destination without copying competitor maps.

Only after this system is solid:
- **Place 03** with a genuinely new production theme, art language and order pool.

## Milestone I – Third Place & content expansion
Goal: prove the chapter architecture scales without becoming repetitive.

Requirements for Place 03:
- own world/art direction;
- at least one genuinely new item family or producer behavior;
- six meaningful restoration beats;
- new customer/order combinations;
- a gameplay wrinkle that is readable and fair, not merely higher numbers;
- migration + browser QA + screenshot acceptance.

## Milestone J – Collection depth & achievements
Goal: make long-term ownership/discovery satisfying.

Build candidates:
- item mastery/discovery completion per family;
- guest book/customer collection;
- Place completion badges;
- non-grindy achievements;
- cosmetic rewards for meaningful milestones;
- profile/stat screen only when it contains genuinely useful progression.

## Milestone K – Economy & balancing tools
Goal: make progression tunable before broad live content.

Build:
- move order templates, rewards, generator output and Place costs into clearer data/config modules;
- automated progression simulations/tests;
- difficulty bands for order generation;
- pacing targets for energy, merges, orders and restoration;
- audit Coins, Stars and Energy so every currency has a clear purpose;
- no hidden rigging or dynamic difficulty that falsifies outcomes.

## Milestone L – Cloud save / account layer
Goal: protect progress and allow cross-device play.

Build only when the local schema is stable:
- dedicated Poply Neon-backed cloud-save model;
- optional account/sign-in;
- conflict-safe sync policy;
- local-first offline behavior;
- privacy-minimal data model.

No analytics/identity data beyond what is actually needed.

## Milestone M – Events / live content
Goal: add variety after the core progression is deep enough.

Candidates:
- themed limited order sets;
- temporary visual Place themes;
- fair event reward tracks;
- special customer stories;
- event-specific collection pages.

Do not start live events while the base game still lacks core depth.

## Milestone N – Native release readiness
- installable PWA quality pass;
- iOS/iPadOS + Android packaging from the same codebase;
- device QA matrix;
- app icons, launch assets, store screenshots and metadata;
- privacy disclosures;
- performance/battery/network audits;
- accessibility/reduced-motion checks.

# Immediate build order
Unless a real blocker/bug takes precedence, the implementation order is now:

1. **Milestone E1: Player XP + Level system**
2. **Milestone E2: Collection Book + discovery rewards**
3. **Milestone F1: Storage tray + first meaningful Coin sink**
4. **Milestone G: Daily goals / fair return loop**
5. **Milestone H: World map / Place selector**
6. **Milestone I: Place 03**

Production-quality Milestone B continues in parallel and remains screenshot-gated. A feature release may not use “more systems” as an excuse for cheap UI, broken mobile composition or weak feedback.

# Feature-selection rule
Before adding a feature, answer:
- What player problem does it solve?
- What new decision, motivation or reward does it create?
- Does it connect to the core loop rather than sit as a disconnected menu?
- Can it be tested deterministically?
- Can it fit the current mobile shell without returning to web-dashboard UI?

If those answers are weak, do not build the feature yet.

# Release rule
Every non-trivial feature ships through:
`fresh branch from main → implementation → deterministic tests → Mobile WebKit QA → screenshot self-review → PR exact-head green → merge → exact-main CI + Browser QA + Pages deploy`.

Canonical test URL remains:
`https://ys2mm422yb-max.github.io/poply/`
