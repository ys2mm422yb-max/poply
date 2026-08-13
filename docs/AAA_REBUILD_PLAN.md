# Poply Places – Premium Foundation Rebuild

Status: ACTIVE / binding from 2026-08-14 until explicitly replaced by the owner.

## Why this rebuild exists

The current V2 prototype proved the basic direction (persistent merge board, generators, orders, rewards and place restoration), but the implementation accumulated multiple visual/runtime hotfix layers. Real iPhone screenshots repeatedly exposed the same classes of problems after each patch:

- Place and Orders views became oversized or mostly empty.
- UI overlays and menus fought for z-index/space.
- the board alternated between beige prototype styling and dark styling without a unified authored visual language.
- legacy/bootstrap/recovery/purpose/tab/viewport layers modified the same screen independently.
- a fix for one view frequently displaced another view.
- the result remained closer to a web prototype than a premium commercial casual mobile game.

This is an architectural/production-quality problem, not a request for another cosmetic CSS pass.

## Product direction stays the same

Poply remains an original merge-and-build casual game:

1. Produce low-tier items from generators.
2. Merge two identical same-family/same-tier items into the next tier.
3. Build the exact items requested by active jobs.
4. Deliver jobs for coins + restoration stars.
5. Spend restoration stars on a visible, named improvement of the current Poply Place.
6. See the Place change and unlock deeper item/order content.
7. Repeat with increasing variety, discovery and board strategy.

The player must always be able to answer: **“What am I making, who wants it, what do I earn, and what does that unlock/build?”**

## Target quality bar

“AAA” in this project means the presentation discipline of a top-tier commercial casual mobile game:

- authored hierarchy instead of stacked website cards,
- one coherent art/UI material language,
- crisp and readable at iPhone size,
- tactile drag/merge/generator/order/build feedback,
- no fake/no-op controls,
- no giant empty surfaces,
- no debug-looking outlines or placeholders,
- no low-resolution art stretched to fill the screen,
- every state communicates purpose and next action,
- every visible button does something meaningful,
- phone portrait feels intentionally composed rather than responsive by accident.

It does NOT mean copying another game's protected art, characters, exact layout, item chains, names, narrative, sounds or brand presentation.

## Architectural reset

### Live shell

The canonical build should load one current application runtime and one current application stylesheet for V2 presentation.

Historical V2 hotfix files may remain in the repository for history but must not be loaded by the canonical `index.html` once the rebuild ships.

The live shell must not require independent CSS/JS layers to separately patch:
- release,
- layout,
- board,
- focused views,
- tabs,
- purpose,
- recovery,
- viewport.

Those responsibilities belong to the current app runtime/style system with explicit state/view ownership.

### Domain logic

Keep pure merge/order/place logic in `src/v2-game.js` or a later dedicated domain module.

The renderer must not duplicate merge/order business rules.

### Persistence

One save key, one load/normalize/migrate path, one save path.

Migrations must be deterministic, idempotent and tested. Startup scripts must never independently mutate the same save in several passes.

### View model

The app owns exactly one active primary view:
- `board`
- `orders`
- `place`

Navigation changes the view in application state. CSS should render that explicit view; it must not infer behavior by stacking later overrides.

## View contracts

### Board – primary play view

Must fit normal phone portrait play without vertical page scrolling.

Visible at once:
- compact identity/resource HUD,
- compact current restoration target,
- compact job strip or job summary,
- complete interactive 7x7 board,
- 3-tab bottom navigation.

Board priorities:
1. items/generators,
2. requested-item guidance and real merge opportunities,
3. cells,
4. decorative chrome.

Empty cells visually recede. A mostly empty board must not read as a giant empty grid.

### Orders – work queue view

Must not be three giant cards floating in empty space.

Each job needs:
- customer identity,
- order title,
- requested item art + have/need,
- coin reward,
- restoration-star reward,
- clear ready/not-ready state,
- delivery action.

The view also shows the relationship to the current restoration target: jobs fund the next build.

### Place – emotional payoff view

Must not be a low-resolution hero image enlarged across most of the viewport.

The place image gets a controlled authored stage area. The rest of the view contains meaningful progression UI:
- current Place identity,
- completed/remaining restoration beats,
- current next build and star progress,
- visible milestone path (6 steps for the first Place),
- build button when affordable,
- concise explanation of what the build changes/unlocks.

Eventually each restoration beat must visibly alter the actual Place art. Until production art exists, the shell must still communicate the state cleanly without stretching temporary art.

## First-place progression

Café am Meer has six restoration beats:

1. Lichter
2. Neue Theke
3. Menüwand
4. Sitzecke
5. Meerterrasse
6. Poply-Schild

Every job pays restoration stars. Stars are never displayed as an abstract currency without the next required cost nearby.

Completing each restoration beat should eventually produce a visual scene change and at selected milestones unlock content.

## Content progression target

Current four-tier chains are a prototype minimum, not the final content depth.

Next content target after the foundation is stable:
- 3 item families,
- 6–8 tiers per main family,
- generator upgrade/evolution,
- controlled order difficulty by progression stage,
- onboarding orders that teach one mechanic at a time,
- no early order that becomes impossible through reasonable intuitive merging.

## Interaction quality gates

### Generator
- clearly looks tappable/productive,
- immediate dispense feedback,
- output destination obvious,
- no silent failure.

### Drag/move
- dragged item follows the finger,
- target previews move vs merge vs invalid,
- invalid drop returns cleanly,
- generator cannot accidentally be treated as an ordinary merge item.

### Merge
- anticipation on valid target,
- snap/compress,
- tier-up reveal,
- new item identity immediately readable,
- short haptic/audio hook where supported.

### Order delivery
- required items clearly leave board,
- reward visibly travels/counts into currencies,
- next restoration target reacts,
- replacement order arrives intentionally, not as a silent text change.

### Build/restoration
- build button explains missing stars when blocked,
- build has a distinct reward moment,
- restoration stage updates visibly,
- next target is revealed.

## Mobile quality gates

Primary QA target: iPhone-like 390x844 plus short Safari visual viewport.

Also check:
- 430x932 phone,
- 768x1024 tablet portrait,
- 1024x768 or equivalent tablet landscape.

A release fails if:
- any primary control is covered by browser chrome/safe area,
- Board primary play needs vertical page scrolling,
- Place art is visibly pixelated by over-scaling,
- Orders contain large unintentional dead zones,
- primary navigation is a no-op,
- menu overlays appear behind/in the wrong view,
- item art is clipped/blank/misaligned,
- loading/reloading changes or loses game state unexpectedly.

## Anti-circle rule

Do not keep layering hotfix styles/scripts onto a broken composition.

If two consecutive patches address the same class of layout/view bug, stop and simplify/rebuild the responsible layer before shipping another patch.

Before a release, compare against the last real-device screenshots and ask:
- Did the structural problem disappear?
- Did code complexity decrease or remain controlled?
- Is the next iteration easier, not harder?

If not, do not call it progress.

## Milestones

### R1 – Premium foundation (CURRENT)
- replace layered live shell with one app runtime + one app stylesheet,
- explicit Board / Orders / Place views,
- consolidated save/load/migration,
- preserve current player state,
- keep existing merge/order/build rules working,
- remove no-op primary systems,
- real interaction regression tests,
- cache-busted canonical deployment.

### R2 – Purpose and progression depth
- 6–8-tier item chains,
- staged order difficulty,
- generator progression,
- stronger onboarding and board economy,
- avoid dead/overmerge states.

### R3 – Production presentation
- production-quality coherent item assets,
- stage-specific Place artwork for restoration beats,
- merge/generator/delivery/build VFX and motion polish,
- sound/haptic identity,
- tablet composition.

### R4 – Meta systems
- collection/discovery,
- storage/board-pressure tools,
- next Place unlock,
- fair daily/return systems only after core play is proven.

## Release discipline

- fresh branch from current `main` for non-trivial work,
- exact-head PR CI must pass,
- merge only after review of changed files,
- exact resulting `main` CI must pass,
- `Deploy canonical test build` must succeed on the same commit,
- only then call the build live,
- automation stays paused during large overlapping rebuild work.

Canonical test URL remains:
`https://ys2mm422yb-max.github.io/poply/`
