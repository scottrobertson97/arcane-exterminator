# AGENTS.md

## Project Overview
- Single-page HTML canvas game inspired by Vampire Survivors.
- Files: `index.html`, `style.css`, `game.js`.
- Runs directly in the browser (no build step).

## Current Gameplay Systems
- **Player**: WASD/Arrow keys, auto-attack firebolts, HP ring, XP/levels.
- **World**: Larger than viewport with a camera that follows the player.
- **Enemies**: Spawn near viewport edges, flocking toward player with separation.
- **XP**: Orbs drop on enemy death; leveling opens weapon/ability menu.
- **Relics**: Collectibles spawn on the map; picking one opens stat-upgrade menu.
- **Weapons/Abilities**: Lightning pulse (unlock + upgrades), orbiting blades (unlock + upgrades).
- **VFX**: Fireball trails, lightning shock lines, enemy death particles.

## Key Constants (game.js)
- World: `WORLD_WIDTH`, `WORLD_HEIGHT`, `VIEW_WIDTH`, `VIEW_HEIGHT`.
- Flocking: `ENEMY_SEP_RADIUS`, `ENEMY_SEP_FORCE`.
- Pulse: `pulseCooldown`, `pulseRadius`, `pulseDamage`, `pulseKnockback`.
- Blades: `bladeCount`, `bladeRadius`, `bladeSpeed`, `bladeDamage`, `bladeHitCooldown`, `bladeSize`.

## Code Structure Notes
- Main loop: `loop()` → `update(dt)` → `draw()`.
- Camera: `camera()` returns world-to-view offset.
- Entities arrays: `bullets`, `enemies`, `orbs`, `relics`, `pulses`, `particles`, `bladePositions`.
- Enemy movement: steer to desired velocity + knockback velocity component.
- Menus: `showLevelUp()` for weapons/abilities, `showStatUpgrades()` for relic stats.

## Development Guidelines
- Prefer minimal changes; keep gameplay feel consistent.
- Use `apply_patch` for single-file edits.
- Keep new constants near existing ones; reset values in `resetGame()`.
- Avoid new dependencies unless necessary.

## Testing
- Manual: open `index.html` in browser.
- Verify: movement, spawning, XP level-up menu, relic stat menu, pulse/blade unlocks, camera edges.
