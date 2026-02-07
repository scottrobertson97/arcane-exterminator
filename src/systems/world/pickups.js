import { player, entities, state, timers } from '../../state/gameState.js'
import { distance } from '../../core/utils.js'
import { addRelic } from './spawning.js'
import { gainXp, getUpgradeLevel } from '../progression/xp.js'
import { openStatUpgradeFromQueue } from '../progression/relicMenu.js'

export function updateRelicSpawner(dt) {
  timers.relic -= dt
  if (timers.relic <= 0 && entities.relics.length < 2) {
    addRelic()
    timers.relic = 18
  }
}

export function updateRelicCollisions(dt) {
  for (let i = entities.relics.length - 1; i >= 0; i -= 1) {
    const relic = entities.relics[i]
    relic.wobble += dt * 4
    const dist = distance(player.x, player.y, relic.x, relic.y)
    if (dist < player.r + relic.r) {
      entities.relics.splice(i, 1)
      state.pendingStatUps += 1
      state.pendingRelicRarities.push(relic.rarity || 'bronze')
      if (!state.paused) openStatUpgradeFromQueue()
    }
  }
}

export function updateHealthPackCollisions(dt) {
  for (let i = entities.healthPacks.length - 1; i >= 0; i -= 1) {
    const pack = entities.healthPacks[i]
    pack.wobble += dt * 5
    const dist = distance(player.x, player.y, pack.x, pack.y)
    if (dist < player.r + pack.r) {
      entities.healthPacks.splice(i, 1)
      player.hp = Math.min(player.maxHp, player.hp + 25)
    }
  }
}

export function updateXpOrbs(dt) {
  for (let i = entities.orbs.length - 1; i >= 0; i -= 1) {
    const orb = entities.orbs[i]
    orb.drift += dt * 2
    orb.bob = Math.sin(orb.drift) * 10
    orb.y = orb.baseY + orb.bob

    const dx = player.x - orb.x
    const dy = player.y - orb.y
    const dist = Math.hypot(dx, dy) || 1

    if (dist < player.pickupRadius + orb.r) {
      gainXp(orb.value)
      entities.orbs.splice(i, 1)
    } else if (getUpgradeLevel('magnet') > 0 && dist < player.pickupRadius * 3) {
      const pull = (1 - dist / (player.pickupRadius * 3)) * 160
      orb.x += (dx / dist) * pull * dt
      orb.baseY += (dy / dist) * pull * dt
      orb.y = orb.baseY + orb.bob
    }
  }
}
