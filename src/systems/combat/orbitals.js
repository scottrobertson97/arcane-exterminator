import { player, orbitCache } from '../../state/gameState.js'

export function updateOrbitCaches(dt) {
  player.bladeAngle += player.bladeSpeed * dt
  orbitCache.blades.length = 0
  if (player.bladesUnlocked && player.bladeCount > 0) {
    const step = (Math.PI * 2) / player.bladeCount
    for (let i = 0; i < player.bladeCount; i += 1) {
      const angle = player.bladeAngle + step * i
      orbitCache.blades.push({
        x: player.x + Math.cos(angle) * player.bladeRadius,
        y: player.y + Math.sin(angle) * player.bladeRadius,
      })
    }
  }

  player.orbAngle += player.orbSpeed * dt
  orbitCache.solars.length = 0
  if (player.orbUnlocked && player.orbCount > 0) {
    const step = (Math.PI * 2) / player.orbCount
    for (let i = 0; i < player.orbCount; i += 1) {
      const angle = player.orbAngle + step * i
      orbitCache.solars.push({
        x: player.x + Math.cos(angle) * player.orbRadius,
        y: player.y + Math.sin(angle) * player.orbRadius,
      })
    }
  }
}
