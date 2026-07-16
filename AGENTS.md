# AGENTS.md

## Project Overview
- Single-page browser game (HTML5 canvas) in the Vampire Survivors style.
- Runs are bounded stages: survive 20 thirty-second waves (10 minutes) to clear the stage, or end early on defeat.
- No framework. Runtime supports both native ES modules (served via HTTP) and a bundled fallback for `file://` launch.
- Core files:
  - `index.html`: HUD, overlays, canvas, zoom controls.
  - `style.css`: layout/theme/overlay/button styles.
  - `src/main.js`: composition root and update/draw orchestration.
- Assets:
  - Sprites in `sprites/` (player, enemies, relic chest, knife, health icon).
  - Background music `Glinting Gold.wav`.

## Module Layout (`src/`)
- `config/`
  - `constants.js`: world, zoom, stage duration/wave count, build caps, population caps, reward gates, and enemy separation constants.
- `core/`
  - `dom.js`: canvas and UI element references.
  - `assets.js`: sprite/audio loading.
  - `camera.js`: camera position, zoom state application, resize handling.
  - `loop.js`: rAF loop driver (`configureLoop`, `loop`).
  - `utils.js`: generic math helpers (`clamp`, `distance`, unbiased `shuffledCopy`).
  - `testApi.js`: query-guarded deterministic test hooks and text snapshots.
- `state/`
  - `gameState.js`: shared mutable runtime objects (`state`, `input`, `player`, `entities`, `orbitCache`, `timers`, `zoomState`).
  - `reset.js`: reset source of truth for a new run.
- `data/`
  - `upgrades.js`: weapon/passive upgrade definitions and relic stat upgrades.
  - `evolutions.js`: six weapon/passive evolution recipes.
  - `stageItems.js`: four fixed-position stage relic definitions.
  - `waves.js`: the 20 wave profiles and their surge events.
- `systems/`
  - `combat/`: targeting, projectiles, abilities, orbit cache updates, and shared Might/Cooldown scaling.
  - `world/`: spawning, enemy simulation, pickups, transient effects lifecycle.
  - `progression/`: XP handling, build slot rules, level/relic/cache menus, evolutions, and persistent meta progression.
  - `render/`: frame/world/effects/entities/minimap render passes.
  - `ui/`: HUD formatting and updates.
  - `input/`: key + mouse/pointer binding and target updates.
- `main.js`
  - Wires cross-system callbacks, owns `update()`/`draw()` orchestrator order, bootstraps listeners, and starts the loop.

## UI and Input Systems
- HUD fields: wave/time/hp/level/xp/combo/kills.
- In-run UI:
  - `#loadout`: compact weapon/passive lists with current ranks and `6`-slot counts.
  - `#run-notice`: live region for wave, guardian, stage-relic, and build notices.
- Overlays:
  - `#menu-overlay`: title, meta-progression, and controls panels.
  - `#levelup`: shared panel for level-up choices, relic stat choices, and boss-cache rewards.
  - `#run-summary`: victory/defeat result plus wave, time, level, kills, evolutions, and shard rewards.
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
  - Starfall Barrage
  - Arc Mines
  - Molten Trail
  - Gravity Well
- Passive lines (`upgradeDefs`):
  - Magnet Field (XP orb attraction + pickup radius scaling)
  - Ember Sigil (Might), Chronicle (Cooldown), Iron Ward (max HP)
  - Kinetic Rune (projectile speed), Astral Lens (area), Windstep Boots (move speed)
  - Mending Charm (HP recovery)
- Build rules:
  - Level-up drafts allow at most 6 owned weapons and 6 owned passives; already-owned lines remain eligible for ranks.
  - Four fixed stage relics (Ember Sigil, Chronicle, Iron Ward, Astral Lens) grant a direct passive rank and intentionally may exceed the 6-passive draft cap.
  - A maxed fixed stage relic converts to XP instead of adding another rank.
- Global combat scaling:
  - `scaledDamage()` applies `player.mightMultiplier` across weapon families.
  - `scaledCooldown()` applies `player.cooldownMultiplier` across firing, abilities, orbit hit cadence, and trail placement.
- Relic stat upgrades (`statUpgrades`):
  - Heavy Rounds, Overclock, Sprint Boots, Iron Heart, Railcast.
- Progression flow:
  - Enemy death -> combo kill-streak refresh + XP orb drop (+ health pack drop chance).
  - XP orbs coalesce into an overflow orb once the 300-orb entity cap is reached, preserving accumulated XP while bounding entity count.
  - XP gain -> level queue (`state.pendingLevels`) -> `showLevelUp()`.
  - Relic pickup -> rarity-aware stat queue (`state.pendingStatUps`, `state.pendingRelicRarities`) -> `showStatUpgrades(rarity)`.
  - Boss death -> bronze/silver/gold cache -> 1/3/5 immediately applied rewards -> one confirmation panel. Exhausted reward slots convert to Arcane Dust shards.
  - Bosses spawned at wave 10 or later mark their eventual cache as evolution-capable. An eligible evolution requires a maxed base weapon and at least one rank of its paired passive; the evolution consumes one cache reward.
  - Queues chain correctly while paused (multiple level/relic rewards are handled in order).
  - Relic rarities (`bronze`, `silver`, `gold`) influence relic VFX and the magnitude of the chosen stat upgrade.
- Evolution recipes (`evolutionDefs`):
  - Firebolts + Ember Sigil -> Inferno Salvo
  - Frost Shards + Kinetic Rune -> Glacial Crown
  - Orbiting Blades + Astral Lens -> Blade Tempest
  - Arcane Nova + Iron Ward -> Star Aegis
  - Chain Lightning + Chronicle -> Tempest Lattice
  - Gravity Well + Magnet Field -> Singularity

## Meta Progression and Save Data
- `src/systems/progression/metaProgression.js` owns the localStorage-backed shard economy and permanent ranks.
- Save schema v2 adds sanitized `lifetime.victories` while migrating older saves through the existing canonical rewrite path.
- Victory grants the normal time/wave shard reward plus a clear bonus and increments lifetime victories; the meta panel displays runs, clears, and best wave.
- Permanent Power and Tempo feed the same global Might/Cooldown multipliers used by every supported weapon family.

## Enemy and Spawn Behavior
- Spawning:
  - `spawnEnemy()` places enemies near camera-edge margins.
  - The 20 profiles in `data/waves.js` define minimum live population, spawn interval, tier mix, and optional HP/speed modifiers.
  - Event waves inject one-time surge packs when a wave begins; regular spawning fills population deficits in small batches.
  - Standard and surge spawning respect `MAX_ENEMIES` (`160`) to bound dense-wave population.
  - Elite spawn chance scales by wave and caps at a max chance.
  - Mini-boss spawns every fixed wave interval (`state.nextBossWave` scheduler).
  - Wave 5/10/15/20 guardians drop boss caches; wave 10+ caches may evolve eligible weapons.
  - Reaching `STAGE_DURATION` (`600` seconds) clears remaining enemies and opens a victory summary.
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
- Combo XP:
  - `COMBO_TIMEOUT`, `COMBO_KILLS_PER_STEP`.
  - `COMBO_XP_BONUS_PER_STEP`, `COMBO_XP_MAX_BONUS`.
- Relic rarity:
  - `RELIC_BRONZE_CHANCE`, `RELIC_SILVER_CHANCE`, `RELIC_GOLD_CHANCE`.
- Stage/build limits:
  - `STAGE_DURATION`, `STAGE_WAVE_COUNT`, `MAX_ENEMIES`, `MAX_XP_ORBS`.
  - `MAX_WEAPON_SLOTS`, `MAX_PASSIVE_SLOTS`, `EVOLUTION_START_WAVE`, `RELIC_SPAWN_INTERVAL`.
- Player baselines in `player` object:
  - Core combat: `damage`, `fireRate`, `bulletSpeed`.
  - Global progression: `mightMultiplier`, `cooldownMultiplier`, `recovery`, `upgrades`, `evolutions`.
  - Defensive/mobility: `maxHp`, `speed`, `pickupRadius`.
  - Ability tunables: pulse/nova/blade/frost/chain/solar/starfall/mine/trail/vortex fields.
- Timers:
  - Grouped in `timers`: `shoot`, `starfall`, `spawn`, `mines`, `trail`, `vortex`, `pulse`, `nova`, `frost`, `chain`, `relic`.

## Reset and State Hygiene Rules
- `resetGame()` is the source of truth for run initialization.
- Any new mutable gameplay variable should be:
  - Declared near related state.
  - Reset in `resetGame()` so restarts are deterministic.
- If adding a new upgrade line:
  - Add `player` fields, `upgradeDefs` entry, `kind` (`weapon` or `passive`), and reset logic together.
  - Ensure UI text and max levels are consistent with apply behavior.
- New run statistics, notices, stage-item state, evolution flags, entities, and timers must also reset in `resetGame()`.
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
- `index.html` auto-loads `game.js` for `file://` launches and `src/main.js` for HTTP(S) launches.
- If you modify `src/` and run via `file://`, rebuild `game.js`:
  - `npx --yes esbuild src/main.js --bundle --format=iife --platform=browser --target=es2020 --outfile=game.js`
- Run through a local HTTP server for manual testing, for example:
  - `python3 -m http.server 5500`
  - open `http://localhost:5500/`
- GitHub Pages is compatible with this module setup.
- Test hooks are opt-in only:
  - Add `?test=1` to install `window.__arcaneTest`, `window.render_game_to_text`, and the on-page test controls.
  - Without the `test` query parameter, none of these globals or controls are installed.
  - Hooks cover run start/snapshot, upgrades/evolution setup, boss/cache setup, stage-item teleport, time/HP control, and deterministic victory checks.

## Manual Test Checklist
- Start/restart flow and music behavior.
- Ten-minute victory flow, wave-20 boundary, defeat flow, and result-specific run summary.
- Keyboard and mouse/touch movement.
- Zoom in/out controls and camera clamping at world edges.
- All 20 wave profiles, surge announcements/packs, population cap, and dense-wave pacing.
- Elite enemy affix behaviors (`fast`, `tank`, `volatile`, `leech`) and readability.
- Guardians appear at waves 5/10/15/20 and drop caches with correct bronze/silver/gold 1/3/5 reward counts.
- Overlapping world relics and boss caches open one modal at a time without dropping queued rewards.
- Wave-5 caches cannot evolve; wave-10+ caches evolve only a maxed weapon with its paired passive.
- Relic rarity distribution and VFX readability (`bronze`/`silver`/`gold`).
- Relic menu title/options reflect rarity and queue order remains stable.
- XP pickup, level-up menu, repeated queued level choices.
- XP orb coalescing preserves total XP at the 300-orb cap.
- Weapon/passive drafts enforce 6/6 ownership caps while still offering ranks for owned lines.
- Four fixed stage relics appear at their map positions, can exceed the passive draft cap, and convert to XP when maxed.
- All six evolution recipes activate once, update loadout presentation, and exhibit their evolved combat behavior.
- Combo streak start/refresh/expire behavior, restart reset, and XP multiplier stacking correctness.
- Relic spawn/pickup, stat menu, queued relic choices.
- Unlock/upgrade behavior for pulse, blades, frost, nova, chain, solar, starfall, mines, trail, and vortex.
- Health pack drop/pickup and HP cap behavior.
- Might and Cooldown affect all supported weapon families and stack with permanent meta bonuses.
- Kill HUD, loadout counts/ranks, live notices, victory/defeat summary, and mobile layout readability.
- Save v2 migrates older saves, preserves ranks/shards, records lifetime victories, and survives reset/reload.
- `?test=1` exposes guarded hooks/text snapshots; normal URLs expose neither.
- Game over/victory transitions and restart integrity.
