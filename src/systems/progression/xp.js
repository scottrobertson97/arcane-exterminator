import { player, state } from '../../state/gameState.js'

let showLevelUpHandler = () => {}

export function setShowLevelUpHandler(fn) {
  showLevelUpHandler = fn
}

export function gainXp(amount) {
  player.xp += amount
  while (player.xp >= player.nextXp) {
    player.xp -= player.nextXp
    player.level += 1
    player.nextXp = Math.round(20 + player.level * 10)
    state.pendingLevels += 1
  }

  if (state.pendingLevels > 0 && !state.paused) {
    showLevelUpHandler()
  }
}

export function getUpgradeLevel(id) {
  return player.upgrades[id] || 0
}

export function applyUpgrade(option) {
  const current = getUpgradeLevel(option.id)
  if (current >= option.max) return
  const next = current + 1
  option.apply(next)
  player.upgrades[option.id] = next
}
