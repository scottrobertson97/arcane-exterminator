import { WORLD_WIDTH, WORLD_HEIGHT } from '../../config/constants.js'
import { entities, state } from '../../state/gameState.js'
import { camera } from '../../core/camera.js'

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
  const baseHp = tier === 2 ? 70 : 40
  const baseSpeed = tier === 2 ? 70 : 90

  entities.enemies.push({
    x,
    y,
    r: tier === 2 ? 16 : 12,
    hp: Math.round(baseHp + wave * 8),
    maxHp: Math.round(baseHp + wave * 8),
    speed: baseSpeed + wave * 4,
    damage: tier === 2 ? 18 : 12,
    tier,
    vx: 0,
    vy: 0,
    knockX: 0,
    knockY: 0,
    shockTimer: 0,
    bladeHitTimer: 0,
    orbHitTimer: 0,
  })
}
