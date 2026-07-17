import {
  BOSS_DAMAGE,
  BOSS_HP_BASE,
  BOSS_HP_WAVE_SCALE,
  BOSS_RADIUS,
  BOSS_SPEED_BASE,
  BOSS_SPEED_WAVE_SCALE,
  EVOLUTION_START_WAVE,
  ELITE_BASE_CHANCE,
  ELITE_FAST_SPEED_MULT,
  ELITE_MAX_CHANCE,
  ELITE_TANK_HP_MULT,
  ELITE_WAVE_BONUS,
  MAX_XP_ORBS,
  RELIC_BRONZE_CHANCE,
  RELIC_GOLD_CHANCE,
  RELIC_SILVER_CHANCE,
  WORLD_WIDTH,
  WORLD_HEIGHT,
} from '../../config/constants.js'
import {
  chooseEnemyArchetype,
  getEnemyArchetype,
} from '../../data/enemyArchetypes.js'
import { stageItemDefs } from '../../data/stageItems.js'
import { entities, state } from '../../state/gameState.js'
import { camera } from '../../core/camera.js'

const eliteAffixes = ['fast', 'tank', 'volatile', 'leech']

function randomEliteAffix() {
  return eliteAffixes[Math.floor(Math.random() * eliteAffixes.length)]
}

function randomAbilityCooldown(behavior) {
  if (behavior === 'swoop') return 0.8 + Math.random() * 0.8
  if (behavior === 'charge') return 1.5 + Math.random() * 1.2
  if (behavior === 'kite') return 1 + Math.random() * 1.1
  return 0
}

function getEdgeSpawnPoint(margin) {
  const edge = Math.floor(Math.random() * 4)
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

  return {
    x: Math.max(0, Math.min(WORLD_WIDTH, x)),
    y: Math.max(0, Math.min(WORLD_HEIGHT, y)),
  }
}

function rollRelicRarity() {
  const total = RELIC_GOLD_CHANCE + RELIC_SILVER_CHANCE + RELIC_BRONZE_CHANCE
  const roll = Math.random() * total
  if (roll < RELIC_GOLD_CHANCE) return 'gold'
  if (roll < RELIC_GOLD_CHANCE + RELIC_SILVER_CHANCE) return 'silver'
  return 'bronze'
}

export function addOrb(x, y, value) {
  if (entities.orbs.length >= MAX_XP_ORBS) {
    const overflowOrb =
      entities.orbs.find(orb => orb.isOverflow) || entities.orbs[0]
    overflowOrb.value += value
    overflowOrb.isOverflow = true
    overflowOrb.r = Math.min(10, 7 + Math.log10(Math.max(1, overflowOrb.value)))
    return
  }

  entities.orbs.push({
    x,
    y,
    baseY: y,
    bob: 0,
    r: 6,
    value,
    drift: Math.random() * Math.PI * 2,
    isOverflow: false,
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
  entities.relics.push({
    x,
    y,
    r: 10,
    wobble: Math.random() * Math.PI * 2,
    rarity: rollRelicRarity(),
    source: 'world',
    canEvolve: false,
  })
}

export function addRelicAt(
  x,
  y,
  rarity = null,
  source = 'world',
  canEvolve = false,
) {
  entities.relics.push({
    x: Math.max(40, Math.min(WORLD_WIDTH - 40, x)),
    y: Math.max(40, Math.min(WORLD_HEIGHT - 40, y)),
    r: 10,
    wobble: Math.random() * Math.PI * 2,
    rarity: rarity || rollRelicRarity(),
    source,
    canEvolve,
  })
}

export function spawnStageItems() {
  entities.stageItems.length = 0
  for (const definition of stageItemDefs) {
    entities.stageItems.push({
      ...definition,
      r: 14,
      wobble: Math.random() * Math.PI * 2,
    })
  }
}

function createEnemy(x, y, options = {}) {
  const wave = Math.floor(state.elapsed / state.waveDuration) + 1
  const archetype = options.forcedArchetype
    ? getEnemyArchetype(options.forcedArchetype)
    : chooseEnemyArchetype(options.enemyMix)
  const tierChance =
    options.tier2Chance ?? Math.min(0.15 + wave * 0.01, 0.4)
  const tier = options.forcedTier || (Math.random() < tierChance ? 2 : 1)
  const eliteChance = Math.min(ELITE_MAX_CHANCE, ELITE_BASE_CHANCE + wave * ELITE_WAVE_BONUS)
  const isElite =
    options.forcedElite === undefined
      ? Boolean(options.forcedAffix) || Math.random() < eliteChance
      : Boolean(options.forcedElite)
  const affix = isElite ? options.forcedAffix || randomEliteAffix() : null
  const baseHp = tier === 2 ? 70 : 40
  const baseSpeed = tier === 2 ? 70 : 90
  let hp = Math.round(
    (baseHp + wave * 8) * archetype.hpMultiplier * (options.hpMultiplier ?? 1),
  )
  let speed =
    (baseSpeed + wave * 4) *
    archetype.speedMultiplier *
    (options.speedMultiplier ?? 1)
  let r = (tier === 2 ? 16 : 12) + archetype.radiusDelta
  const damage =
    (tier === 2 ? 18 : 12) *
    archetype.damageMultiplier *
    (options.damageMultiplier ?? 1)

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

  const enemy = {
    x: Math.max(0, Math.min(WORLD_WIDTH, x)),
    y: Math.max(0, Math.min(WORLD_HEIGHT, y)),
    r,
    hp,
    maxHp: hp,
    speed,
    damage,
    tier,
    archetype: archetype.id,
    spriteKey:
      archetype.id === 'rat' && tier === 2 ? 'rat_big' : archetype.spriteKey,
    behavior: archetype.behavior,
    xpValue: (tier === 2 ? 12 : 8) + archetype.xpBonus,
    isElite,
    affix,
    elitePulse: Math.random() * Math.PI * 2,
    behaviorAge: 0,
    behaviorPhase: 'seek',
    phaseTimer: 0,
    abilityCooldown: randomAbilityCooldown(archetype.behavior),
    chargeX: 0,
    chargeY: 0,
    chargeHit: false,
    strafeDirection: Math.random() < 0.5 ? -1 : 1,
    vx: 0,
    vy: 0,
    knockX: 0,
    knockY: 0,
    shockTimer: 0,
    bladeHitTimer: 0,
    orbHitTimer: 0,
    eventSpawn: Boolean(options.eventSpawn),
  }
  entities.enemies.push(enemy)
  return enemy
}

export function spawnEnemy(options = {}) {
  const position = getEdgeSpawnPoint(120)
  return createEnemy(position.x, position.y, options)
}

export function spawnEnemyAt(x, y, options = {}) {
  return createEnemy(Number(x) || 0, Number(y) || 0, options)
}

export function spawnEnemyPack(count, options = {}) {
  for (let i = 0; i < count; i += 1) spawnEnemy(options)
}

export function spawnMiniBoss(wave) {
  const { x, y } = getEdgeSpawnPoint(140)

  const hp = Math.round(BOSS_HP_BASE + wave * BOSS_HP_WAVE_SCALE)
  const speed = BOSS_SPEED_BASE + wave * BOSS_SPEED_WAVE_SCALE

  entities.enemies.push({
    x,
    y,
    r: BOSS_RADIUS,
    hp,
    maxHp: hp,
    speed,
    damage: BOSS_DAMAGE,
    tier: 2,
    archetype: 'rat',
    spriteKey: 'rat_big',
    behavior: 'seek',
    isElite: false,
    affix: null,
    elitePulse: 0,
    behaviorAge: 0,
    behaviorPhase: 'seek',
    phaseTimer: 0,
    abilityCooldown: 0,
    chargeX: 0,
    chargeY: 0,
    chargeHit: false,
    strafeDirection: 1,
    isBoss: true,
    bossWave: wave,
    chestCanEvolve: wave >= EVOLUTION_START_WAVE,
    bossPulse: Math.random() * Math.PI * 2,
    vx: 0,
    vy: 0,
    knockX: 0,
    knockY: 0,
    shockTimer: 0,
    bladeHitTimer: 0,
    orbHitTimer: 0,
  })
}
