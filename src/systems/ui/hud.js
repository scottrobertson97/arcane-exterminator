import { hud } from '../../core/dom.js'
import { state, player } from '../../state/gameState.js'

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function updateHud() {
  const wave = Math.floor(state.elapsed / state.waveDuration) + 1
  hud.wave.textContent = wave
  hud.time.textContent = formatTime(state.elapsed)
  hud.hp.textContent = `${Math.max(0, Math.round(player.hp))} / ${player.maxHp}`
  hud.level.textContent = player.level
  hud.xp.textContent = `${player.xp} / ${player.nextXp}`
}
