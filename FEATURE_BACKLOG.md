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

3. [x] Combo XP Bonus
- Kill-streak timer grants temporary XP multiplier.
- Files: `src/systems/world/enemies.js`, `src/systems/progression/xp.js`, HUD.
- Smoke checks: streak start/expire behavior, reset on restart, XP math integrity.
- Status notes:
- Added combo runtime state (`comboKills`, `comboExpiresAt`, `comboXpMultiplier`) with reset wiring.
- Added kill-streak registration on enemy death and timeout-driven combo expiry.
- Centralized XP multiplier math in `gainXp()` so permanent + combo multipliers stack consistently.
- Added HUD combo readout (`K#`, multiplier, remaining timer) with active/boost styling.

4. [x] Relic Rarity
- Rarities: bronze/silver/gold with different value impact and VFX.
- Files: pickups/render/progression menu messaging.
- Smoke checks: rarity distribution, UI clarity, upgrade queue stability.
- Status notes:
- Added rarity roll at relic spawn (`bronze`/`silver`/`gold`).
- Added rarity-aware relic queue handling for stat upgrade menus.
- Added rarity-weighted stat option quality and rarity-labeled menu text.
- Added rarity-specific relic visual rings/glow intensity.
- Current refinement uses unbiased three-option sampling while rarity scales the selected stat gain.

### Survivor Progression Slice (Completed 2026-07-16)

- [x] Bounded stage and wave director
  - Added a 10-minute clear condition spanning 20 thirty-second wave profiles.
  - Added per-wave minimum populations, spawn cadence/tier profiles, one-time surge events, wave notices, and a 160-enemy standard/event population cap.
  - Added victory handling, clear-specific shard rewards, and result-aware run summaries.
- [x] Weapon/passive build structure
  - Classified upgrade lines as weapons or passives and capped level-up drafts at 6 owned weapons plus 6 owned passives.
  - Added seven passives alongside Magnet Field: Ember Sigil, Chronicle, Iron Ward, Kinetic Rune, Astral Lens, Windstep Boots, and Mending Charm.
  - Added shared Might/Cooldown scaling so permanent and in-run bonuses apply across supported weapon families.
- [x] Fixed stage relics and bounded XP drops
  - Added four fixed map relics for Ember Sigil, Chronicle, Iron Ward, and Astral Lens.
  - Stage relics directly add a rank and intentionally can exceed the passive draft cap; maxed relics convert to XP.
  - XP gems coalesce at the 300-orb cap so dense waves preserve XP without unbounded orb entities.
- [x] Boss caches and evolutions
  - Boss caches grant 1/3/5 rewards for bronze/silver/gold rarity.
  - Exhausted reward slots convert to end-run Arcane Dust shards, preserving the rarity's full reward count.
  - Wave 10 is the evolution gate; the gate is captured by the boss and carried into its dropped cache.
  - Added six max-weapon + paired-passive recipes: Inferno Salvo, Glacial Crown, Blade Tempest, Star Aegis, Tempest Lattice, and Singularity.
- [x] Progression UI, save migration, and test surface
  - Added kills, compact 6/6 loadout lists, live run notices, evolved-weapon stars, and victory/defeat summary fields.
  - Upgraded persistent save data to v2 with sanitized lifetime victory tracking and migration of older saves.
  - Added `?test=1`-guarded deterministic hooks, on-page controls, and `window.render_game_to_text`; normal URLs expose none of them.

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
9. [x] Meta Progression
- Persistent run currency + account upgrades via localStorage.
- Files: `src/systems/progression/metaProgression.js`, startup/meta UI, reset integration.
- Status notes:
  - Implemented shards, five permanent rank tracks, canonical save sanitization, purchase/reset UI, and run-summary rewards.
  - Save v2 records lifetime victories and rewrites older canonical saves without discarding valid ranks or shards.
  - Permanent Power/Tempo now route through global Might/Cooldown scaling instead of affecting only starter firebolts.

10. Enemy Factions
- Distinct enemy families with unique behavior patterns.
- Files: enemy data model, spawn tables, enemy AI, render telegraphs.

11. Skill Tree Progression
- Branching specialization tracks replacing flat choices.
- Files: progression UI architecture, upgrade data shape, queue flow.

12. Challenge Mode Pack
- Curated modes + daily seed support.
- Files: mode config, startup menu, RNG seeding, scoring.

## Playtest Polish / Tech Debt
1. [x] Fix active-run level display
- Resolved issue: HUD showed `LEVEL 0` after pressing Play even though the title baseline showed level 1.
- Files: `src/state/reset.js`, `src/systems/progression/xp.js`, `src/systems/ui/hud.js`.
- Smoke checks: new run starts at the intended visible level, first XP threshold still queues exactly one level-up, restart preserves the same baseline.
- Status: `resetGame()` now restores level 1, matching initial state and HUD presentation.

2. [ ] Reduce mobile HUD and control obstruction
- Issue: On narrow screens, the HUD, minimap, and zoom controls cover a large portion of the playfield.
- Files: `style.css`, `src/systems/render/minimap.js`, `index.html`.
- Smoke checks: 390px-wide viewport keeps player/enemy action readable, menu overlays still fit, zoom controls remain usable.

3. [x] Optimize enemy separation for dense waves
- Resolved issue: Enemy flocking checked every enemy against every other enemy each frame.
- Files: `src/systems/world/enemies.js`, optional shared spatial helper under `src/core/` or `src/systems/world/`.
- Smoke checks: early movement feel remains unchanged, dense enemy counts avoid frame spikes, separation remains readable near the player.
- Status: shared quadtree queries now bound enemy-neighbor separation work; bullet collision candidates use the same spatial index design.

4. [ ] Consolidate pointer and mouse movement handlers
- Issue: `mousedown`/`mousemove` and pointer events both drive the same mouse-target movement state.
- Files: `src/systems/input/controls.js`.
- Smoke checks: desktop mouse-hold movement works, touch movement works, releasing/canceling input always clears `input.mouseActive`.

5. [x] Replace random-sort shuffles
- Resolved issue: Upgrade and relic menus used `sort(() => Math.random() - 0.5)`, which gave biased random choices.
- Files: `src/systems/progression/upgradesMenu.js`, `src/systems/progression/relicMenu.js`, optional helper in `src/core/utils.js`.
- Smoke checks: level-up options remain capped at three, relic choices remain capped at three, no mutation of shared upgrade definition order.
- Status: `shuffledCopy()` uses Fisher-Yates sampling and is shared by level-up, relic, and boss-cache reward selection.

## Expected Data Model Growth
- `state`: `runModifiers`, `eventState`, `score`, `comboState`.
- Implemented state growth: active wave, kills, bosses defeated, evolution/stage-item counts, run result, and live notice state.
- Implemented player growth: global Might/Cooldown/recovery values plus upgrade/evolution ownership.
- Implemented entities: fixed stage items and richer boss/cache metadata; future factions/event objects remain optional.
- Implemented data modules: `waves.js`, `stageItems.js`, and `evolutions.js`; `enemyArchetypes.js` remains optional.

## Validation Gates
1. Parity baseline
- Run full checklist before and after each feature branch.

2. Feature-specific smoke tests
- Elite/Boss: spawn rates, reward logic, telegraph readability.
- Combo/Synergy: trigger/expire/reset correctness.
- Events/Curses: one-time apply and restart cleanup.
- Meta: save/load integrity and no state leaks.
- Stage/build: 20-wave timing, 160-enemy cap, 300-orb coalescing, 6/6 draft caps, and stage-relic cap bypass.
- Caches/evolutions: rarity reward counts, wave-10 gate, all six recipe prerequisites, single activation, and queue handoff.
- Test API: hooks exist only with `?test=1`, text snapshots remain parseable, and normal play exposes no test globals/UI.

3. Regression hotspots
- `src/state/reset.js` fully resets new mutable fields.
- `update()` and `draw()` contracts remain deterministic.
- Level/relic/cache queue behavior remains stable.
- `game.js` is rebuilt after source changes so HTTP module and `file://` fallback behavior stay aligned.
