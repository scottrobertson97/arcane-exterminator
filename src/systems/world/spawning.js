import {
  ELITE_BASE_CHANCE,
  ELITE_FAST_SPEED_MULT,
  ELITE_MAX_CHANCE,
  ELITE_TANK_HP_MULT,
  ELITE_WAVE_BONUS,
  WORLD_WIDTH,
  WORLD_HEIGHT,
} from '../../config/constants.js'
import { entities, state } from '../../state/gameState.js'
import { camera } from '../../core/camera.js'

const eliteAffixes = ['fast', 'tank', 'volatile', 'leech']

function randomEliteAffix() {
  return eliteAffixes[Math.floor(Math.random() * eliteAffixes.length)]
}

export function addOrb(x, y, value) {
  entities.orbs.push({
    x,
    y,
    baseY: y,
    bob: 0,
    r: 6,
    value,
    drift: Math.random() * Math.PI * 2,
  })
}

export function addRelic() {
  const cam = camera()
  const margin = 60
  const x = Math.max(
    margin,
    Math.min(WORLD_WIDTH - margin, cam.x + Math.random() * cam.viewWidth),
  )
  const y = Math.max(
    margin,
    Math.min(WORLD_HEIGHT - margin, cam.y + Math.random() * cam.viewHeight),
  )
  entities.relics.push({ x, y, r: 10, wobble: Math.random() * Math.PI * 2 })
}

export function spawnEnemy() {
  const wave = Math.floor(state.elapsed / state.waveDuration) + 1
  const edge = Math.floor(Math.random() * 4)
  const margin = 120
  const cam = camera()
  let x = 0
  let y = 0

  if (edge === 0) {
    x = cam.x - margin
    y = cam.y + Math.random() * cam.viewHeight
  } else if (edge === 1) {
    x = cam.x + cam.viewWidth + margin
    y = cam.y + Math.random() * cam.viewHeight
  } else if (edge === 2) {
    x = cam.x + Math.random() * cam.viewWidth
    y = cam.y - margin
  } else {
    x = cam.x + Math.random() * cam.viewWidth
    y = cam.y + cam.viewHeight + margin
  }

  x = Math.max(0, Math.min(WORLD_WIDTH, x))
  y = Math.max(0, Math.min(WORLD_HEIGHT, y))

  const tier = Math.random() < Math.min(0.15 + wave * 0.01, 0.4) ? 2 : 1
  const eliteChance = Math.min(ELITE_MAX_CHANCE, ELITE_BASE_CHANCE + wave * ELITE_WAVE_BONUS)
  const isElite = Math.random() < eliteChance
  const affix = isElite ? randomEliteAffix() : null
  const baseHp = tier === 2 ? 70 : 40
  const baseSpeed = tier === 2 ? 70 : 90
  let hp = Math.round(baseHp + wave * 8)
  let speed = baseSpeed + wave * 4
  let r = tier === 2 ? 16 : 12
  const damage = tier === 2 ? 18 : 12

  if (affix === 'fast') {
    speed *= ELITE_FAST_SPEED_MULT
  } else if (affix === 'tank') {
    hp = Math.round(hp * ELITE_TANK_HP_MULT)
    speed *= 0.88
    r += 2
  } else if (affix === 'leech') {
    hp = Math.round(hp * 1.15)
  } else if (affix === 'volatile') {
    speed *= 1.08
  }

  entities.enemies.push({
    x,
    y,
    r,
    hp,
    maxHp: hp,
    speed,
    damage,
    tier,
    isElite,
    affix,
    elitePulse: Math.random() * Math.PI * 2,
    vx: 0,
    vy: 0,
    knockX: 0,
    knockY: 0,
    shockTimer: 0,
    bladeHitTimer: 0,
    orbHitTimer: 0,
  })
}
