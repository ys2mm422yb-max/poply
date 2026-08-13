# Poply – Next Steps

This roadmap is the standing execution order after the Connect-and-Pop core became playable. It is intentionally prioritized by player value rather than by feature count.

## Now – turn the prototype into a real game

1. **Varied level objectives**
   - Score plus collect-colour goals.
   - Long-chain goals.
   - Power-use goals.
   - Always show progress during play.

2. **Persistent progression**
   - Keep unlocked levels, best stars and best chain locally.
   - Resume the player's last selected unlocked level after reload.
   - Never lose progress because the page refreshed.

3. **Level path**
   - A compact playable level trail first.
   - Later evolve this into a polished level map/home screen without disrupting the fast play loop.

4. **Power system depth**
   - Make Blast and Prism easier to understand visually.
   - Add satisfying combinations between powers.
   - Balance how often powers can realistically be created and used.

5. **Game-feel pass**
   - Better chain anticipation while dragging.
   - Escalating sound/haptic/visual feedback for 3, 4, 5, 7+ chains.
   - Stronger but readable win celebration.
   - Polish refill/drop timing and perceived responsiveness.

## Next – make levels meaningfully different

6. **Board mechanics and blockers**
   - Introduce original blockers/targets gradually, one mechanic at a time.
   - Examples to prototype: bubbles to pop, locked cells, spreading goo, collectible stars that must fall to the bottom.
   - Every mechanic needs deterministic tests and a tutorial-level introduction.

7. **Level design system**
   - Move level definitions into dedicated data rather than hard-coding gameplay logic.
   - Support score, collection, chain, power and blocker goals.
   - Add balancing metadata without rigging outcomes.

8. **Difficulty curve**
   - Early levels teach and reward.
   - Mid levels require planning and power use.
   - Difficulty should adapt carefully only to preserve flow, never to manufacture losses or fake near-misses.

## Then – retention without dark patterns

9. **Daily challenge**
   - One fair daily board/challenge.
   - Cosmetic or mastery reward, not pay-to-win pressure.

10. **Streak / return reward**
    - Reward returning without harsh punishment for missing a day.

11. **Mastery and collection**
    - Stars, badges, cosmetic themes or piece skins.
    - Progress should feel meaningful without requiring purchases.

## Online/backend phase

12. **Neon-backed cloud progression**
    - Keep local play working first.
    - Add optional cloud save only when the local progression model is stable.

13. **Optional identity/auth**
    - Only if needed for cloud sync, events or cross-device progress.
    - Do not force accounts just to play.

14. **Events / leaderboards**
    - Add only after anti-cheat and privacy implications are understood.

## Release-readiness phase

15. **Installable PWA polish**
    - App icons, install behavior, offline shell where useful.

16. **Native packaging**
    - Package the same game implementation for iOS/iPadOS and Android rather than maintaining separate games.

17. **Device QA**
    - iPhone small/large portrait.
    - iPad portrait and landscape.
    - Android phone portrait.
    - Android tablet portrait and landscape.
    - Safe areas, touch, audio, haptics, reduced motion and performance.

18. **Store readiness**
    - Privacy disclosures, screenshots, icons, age rating, store metadata and production analytics only when justified.

## Permanent execution rule

At each meaningful release, choose the highest-priority unfinished item that materially improves Poply. Do not blindly add features. First fix any gameplay, clarity, responsiveness, visual-polish or reliability regression discovered in the current live build. Every release must continue using the canonical test URL:

`https://ys2mm422yb-max.github.io/poply/`
