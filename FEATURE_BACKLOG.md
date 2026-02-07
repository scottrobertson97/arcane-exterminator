# Feature Backlog

This backlog defines a staged rollout for future gameplay features.

## Delivery Rules
- Keep strict parity for unrelated systems.
- Ship one feature per branch.
- Run parity checks before and after each feature.
- Keep update and draw orchestration order stable unless the feature explicitly requires expansion.

## Priority Backlog

### Quick Wins
1. [x] Elite Enemies
- Affixes: `fast`, `tank`, `volatile`, `leech`.
- Files: `src/systems/world/spawning.js`, `src/systems/world/enemies.js`, `src/systems/render/entities.js`.
- Smoke checks: spawn frequency, affix readability, no baseline spawn regressions.
- Status notes:
- Implemented affix-specific behavior and elite spawn chance scaling.
- Added elite visual rings by affix and volatile death pulse telegraph.
- Added elite XP bonus on kill.

2. [x] Mini-Boss Every N Waves
- Boss waves: 5, 10, 15...
- Guaranteed relic drop on boss death.
- Files: world spawning/enemies/render, relic drop flow.
- Smoke checks: one boss per threshold, reward consistency, pacing impact.
- Status notes:
- Added boss wave scheduler using `state.nextBossWave`.
- Added dedicated boss spawn path with larger stats/radius and visual telegraph.
- Added guaranteed relic drop at boss death position and boss XP reward.

3. Combo XP Bonus
- Kill-streak timer grants temporary XP multiplier.
- Files: `src/systems/world/enemies.js`, `src/systems/progression/xp.js`, HUD.
- Smoke checks: streak start/expire behavior, reset on restart, XP math integrity.

4. Relic Rarity
- Rarities: bronze/silver/gold with different value impact and VFX.
- Files: pickups/render/progression menu messaging.
- Smoke checks: rarity distribution, UI clarity, upgrade queue stability.

### Mid-Scope
5. Biome Zones
- Region-based spawn flavor and visual tinting.
- Files: world constants/spawn/render/minimap.

6. Curse System
- Start-of-run modifiers (more enemies, enemy speed, reduced healing) with score bonus.
- Files: startup UI, state/config, spawning/enemies, scoring.

7. Weapon Synergy Perks
- Hidden conditional bonuses based on upgrade combinations.
- Files: `src/data/upgrades.js`, combat systems, menu copy.

8. Objective Events
- Timed objectives (beacon defense, cursed nest clear, storm survive).
- Files: state/event orchestration, world spawning, HUD/event UI.

### Roadmap Bets
9. Meta Progression
- Persistent run currency + account upgrades via localStorage.
- Files: new `src/systems/meta/*`, startup UI, reset integration.

10. Enemy Factions
- Distinct enemy families with unique behavior patterns.
- Files: enemy data model, spawn tables, enemy AI, render telegraphs.

11. Skill Tree Progression
- Branching specialization tracks replacing flat choices.
- Files: progression UI architecture, upgrade data shape, queue flow.

12. Challenge Mode Pack
- Curated modes + daily seed support.
- Files: mode config, startup menu, RNG seeding, scoring.

## Expected Data Model Growth
- `state`: `runModifiers`, `eventState`, `score`, `comboState`.
- `player`: synergy flags/counters, optional persistent multipliers.
- `entities`: optional `bosses`, `eventObjects`, richer enemy metadata (`isElite`, `affix`, `faction`).
- `data/upgrades.js`: conditional/synergy definitions.
- Optional: `src/data/enemyArchetypes.js`, `src/systems/meta/*`.

## Validation Gates
1. Parity baseline
- Run full checklist before and after each feature branch.

2. Feature-specific smoke tests
- Elite/Boss: spawn rates, reward logic, telegraph readability.
- Combo/Synergy: trigger/expire/reset correctness.
- Events/Curses: one-time apply and restart cleanup.
- Meta: save/load integrity and no state leaks.

3. Regression hotspots
- `src/state/reset.js` fully resets new mutable fields.
- `update()` and `draw()` contracts remain deterministic.
- Level/relic queue behavior remains stable.
