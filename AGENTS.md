# AGENTS.md

## Project Overview
- Single-page browser game (HTML5 canvas) in the Vampire Survivors style.
- No build tooling or framework; load `index.html` directly in a browser.
- Core files:
  - `index.html`: HUD, overlays, canvas, zoom controls.
  - `style.css`: layout/theme/overlay/button styles.
  - `game.js`: all runtime logic, state, rendering, input, progression.
- Assets:
  - Sprites in `sprites/` (player, enemies, relic chest, knife, health icon).
  - Background music `Glinting Gold.wav`.

## Architecture Summary (`game.js`)
- Top-level state buckets:
  - `state`: run/pause/time/wave and queued upgrade counters.
  - `input`: keyboard + mouse/pointer target movement state.
  - `player`: stats, unlock flags, timers/scalars for all weapon systems.
- Entity arrays:
  - World actors: `enemies`, `bullets`, `orbs`, `relics`, `healthPacks`.
  - Effect layers: `pulses`, `particles`, `chainArcs`.
  - Derived orbit positions each frame: `bladePositions`, `solarPositions`.
- Loop shape:
  - `requestAnimationFrame(loop)` drives `update(dt)`, `draw()`, `updateHud()`.
  - `update(dt)` exits early when `state.paused` is true (menus pause gameplay).
- Camera + world:
  - World bounds: `WORLD_WIDTH`/`WORLD_HEIGHT`.
  - Viewport size is zoom-aware (`VIEW_WIDTH`/`VIEW_HEIGHT`) and follows player via `camera()`.

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

## Combat and Progression Systems
- Baseline attack:
  - Auto-fired firebolts target `nearestEnemy()` via `shoot(dt)`.
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
  - Enemy death -> XP orb drop (+ optional health pack drop chance).
  - XP gain -> level queue (`state.pendingLevels`) -> `showLevelUp()`.
  - Relic pickup -> stat queue (`state.pendingStatUps`) -> `showStatUpgrades()`.
  - Queues chain correctly while paused (multiple level/relic rewards are handled in order).

## Enemy and Spawn Behavior
- Spawning:
  - `spawnEnemy()` places enemies near camera-edge margins.
  - Wave scales by elapsed time (`state.waveDuration`), affecting tier, HP, speed, spawn rate.
- Movement:
  - Seek player + separation flocking (`ENEMY_SEP_RADIUS`, `ENEMY_SEP_FORCE`).
  - Steering interpolation via velocity smoothing.
  - Knockback stored as decaying `knockX`/`knockY`.
  - Shock debuff slows movement and drives electric VFX.

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
  - `WORLD_WIDTH`, `WORLD_HEIGHT`, `VIEW_WIDTH`, `VIEW_HEIGHT`, `zoomLevels`.
- Enemy flocking:
  - `ENEMY_SEP_RADIUS`, `ENEMY_SEP_FORCE`.
- Player baselines in `player` object:
  - Core combat: `damage`, `fireRate`, `bulletSpeed`.
  - Defensive/mobility: `maxHp`, `speed`, `pickupRadius`.
  - Ability tunables: pulse/nova/blade/frost/chain/solar fields.
- Timers:
  - Global: `shootTimer`, `spawnTimer`, `pulseTimer`, `novaTimer`, `frostTimer`, `chainTimer`, `relicTimer`.

## Reset and State Hygiene Rules
- `resetGame()` is the source of truth for run initialization.
- Any new mutable gameplay variable should be:
  - Declared near related state.
  - Reset in `resetGame()` so restarts are deterministic.
- If adding a new upgrade line:
  - Add `player` fields, `upgradeDefs` entry, and reset logic together.
  - Ensure UI text and max levels are consistent with apply behavior.

## Development Guidelines
- Prefer minimal gameplay-affecting changes unless explicitly requested.
- Preserve feel of movement/combat cadence when tuning values.
- Keep single-file edits in `game.js` focused and localized.
- Avoid adding dependencies or build steps.

## Manual Test Checklist
- Start/restart flow and music behavior.
- Keyboard and mouse/touch movement.
- Zoom in/out controls and camera clamping at world edges.
- Enemy spawn pacing across early waves.
- XP pickup, level-up menu, repeated queued level choices.
- Relic spawn/pickup, stat menu, queued relic choices.
- Unlock/upgrade behavior for pulse, blades, frost, nova, chain, and solar orbs.
- Health pack drop/pickup and HP cap behavior.
- Game over transition and restart integrity.
