import { entities, player } from '../../state/gameState.js'
import { nearestEnemy } from './targeting.js'

export function pulseShockwave() {
  entities.pulses.push({
    x: player.x,
    y: player.y,
    r: 0,
    max: player.pulseRadius,
    life: 0.45,
    maxLife: 0.45,
    type: 'pulse',
  })

  for (const enemy of entities.enemies) {
    const dx = enemy.x - player.x
    const dy = enemy.y - player.y
    const dist = Math.hypot(dx, dy) || 1
    if (dist <= player.pulseRadius) {
      enemy.hp -= player.pulseDamage
      enemy.shockTimer = 1.2
      const falloff = 1 - dist / player.pulseRadius
      const knock = player.pulseKnockback * Math.max(0.2, falloff)
      enemy.knockX += (dx / dist) * knock
      enemy.knockY += (dy / dist) * knock
    }
  }
}

export function novaShockwave() {
  entities.pulses.push({
    x: player.x,
    y: player.y,
    r: 0,
    max: player.novaRadius,
    life: 0.35,
    maxLife: 0.35,
    type: 'nova',
  })

  for (const enemy of entities.enemies) {
    const dx = enemy.x - player.x
    const dy = enemy.y - player.y
    const dist = Math.hypot(dx, dy) || 1
    if (dist <= player.novaRadius) {
      enemy.hp -= player.novaDamage
      enemy.shockTimer = 0.6
      const falloff = 1 - dist / player.novaRadius
      const knock = player.novaKnockback * Math.max(0.2, falloff)
      enemy.knockX += (dx / dist) * knock
      enemy.knockY += (dy / dist) * knock
    }
  }
}

export function chainLightning() {
  if (entities.enemies.length === 0) return

  const hit = []
  let current = nearestEnemy()
  if (!current) return

  entities.chainArcs.push({
    x1: player.x,
    y1: player.y,
    x2: current.x,
    y2: current.y,
    life: 0.2,
  })

  for (let i = 0; i < player.chainCount + 1; i += 1) {
    if (!current) break
    current.hp -= player.chainDamage
    current.shockTimer = Math.max(current.shockTimer, 0.8)
    hit.push(current)

    const next = entities.enemies
      .filter(enemy => !hit.includes(enemy))
      .map(enemy => ({
        enemy,
        dist: Math.hypot(enemy.x - current.x, enemy.y - current.y),
      }))
      .filter(entry => entry.dist <= player.chainRange)
      .sort((a, b) => a.dist - b.dist)[0]

    if (next) {
      entities.chainArcs.push({
        x1: current.x,
        y1: current.y,
        x2: next.enemy.x,
        y2: next.enemy.y,
        life: 0.2,
      })
    }

    current = next ? next.enemy : null
  }
}
