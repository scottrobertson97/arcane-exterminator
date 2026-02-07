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
