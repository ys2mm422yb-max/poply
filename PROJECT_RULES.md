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
- Updates intended for testing must be published back to this same URL.
- Do not make rotating preview URLs the normal user testing path.
- If deployment is temporarily broken, fix the canonical deployment instead of replacing it with a new long-term test URL.

## 3. Ownership and autonomy

- Routine implementation decisions may be made independently when they stay within the agreed Poply vision.
- Choose the tests that are appropriate for each change; do not ask the project owner to design the test strategy.
- Fix straightforward defects found during implementation or testing without waiting for separate approval.
- Prefer small, reviewable changes over large rewrites.
- Do not introduce paid services or material recurring costs without explicit owner approval.

## 4. Continuous self-review and improvement

Self-review is a permanent part of development, not an optional extra.

- At every meaningful milestone, independently review the current Poply build for gameplay quality, visual polish, mobile usability, accessibility, responsiveness, performance and technical reliability.
- When a screenshot, live build or canonical test link is available, inspect the actual rendered result rather than judging only from source code.
- Identify obvious weaknesses and low-risk improvements proactively; do not wait for the project owner to point out every issue individually.
- Fix clear defects and usability problems as part of the same work when practical.
- For subjective design changes, preserve what already works and improve with purpose rather than changing things merely for novelty.
- Compare changes against the product vision: Poply should feel immediately understandable, polished, satisfying and increasingly like a real game rather than a technical demo.
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

A change is not considered finished merely because it compiles. The meaningful user path must work.

## 6. Game/product rules

Poply is a mobile-first Match-3 game designed for broad appeal.

- The core interaction must be immediately understandable.
- Sessions should be short and satisfying.
- Moment-to-moment feedback, combos and progression should create a strong "one more round" feeling.
- Difficulty may adapt to maintain flow, but the game must not secretly rig outcomes to manufacture losses or fake near-misses.
- Monetization must not be pay-to-win or depend on deceptive dark patterns.
- Poply must have its own visual identity. Do not copy Candy Crush branding, art, level layouts, sounds or protected presentation.
- Avoid visual positioning that is strongly gender-coded; aim for modern, colorful and universal.

## 7. Architecture rules

- Keep pure game logic separated from rendering/UI.
- Prefer deterministic logic that is easy to test.
- Keep dependencies minimal and pinned when added.
- Never commit secrets, database passwords, private keys or privileged tokens.
- Client code must never contain database-owner/admin credentials.
- Backend access must follow least privilege.
- Keep data models simple until a feature actually needs more complexity.

## 8. Git and release rules

- `main` is the stable integration branch.
- Non-trivial changes should normally be developed on a branch and merged after appropriate checks.
- CI should run automatically on pushes/PRs that affect code.
- Do not knowingly publish a failing build to the canonical test link.
- Keep commit messages descriptive enough to understand why the change exists.

## 9. Documentation rules

- Keep this file current when a permanent rule changes.
- Keep `README.md` useful as the entry point for the project.
- Record important product decisions in `docs/PRODUCT_VISION.md`.
- Document backend/schema decisions when they become non-trivial.

## 10. Data and privacy

- Use synthetic test data only.
- Collect only data that is actually needed for game functionality or product improvement.
- Do not add invasive tracking by default.
- Any analytics added later should be documented and privacy-conscious.
