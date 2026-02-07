import { BOSS_WAVE_INTERVAL, WORLD_WIDTH, WORLD_HEIGHT } from '../config/constants.js'
import { applyZoom } from '../core/camera.js'
import { zoomState, player, entities, orbitCache, state, timers } from './gameState.js'

export function resetGame() {
  zoomState.index = 1
  applyZoom()

  player.x = WORLD_WIDTH / 2
  player.y = WORLD_HEIGHT / 2
  player.hp = player.maxHp
  player.xp = 0
  player.level = 0
  player.nextXp = 20
  player.speed = 180
  player.isMoving = false
  player.damage = 18
  player.fireRate = 1.2
  player.bulletSpeed = 420
  player.pickupRadius = 30
  player.pulseCooldown = 4.5
  player.pulseRadius = 120
  player.pulseDamage = 28
  player.pulseKnockback = 320
  player.pulseUnlocked = false
  player.novaCooldown = 2.6
  player.novaRadius = 70
  player.novaDamage = 14
  player.novaKnockback = 220
  player.novaUnlocked = false
  player.bladesUnlocked = false
  player.bladeCount = 2
  player.bladeRadius = 34
  player.bladeSpeed = 2.4
  player.bladeDamage = 14
  player.bladeHitCooldown = 0.35
  player.bladeSize = 22
  player.bladeAngle = 0
  player.frostFireRate = 0.9
  player.frostDamage = 10
  player.frostSpeed = 360
  player.frostPierce = 2
  player.frostShots = 2
  player.frostUnlocked = false
  player.chainCooldown = 1.6
  player.chainDamage = 12
  player.chainRange = 120
  player.chainCount = 2
  player.chainUnlocked = false
  player.starfallCooldown = 3.4
  player.starfallCount = 8
  player.starfallDamage = 10
  player.starfallSpeed = 280
  player.starfallLife = 0.9
  player.starfallUnlocked = false
  player.mineCooldown = 5.5
  player.mineDamage = 22
  player.mineRadius = 54
  player.mineArmTime = 0.35
  player.mineMaxActive = 2
  player.mineLifetime = 8
  player.mineUnlocked = false
  player.trailSpawnInterval = 0.3
  player.trailPatchLife = 1.2
  player.trailRadius = 20
  player.trailDps = 14
  player.trailMaxPatches = 24
  player.trailUnlocked = false
  player.vortexCooldown = 7
  player.vortexDuration = 2.2
  player.vortexRadius = 120
  player.vortexPull = 260
  player.vortexDps = 9
  player.vortexUnlocked = false
  player.orbCount = 1
  player.orbRadius = 60
  player.orbSpeed = 1.2
  player.orbDamage = 8
  player.orbHitCooldown = 0.6
  player.orbAngle = 0
  player.orbUnlocked = false
  player.upgrades = { bullets: 1 }

  entities.bullets.length = 0
  entities.enemies.length = 0
  entities.orbs.length = 0
  entities.mines.length = 0
  entities.trails.length = 0
  entities.vortexes.length = 0
  entities.relics.length = 0
  entities.healthPacks.length = 0
  entities.pulses.length = 0
  entities.particles.length = 0
  entities.chainArcs.length = 0
  orbitCache.blades.length = 0
  orbitCache.solars.length = 0

  state.elapsed = 0
  state.nextBossWave = BOSS_WAVE_INTERVAL
  state.pendingLevels = 0
  state.pendingStatUps = 0
  state.pendingRelicRarities.length = 0

  timers.shoot = 0
  timers.starfall = 0
  timers.spawn = 0
  timers.mines = 0
  timers.trail = 0
  timers.vortex = 0
  timers.pulse = 0
  timers.nova = 0
  timers.frost = 0
  timers.chain = 0
  timers.relic = 6
}
