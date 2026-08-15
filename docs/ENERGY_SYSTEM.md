# Poply energy system

Status: ACTIVE implementation target from 2026-08-15.

## Why this exists
Energy should create understandable pacing without making normal return time feel wasted. The original shipped Place-02 build consumed Energy but did not regenerate it; that was fixed with a persisted two-minute clock. The next fairness problem is full Energy: if a player closes Poply at 40/40, ordinary regeneration time previously did nothing at all.

## Player-facing rule
- Base maximum Energy starts at **40**; earned Player-Level capacity upgrades may raise it.
- Every successful generator tap costs **1 Energy**.
- When below the cap, Poply restores **1 Energy every 2 minutes**.
- Regeneration continues while the page/app is closed by using a persisted refill clock.
- While normal Energy is full, the same deterministic two-minute intervals bank an **Energy Reserve**, up to maximal **5** points.
- Die Reserve ist **keine neue Währung** und keine manuell abholbare Belohnung. Sie ist nur gespeicherte Überlauf-Regeneration und wird automatisch zuerst genutzt, um verbrauchte Energy wieder aufzufüllen.
- A real generator action is still required; Reserve never creates items by itself and never lets Energy exceed the current Max-Energy cap.
- Spending from full Energy starts a fresh two-minute interval. Spending while already below full does not reset the running interval.

## Why Reserve is fair
The Reserve makes return time useful even when the player happened to leave at full Energy. It does not add an ad gate, purchase, premium currency, random refill, streak requirement, expiry timer or hidden boost. Five points is deliberately small: it softens wasted regeneration time without removing Board/Energy planning.

## Visibility contract
The top Energy pill must explain the system without a help page:
- below full Energy it shows the live `+1 in M:SS` countdown;
- at full Energy it shows the current `Reserve N/5` state;
- tapping the Energy pill opens a compact planning detail;
- at full Energy that detail shows `ENERGIE-RESERVE`, the exact stored amount, the next Reserve timing while not capped and the rule that Reserve is automatically used first;
- below full it still shows the deterministic full-recharge estimate, e.g. `Voll in ca. 10 Min`, plus any remaining Reserve state;
- the detail explicitly says regeneration continues offline;
- opening/closing the detail is state-neutral and never spends Reserve or changes the refill clock;
- when normal Energy or Reserve increases while the app is open, the Energy control may use the existing short restrained refill pulse;
- accessibility text states the exact Energy/Reserve state and the automatic-use rule.

A player must never have to guess whether Energy is bought, earned from orders, reset by reopening the game, restored over time, wasted at full, or how stored overflow will be used.

## Save compatibility
The existing storage key remains unchanged. Old saves without `energyReserve` gain an explicit zero Reserve without changing current Energy, Max Energy, Board, Coins, Stars, Orders, stats or Place progress. Existing saves without an Energy clock still keep current Energy and receive a valid clock. Reserve is persisted locally through the existing save path.

## Deterministic behavior
- At full Energy, each complete two-minute interval adds exactly one Reserve point until 5/5.
- At 5/5 Reserve, further full-Energy time creates no additional hidden value.
- If Energy is below max and Reserve exists, Reserve fills the deficit before ordinary timed regeneration is applied.
- Reserve use and timed regeneration may combine in one refresh, but Energy never exceeds Max Energy.
- The same persisted clock drives both normal regeneration and full-Energy Reserve banking.

## QA contract
Deterministic tests cover legacy Reserve migration, full-Energy banking, the 5-point cap, automatic Reserve use, combination with timed regeneration, next-point timing and no overflow beyond Max Energy. Mobile WebKit QA must:
- seed a synthetic full-Energy save with six elapsed minutes and prove it becomes `Reserve 3/5`;
- open the real Energy detail and verify 390×844 and 390×720 screenshots without clipping, document scroll or Bottom-Navigation overlap;
- perform a real generator tap and prove exactly one item is generated while Reserve drops 3→2 and Energy returns to full automatically;
- reload and prove the remaining Reserve persists.

Normal CI, Mobile WebKit Browser QA, generated screenshot review and exact-main deployment remain required before release.
