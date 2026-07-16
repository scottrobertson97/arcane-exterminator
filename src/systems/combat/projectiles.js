import { entities, player, timers } from '../../state/gameState.js'
import { WORLD_HEIGHT, WORLD_WIDTH } from '../../config/constants.js'
import { nearestEnemy } from './targeting.js'
import { createQuadtree } from '../world/quadtree.js'
import { scaledCooldown, scaledDamage } from './scaling.js'

const enemyHitQuadtree = createQuadtree({
  x: 0,
  y: 0,
  width: WORLD_WIDTH,
  height: WORLD_HEIGHT,
})
const bulletHitCandidates = []

export function shoot(dt) {
  timers.shoot -= dt
  if (timers.shoot > 0) return
  const target = nearestEnemy()
  if (!target) return

  const dx = target.x - player.x
  const dy = target.y - player.y
  const dist = Math.hypot(dx, dy) || 1
  const baseAngle = Math.atan2(dy, dx)
  const evolved = Boolean(player.evolutions.inferno_salvo)
  const shotCount = evolved ? 3 : 1
  const spread = evolved ? 0.13 : 0

  for (let i = 0; i < shotCount; i += 1) {
    const angle = baseAngle + (i - (shotCount - 1) / 2) * spread
    entities.bullets.push({
      x: player.x,
      y: player.y,
      vx: Math.cos(angle) * player.bulletSpeed,
      vy: Math.sin(angle) * player.bulletSpeed,
      r: evolved ? 5 : 4,
      damage: scaledDamage(player.damage),
      life: evolved ? 1.7 : 1.5,
      type: evolved ? 'inferno' : 'fire',
      pierce: evolved ? 2 : 1,
      hitTargets: [],
    })
  }

  timers.shoot = scaledCooldown(1 / player.fireRate)
}

export function fireFrostShards(dt) {
  timers.frost -= dt
  if (timers.frost > 0) return
  const target = nearestEnemy()
  if (!target) return

  const dx = target.x - player.x
  const dy = target.y - player.y
  const baseAngle = Math.atan2(dy, dx)
  const spread = 0.18
  const evolved = Boolean(player.evolutions.glacial_crown)
  const count = Math.max(1, player.frostShots)
  const start = -((count - 1) * spread) / 2

  for (let i = 0; i < count; i += 1) {
    const angle = baseAngle + start + i * spread
    entities.bullets.push({
      x: player.x,
      y: player.y,
      vx: Math.cos(angle) * player.frostSpeed,
      vy: Math.sin(angle) * player.frostSpeed,
      r: 4,
      damage: scaledDamage(player.frostDamage),
      life: 1.4,
      type: evolved ? 'glacial' : 'frost',
      pierce: player.frostPierce,
      hitTargets: [],
    })
  }

  timers.frost = scaledCooldown(1 / player.frostFireRate)
}

export function fireStarfall(dt) {
  timers.starfall -= dt
  if (timers.starfall > 0) return

  const count = Math.max(1, Math.round(player.starfallCount))
  const step = (Math.PI * 2) / count
  const baseAngle = Math.random() * Math.PI * 2

  for (let i = 0; i < count; i += 1) {
    const angle = baseAngle + step * i
    entities.bullets.push({
      x: player.x,
      y: player.y,
      vx: Math.cos(angle) * player.starfallSpeed,
      vy: Math.sin(angle) * player.starfallSpeed,
      r: 4,
      damage: scaledDamage(player.starfallDamage),
      life: player.starfallLife,
      type: 'starfall',
      pierce: 1,
      hitTargets: [],
    })
  }

  timers.starfall = scaledCooldown(player.starfallCooldown)
}

export function updateBullets(dt) {
  enemyHitQuadtree.clear()
  let maxEnemyRadius = 0
  for (const enemy of entities.enemies) {
    if (enemy.hp <= 0) continue
    enemyHitQuadtree.insert(enemy)
    maxEnemyRadius = Math.max(maxEnemyRadius, enemy.r)
  }

  for (let i = entities.bullets.length - 1; i >= 0; i -= 1) {
    const bullet = entities.bullets[i]
    bullet.x += bullet.vx * dt
    bullet.y += bullet.vy * dt
    bullet.life -= dt

    entities.particles.push({
      x: bullet.x,
      y: bullet.y,
      vx: (Math.random() - 0.5) * 40,
      vy: (Math.random() - 0.5) * 40,
      r: 3 + Math.random() * 2,
      life: 0.35,
      color:
        bullet.type === 'frost' || bullet.type === 'glacial'
          ? 'ice'
          : bullet.type === 'starfall'
            ? 'spark'
            : 'fire',
    })

    let hit = false
    bulletHitCandidates.length = 0
    enemyHitQuadtree.queryCircle(
      bullet.x,
      bullet.y,
      bullet.r + maxEnemyRadius,
      bulletHitCandidates,
    )
    for (const enemy of bulletHitCandidates) {
      if (enemy.hp <= 0) continue
      if (bullet.hitTargets?.includes(enemy)) continue
      const dx = enemy.x - bullet.x
      const dy = enemy.y - bullet.y
      if (Math.hypot(dx, dy) < enemy.r + bullet.r) {
        enemy.hp -= bullet.damage
        if (bullet.type === 'frost' || bullet.type === 'glacial') {
          enemy.shockTimer = Math.max(
            enemy.shockTimer,
            bullet.type === 'glacial' ? 2.2 : 1.1,
          )
        }
        if (bullet.hitTargets) bullet.hitTargets.push(enemy)
        bullet.pierce = Math.max(0, (bullet.pierce || 1) - 1)
        hit = bullet.pierce <= 0
        break
      }
    }

    if (
      hit ||
      bullet.life <= 0 ||
      bullet.x < -30 ||
      bullet.x > WORLD_WIDTH + 30 ||
      bullet.y < -30 ||
      bullet.y > WORLD_HEIGHT + 30
    ) {
      entities.bullets.splice(i, 1)
    }
  }
}
