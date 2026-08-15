# First Session Rebuild

Issue: #109
PR: #110
Start main: `a8fdca6076884882e1beed332994a7140b465e55`
Branch: `feature/first-session-alive`
Implementation screenshot-accepted head before documentation closeout: `f71a2fb909f2594de293b1e33b1fd580f2c18ab6`

## Player problem
The visible purpose loop made Poply easier to understand, but the first session still felt repetitive and Place 01 did not create enough desire to rebuild it. The player saw three similar one-item jobs, repeated Daily tasks and a largely static Café whose upgrades changed too little.

This rebuild optimizes for **events, variety, visible transformation and consequence**, not more explanation text.

## Core promise
The first minutes now demonstrate:

**merge → serve → immediate visible build → new gameplay possibility → richer order → stronger build → living Place**

The first real service grants exactly the 4 Stars needed for `Lichter`. Direct visible order repetition is prevented. Place upgrades progressively unlock broader order content and materially change the authored Café scene.

## Completed blocks
1. **First Session / Level 1 redesign** — authored opening with `Erster Kaffee` as the fast first payoff and two real combo jobs.
2. **Order variety and anti-repeat** — broader early Coast pool, stage-specific pools and duplicate/just-served-title avoidance.
3. **Place 01 visual transformation** — all six upgrades now have materially larger authored scene impact.
4. **Living world motion** — Café plants, light, steam, barista, guests, planters, flags and celebration details animate with Reduced Motion safety.
5. **Upgrade-driven gameplay unlocks** — Place 01 steps expose concrete order/content unlocks and build feedback surfaces the unlock.
6. **Daily Goal variety** — three contextual deterministic goal types with target variants; fixed daily merge+serve repetition removed and adjacent-day duplicate sets avoided when alternatives exist.
7. **UI cleanup + mobile visual QA** — actionable Board CTA, redundant progress/status surfaces removed, copy clipping fixed, dedicated First-Session WebKit QA added for 390×844 and 390×720.

## Opening contract
Fresh orders:
- `Erster Kaffee`: coffee tier 2, 50 Coins, 4 Stars;
- `Frühstück am Fenster`: bakery tier 2 + coffee tier 2, 90 Coins, 3 Stars;
- `Süße Begrüßung`: sweet tier 2 + bakery tier 2, 95 Coins, 3 Stars.

After the first service, a replacement order cannot reuse the just-served title or duplicate another currently visible title. Place 01 restoration stage determines which broader Coast order pool can appear.

## Place 01 restoration contract
- `Lichter` → warm scene lighting and evening combo-order unlock;
- `Neue Theke` → larger staffed counter, cups/steam and tier-3 order unlock;
- `Menüwand` → awning/menu identity and broader Café combinations;
- `Sitzecke` → inhabited seating and harder Coast orders;
- `Meerterrasse` → large deck/planters and premium Coast orders;
- `Poply-Schild` → final identity/celebration and Sonnenkai + Tropenbar unlock.

## Coordination boundary
Open PR #99 owns persisted Guest Loyalty / guest-visit Collection progression. This rebuild changes normal order selection/presentation but does not overwrite PR #99's persisted guest visit state or Collection loyalty UI.

## Visual acceptance
A green assertion alone is not acceptance. Several green or near-green heads were rejected after opening GitHub Actions screenshots because of a blank Daily ribbon, a clipped selected-order status pill, ellipsized purpose/unlock copy and a WebKit service-worker registration problem. Those findings and exact workflow/artifact IDs are logged in #109 and #42.

Final implementation candidate `f71a2fb909f2594de293b1e33b1fd580f2c18ab6` passed:
- CI `31896742437`;
- Browser QA `31896742395`;
- Place 03 QA `31896742407`;
- PWA Update QA `31896742449`;
- Browser artifact `9250054999`.

The generated First-Session screenshots `80`–`90` were opened and reviewed. The 390×844 Orders wrap issue found in the preceding candidate was removed by `f71a2fb…`. The fixed square 7×7 Board intentionally keeps its touch geometry rather than stretching cells to fill tall screens; the remaining lower band is atmospheric rather than another dashboard surface.
