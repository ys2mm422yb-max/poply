# Poply repository instructions

Before changing this repository, read `PROJECT_RULES.md` and `docs/PRODUCT_VISION.md`.

Hard constraints:
- This repository is only for Poply.
- Never touch DokoHilf or any other project's repository, database, secrets, deployment or infrastructure while working on Poply.
- Poply backend work must target only the dedicated Neon project identified in `docs/BACKEND.md`.
- Use the permanent test URL documented in `PROJECT_RULES.md`; do not replace it with rotating preview links.
- Choose and run tests based on the risk of each change. Game-rule changes require deterministic tests.
- Do not publish known failing builds.
- Do not commit secrets or privileged credentials.
- Keep game logic independent from UI where practical.
- Preserve Poply's own identity; do not copy Candy Crush assets, branding or level designs.
