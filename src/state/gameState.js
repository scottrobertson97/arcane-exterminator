import { canvas } from '../core/dom.js'
import { WORLD_WIDTH, WORLD_HEIGHT, zoomLevels } from '../config/constants.js'

export const zoomState = {
  index: 1,
  zoom: zoomLevels[1],
  viewWidth: canvas.width / zoomLevels[1],
  viewHeight: canvas.height / zoomLevels[1],
}

export const state = {
  running: false,
  paused: false,
  lastTime: 0,
  elapsed: 0,
  waveDuration: 30,
  nextBossWave: 5,
  pendingLevels: 0,
  pendingStatUps: 0,
}

export const input = {
  up: false,
  down: false,
  left: false,
  right: false,
  mouseActive: false,
  mouseX: 0,
  mouseY: 0,
}

export const player = {
  x: WORLD_WIDTH / 2,
  y: WORLD_HEIGHT / 2,
  r: 12,
  speed: 180,
  maxHp: 100,
  hp: 100,
  damage: 18,
  fireRate: 1.2,
  bulletSpeed: 420,
  xp: 0,
  level: 1,
  nextXp: 20,
  pickupRadius: 30,
  pulseCooldown: 4.5,
  pulseRadius: 120,
  pulseDamage: 28,
  pulseKnockback: 320,
  pulseUnlocked: false,
  novaCooldown: 2.6,
  novaRadius: 70,
  novaDamage: 14,
  novaKnockback: 220,
  novaUnlocked: false,
  bladeCount: 2,
  bladeRadius: 34,
  bladeSpeed: 2.4,
  bladeDamage: 14,
  bladeHitCooldown: 0.35,
  bladeSize: 22,
  bladeAngle: 0,
  bladesUnlocked: false,
  frostFireRate: 0.9,
  frostDamage: 10,
  frostSpeed: 360,
  frostPierce: 2,
  frostShots: 2,
  frostUnlocked: false,
  chainCooldown: 1.6,
  chainDamage: 12,
  chainRange: 120,
  chainCount: 2,
  chainUnlocked: false,
  orbCount: 1,
  orbRadius: 60,
  orbSpeed: 1.2,
  orbDamage: 8,
  orbHitCooldown: 0.6,
  orbAngle: 0,
  orbUnlocked: false,
  upgrades: {},
}

export const entities = {
  bullets: [],
  enemies: [],
  orbs: [],
  relics: [],
  healthPacks: [],
  pulses: [],
  particles: [],
  chainArcs: [],
}

export const orbitCache = {
  blades: [],
  solars: [],
}

export const timers = {
  shoot: 0,
  spawn: 0,
  pulse: 0,
  nova: 0,
  frost: 0,
  chain: 0,
  relic: 0,
}
