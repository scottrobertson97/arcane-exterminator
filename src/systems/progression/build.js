import {
  MAX_PASSIVE_SLOTS,
  MAX_WEAPON_SLOTS,
} from '../../config/constants.js'
import { evolutionDefs } from '../../data/evolutions.js'
import { upgradeDefs } from '../../data/upgrades.js'
import { player, state, timers } from '../../state/gameState.js'

export function getOwnedUpgradeCount(kind) {
  return upgradeDefs.filter(
    option => option.kind === kind && (player.upgrades[option.id] || 0) > 0,
  ).length
}

export function canOfferUpgradeBySlots(option) {
  if ((player.upgrades[option.id] || 0) > 0) return true

  if (option.kind === 'passive') {
    return getOwnedUpgradeCount('passive') < MAX_PASSIVE_SLOTS
  }

  return getOwnedUpgradeCount('weapon') < MAX_WEAPON_SLOTS
}

export function isWeaponEvolved(weaponId) {
  return evolutionDefs.some(
    recipe => recipe.weaponId === weaponId && player.evolutions[recipe.id],
  )
}

export function getEligibleEvolutions() {
  return evolutionDefs.filter(recipe => {
    if (player.evolutions[recipe.id]) return false
    const weapon = upgradeDefs.find(option => option.id === recipe.weaponId)
    if (!weapon) return false
    const weaponLevel = player.upgrades[recipe.weaponId] || 0
    const passiveLevel = player.upgrades[recipe.passiveId] || 0
    return weaponLevel >= weapon.max && passiveLevel > 0
  })
}

function resetEvolvedWeaponTimer(weaponId) {
  const timerKey = {
    bullets: 'shoot',
    frost: 'frost',
    nova: 'nova',
    chain: 'chain',
    vortex: 'vortex',
  }[weaponId]
  if (timerKey) timers[timerKey] = 0
}

export function activateEvolution(recipe) {
  if (!recipe || player.evolutions[recipe.id]) return false
  player.evolutions[recipe.id] = true
  recipe.apply()
  resetEvolvedWeaponTimer(recipe.weaponId)
  state.evolutionCount += 1
  return true
}
