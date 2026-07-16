import { STAGE_WAVE_COUNT } from '../config/constants.js'

const waveDefs = [
  { minAlive: 12, spawnInterval: 0.95, tier2Chance: 0.05 },
  {
    minAlive: 18,
    spawnInterval: 0.82,
    tier2Chance: 0.08,
    event: { count: 6, speedMultiplier: 1.35, hpMultiplier: 0.8 },
  },
  { minAlive: 24, spawnInterval: 0.72, tier2Chance: 0.12 },
  {
    minAlive: 30,
    spawnInterval: 0.62,
    tier2Chance: 0.15,
    event: { count: 10, speedMultiplier: 1.2 },
  },
  { minAlive: 34, spawnInterval: 0.58, tier2Chance: 0.18 },
  { minAlive: 38, spawnInterval: 0.52, tier2Chance: 0.2 },
  {
    minAlive: 44,
    spawnInterval: 0.48,
    tier2Chance: 0.22,
    event: { count: 12, speedMultiplier: 1.4, hpMultiplier: 0.82 },
  },
  { minAlive: 50, spawnInterval: 0.44, tier2Chance: 0.24 },
  { minAlive: 56, spawnInterval: 0.4, tier2Chance: 0.26 },
  {
    minAlive: 62,
    spawnInterval: 0.36,
    tier2Chance: 0.28,
    event: { count: 14, hpMultiplier: 1.15, speedMultiplier: 0.9 },
  },
  {
    minAlive: 85,
    spawnInterval: 0.24,
    tier2Chance: 0.05,
    hpMultiplier: 0.65,
    speedMultiplier: 1.12,
    event: { count: 26, hpMultiplier: 0.55, speedMultiplier: 1.25 },
  },
  { minAlive: 70, spawnInterval: 0.32, tier2Chance: 0.3 },
  { minAlive: 76, spawnInterval: 0.3, tier2Chance: 0.32 },
  {
    minAlive: 82,
    spawnInterval: 0.28,
    tier2Chance: 0.34,
    event: { count: 16, speedMultiplier: 1.35 },
  },
  { minAlive: 90, spawnInterval: 0.26, tier2Chance: 0.36 },
  { minAlive: 96, spawnInterval: 0.24, tier2Chance: 0.38 },
  {
    minAlive: 105,
    spawnInterval: 0.22,
    tier2Chance: 0.4,
    event: { count: 20, hpMultiplier: 1.2, speedMultiplier: 0.92 },
  },
  { minAlive: 115, spawnInterval: 0.21, tier2Chance: 0.42 },
  { minAlive: 125, spawnInterval: 0.2, tier2Chance: 0.44 },
  {
    minAlive: 140,
    spawnInterval: 0.18,
    tier2Chance: 0.46,
    event: { count: 24, speedMultiplier: 1.3, hpMultiplier: 1.1 },
  },
]

export function getWaveNumber(elapsed, waveDuration) {
  const wave = Math.floor(Math.max(0, elapsed) / waveDuration) + 1
  return Math.min(STAGE_WAVE_COUNT, Math.max(1, wave))
}

export function getWaveConfig(wave) {
  return waveDefs[Math.min(waveDefs.length, Math.max(1, wave)) - 1]
}
