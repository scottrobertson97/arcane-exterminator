import { WORLD_HEIGHT, WORLD_WIDTH } from '../../config/constants.js'
import { clamp } from '../../core/utils.js'
import { entities, player, timers } from '../../state/gameState.js'
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

export function deployArcMines(dt) {
  timers.mines -= dt
  if (timers.mines > 0) return

  const target = nearestEnemy()
  if (!target) return

  const angle = Math.atan2(target.y - player.y, target.x - player.x)

  const dropDistance = 72 + Math.random() * 24
  const x = clamp(player.x + Math.cos(angle) * dropDistance, 20, WORLD_WIDTH - 20)
  const y = clamp(player.y + Math.sin(angle) * dropDistance, 20, WORLD_HEIGHT - 20)

  const maxActive = Math.max(1, Math.round(player.mineMaxActive))
  while (entities.mines.length >= maxActive) {
    entities.mines.splice(0, 1)
  }

  entities.mines.push({
    x,
    y,
    r: 11,
    radius: player.mineRadius,
    triggerRadius: Math.max(20, player.mineRadius * 0.45),
    damage: player.mineDamage,
    armTimer: player.mineArmTime,
    life: player.mineLifetime,
    maxLife: player.mineLifetime,
  })

  timers.mines = player.mineCooldown
}

export function castGravityWell(dt) {
  timers.vortex -= dt
  if (timers.vortex > 0) return

  const target = nearestEnemy()
  if (!target) return

  entities.vortexes.push({
    x: target.x,
    y: target.y,
    r: player.vortexRadius,
    life: player.vortexDuration,
    maxLife: player.vortexDuration,
    dps: player.vortexDps,
    pull: player.vortexPull,
  })

  entities.pulses.push({
    x: target.x,
    y: target.y,
    r: 0,
    max: Math.max(26, player.vortexRadius * 0.35),
    life: 0.24,
    maxLife: 0.24,
    type: 'vortex',
  })

  timers.vortex = player.vortexCooldown
}
