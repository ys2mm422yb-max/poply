# Poply – Binding Project Rules

These rules apply to all future work on Poply unless the project owner explicitly changes them.

## 1. Hard project isolation

- Work only in GitHub repository `ys2mm422yb-max/poply` for Poply code.
- Use only Poply's dedicated Neon project for Poply backend/database work.
- Never read from, write to, migrate, deploy to or otherwise modify DokoHilf or any unrelated repository/database as part of Poply work.
- Never reuse another project's secrets, keys, migrations, tables, deployments, environments or test data.
- If a target resource cannot be verified as Poply-owned, do not modify it.

## 2. Permanent test link

- There is one canonical test URL: `https://ys2mm422yb-max.github.io/poply/`.
- Updates intended for testing must always be published back to this same URL.
- Do not make rotating preview URLs the normal user testing path.
- If deployment is temporarily broken, fix the canonical deployment instead of replacing it with a new long-term test URL.

## 3. Ownership and autonomy

- Routine implementation decisions may be made independently when they stay within the agreed Poply vision and `docs/END_GOAL.md`.
- Choose the tests that are appropriate for each change; do not ask the project owner to design the test strategy.
- Fix straightforward defects found during implementation, testing or visual review without waiting for separate approval.
- Prefer small, reviewable changes over large rewrites unless the core design itself is wrong.
- Do not introduce paid services or material recurring costs without explicit owner approval.

## 4. Continuous self-review and improvement

Self-review is a permanent part of development, not an optional extra.

- At every meaningful milestone, independently review the current Poply build for gameplay quality, visual polish, mobile usability, accessibility, responsiveness, performance and technical reliability.
- When a screenshot, live build or canonical test link is available, inspect the actual rendered result rather than judging only from source code.
- Identify obvious weaknesses and low-risk improvements proactively; do not wait for the project owner to point out every issue individually.
- Fix clear defects and usability problems as part of the same work when practical.
- Compare every meaningful release against `docs/END_GOAL.md`.
- The quality gate is not "works". The build should feel cohesive, immediately understandable, responsive and capable of producing a real "wow" reaction.
- If the interaction feels technically explainable but intuitively wrong, change the interaction instead of piling on tutorial text.
- If a UI looks like separate cards, controls or technical-demo pieces pasted together, keep iterating until the screen reads as one coherent game experience.
- After meaningful UI/gameplay releases, verify the canonical test link and use the rendered result to decide the next improvement pass.

## 5. Test policy

Testing is risk-based, not checkbox-based.

Minimum expectations:
- Game-rule changes: deterministic unit tests for affected rules and important edge cases.
- UI/input changes: verify the affected interaction and mobile layout.
- Persistence/backend changes: verify successful read/write behavior and failure handling against Poply resources only.
- Database schema changes: test on an isolated Neon branch first when practical, then apply only after verification.
- Deployment changes: verify the canonical test URL after deployment.
- Bug fixes: add a regression test when the bug can reasonably be reproduced automatically.
- Meaningful responsive UI changes: check representative phone and tablet sizes, including about 390x844, 430x932, 768x1024, 1024x1366 and one tablet landscape size when tooling permits.

A change is not considered finished merely because it compiles. The meaningful user path must work.

## 6. Core gameplay rules

Poply is a mobile-first connect-and-pop puzzle game designed for broad appeal.

- The primary interaction is direct same-colour chaining: the player drags through adjacent matching pieces and releases to pop the chain.
- A valid normal chain contains at least three matching pieces.
- Diagonal neighbouring pieces may be connected as well as horizontal and vertical neighbours.
- The player must never need to swap unrelated colours to create a valid move.
- Do not reintroduce classic swap-Match-3 as the default core mechanic unless the project owner explicitly changes direction again.
- The chain must be visible while dragging so the player's action and the game's interpretation stay obvious.
- The player may backtrack through the immediately previous piece while dragging without being punished.
- Early play should surface a real same-colour chain as a hint without taking control away.
- Five-piece chains create a meaningful Blast power piece.
- Seven-or-more-piece chains create a stronger Prism power piece.
- Activating powers must visibly clear multiple pieces and feel substantially stronger than a normal pop.
- If no valid chain remains after a move, the board must safely reshuffle into a playable state.
- Sessions should be short and satisfying, with strong moment-to-moment feedback and a clear level objective.
- Difficulty may adapt to maintain flow, but the game must not secretly rig outcomes to manufacture losses or fake near-misses.
- Monetization must not be pay-to-win or depend on deceptive dark patterns.
- Poply must have its own visual identity. Do not copy Candy Crush branding, art, level layouts, sounds or protected presentation.
- Avoid strongly gender-coded visual positioning; aim for modern, colorful and universal.

## 7. Platform and responsive rules

- Poply must work on iOS and Android phones and tablets.
- The canonical web build is the development/test baseline and must remain usable in Safari on iPhone/iPad and Chromium-based Android browsers.
- The layout must adapt intentionally between phone portrait, tablet portrait and tablet landscape; do not merely stretch a phone layout.
- Respect safe areas, touch targets, pointer/touch input and reduced-motion preferences.
- Keep the web codebase suitable for later packaging as native iOS/Android apps without maintaining separate game implementations.

## 8. Architecture rules

- Keep pure game logic separated from rendering/UI.
- Prefer deterministic logic that is easy to test.
- Keep dependencies minimal and pinned when added.
- Never commit secrets, database passwords, private keys or privileged tokens.
- Client code must never contain database-owner/admin credentials.
- Backend access must follow least privilege.
- Keep data models simple until a feature actually needs more complexity.

## 9. Git and release rules

- `main` is the stable integration branch.
- Non-trivial changes should normally be developed on a branch and merged after appropriate checks.
- CI should run automatically on pushes/PRs that affect code.
- Do not knowingly publish a failing build to the canonical test link.
- Keep commit messages descriptive enough to understand why the change exists.

## 10. Documentation rules

- Keep this file current when a permanent rule changes.
- Keep `README.md` useful as the entry point for the project.
- `docs/END_GOAL.md` is the standing product-quality target and must remain aligned with the owner's intent.
- Record important product decisions in `docs/PRODUCT_VISION.md`.
- Document backend/schema decisions when they become non-trivial.

## 11. Data and privacy

- Use synthetic test data only.
- Collect only data that is actually needed for game functionality or product improvement.
- Do not add invasive tracking by default.
- Any analytics added later should be documented and privacy-conscious.
