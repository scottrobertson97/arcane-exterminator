import { entities, player, timers } from '../../state/gameState.js'
import { WORLD_HEIGHT, WORLD_WIDTH } from '../../config/constants.js'
import { nearestEnemy } from './targeting.js'

export function shoot(dt) {
  timers.shoot -= dt
  if (timers.shoot > 0) return
  const target = nearestEnemy()
  if (!target) return

  const dx = target.x - player.x
  const dy = target.y - player.y
  const dist = Math.hypot(dx, dy) || 1
  const vx = (dx / dist) * player.bulletSpeed
  const vy = (dy / dist) * player.bulletSpeed

  entities.bullets.push({
    x: player.x,
    y: player.y,
    vx,
    vy,
    r: 4,
    damage: player.damage,
    life: 1.5,
    type: 'fire',
  })

  timers.shoot = 1 / player.fireRate
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
      damage: player.frostDamage,
      life: 1.4,
      type: 'frost',
      pierce: player.frostPierce,
    })
  }

  timers.frost = 1 / player.frostFireRate
}

export function updateBullets(dt) {
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
      color: bullet.type === 'frost' ? 'ice' : 'fire',
    })

    let hit = false
    for (const enemy of entities.enemies) {
      const dx = enemy.x - bullet.x
      const dy = enemy.y - bullet.y
      if (Math.hypot(dx, dy) < enemy.r + bullet.r) {
        enemy.hp -= bullet.damage
        hit = true
        if (bullet.type === 'frost') {
          bullet.pierce -= 1
          if (bullet.pierce > 0) hit = false
        }
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
