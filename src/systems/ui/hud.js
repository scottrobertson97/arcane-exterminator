import { hud } from '../../core/dom.js'
import { state, player } from '../../state/gameState.js'
import { getComboSnapshot } from '../progression/xp.js'

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatComboText(combo) {
  if (!combo.active) return '-'
  return `K${combo.kills} x${combo.multiplier.toFixed(2)} ${combo.remaining.toFixed(1)}s`
}

export function updateHud() {
  const wave = Math.floor(state.elapsed / state.waveDuration) + 1
  const combo = getComboSnapshot()
  hud.wave.textContent = wave
  hud.time.textContent = formatTime(state.elapsed)
  hud.hp.textContent = `${Math.max(0, Math.round(player.hp))} / ${player.maxHp}`
  hud.level.textContent = player.level
  hud.xp.textContent = `${player.xp} / ${player.nextXp}`
  if (hud.combo) {
    hud.combo.textContent = formatComboText(combo)
    hud.combo.classList.toggle('combo-active', combo.active)
    hud.combo.classList.toggle('combo-boost', combo.multiplier > 1)
  }
  if (hud.metaBonus) hud.metaBonus.textContent = state.metaBonusText
}
