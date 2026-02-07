# AGENTS.md

## Project Overview
- Single-page browser game (HTML5 canvas) in the Vampire Survivors style.
- No build tooling or framework; runs as native ES modules in the browser.
- Core files:
  - `index.html`: HUD, overlays, canvas, zoom controls.
  - `style.css`: layout/theme/overlay/button styles.
  - `src/main.js`: composition root and update/draw orchestration.
- Assets:
  - Sprites in `sprites/` (player, enemies, relic chest, knife, health icon).
  - Background music `Glinting Gold.wav`.

## Module Layout (`src/`)
- `config/`
  - `constants.js`: world, zoom, and enemy separation constants.
- `core/`
  - `dom.js`: canvas and UI element references.
  - `assets.js`: sprite/audio loading.
  - `camera.js`: camera position, zoom state application, resize handling.
  - `loop.js`: rAF loop driver (`configureLoop`, `loop`).
  - `utils.js`: generic math helpers (`clamp`, `distance`).
- `state/`
  - `gameState.js`: shared mutable runtime objects (`state`, `input`, `player`, `entities`, `orbitCache`, `timers`, `zoomState`).
  - `reset.js`: reset source of truth for a new run.
- `data/`
  - `upgrades.js`: weapon upgrade definitions and relic stat upgrades.
- `systems/`
  - `combat/`: targeting, projectiles, abilities, orbit cache updates.
  - `world/`: spawning, enemy simulation, pickups, transient effects lifecycle.
  - `progression/`: XP handling and level/relic menu flows.
  - `render/`: frame/world/effects/entities/minimap render passes.
  - `ui/`: HUD formatting and updates.
  - `input/`: key + mouse/pointer binding and target updates.
- `main.js`
  - Wires cross-system callbacks, owns `update()`/`draw()` orchestrator order, bootstraps listeners, and starts the loop.

## UI and Input Systems
- HUD fields: wave/time/hp/level/xp.
- Overlays:
  - `#instructions`: start screen + game over reuse.
  - `#levelup`: shared panel for level-up and relic stat selection.
- Zoom:
  - Discrete zoom levels in `zoomLevels` with `setZoomIndex()` and `applyZoom()`.
- Input:
  - Keyboard movement: WASD + Arrow keys.
  - Mouse/pointer movement: hold/capture and move toward world-space cursor target.
  - Input module: `src/systems/input/controls.js`.

## Combat and Progression Systems
- Baseline attack:
  - Auto-fired firebolts target `nearestEnemy()` via `shoot(dt)`.
- Enemy variants:
  - Rare elite enemies spawn with one affix: `fast`, `tank`, `volatile`, `leech`.
  - Elite enemies grant bonus XP on kill and have affix-specific visuals/behavior.
- Unlockable/upgradeable weapon lines (`upgradeDefs`):
  - Lightning Pulse (`pulseShockwave`)
  - Orbiting Blades
  - Frost Shards (`fireFrostShards`)
  - Arcane Nova (`novaShockwave`)
  - Chain Lightning (`chainLightning`)
  - Solar Orbs (orbiting damage)
  - Firebolt track upgrades
  - Magnet Field (XP orb attraction + pickup radius scaling)
- Relic stat upgrades (`statUpgrades`):
  - Heavy Rounds, Overclock, Sprint Boots, Iron Heart, Railcast.
- Progression flow:
  - Enemy death -> XP orb drop (+ health pack drop chance).
  - XP gain -> level queue (`state.pendingLevels`) -> `showLevelUp()`.
  - Relic pickup -> rarity-aware stat queue (`state.pendingStatUps`, `state.pendingRelicRarities`) -> `showStatUpgrades(rarity)`.
  - Queues chain correctly while paused (multiple level/relic rewards are handled in order).
  - Relic rarities (`bronze`, `silver`, `gold`) influence relic VFX and stat-upgrade option quality.

## Enemy and Spawn Behavior
- Spawning:
  - `spawnEnemy()` places enemies near camera-edge margins.
  - Wave scales by elapsed time (`state.waveDuration`), affecting tier, HP, speed, spawn rate.
  - Elite spawn chance scales by wave and caps at a max chance.
  - Mini-boss spawns every fixed wave interval (`state.nextBossWave` scheduler).
- Movement:
  - Seek player + separation flocking (`ENEMY_SEP_RADIUS`, `ENEMY_SEP_FORCE`).
  - Steering interpolation via velocity smoothing.
  - Knockback stored as decaying `knockX`/`knockY`.
  - Shock debuff slows movement and drives electric VFX.
  - Leech elites heal when damaging the player.
  - Volatile elites explode on death and can damage the player in radius.
  - Mini-bosses have larger hit radius/stats and guaranteed relic drop on death.

## Rendering Pipeline
- `draw()` order:
  - Background and world grid
  - Pickups/effects/projectiles
  - Enemies/player with shadowing and sprite fallbacks
  - Player HP ring
  - Minimap overlay (player + relic markers)
- Visual effects:
  - Bullet trails (fire/ice particles), enemy death blood particles.
  - Pulse/nova rings, chain arcs, shocked-enemy connective lines.

## Key Constants and Tunables
- World/camera:
  - `WORLD_WIDTH`, `WORLD_HEIGHT`, `zoomLevels`.
  - Runtime viewport/zoom state in `zoomState` (`viewWidth`, `viewHeight`, `zoom`, `index`).
- Enemy flocking:
  - `ENEMY_SEP_RADIUS`, `ENEMY_SEP_FORCE`.
- Elite enemies:
  - `ELITE_BASE_CHANCE`, `ELITE_WAVE_BONUS`, `ELITE_MAX_CHANCE`.
  - Affix tunables: fast speed multiplier, tank HP multiplier, leech heal factor, volatile radius/damage.
- Mini-boss:
  - `BOSS_WAVE_INTERVAL`, `BOSS_HP_BASE`, `BOSS_HP_WAVE_SCALE`.
  - `BOSS_SPEED_BASE`, `BOSS_SPEED_WAVE_SCALE`, `BOSS_RADIUS`, `BOSS_DAMAGE`, `BOSS_XP_REWARD`.
- Relic rarity:
  - `RELIC_BRONZE_CHANCE`, `RELIC_SILVER_CHANCE`, `RELIC_GOLD_CHANCE`.
- Player baselines in `player` object:
  - Core combat: `damage`, `fireRate`, `bulletSpeed`.
  - Defensive/mobility: `maxHp`, `speed`, `pickupRadius`.
  - Ability tunables: pulse/nova/blade/frost/chain/solar fields.
- Timers:
  - Grouped in `timers`: `shoot`, `spawn`, `pulse`, `nova`, `frost`, `chain`, `relic`.

## Reset and State Hygiene Rules
- `resetGame()` is the source of truth for run initialization.
- Any new mutable gameplay variable should be:
  - Declared near related state.
  - Reset in `resetGame()` so restarts are deterministic.
- If adding a new upgrade line:
  - Add `player` fields, `upgradeDefs` entry, and reset logic together.
  - Ensure UI text and max levels are consistent with apply behavior.
- Keep `state/gameState.js` as the only runtime state source; avoid duplicate shadow state in modules.

## Development Guidelines
- Prefer minimal gameplay-affecting changes unless explicitly requested.
- Preserve feel of movement/combat cadence when tuning values.
- Keep edits localized to the owning module under `src/`.
- Avoid creating circular imports; use callback setters (as done in progression modules) when needed.
- Avoid adding dependencies or build steps.
- Keep `update()` and `draw()` pass order identical unless intentionally changing gameplay/render behavior.
- Use `FEATURE_BACKLOG.md` for staged feature rollout planning (one feature per branch with parity gates).

## Runtime Notes
- Because the project uses ES modules, opening `index.html` via `file://` may fail with CORS restrictions.
- Run through a local HTTP server for manual testing, for example:
  - `python3 -m http.server 5500`
  - open `http://localhost:5500/`
- GitHub Pages is compatible with this module setup.

## Manual Test Checklist
- Start/restart flow and music behavior.
- Keyboard and mouse/touch movement.
- Zoom in/out controls and camera clamping at world edges.
- Enemy spawn pacing across early waves.
- Elite enemy affix behaviors (`fast`, `tank`, `volatile`, `leech`) and readability.
- Mini-boss appears on expected wave thresholds and always drops a relic on death.
- Relic rarity distribution and VFX readability (`bronze`/`silver`/`gold`).
- Relic menu title/options reflect rarity and queue order remains stable.
- XP pickup, level-up menu, repeated queued level choices.
- Relic spawn/pickup, stat menu, queued relic choices.
- Unlock/upgrade behavior for pulse, blades, frost, nova, chain, and solar orbs.
- Health pack drop/pickup and HP cap behavior.
- Game over transition and restart integrity.
