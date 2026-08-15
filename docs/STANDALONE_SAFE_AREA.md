Status: urgent iOS installed-web-app layout contract.

Problem observed from a real installed Poply screenshot on iPhone: the Poply top HUD is rendered underneath the iOS status bar, colliding with the clock, Wi‑Fi and battery indicators. The header also compresses and overlaps internally because the brand, player-level badge, resource pills and menu button do not reserve safe-area space or enough responsive width.

Required contract:
- installed/standalone iOS must never place Poply HUD content inside the top safe area;
- the app may keep `viewport-fit=cover` and `black-translucent`, but `.app-shell`/`.topbar` must explicitly budget `env(safe-area-inset-top)`;
- the first grid row must include the safe-area height rather than forcing the HUD into a 56px row;
- the brand + player-level badge must not overlap resource pills;
- energy, coins, stars and menu stay readable at 390px and narrower;
- 390x844 and 390x720 remain one-screen with no document scroll;
- standalone QA must simulate a non-zero top safe area and assert the HUD begins below it.
