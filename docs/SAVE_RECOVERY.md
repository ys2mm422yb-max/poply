# Poply Save Recovery

Status: product reliability contract.

## Player problem
A single malformed or partially written local save must not silently wipe a player's whole Board, Places and progression back to a new game.

## Contract
- `poply-v2-state-1` remains the canonical local save key.
- `poply-v2-state-1-backup` stores the previous valid canonical save as a rolling recovery point.
- Every normal save first validates the previous canonical state; only a valid previous state may become the backup.
- The new canonical state is then written normally.
- On load, Poply uses the canonical save when it parses and migrates successfully.
- If the canonical save is malformed/unreadable, Poply attempts the rolling backup.
- A valid backup is migrated through the normal state migration path, returned to the game and written back into the canonical key so later saves continue normally.
- If neither copy is usable, Poply falls back to the normal deterministic initial state.
- Explicit `freshState()` / reset replaces both canonical and backup copies, so an old pre-reset game can never resurrect after a later corruption.

## Safety choices
- Recovery is local-first and introduces no backend, account, analytics, tracking or recurring cost.
- The backup deliberately lags the canonical save by one successful save during normal play. That bounds recovery loss while ensuring the backup is a previously known-valid state rather than the same potentially bad write.
- Existing saves migrate without schema changes; the first successful load/save seeds a backup automatically.

## Tests
`tests/aaa-state.test.js` proves:
1. consecutive saves keep the previous valid state in the backup;
2. corrupt canonical JSON restores the previous state and repairs the canonical key;
3. reset replaces both copies and prevents old progress from returning.

This reliability layer is intentionally invisible during healthy play. Browser QA remains a required release regression gate even though this slice adds no new visible UI.