# Poply – Binding Project Rules

These rules apply to all future Poply work unless the project owner explicitly changes them.

## 1. Hard project isolation
- Work only in `ys2mm422yb-max/poply` for Poply code/docs.
- Use only Poply's dedicated Neon project for Poply backend/database work.
- Never read from, write to, migrate, deploy to or otherwise modify DokoHilf or any unrelated project as part of Poply work.
- Never reuse another project's secrets, keys, migrations, tables, deployments, environments or test data.
- If a target resource cannot be verified as Poply-owned, do not modify it.

## 2. Permanent test link
- Canonical test URL: `https://ys2mm422yb-max.github.io/poply/`.
- Testable updates always return to this same URL.
- Do not use rotating preview URLs as the normal testing path.
- If deployment breaks, repair the canonical deployment instead of replacing the URL.

## 3. Binding product reset – 2026-08-13
Poply is no longer being developed as a connect-and-pop / chain puzzle game.

The former same-colour chain build is a historical prototype only. Autonomous workers must not continue polishing or expanding that mechanic unless the owner explicitly changes direction again.

The active product direction is a persistent **merge-and-build casual game**:
- persistent merge board,
- two identical same-tier items merge into one higher-tier item,
- generators create base/low-tier items,
- several orders/tasks request evolved items,
- delivering orders earns rewards,
- rewards visibly restore/build/upgrade a Poply place,
- progression unlocks new item families, generators, systems and places,
- short satisfying merges feed meaningful long-term progression.

`docs/GAME_DIRECTION_V2.md`, `docs/PRODUCT_VISION.md` and `docs/END_GOAL.md` are the active product target.

## 4. Originality / reference rule
Poply may learn from broad merge-and-meta genre structures such as merge boards, generators, item chains, orders, renovation/progression and events.

Do not reproduce another game's protected characters/story, artwork/icons, exact UI composition, exact item chains/order data, names/locations, sounds or branded presentation.

The target is an original Poply product in the same broad genre, not a direct copy.

## 5. Ownership and autonomy
- Routine implementation decisions may be made independently within the active Poply direction.
- Choose appropriate tests independently.
- Fix straightforward defects found during implementation/testing/visual review without separate approval.
- Prefer reviewable changes, but deliberate rebuilds are allowed when old architecture conflicts with the new direction.
- Do not introduce paid services or material recurring costs without explicit owner approval.

## 6. Continuous self-review
- At meaningful milestones independently review merge clarity, board usability, order flow, progression, visual polish, mobile UX, accessibility, responsiveness, performance and reliability.
- Prefer rendered screenshots/live builds over source-only judgments.
- Proactively fix obvious weaknesses; do not wait for the owner to list every issue.
- Compare releases against `docs/END_GOAL.md`, `docs/GAME_DIRECTION_V2.md` and `docs/VISUAL_DIRECTION.md`.
- The quality gate is not merely "works". The game should feel cohesive, tactile, understandable and rewarding.
- Board, orders and visible meta-progression must read as one game, not separate web panels.
- The owner is not the routine QA system. When browser/render tooling is available, autonomously generate and inspect representative mobile screenshots and exercise meaningful interactions before asking for device feedback.

## 7. Core merge rules
- The board persists between sessions.
- Items can be moved between valid open cells.
- Two identical mergeable items of the same family and tier combine into exactly one next-tier item.
- Invalid merges must never silently consume an item.
- Merge feedback must make the result obvious immediately.
- Generators create items according to data-defined families/rules.
- Generator charges/cooldowns must be understandable and testable.
- Early development prioritizes fun over aggressive energy restrictions.
- A full board must remain recoverable through fair tools such as storage, selling/removal, rewards or guided cleanup.
- Orders consume required items only when requirements are satisfied.
- Rewards and progression must be deterministic/testable.
- Item families, tiers, generators, orders and place progression should be data-driven.

## 8. Meta progression
- The merge board alone is not the complete product.
- Completing orders feeds visible progression.
- The current Poply place visibly changes as progress is earned/spent.
- Major milestones unlock meaningful new content: areas, item families, generators, characters, systems or places.
- Progress persists reliably after reload.
- Local-first progression is required before cloud sync.

## 9. Engagement and monetization
Replayability should come from discovery, collection, board optimization, short goals and visible growth.

Do not use hidden loss rigging, fake near-win manipulation, intentionally bad randomness before purchase offers, deceptive countdowns/fake scarcity or pay-to-win progression.

Energy/cooldowns, ads and purchases may be considered later only after the core loop is fun without them and only if they do not destroy the play loop.

## 10. Platform and responsive rules
- Support iOS/Android phones and tablets.
- Canonical web build remains usable in Safari on iPhone/iPad and Chromium-based Android browsers.
- Portrait is the primary mobile orientation.
- Tablet portrait/landscape must be intentionally composed, not stretched phone layouts.
- Respect safe areas, touch/drag interactions, reduced motion and performance constraints.
- Keep one shared implementation suitable for later native packaging.

## 11. Test policy
Testing is risk-based.
- Merge changes: deterministic tests for eligibility, evolution and item preservation.
- Generator changes: tests for generated families, charges/cooldowns and failure states.
- Order changes: tests for requirements, item consumption and rewards.
- Progression changes: tests for unlocks, restoration and persistence.
- UI/input changes: verify move/drag/merge interaction and mobile layout.
- Persistence/backend changes: verify successful read/write and failure recovery using Poply resources only.
- Database schema changes: use isolated Neon branching/testing first when practical.
- Deployment changes: verify the canonical test URL.
- Bug fixes: add regression coverage when practical.
- Responsive changes: check representative phone/tablet sizes when tooling permits.
- Meaningful user-visible or interactive changes must run the mobile Browser QA described in `docs/BROWSER_QA_POLICY.md` when the workflow is available.
- Browser QA must exercise real rendered interactions rather than only checking source/markup; important flows such as navigation and order delivery must fail CI when the visible control does not actually work.
- Browser QA must retain screenshot artifacts for representative mobile views, including a short Safari-like visible viewport; for meaningful visual releases the autonomous worker should inspect those generated screenshots before merge when tooling permits.

A compile/build pass alone is never sufficient for meaningful gameplay work.

## 12. Architecture
- Keep pure domain/game logic separated from rendering/UI.
- Prefer deterministic logic.
- Model item families, tiers, generators, orders and place progression as data/configuration.
- Keep dependencies minimal/pinned.
- Never commit secrets/private credentials.
- Client code must never contain database-owner/admin credentials.
- Backend follows least privilege.
- Keep the local game playable without Neon until online features genuinely need it.

## 13. Git and release
- `main` is the stable integration branch.
- Non-trivial work should normally use a branch and merge after appropriate checks.
- CI should run automatically for code changes.
- For meaningful user-visible/interactive releases, exact-head Browser QA is part of the merge gate when available, alongside normal CI.
- After merge, exact-main normal CI, Browser QA and canonical Pages deployment must succeed before calling the release live.
- Do not knowingly publish a failing build.
- Keep commit messages descriptive.
- When product direction changes permanently, update all standing project documents and automation prompts in the same change set.

## 14. Documentation
- `README.md` must match the active direction.
- `docs/GAME_DIRECTION_V2.md` = active mechanical/meta foundation.
- `docs/END_GOAL.md` = finished-product quality target.
- `docs/PRODUCT_VISION.md` = player promise/product loop.
- `docs/NEXT_STEPS.md` = execution priority.
- `docs/VISUAL_DIRECTION.md` = visual/UI quality target.
- `docs/BROWSER_QA_POLICY.md` = mandatory self-run mobile interaction/screenshot QA contract.

## 15. Data and privacy
- Use synthetic test data only.
- Collect only data needed for game functionality or justified product improvement.
- Do not add invasive tracking by default.
- Any analytics added later must be documented and privacy-conscious.
