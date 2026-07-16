import { player } from '../../state/gameState.js'

export function scaledDamage(baseDamage) {
  return baseDamage * Math.max(0, player.mightMultiplier || 1)
}

export function scaledCooldown(baseCooldown) {
  return Math.max(0.04, baseCooldown * Math.max(0.05, player.cooldownMultiplier || 1))
}
