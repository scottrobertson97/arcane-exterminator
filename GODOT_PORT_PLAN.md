# Godot Port Plan

Assumption: "gotdot" means Godot.

## Target

- Port Arcane Exterminator from the current browser canvas runtime to Godot as a 2D top-down survivors-style game.
- Keep the existing browser version intact until the Godot build reaches feature parity.
- Use Godot 4.x, with Godot 4.7 stable as the current baseline target. The official Godot archive lists `4.7-stable` as stable on 18 June 2026, while `4.7.1` is still `rc1` as of 1 July 2026: https://godotengine.org/download/archive/
- Use GDScript first. This project is gameplay-heavy but not large enough to justify C# unless future profiling proves a specific hotspot needs it.
- Prefer custom gameplay math over Godot physics for core enemy/player combat parity. Use Godot nodes for scene structure, rendering, input, audio, UI, and export.

## Non-Negotiable Parity Goals

- Preserve the current run feel: player speed, camera scale, spawn pacing, enemy pressure, auto-target cadence, pickup rhythm, and upgrade timing.
- Preserve the current state contracts:
  - `resetGame()` behavior becomes the Godot run reset source of truth.
  - `state`, `player`, `entities`, `timers`, and `orbitCache` become explicit Godot runtime resources or autoload-owned objects.
  - Level and relic reward queues must remain stable while paused.
  - Meta progression must remain versioned and sanitized before use.
- Preserve all live weapon lines, including the newer area-control weapons:
  - Firebolts
  - Lightning Pulse
  - Orbiting Blades
  - Frost Shards
  - Arcane Nova
  - Chain Lightning
  - Solar Orbs
  - Starfall Barrage
  - Arc Mines
  - Molten Trail
  - Gravity Well
- Preserve all current enemy/reward systems:
  - Normal and tier 2 enemies
  - Elite affixes: `fast`, `tank`, `volatile`, `leech`
  - Mini-boss wave scheduler and guaranteed relic drops
  - Combo XP multiplier
  - Bronze, silver, and gold relic rarities
  - Health pack drops
  - Shard-based meta progression

## Recommended Godot Project Shape

Create the Godot project under `godot/` so it can coexist with the browser version during the port.

```text
godot/
  project.godot
  assets/
    sprites/
    audio/
  scenes/
    Main.tscn
    world/World.tscn
    player/Player.tscn
    enemies/Enemy.tscn
    pickups/XpOrb.tscn
    pickups/Relic.tscn
    pickups/HealthPack.tscn
    projectiles/Bullet.tscn
    ui/Hud.tscn
    ui/MenuOverlay.tscn
    ui/LevelUpPanel.tscn
    ui/RunSummary.tscn
  scripts/
    autoload/GameState.gd
    autoload/SaveService.gd
    autoload/UpgradeCatalog.gd
    config/RunConstants.gd
    main/Main.gd
    player/PlayerController.gd
    systems/RunDirector.gd
    systems/EnemySpawner.gd
    systems/EnemySystem.gd
    systems/CombatSystem.gd
    systems/PickupSystem.gd
    systems/ProgressionSystem.gd
    systems/EffectsSystem.gd
    systems/CameraRig.gd
    ui/Hud.gd
    ui/MenuOverlay.gd
    ui/ChoicePanel.gd
  resources/
    upgrades/
    enemies/
    meta/
```

Use `GameState.gd` as the single runtime state owner, mirroring `src/state/gameState.js`. Systems should mutate that state through clear methods instead of each scene inventing its own shadow state.

## Browser To Godot Mapping

| Current file/system | Godot equivalent | Notes |
| --- | --- | --- |
| `index.html` HUD and overlays | `CanvasLayer` plus `Control` scenes | HUD, title, meta progression, controls, run summary, level-up, and relic choices should be Godot UI, not drawn into the playfield. |
| `style.css` | Godot themes and Control layout | Port the visual language after functional UI parity is working. |
| `src/main.js` | `Main.gd` plus `RunDirector.gd` | Keep the same update order unless intentionally changing behavior. |
| `src/config/constants.js` | `RunConstants.gd` or `.tres` resources | Keep tunables centralized and easy to diff against JS values. |
| `src/state/gameState.js` | `GameState.gd` autoload | Own screen state, input state, player stats, entity arrays/pools, timers, combo state, and zoom state. |
| `src/state/reset.js` | `GameState.reset_run()` | This is the Godot source of truth for new runs. |
| `src/data/upgrades.js` | `UpgradeCatalog.gd` and upgrade resources | Start with code-defined catalog for speed; move to resources once stable. |
| `src/systems/input/controls.js` | Godot InputMap and pointer handling | Map `move_up/down/left/right`, `pointer_move`, `confirm`, `cancel`, `zoom_in`, `zoom_out`. |
| `src/core/camera.js` | `CameraRig.gd` using `Camera2D` | Match discrete zoom levels `[1, 2, 4]` and world-edge clamping. |
| `src/systems/world/spawning.js` | `EnemySpawner.gd` and `PickupSystem.gd` | Preserve camera-edge spawn placement and wave scaling. |
| `src/systems/world/enemies.js` | `EnemySystem.gd` | Keep seek, separation, velocity smoothing, knockback decay, shock slow, leech, volatile, and death rewards. |
| `src/systems/combat/*` | `CombatSystem.gd` plus small weapon helpers | Keep numeric timers for parity before considering Godot `Timer` nodes. |
| `src/systems/progression/*` | `ProgressionSystem.gd`, `ChoicePanel.gd`, `SaveService.gd` | Preserve level/relic queue order and paused menu chaining. |
| `src/systems/render/*` | Godot sprites, particles, `Line2D`, custom draw nodes | Rebuild visual passes in layers that match the current draw order. |
| `sprites/` and `Glinting Gold.wav` | `godot/assets/` imports | Keep original assets unchanged; configure import scale/filtering in Godot. |

## Milestones

### 0. Baseline Capture

- Run the current browser game and capture reference screenshots for:
  - Title screen
  - Early run at 0-30 seconds
  - Level-up panel
  - Relic choice panel
  - Meta progression screen
  - Run summary
- Record current values from `src/config/constants.js`, `src/state/gameState.js`, `src/state/reset.js`, and `src/data/upgrades.js`.
- Confirm the live manual checklist from `AGENTS.md` plus the newer meta and area-control systems.

Gate: reference captures and a parity checklist exist before Godot implementation starts.

### 1. Godot Scaffold

- Create `godot/` project.
- Add autoloads:
  - `GameState`
  - `SaveService`
  - `UpgradeCatalog`
- Import sprites and `Glinting Gold.wav`.
- Build `Main.tscn` with:
  - World root
  - `Camera2D`
  - HUD `CanvasLayer`
  - Menu overlay
  - Level-up choice panel
  - Run summary panel
- Add input actions for keyboard movement, pointer movement, zoom, confirm, and cancel.

Gate: project launches, title screen appears, music can be started by user action, and zoom controls update the camera.

### 2. Movement, Camera, And World Shell

- Port `WORLD_WIDTH`, `WORLD_HEIGHT`, and zoom levels.
- Implement player movement using the current normalized vector logic.
- Implement hold-to-move pointer targeting in world space.
- Implement camera clamping against world bounds.
- Add a grid/background layer to match current readability.
- Add HUD fields for wave, time, HP, level, XP, combo, and permanent bonus text.

Gate: player movement, pointer movement, zoom, and camera clamping feel equivalent to the browser version.

### 3. Combat MVP

- Port firebolt auto-targeting against nearest enemy.
- Port bullet movement, lifetime, collision, damage, and particles.
- Port enemy spawn placement near camera edges.
- Port basic enemy seek behavior, separation, velocity smoothing, knockback decay, and player contact damage.
- Port XP orb drops, attraction/pickup radius, level calculation, and level-up queue.

Gate: a plain run can start, spawn enemies, kill enemies, collect XP, level up, pause for choices, resume, and game over.

### 4. Upgrade And Relic Menus

- Port `upgradeDefs` exactly before tuning.
- Port `statUpgrades` with rarity scaling.
- Port pending level and pending relic queues.
- Port bronze/silver/gold relic spawn, pickup, menu title, and option quality.
- Replace random-sort option shuffles with a proper Fisher-Yates shuffle while preserving the same option caps.

Gate: repeated queued levels and relic choices chain in the same order/paused state as the browser game.

### 5. Enemy Variants, Bosses, Pickups, And Combo

- Port elite spawn chance scaling and affix behavior.
- Port volatile death explosion and leech healing.
- Port mini-boss wave interval scheduling, stats, telegraph, XP reward, and guaranteed relic drop.
- Port health pack drop and pickup behavior.
- Port combo kill timer, XP multiplier stacking, HUD readout, and reset behavior.

Gate: elite affixes are readable, mini-bosses appear on expected wave thresholds, combo starts/refreshes/expires, and restart resets all temporary state.

### 6. Full Weapon Parity

Port weapon lines in low-risk slices:

1. Firebolt upgrades and Magnet Field.
2. Lightning Pulse and Arcane Nova.
3. Orbiting Blades and Solar Orbs.
4. Frost Shards and Chain Lightning.
5. Starfall Barrage.
6. Arc Mines.
7. Molten Trail.
8. Gravity Well.

For each weapon:

- Port player fields.
- Port reset values.
- Port upgrade apply behavior and copy.
- Port timer logic.
- Port hit detection and damage.
- Port visuals.
- Add one focused playtest note before moving to the next weapon.

Gate: every weapon can unlock, upgrade to max level, reset correctly, and interact correctly with enemy movement/death rewards.

### 7. Meta Progression And Save Data

- Port save schema from `metaProgression.js` into `SaveService.gd`.
- Use versioned JSON under `user://arcane_exterminator_save.json`.
- Preserve:
  - `shards`
  - `metaRanks`
  - `lifetime`
  - rank caps
  - cost growth
  - sanitized load behavior
  - reset save behavior
- Decide separately whether old browser `localStorage` saves need migration. Native Godot exports cannot naturally read browser `localStorage`; a one-time migration only matters if the web export must preserve existing browser players.

Gate: run summary awards shards, meta purchases persist after restart, reset save works, and corrupt save data falls back safely.

### 8. Rendering And Polish Parity

- Rebuild draw order as Godot layers:
  - Background/grid
  - Pickups and ground effects
  - Pulses, chain arcs, projectiles, particles
  - Relics and health packs
  - Enemies
  - Player and HP ring
  - Minimap and HUD
- Recreate elite, boss, relic rarity, shock, pulse, nova, mine, trail, vortex, and chain visuals.
- Add minimap with player and relic markers.
- Match UI screens and responsive scaling for desktop and web exports.

Gate: visual readability matches or improves on the canvas version without obscuring the playfield.

### 9. Performance Pass

- Start simple with pooled scene instances for enemies, projectiles, pickups, particles, and transient effects.
- Keep custom enemy separation using the current quadtree/grid idea rather than relying on full physics overlap checks for every enemy pair.
- Profile dense waves before optimizing further.
- If node count becomes the bottleneck, convert low-interaction visuals to batched/custom-draw nodes before changing gameplay logic.
- Track these hotspots:
  - Enemy separation queries
  - Projectile/enemy collision loops
  - Particle counts
  - Trail/vortex zone ticks
  - UI updates every frame

Gate: dense waves avoid frame spikes and still feel like the browser version.

### 10. Export And Release

- Configure exports for Windows and Web first.
- Verify audio import size; `Glinting Gold.wav` is large and may need an exported compressed format.
- Add platform smoke checks:
  - Windows desktop launch
  - Web export launch
  - Browser focus/input behavior
  - Save persistence
  - Restart behavior
- Keep the browser version available until the Godot export passes the full parity checklist.

Gate: Godot build passes the manual checklist and has no known parity-blocking regressions.

## Suggested Branch Sequence

1. `codex/godot-port-plan`
2. `codex/godot-scaffold`
3. `codex/godot-movement-camera`
4. `codex/godot-combat-mvp`
5. `codex/godot-progression-menus`
6. `codex/godot-enemy-reward-parity`
7. `codex/godot-weapon-parity`
8. `codex/godot-meta-save`
9. `codex/godot-polish-export`

Each branch should end with a short parity note in this plan or a follow-up progress file.

## Key Risks

- Feel drift from switching from browser `requestAnimationFrame` timing to Godot process/physics loops.
- Enemy density performance if every enemy becomes a heavy physics body.
- Menu queue regressions around pending levels and pending relic rewards.
- Save migration expectations if existing browser saves matter.
- Asset scale/import drift, especially sprite filtering, pivots, and hit radii.
- The current browser code still has known tech debt, such as active-run level display and pointer/mouse handler duplication. Decide whether to preserve those behaviors for parity or fix them during the port.

## Definition Of Done

- Godot build supports title, controls, meta progression, run, level-up, relic choices, run summary, restart, and save reset.
- All current weapons, enemies, pickups, relic rarities, combo XP, boss waves, and meta bonuses are implemented.
- All mutable run fields are reset from one source of truth.
- Full manual checklist passes on Windows and Web exports.
- The old browser implementation can be retired or kept as a legacy build with a clear note in `README`/backlog.
