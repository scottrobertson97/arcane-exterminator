import {
  MAX_ENEMY_PROJECTILES,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../../config/constants.js'
import { entities, player } from '../../state/gameState.js'

export function spawnEnemyProjectile(projectile) {
  if (entities.enemyProjectiles.length >= MAX_ENEMY_PROJECTILES) return false

  const x = Number(projectile.x)
  const y = Number(projectile.y)
  const vx = Number(projectile.vx)
  const vy = Number(projectile.vy)
  if (![x, y, vx, vy].every(Number.isFinite)) return false

  entities.enemyProjectiles.push({
    x,
    y,
    vx,
    vy,
    r: Number.isFinite(projectile.r) ? Math.max(1, projectile.r) : 5,
    damage: Number.isFinite(projectile.damage) ? Math.max(0, projectile.damage) : 0,
    life: Number.isFinite(projectile.life) ? Math.max(0.05, projectile.life) : 3,
    type: projectile.type || 'enemy',
    color: projectile.color || '#b86cff',
  })
  return true
}

export function updateEnemyProjectiles(dt) {
  const step = Number.isFinite(dt) ? Math.max(0, dt) : 0
  if (entities.enemyProjectiles.length > MAX_ENEMY_PROJECTILES) {
    entities.enemyProjectiles.splice(
      0,
      entities.enemyProjectiles.length - MAX_ENEMY_PROJECTILES,
    )
  }

  for (let i = entities.enemyProjectiles.length - 1; i >= 0; i -= 1) {
    const projectile = entities.enemyProjectiles[i]
    projectile.life = Number.isFinite(projectile.life) ? projectile.life - step : 0
    projectile.x += projectile.vx * step
    projectile.y += projectile.vy * step

    const radius = Number.isFinite(projectile.r) ? Math.max(1, projectile.r) : 1
    const outOfBounds =
      projectile.x < -radius ||
      projectile.x > WORLD_WIDTH + radius ||
      projectile.y < -radius ||
      projectile.y > WORLD_HEIGHT + radius
    const invalid =
      !Number.isFinite(projectile.x) ||
      !Number.isFinite(projectile.y) ||
      !Number.isFinite(projectile.vx) ||
      !Number.isFinite(projectile.vy)

    if (projectile.life <= 0 || outOfBounds || invalid) {
      entities.enemyProjectiles.splice(i, 1)
      continue
    }

    const dx = player.x - projectile.x
    const dy = player.y - projectile.y
    if (Math.hypot(dx, dy) <= player.r + radius) {
      player.hp -= Number.isFinite(projectile.damage) ? Math.max(0, projectile.damage) : 0
      entities.enemyProjectiles.splice(i, 1)
    }
  }
}
