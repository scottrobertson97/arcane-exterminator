import {
  BOSS_XP_REWARD,
  ELITE_LEECH_HEAL_FACTOR,
  ELITE_VOLATILE_DAMAGE,
  ELITE_VOLATILE_RADIUS,
  ELITE_XP_BONUS,
  ENEMY_SEP_FORCE,
  ENEMY_SEP_RADIUS,
} from '../../config/constants.js'
import { entities, orbitCache, player } from '../../state/gameState.js'
import { addOrb, addRelicAt } from './spawning.js'

export function updateEnemies(dt) {
  for (let i = entities.enemies.length - 1; i >= 0; i -= 1) {
    const enemy = entities.enemies[i]
    const dx = player.x - enemy.x
    const dy = player.y - enemy.y
    const dist = Math.hypot(dx, dy) || 1

    let sepX = 0
    let sepY = 0
    for (const other of entities.enemies) {
      if (other === enemy) continue
      const ox = enemy.x - other.x
      const oy = enemy.y - other.y
      const od = Math.hypot(ox, oy)
      if (od > 0 && od < ENEMY_SEP_RADIUS) {
        const push = (ENEMY_SEP_RADIUS - od) / ENEMY_SEP_RADIUS
        sepX += (ox / od) * push
        sepY += (oy / od) * push
      }
    }

    if (enemy.shockTimer > 0) enemy.shockTimer -= dt
    if (enemy.bladeHitTimer > 0) enemy.bladeHitTimer -= dt
    if (enemy.orbHitTimer > 0) enemy.orbHitTimer -= dt
    if (enemy.isElite) enemy.elitePulse += dt * 6
    if (enemy.isBoss) enemy.bossPulse += dt * 4
    const slow = enemy.shockTimer > 0 ? 0.55 : 1
    const seekVX = (dx / dist) * enemy.speed * slow
    const seekVY = (dy / dist) * enemy.speed * slow
    const sepVX = sepX * ENEMY_SEP_FORCE
    const sepVY = sepY * ENEMY_SEP_FORCE
    const desiredVX = seekVX + sepVX
    const desiredVY = seekVY + sepVY

    const steer = 6
    enemy.vx += (desiredVX - enemy.vx) * steer * dt
    enemy.vy += (desiredVY - enemy.vy) * steer * dt

    const kx = enemy.knockX
    const ky = enemy.knockY
    enemy.knockX *= 0.85
    enemy.knockY *= 0.85
    enemy.x += (enemy.vx + kx) * dt
    enemy.y += (enemy.vy + ky) * dt

    if (enemy.bladeHitTimer <= 0) {
      for (const blade of orbitCache.blades) {
        const bx = blade.x - enemy.x
        const by = blade.y - enemy.y
        if (Math.hypot(bx, by) < enemy.r + player.bladeSize * 0.5) {
          enemy.hp -= player.bladeDamage
          enemy.bladeHitTimer = player.bladeHitCooldown
          break
        }
      }
    }

    if (enemy.orbHitTimer <= 0) {
      for (const orb of orbitCache.solars) {
        const ox = orb.x - enemy.x
        const oy = orb.y - enemy.y
        if (Math.hypot(ox, oy) < enemy.r + 8) {
          enemy.hp -= player.orbDamage
          enemy.orbHitTimer = player.orbHitCooldown
          break
        }
      }
    }

    if (dist < enemy.r + player.r) {
      player.hp -= enemy.damage * dt
      if (enemy.affix === 'leech') {
        enemy.hp = Math.min(
          enemy.maxHp,
          enemy.hp + enemy.damage * ELITE_LEECH_HEAL_FACTOR * dt,
        )
      }
    }

    if (enemy.hp <= 0) {
      entities.enemies.splice(i, 1)
      const orbValue = enemy.isBoss
        ? BOSS_XP_REWARD
        : (enemy.tier === 2 ? 12 : 8) + (enemy.isElite ? ELITE_XP_BONUS : 0)
      addOrb(enemy.x, enemy.y, orbValue)

      if (enemy.isBoss) {
        addRelicAt(enemy.x, enemy.y)
      }

      if (enemy.affix === 'volatile') {
        entities.pulses.push({
          x: enemy.x,
          y: enemy.y,
          r: 0,
          max: ELITE_VOLATILE_RADIUS,
          life: 0.28,
          maxLife: 0.28,
          type: 'volatile',
        })

        const pdx = player.x - enemy.x
        const pdy = player.y - enemy.y
        const playerDist = Math.hypot(pdx, pdy)
        if (playerDist < ELITE_VOLATILE_RADIUS + player.r) {
          player.hp -= ELITE_VOLATILE_DAMAGE
        }

        for (let p = 0; p < 10; p += 1) {
          entities.particles.push({
            x: enemy.x,
            y: enemy.y,
            vx: (Math.random() - 0.5) * 180,
            vy: (Math.random() - 0.5) * 180,
            r: 2 + Math.random() * 3,
            life: 0.35,
            color: 'fire',
          })
        }
      }

      if (Math.random() < 0.1) {
        entities.healthPacks.push({
          x: enemy.x,
          y: enemy.y,
          r: 10,
          wobble: Math.random() * Math.PI * 2,
        })
      }
      for (let p = 0; p < 10; p += 1) {
        entities.particles.push({
          x: enemy.x,
          y: enemy.y,
          vx: (Math.random() - 0.5) * 120,
          vy: (Math.random() - 0.5) * 120,
          r: 3 + Math.random() * 3,
          life: 0.55,
          color: 'blood',
        })
      }
    }
  }
}
