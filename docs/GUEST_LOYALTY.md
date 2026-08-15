# Poply Guest Loyalty

Status: active product slice.

Normal Orders now also build durable relationships with Poply's three existing original guests: Mika, Nora and Sam. Guest identity follows the same deterministic order/portrait sequence already used by the game.

Only a successful normal-order delivery or Daily Bonus Guest service increments the matching guest. Legacy saves start guest visits at zero because aggregate historical order counts cannot prove which portrait was actually served; migration grants no retroactive Coins.

Loyalty milestones:
- 0 visits: `Neu`
- 1 visit: `Bekannt` +25 Coins
- 5 visits: `Stammgast` +100 Coins
- 12 visits: `Lieblingsgast` +250 Coins

Rewards are automatic on the exact visit transition; there is no claim button, streak or new currency. Persisted `guestVisits` counts are the only new save data.

The existing Collection page shows a compact `STAMMGÄSTE` row with all three portraits, visit count, current loyalty title, next milestone and reward. This intentionally avoids a fifth main navigation tab or generic profile dashboard.

QA requires deterministic mapping/migration/milestone coverage plus real Mobile WebKit service → Collection → reload verification at 390×844 and 390×720 with no document scroll or navigation overlap.
