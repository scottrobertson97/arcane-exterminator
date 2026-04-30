import {
  COMBO_KILLS_PER_STEP,
  COMBO_TIMEOUT,
  COMBO_XP_BONUS_PER_STEP,
  COMBO_XP_MAX_BONUS,
} from '../../config/constants.js'
import { player, state } from '../../state/gameState.js'

let showLevelUpHandler = () => {}

export function setShowLevelUpHandler(fn) {
  showLevelUpHandler = fn
}

function resetComboState() {
  state.comboKills = 0
  state.comboExpiresAt = 0
  state.comboXpMultiplier = 1
}

function syncComboState() {
  if (state.comboKills === 0) {
    state.comboXpMultiplier = 1
    return
  }

  if (state.elapsed >= state.comboExpiresAt) {
    resetComboState()
  }
}

function updateComboMultiplier() {
  const bonusSteps = Math.floor(state.comboKills / COMBO_KILLS_PER_STEP)
  const bonus = Math.min(COMBO_XP_MAX_BONUS, bonusSteps * COMBO_XP_BONUS_PER_STEP)
  state.comboXpMultiplier = +(1 + bonus).toFixed(2)
}

export function registerComboKill() {
  syncComboState()
  state.comboKills += 1
  state.comboExpiresAt = state.elapsed + COMBO_TIMEOUT
  updateComboMultiplier()
}

export function getComboSnapshot() {
  syncComboState()
  const remaining = Math.max(0, state.comboExpiresAt - state.elapsed)
  return {
    active: remaining > 0 && state.comboKills > 0,
    kills: state.comboKills,
    multiplier: state.comboXpMultiplier,
    remaining,
  }
}

function getXpMultiplier() {
  syncComboState()
  return (player.xpGainMultiplier || 1) * state.comboXpMultiplier
}

export function gainXp(baseAmount) {
  const effectiveXp = Math.max(1, Math.round(baseAmount * getXpMultiplier()))
  player.xp += effectiveXp
  while (player.xp >= player.nextXp) {
    player.xp -= player.nextXp
    player.level += 1
    player.nextXp = Math.round(20 + player.level * 10)
    state.pendingLevels += 1
  }

  if (state.pendingLevels > 0 && !state.paused) {
    showLevelUpHandler()
  }

  return effectiveXp
}

export function getUpgradeLevel(id) {
  return player.upgrades[id] || 0
}

export function applyUpgrade(option) {
  const current = getUpgradeLevel(option.id)
  if (current >= option.max) return
  const next = current + 1
  option.apply(next)
  player.upgrades[option.id] = next
}
