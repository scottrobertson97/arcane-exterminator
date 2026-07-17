import {
  BOSS_XP_REWARD,
  ELITE_LEECH_HEAL_FACTOR,
  ELITE_VOLATILE_DAMAGE,
  ELITE_VOLATILE_RADIUS,
  ELITE_XP_BONUS,
  ENEMY_SEP_FORCE,
  ENEMY_SEP_RADIUS,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../../config/constants.js'
import { entities, orbitCache, player, state } from '../../state/gameState.js'
import { addOrb, addRelicAt } from './spawning.js'
import { registerComboKill } from '../progression/xp.js'
import { createQuadtree } from './quadtree.js'
import { scaledCooldown, scaledDamage } from '../combat/scaling.js'
import { spawnEnemyProjectile } from './enemyProjectiles.js'

const enemyQuadtree = createQuadtree({
  x: 0,
  y: 0,
  width: WORLD_WIDTH,
  height: WORLD_HEIGHT,
})
const nearbyEnemies = []

const BAT_WINDUP_TIME = 0.25
const BAT_SWOOP_TIME = 0.45
const BEETLE_WINDUP_TIME = 0.65
const BEETLE_CHARGE_TIME = 0.65
const HEX_MIN_RANGE = 170
const HEX_MAX_RANGE = 250

function finiteOr(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback
}

function setLockedDirection(enemy, dx, dy, dist) {
  if (dist > 0.001) {
    enemy.chargeX = dx / dist
    enemy.chargeY = dy / dist
    return
  }

  const velocityLength = Math.hypot(enemy.vx, enemy.vy)
  enemy.chargeX = velocityLength > 0.001 ? enemy.vx / velocityLength : 1
  enemy.chargeY = velocityLength > 0.001 ? enemy.vy / velocityLength : 0
}

function sanitizeEnemyState(enemy) {
  enemy.vx = finiteOr(enemy.vx)
  enemy.vy = finiteOr(enemy.vy)
  enemy.knockX = finiteOr(enemy.knockX)
  enemy.knockY = finiteOr(enemy.knockY)
  enemy.shockTimer = Math.max(0, finiteOr(enemy.shockTimer))
  enemy.bladeHitTimer = finiteOr(enemy.bladeHitTimer)
  enemy.orbHitTimer = finiteOr(enemy.orbHitTimer)
  enemy.elitePulse = finiteOr(enemy.elitePulse)
  enemy.bossPulse = finiteOr(enemy.bossPulse)
  enemy.behaviorAge = Math.max(0, finiteOr(enemy.behaviorAge))
  enemy.behaviorPhase =
    typeof enemy.behaviorPhase === 'string' ? enemy.behaviorPhase : 'seek'
  enemy.phaseTimer = Math.max(0, finiteOr(enemy.phaseTimer))
  enemy.abilityCooldown = Math.max(0, finiteOr(enemy.abilityCooldown))
  enemy.chargeX = finiteOr(enemy.chargeX)
  enemy.chargeY = finiteOr(enemy.chargeY)
  enemy.chargeHit = Boolean(enemy.chargeHit)
  enemy.strafeDirection = enemy.strafeDirection === -1 ? -1 : 1
}

function beginLockedAttack(enemy, phase, duration, dx, dy, dist) {
  setLockedDirection(enemy, dx, dy, dist)
  enemy.behaviorPhase = phase
  enemy.phaseTimer = duration
  enemy.chargeHit = false
}

function ashBatMovement(enemy, dx, dy, dist, speed, slow, sepVX, sepVY, dt) {
  enemy.behaviorAge += dt
  if (!['seek', 'windup', 'swoop'].includes(enemy.behaviorPhase)) {
    enemy.behaviorPhase = 'seek'
  }

  if (enemy.behaviorPhase === 'seek') {
    enemy.abilityCooldown -= dt
    if (enemy.abilityCooldown <= 0) {
      beginLockedAttack(enemy, 'windup', BAT_WINDUP_TIME, dx, dy, dist)
    }
  } else {
    enemy.phaseTimer -= dt
    if (enemy.phaseTimer <= 0) {
      if (enemy.behaviorPhase === 'windup') {
        enemy.behaviorPhase = 'swoop'
        enemy.phaseTimer = BAT_SWOOP_TIME
      } else {
        enemy.behaviorPhase = 'seek'
        enemy.phaseTimer = 0
        enemy.abilityCooldown = 1.35 + Math.random() * 0.65
      }
    }
  }

  if (enemy.behaviorPhase === 'swoop') {
    return {
      direct: true,
      vx: enemy.chargeX * speed * 2.5 * slow,
      vy: enemy.chargeY * speed * 2.5 * slow,
    }
  }

  if (enemy.behaviorPhase === 'windup') {
    return {
      steer: 10,
      vx: -enemy.chargeX * speed * 0.18 * slow + sepVX * 0.3,
      vy: -enemy.chargeY * speed * 0.18 * slow + sepVY * 0.3,
    }
  }

  const towardX = dx / dist
  const towardY = dy / dist
  const weave = Math.sin(enemy.behaviorAge * 7.5) * speed * 0.55 * slow
  return {
    steer: 7,
    vx: towardX * speed * slow - towardY * weave + sepVX,
    vy: towardY * speed * slow + towardX * weave + sepVY,
  }
}

function emitBeetleWindup(enemy) {
  if (entities.particles.length >= 600) return

  for (let p = 0; p < 2; p += 1) {
    const angle = Math.random() * Math.PI * 2
    entities.particles.push({
      x: enemy.x + Math.cos(angle) * enemy.r,
      y: enemy.y + Math.sin(angle) * enemy.r,
      vx: Math.cos(angle) * 28,
      vy: Math.sin(angle) * 28,
      r: 2 + Math.random() * 1.5,
      life: 0.35,
      color: 'spark',
    })
  }
}

function ironbackMovement(enemy, dx, dy, dist, speed, slow, sepVX, sepVY, dt) {
  enemy.behaviorAge += dt
  enemy.telegraphTimer = finiteOr(enemy.telegraphTimer)
  if (!['seek', 'windup', 'charge'].includes(enemy.behaviorPhase)) {
    enemy.behaviorPhase = 'seek'
  }

  if (enemy.behaviorPhase === 'seek') {
    enemy.abilityCooldown -= dt
    if (enemy.abilityCooldown <= 0) {
      beginLockedAttack(enemy, 'windup', BEETLE_WINDUP_TIME, dx, dy, dist)
      enemy.telegraphTimer = 0
    }
  } else {
    enemy.phaseTimer -= dt
    if (enemy.behaviorPhase === 'windup') {
      enemy.telegraphTimer -= dt
      if (enemy.telegraphTimer <= 0) {
        emitBeetleWindup(enemy)
        enemy.telegraphTimer = 0.12
      }
    }

    if (enemy.phaseTimer <= 0) {
      if (enemy.behaviorPhase === 'windup') {
        enemy.behaviorPhase = 'charge'
        enemy.phaseTimer = BEETLE_CHARGE_TIME
        enemy.chargeHit = false
      } else {
        enemy.behaviorPhase = 'seek'
        enemy.phaseTimer = 0
        enemy.abilityCooldown = 2.15 + Math.random() * 0.7
      }
    }
  }

  if (enemy.behaviorPhase === 'charge') {
    return {
      direct: true,
      vx: enemy.chargeX * speed * 3.6 * slow,
      vy: enemy.chargeY * speed * 3.6 * slow,
    }
  }

  if (enemy.behaviorPhase === 'windup') {
    return {
      steer: 12,
      vx: sepVX * 0.2,
      vy: sepVY * 0.2,
    }
  }

  return {
    steer: 5,
    vx: (dx / dist) * speed * 0.58 * slow + sepVX,
    vy: (dy / dist) * speed * 0.58 * slow + sepVY,
  }
}

function fireHexBolt(enemy, dx, dy, dist) {
  const projectileSpeed = 210
  const spawned = spawnEnemyProjectile({
    x: enemy.x,
    y: enemy.y,
    vx: (dx / dist) * projectileSpeed,
    vy: (dy / dist) * projectileSpeed,
    r: 5,
    damage: Math.max(5, finiteOr(enemy.projectileDamage, enemy.damage * 0.55)),
    life: 3.2,
    type: 'hex_bolt',
    color: '#b86cff',
  })

  enemy.abilityCooldown = spawned ? 1.85 + Math.random() * 0.3 : 0.25
}

function hexAcolyteMovement(enemy, dx, dy, dist, speed, slow, sepVX, sepVY, dt) {
  enemy.behaviorAge += dt
  enemy.behaviorPhase = 'kite'
  enemy.strafeTimer = finiteOr(enemy.strafeTimer, 1.4) - dt
  if (enemy.strafeTimer <= 0) {
    enemy.strafeDirection *= -1
    enemy.strafeTimer = 1.35 + Math.random() * 1.1
  }

  enemy.abilityCooldown -= dt
  if (enemy.abilityCooldown <= 0 && dist <= 480) {
    fireHexBolt(enemy, dx, dy, dist)
  }

  const towardX = dx / dist
  const towardY = dy / dist
  let radial = ((dist - 210) / 40) * speed * 0.38
  if (dist < HEX_MIN_RANGE) radial = -speed * 0.92
  else if (dist > HEX_MAX_RANGE) radial = speed * 0.82
  const strafe = speed * 0.62 * enemy.strafeDirection

  return {
    steer: 6,
    vx: (towardX * radial - towardY * strafe) * slow + sepVX,
    vy: (towardY * radial + towardX * strafe) * slow + sepVY,
  }
}

function movementForEnemy(enemy, dx, dy, dist, sepX, sepY, slow, dt) {
  const speed = Math.max(0, finiteOr(enemy.speed))
  const sepVX = sepX * ENEMY_SEP_FORCE
  const sepVY = sepY * ENEMY_SEP_FORCE

  if (enemy.archetype === 'ash_bat') {
    return ashBatMovement(enemy, dx, dy, dist, speed, slow, sepVX, sepVY, dt)
  }
  if (enemy.archetype === 'ironback_beetle') {
    return ironbackMovement(enemy, dx, dy, dist, speed, slow, sepVX, sepVY, dt)
  }
  if (enemy.archetype === 'hex_acolyte') {
    return hexAcolyteMovement(enemy, dx, dy, dist, speed, slow, sepVX, sepVY, dt)
  }

  return {
    steer: 6,
    vx: (dx / dist) * speed * slow + sepVX,
    vy: (dy / dist) * speed * slow + sepVY,
  }
}

function applyContactDamage(enemy, dist, dt) {
  if (dist >= enemy.r + player.r) return

  const isChargingBeetle =
    enemy.archetype === 'ironback_beetle' && enemy.behaviorPhase === 'charge'
  if (isChargingBeetle) {
    if (enemy.chargeHit) return
    const burstDamage = Math.max(
      0,
      finiteOr(enemy.chargeDamage, finiteOr(enemy.damage) * 1.6),
    )
    player.hp -= burstDamage
    enemy.chargeHit = true
    if (enemy.affix === 'leech') {
      const maxHp = finiteOr(enemy.maxHp, finiteOr(enemy.hp))
      enemy.hp = Math.min(
        maxHp,
        enemy.hp + burstDamage * ELITE_LEECH_HEAL_FACTOR,
      )
    }
    return
  }

  const contactDamage = Math.max(0, finiteOr(enemy.damage)) * dt
  player.hp -= contactDamage
  if (enemy.affix === 'leech') {
    const maxHp = finiteOr(enemy.maxHp, finiteOr(enemy.hp))
    enemy.hp = Math.min(
      maxHp,
      enemy.hp + contactDamage * ELITE_LEECH_HEAL_FACTOR,
    )
  }
}

export function updateEnemies(dt) {
  const step = Number.isFinite(dt) ? Math.max(0, dt) : 0
  enemyQuadtree.clear()
  for (const enemy of entities.enemies) {
    enemyQuadtree.insert(enemy)
  }

  for (let i = entities.enemies.length - 1; i >= 0; i -= 1) {
    const enemy = entities.enemies[i]
    sanitizeEnemyState(enemy)
    const dx = player.x - enemy.x
    const dy = player.y - enemy.y
    const dist = Math.hypot(dx, dy) || 1

    let sepX = 0
    let sepY = 0
    nearbyEnemies.length = 0
    enemyQuadtree.queryCircle(enemy.x, enemy.y, ENEMY_SEP_RADIUS, nearbyEnemies)
    for (const other of nearbyEnemies) {
      if (other === enemy) continue
      if (other.hp <= 0) continue
      const ox = enemy.x - other.x
      const oy = enemy.y - other.y
      const od = Math.hypot(ox, oy)
      if (od > 0 && od < ENEMY_SEP_RADIUS) {
        const push = (ENEMY_SEP_RADIUS - od) / ENEMY_SEP_RADIUS
        sepX += (ox / od) * push
        sepY += (oy / od) * push
      }
    }

    if (enemy.shockTimer > 0) enemy.shockTimer = Math.max(0, enemy.shockTimer - step)
    if (enemy.bladeHitTimer > 0) enemy.bladeHitTimer -= step
    if (enemy.orbHitTimer > 0) enemy.orbHitTimer -= step
    if (enemy.isElite) enemy.elitePulse += step * 6
    if (enemy.isBoss) enemy.bossPulse += step * 4
    const slow = enemy.shockTimer > 0 ? 0.55 : 1
    const movement = movementForEnemy(enemy, dx, dy, dist, sepX, sepY, slow, step)

    if (movement.direct) {
      enemy.vx = movement.vx
      enemy.vy = movement.vy
    } else {
      const steer = finiteOr(movement.steer, 6)
      enemy.vx += (movement.vx - enemy.vx) * steer * step
      enemy.vy += (movement.vy - enemy.vy) * steer * step
    }

    const kx = enemy.knockX
    const ky = enemy.knockY
    enemy.knockX *= 0.85
    enemy.knockY *= 0.85
    enemy.x += (enemy.vx + kx) * step
    enemy.y += (enemy.vy + ky) * step

    if (enemy.bladeHitTimer <= 0) {
      for (const blade of orbitCache.blades) {
        const bx = blade.x - enemy.x
        const by = blade.y - enemy.y
        if (Math.hypot(bx, by) < enemy.r + player.bladeSize * 0.5) {
          enemy.hp -= scaledDamage(player.bladeDamage)
          enemy.bladeHitTimer = scaledCooldown(player.bladeHitCooldown)
          break
        }
      }
    }

    if (enemy.orbHitTimer <= 0) {
      for (const orb of orbitCache.solars) {
        const ox = orb.x - enemy.x
        const oy = orb.y - enemy.y
        if (Math.hypot(ox, oy) < enemy.r + 8) {
          enemy.hp -= scaledDamage(player.orbDamage)
          enemy.orbHitTimer = scaledCooldown(player.orbHitCooldown)
          break
        }
      }
    }

    applyContactDamage(enemy, Math.hypot(player.x - enemy.x, player.y - enemy.y), step)

    if (enemy.hp <= 0) {
      entities.enemies.splice(i, 1)
      registerComboKill()
      state.kills += 1
      const orbValue = enemy.isBoss
        ? BOSS_XP_REWARD
        : finiteOr(enemy.xpValue, enemy.tier === 2 ? 12 : 8) +
          (enemy.isElite ? ELITE_XP_BONUS : 0)
      addOrb(enemy.x, enemy.y, orbValue)

      if (enemy.isBoss) {
        state.bossesDefeated += 1
        const rarity =
          enemy.bossWave >= 20 ? 'gold' : enemy.bossWave >= 10 ? 'silver' : null
        addRelicAt(
          enemy.x,
          enemy.y,
          rarity,
          'boss',
          Boolean(enemy.chestCanEvolve),
        )
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
