import { STAGE_WAVE_COUNT } from '../config/constants.js'

function enemyMix(entries) {
  return Object.freeze(entries.map(entry => Object.freeze({ ...entry })))
}

const RAT_ONLY = enemyMix([{ id: 'rat', weight: 1 }])
const BAT_INTRO = enemyMix([
  { id: 'rat', weight: 0.78 },
  { id: 'ash_bat', weight: 0.22 },
])
const BEETLE_INTRO = enemyMix([
  { id: 'rat', weight: 0.64 },
  { id: 'ash_bat', weight: 0.22 },
  { id: 'ironback_beetle', weight: 0.14 },
])
const ACOLYTE_INTRO = enemyMix([
  { id: 'rat', weight: 0.58 },
  { id: 'ash_bat', weight: 0.2 },
  { id: 'ironback_beetle', weight: 0.14 },
  { id: 'hex_acolyte', weight: 0.08 },
])
const MID_STAGE = enemyMix([
  { id: 'rat', weight: 0.52 },
  { id: 'ash_bat', weight: 0.2 },
  { id: 'ironback_beetle', weight: 0.16 },
  { id: 'hex_acolyte', weight: 0.12 },
])
const LATE_STAGE = enemyMix([
  { id: 'rat', weight: 0.5 },
  { id: 'ash_bat', weight: 0.19 },
  { id: 'ironback_beetle', weight: 0.17 },
  { id: 'hex_acolyte', weight: 0.14 },
])
const FINAL_STAGE = enemyMix([
  { id: 'rat', weight: 0.5 },
  { id: 'ash_bat', weight: 0.18 },
  { id: 'ironback_beetle', weight: 0.16 },
  { id: 'hex_acolyte', weight: 0.16 },
])
const BAT_SURGE = enemyMix([
  { id: 'rat', weight: 0.4 },
  { id: 'ash_bat', weight: 0.6 },
])
const BEETLE_SURGE = enemyMix([
  { id: 'rat', weight: 0.45 },
  { id: 'ash_bat', weight: 0.1 },
  { id: 'ironback_beetle', weight: 0.45 },
])
const ACOLYTE_SURGE = enemyMix([
  { id: 'rat', weight: 0.42 },
  { id: 'ash_bat', weight: 0.12 },
  { id: 'ironback_beetle', weight: 0.16 },
  { id: 'hex_acolyte', weight: 0.3 },
])

const waveDefs = [
  { minAlive: 12, spawnInterval: 0.95, tier2Chance: 0.05, enemyMix: RAT_ONLY },
  {
    minAlive: 18,
    spawnInterval: 0.82,
    tier2Chance: 0.08,
    enemyMix: BAT_INTRO,
    event: {
      count: 6,
      speedMultiplier: 1.35,
      hpMultiplier: 0.8,
      enemyMix: BAT_SURGE,
    },
  },
  { minAlive: 24, spawnInterval: 0.72, tier2Chance: 0.12, enemyMix: BAT_INTRO },
  {
    minAlive: 30,
    spawnInterval: 0.62,
    tier2Chance: 0.15,
    enemyMix: BAT_INTRO,
    event: { count: 10, speedMultiplier: 1.2, enemyMix: BAT_SURGE },
  },
  { minAlive: 34, spawnInterval: 0.58, tier2Chance: 0.18, enemyMix: BEETLE_INTRO },
  { minAlive: 38, spawnInterval: 0.52, tier2Chance: 0.2, enemyMix: BEETLE_INTRO },
  {
    minAlive: 44,
    spawnInterval: 0.48,
    tier2Chance: 0.22,
    enemyMix: BEETLE_INTRO,
    event: {
      count: 12,
      speedMultiplier: 1.4,
      hpMultiplier: 0.82,
      enemyMix: BAT_SURGE,
    },
  },
  { minAlive: 50, spawnInterval: 0.44, tier2Chance: 0.24, enemyMix: ACOLYTE_INTRO },
  { minAlive: 56, spawnInterval: 0.4, tier2Chance: 0.26, enemyMix: ACOLYTE_INTRO },
  {
    minAlive: 62,
    spawnInterval: 0.36,
    tier2Chance: 0.28,
    enemyMix: ACOLYTE_INTRO,
    event: {
      count: 14,
      hpMultiplier: 1.15,
      speedMultiplier: 0.9,
      enemyMix: BEETLE_SURGE,
    },
  },
  {
    minAlive: 85,
    spawnInterval: 0.24,
    tier2Chance: 0.05,
    hpMultiplier: 0.65,
    speedMultiplier: 1.12,
    enemyMix: MID_STAGE,
    event: {
      count: 26,
      hpMultiplier: 0.55,
      speedMultiplier: 1.25,
      enemyMix: BAT_SURGE,
    },
  },
  { minAlive: 70, spawnInterval: 0.32, tier2Chance: 0.3, enemyMix: MID_STAGE },
  { minAlive: 76, spawnInterval: 0.3, tier2Chance: 0.32, enemyMix: MID_STAGE },
  {
    minAlive: 82,
    spawnInterval: 0.28,
    tier2Chance: 0.34,
    enemyMix: MID_STAGE,
    event: { count: 16, speedMultiplier: 1.35, enemyMix: ACOLYTE_SURGE },
  },
  { minAlive: 90, spawnInterval: 0.26, tier2Chance: 0.36, enemyMix: MID_STAGE },
  { minAlive: 96, spawnInterval: 0.24, tier2Chance: 0.38, enemyMix: LATE_STAGE },
  {
    minAlive: 105,
    spawnInterval: 0.22,
    tier2Chance: 0.4,
    enemyMix: LATE_STAGE,
    event: {
      count: 20,
      hpMultiplier: 1.2,
      speedMultiplier: 0.92,
      enemyMix: BEETLE_SURGE,
    },
  },
  { minAlive: 115, spawnInterval: 0.21, tier2Chance: 0.42, enemyMix: LATE_STAGE },
  { minAlive: 125, spawnInterval: 0.2, tier2Chance: 0.44, enemyMix: FINAL_STAGE },
  {
    minAlive: 140,
    spawnInterval: 0.18,
    tier2Chance: 0.46,
    enemyMix: FINAL_STAGE,
    event: {
      count: 24,
      speedMultiplier: 1.3,
      hpMultiplier: 1.1,
      enemyMix: ACOLYTE_SURGE,
    },
  },
]

export function getWaveNumber(elapsed, waveDuration) {
  const wave = Math.floor(Math.max(0, elapsed) / waveDuration) + 1
  return Math.min(STAGE_WAVE_COUNT, Math.max(1, wave))
}

export function getWaveConfig(wave) {
  return waveDefs[Math.min(waveDefs.length, Math.max(1, wave)) - 1]
}
