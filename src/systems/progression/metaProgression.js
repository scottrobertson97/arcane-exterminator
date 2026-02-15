import { player } from '../../state/gameState.js'

const SAVE_VERSION = 1
export const SAVE_KEY = 'waveSurvivors.save.v1'
export const META_RANK_CAP = 5
const META_COST_GROWTH = 1.6

export const metaNodes = [
  {
    id: 'max_hp',
    label: 'Vitality',
    baseCost: 3,
    perRank: 0.06,
    shortLabel: 'HP',
    key: 'maxHp',
  },
  {
    id: 'move_speed',
    label: 'Mobility',
    baseCost: 3,
    perRank: 0.03,
    shortLabel: 'SPD',
    key: 'moveSpeed',
  },
  {
    id: 'damage',
    label: 'Power',
    baseCost: 4,
    perRank: 0.05,
    shortLabel: 'DMG',
    key: 'damage',
  },
  {
    id: 'fire_rate',
    label: 'Tempo',
    baseCost: 4,
    perRank: 0.04,
    shortLabel: 'ROF',
    key: 'fireRate',
  },
  {
    id: 'xp_gain',
    label: 'Wisdom',
    baseCost: 3,
    perRank: 0.06,
    shortLabel: 'XP',
    key: 'xpGain',
  },
]

function createDefaultMetaRanks() {
  return {
    max_hp: 0,
    move_speed: 0,
    damage: 0,
    fire_rate: 0,
    xp_gain: 0,
  }
}

function createDefaultLifetime() {
  return {
    runs: 0,
    totalTime: 0,
    bestWave: 0,
    totalShardsEarned: 0,
  }
}

export function createDefaultSave() {
  return {
    version: SAVE_VERSION,
    shards: 0,
    metaRanks: createDefaultMetaRanks(),
    lifetime: createDefaultLifetime(),
  }
}

function toInt(value, fallback = 0) {
  return Number.isFinite(value) ? Math.floor(value) : fallback
}

function clampInt(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function sanitizeMetaRanks(raw) {
  const next = createDefaultMetaRanks()
  if (!raw || typeof raw !== 'object') return next

  for (const node of metaNodes) {
    const rank = toInt(raw[node.id], 0)
    next[node.id] = clampInt(rank, 0, META_RANK_CAP)
  }

  return next
}

function sanitizeLifetime(raw) {
  const next = createDefaultLifetime()
  if (!raw || typeof raw !== 'object') return next

  next.runs = Math.max(0, toInt(raw.runs, 0))
  next.totalTime = Math.max(0, toInt(raw.totalTime, 0))
  next.bestWave = Math.max(0, toInt(raw.bestWave, 0))
  next.totalShardsEarned = Math.max(0, toInt(raw.totalShardsEarned, 0))

  return next
}

function toCanonicalSave(raw) {
  const defaults = createDefaultSave()

  if (!raw || typeof raw !== 'object') return defaults

  const shards = Math.max(0, toInt(raw.shards, defaults.shards))
  const metaRanks = sanitizeMetaRanks(raw.metaRanks)
  const lifetime = sanitizeLifetime(raw.lifetime)

  return {
    version: SAVE_VERSION,
    shards,
    metaRanks,
    lifetime,
  }
}

function readStorage() {
  try {
    return localStorage.getItem(SAVE_KEY)
  } catch {
    return null
  }
}

export function saveProgress(saveData) {
  const canonical = toCanonicalSave(saveData)
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(canonical))
  } catch {
    // Ignore write failures (private mode/quota).
  }
  return canonical
}

export function loadSave() {
  const raw = readStorage()
  if (!raw) return createDefaultSave()

  let parsed = null
  try {
    parsed = JSON.parse(raw)
  } catch {
    const defaults = createDefaultSave()
    saveProgress(defaults)
    return defaults
  }

  const canonical = toCanonicalSave(parsed)
  const parsedVersion = toInt(parsed?.version, -1)
  const needsRewrite = parsedVersion !== SAVE_VERSION || raw !== JSON.stringify(canonical)

  if (needsRewrite) {
    saveProgress(canonical)
  }

  return canonical
}

export function resetSaveProgress() {
  return saveProgress(createDefaultSave())
}

export function getMetaRank(saveData, nodeId) {
  const rank = toInt(saveData?.metaRanks?.[nodeId], 0)
  return clampInt(rank, 0, META_RANK_CAP)
}

export function getNextMetaCost(node, currentRank) {
  if (currentRank >= META_RANK_CAP) return 0
  return Math.ceil(node.baseCost * Math.pow(META_COST_GROWTH, currentRank))
}

export function canPurchaseMetaRank(saveData, nodeId) {
  const node = metaNodes.find(entry => entry.id === nodeId)
  if (!node) return false
  const rank = getMetaRank(saveData, nodeId)
  if (rank >= META_RANK_CAP) return false
  const cost = getNextMetaCost(node, rank)
  return (saveData?.shards || 0) >= cost
}

export function purchaseMetaRank(saveData, nodeId) {
  const node = metaNodes.find(entry => entry.id === nodeId)
  if (!node) return false

  const currentRank = getMetaRank(saveData, nodeId)
  if (currentRank >= META_RANK_CAP) return false

  const cost = getNextMetaCost(node, currentRank)
  if ((saveData?.shards || 0) < cost) return false

  saveData.shards -= cost
  saveData.metaRanks[nodeId] = currentRank + 1
  return true
}

function calcNodeMultiplier(node, rank) {
  return Math.pow(1 + node.perRank, rank)
}

export function getMetaMultipliers(metaRanks) {
  const ranks = sanitizeMetaRanks(metaRanks)

  return {
    maxHp: calcNodeMultiplier(metaNodes[0], ranks.max_hp),
    moveSpeed: calcNodeMultiplier(metaNodes[1], ranks.move_speed),
    damage: calcNodeMultiplier(metaNodes[2], ranks.damage),
    fireRate: calcNodeMultiplier(metaNodes[3], ranks.fire_rate),
    xpGain: calcNodeMultiplier(metaNodes[4], ranks.xp_gain),
  }
}

function formatPercent(multiplier) {
  const pct = (multiplier - 1) * 100
  const rounded = Math.round(pct * 10) / 10
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1)
}

export function buildMetaBonusText(metaRanks) {
  const mult = getMetaMultipliers(metaRanks)
  return `Perm: HP +${formatPercent(mult.maxHp)}% SPD +${formatPercent(mult.moveSpeed)}% DMG +${formatPercent(mult.damage)}% ROF +${formatPercent(mult.fireRate)}% XP +${formatPercent(mult.xpGain)}%`
}

export function describeMetaNode(node, rank) {
  const nextRank = Math.min(META_RANK_CAP, rank + 1)
  const bonus = (Math.pow(1 + node.perRank, nextRank) - 1) * 100
  const rounded = Math.round(bonus * 10) / 10
  const value = Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1)
  return `Rank ${nextRank}/${META_RANK_CAP}: ${node.shortLabel} +${value}%`
}

export function applyMetaBonuses(metaRanks) {
  const mult = getMetaMultipliers(metaRanks)

  player.maxHp = Math.max(1, Math.round(player.maxHp * mult.maxHp))
  player.hp = player.maxHp
  player.speed = Math.max(1, Math.round(player.speed * mult.moveSpeed))
  player.damage = Math.max(1, Math.round(player.damage * mult.damage))
  player.fireRate = +(player.fireRate * mult.fireRate).toFixed(2)
  player.xpGainMultiplier = mult.xpGain

  return mult
}

export function computeShardReward(elapsedSeconds, wave) {
  const safeElapsed = Math.max(0, elapsedSeconds)
  const safeWave = Math.max(1, wave)
  const earned = Math.floor(safeElapsed / 25) + Math.max(0, safeWave - 1) * 2
  return Math.max(3, earned)
}

export function awardRunShards(saveData, elapsedSeconds, wave) {
  const earned = computeShardReward(elapsedSeconds, wave)
  saveData.shards += earned
  saveData.lifetime.runs += 1
  saveData.lifetime.totalTime += Math.max(0, Math.floor(elapsedSeconds))
  saveData.lifetime.bestWave = Math.max(saveData.lifetime.bestWave, Math.max(1, wave))
  saveData.lifetime.totalShardsEarned += earned
  return earned
}
