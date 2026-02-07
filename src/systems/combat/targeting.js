import { entities, player } from '../../state/gameState.js'

export function nearestEnemy() {
  let best = null
  let bestDist = Infinity
  for (const enemy of entities.enemies) {
    const dx = enemy.x - player.x
    const dy = enemy.y - player.y
    const dist = Math.hypot(dx, dy)
    if (dist < bestDist) {
      bestDist = dist
      best = enemy
    }
  }
  return best
}
