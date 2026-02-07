Original prompt: i want the relic rarity to effect how much it boots stats

## 2026-02-07
- Traced relic flow: relic pickup queues rarity (`pendingRelicRarities`) and stat menu currently applies fixed `statUpgrades` values.
- Implemented rarity-scaled relic stat gains:
  - Added rarity stat multipliers to `src/config/constants.js` (`bronze=1`, `silver=1.25`, `gold=1.5`).
  - Updated `src/data/upgrades.js` stat upgrades to accept rarity, scale bonus magnitude, and generate rarity-aware descriptions.
  - Updated `src/systems/progression/relicMenu.js` to render function-based descriptions and pass rarity into `option.apply(rarity)`.
- Next: run Playwright game validation and inspect screenshots/text/console for regressions.
- Validation:
  - Ran Playwright client against local server with action bursts and start click.
  - Reviewed screenshots in `output/web-game/relic-rarity/shot-0.png`, `shot-1.png`, `shot-2.png`.
  - No Playwright-captured console/page errors were reported.
  - No regressions observed in core movement/combat rendering during sampled frames.
- Note: this game currently does not expose `window.render_game_to_text`, so state JSON artifacts were not produced by the client.

## TODO / next agent suggestions
- Optional tuning pass: if rarity scaling feels too strong/weak in play, adjust `RELIC_SILVER_STAT_MULT` and `RELIC_GOLD_STAT_MULT` in `src/config/constants.js`.
- Optional UX improvement: display explicit rarity multiplier (e.g. `x1.25`) in relic option subtitle.
- Follow-up fix: aligned `Iron Heart` UI text with applied value by rounding to the same integer used in gameplay logic.
- Re-ran Playwright smoke check after patch (`output/web-game/relic-rarity-recheck/shot-0.png`), no Playwright-captured console/page errors.

## 2026-02-07 (Area-control weapons)
- New prompt: implement the 4-weapon area-control expansion plan (starfall, mines, trail, vortex) end-to-end.
- Started implementation pass by mapping required changes across state/reset/upgrades/combat/world/render/main orchestration.
- Implemented full area-control weapon expansion across state/combat/world/render/main:
  - Added player fields/unlock flags for `starfall`, `mines`, `trail`, `vortex` plus `player.isMoving`.
  - Added `entities.mines`, `entities.trails`, `entities.vortexes`.
  - Added `timers.starfall`, `timers.mines`, `timers.trail`, `timers.vortex`.
  - Reset wiring added in `src/state/reset.js` for all new mutable fields/arrays/timers.
- Added weapon behavior:
  - `fireStarfall(dt)` radial burst bullets (`type: starfall`) in `src/systems/combat/projectiles.js`.
  - `deployArcMines(dt)` and `castGravityWell(dt)` in `src/systems/combat/abilities.js`.
  - `updateMines(dt)`, `updateTrails(dt)`, `updateVortexes(dt)` in `src/systems/world/effects.js`.
- Added upgrade lines in `src/data/upgrades.js` with requested ladders and max levels:
  - `Starfall Barrage` (max 4)
  - `Arc Mines` (max 5)
  - `Molten Trail` (max 5)
  - `Gravity Well` (max 5)
- Added visuals:
  - `drawMines` in `src/systems/render/entities.js`.
  - `drawTrailPatches` and `drawVortexRings` in `src/systems/render/effects.js`.
  - Extended pulse ring colors for `mine` and `vortex` types.
  - Extended bullet/particle coloring for `starfall` (`spark` particles).
- Main loop integration (`src/main.js`):
  - `updateWeaponFiring(dt)` now invokes starfall/mines/vortex behind unlock flags.
  - Zone lifecycle updates run after `updateBullets(dt)` and before particle/effect cleanup.
  - New draw calls inserted without reordering existing pass semantics.
- Validation run (area-control implementation):
  - Started local server: `python3 -m http.server 5500`.
  - Ran Playwright client smoke burst with movement/capture:
    - `output/web-game/area-control-weapons/shot-0.png`
    - `output/web-game/area-control-weapons/shot-1.png`
    - `output/web-game/area-control-weapons/shot-2.png`
  - Ran extended Playwright scenario for sustained gameplay coverage:
    - `output/web-game/area-control-weapons-long/shot-0.png` ... `shot-5.png`
  - Opened screenshots and verified no render corruption from new draw passes.
  - No Playwright-captured `errors-*.json` files were generated in either run (no console/page errors captured).
- Observed test limitation: deterministic scripted runs did not naturally level into the new weapon picks within the captured windows, so visual confirmation covers integration stability and regression surface, not per-weapon unlock showcase in this automated pass.

## TODO / next agent suggestions
- Add a tiny dev-only test hook (guarded behind query param) to grant XP quickly, enabling deterministic automated validation of each new level-up weapon behavior (starfall burst count/cooldown, mines trigger, trail spawn cap, vortex pull/tick).
- Optionally expose `window.render_game_to_text` to provide machine-verifiable state assertions for weapon entities (`mines/trails/vortexes`) in Playwright runs.
- Follow-up tuning/fix pass:
  - `deployArcMines(dt)` now requires a nearest-enemy target direction before placing, matching the design note.
  - Corrected gravity well pull integration to avoid double `dt` scaling (pull now matches configured magnitude and enemy update integration).
- Re-ran Playwright smoke validation after fix:
  - `output/web-game/area-control-weapons-recheck/shot-0.png`
  - `output/web-game/area-control-weapons-recheck/shot-1.png`
  - No `errors-*.json` produced (no Playwright-captured console/page errors).
- Ran parse checks: `node --check` passed for all modified JS modules (`src/main.js`, state/combat/world/render/data files touched in this change).
