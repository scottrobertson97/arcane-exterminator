import { hud, loadout, runNotice } from '../../core/dom.js'
import { MAX_PASSIVE_SLOTS, MAX_WEAPON_SLOTS } from '../../config/constants.js'
import { evolutionDefs } from '../../data/evolutions.js'
import { upgradeDefs } from '../../data/upgrades.js'
import { getWaveNumber } from '../../data/waves.js'
import { state, player } from '../../state/gameState.js'
import { getComboSnapshot } from '../progression/xp.js'

let lastLoadoutSignature = ''

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatComboText(combo) {
  if (!combo.active) return '-'
  return `K${combo.kills} x${combo.multiplier.toFixed(2)} ${combo.remaining.toFixed(1)}s`
}

function getUpgradeLevel(option) {
  const level = Number(player.upgrades?.[option.id])
  return Number.isFinite(level) ? Math.max(0, Math.floor(level)) : 0
}

function buildLoadoutItems() {
  const activeEvolutions = evolutionDefs.filter(recipe => player.evolutions?.[recipe.id])
  const evolutionsByWeapon = new Map(
    activeEvolutions.map(recipe => [recipe.weaponId, recipe]),
  )
  const matchedEvolutionIds = new Set()
  const weapons = []
  const passives = []

  for (const option of upgradeDefs) {
    const level = getUpgradeLevel(option)
    if (level <= 0) continue

    if (option.kind === 'passive') {
      passives.push({ name: option.name || option.id, level, evolved: false })
      continue
    }

    const evolution = evolutionsByWeapon.get(option.id)
    if (evolution) {
      matchedEvolutionIds.add(evolution.id)
      weapons.push({
        name: `★ ${evolution.name}`,
        level: 'EVO',
        evolved: true,
      })
    } else {
      weapons.push({ name: option.name || option.id, level, evolved: false })
    }
  }

  for (const evolution of activeEvolutions) {
    if (matchedEvolutionIds.has(evolution.id)) continue
    weapons.push({
      name: `★ ${evolution.name}`,
      level: 'EVO',
      evolved: true,
    })
  }

  return { weapons, passives }
}

function replaceLoadoutList(element, items) {
  if (!element) return
  if (items.length === 0) {
    const empty = document.createElement('div')
    empty.className = 'loadout-empty'
    empty.textContent = 'Empty'
    element.replaceChildren(empty)
    return
  }

  const rows = items.map(item => {
    const row = document.createElement('div')
    row.className = `loadout-item${item.evolved ? ' evolved' : ''}`

    const name = document.createElement('span')
    name.className = 'loadout-name'
    name.textContent = item.name
    name.title = item.name

    const level = document.createElement('span')
    level.className = 'loadout-level'
    level.textContent = item.evolved ? item.level : `Lv ${item.level}`

    row.appendChild(name)
    row.appendChild(level)
    return row
  })
  element.replaceChildren(...rows)
}

function updateLoadout() {
  if (!loadout.panel) return
  loadout.panel.classList.toggle('hidden', !state.running)

  const items = buildLoadoutItems()
  const signature = JSON.stringify(items)
  if (signature === lastLoadoutSignature) return
  lastLoadoutSignature = signature

  replaceLoadoutList(loadout.weapons, items.weapons)
  replaceLoadoutList(loadout.passives, items.passives)
  if (loadout.weaponCount) {
    loadout.weaponCount.textContent = `${items.weapons.length} / ${MAX_WEAPON_SLOTS}`
  }
  if (loadout.passiveCount) {
    loadout.passiveCount.textContent = `${items.passives.length} / ${MAX_PASSIVE_SLOTS}`
  }
}

function updateRunNotice() {
  if (!runNotice) return
  const text = typeof state.noticeText === 'string' ? state.noticeText.trim() : ''
  const expiresAt = Number(state.noticeExpiresAt) || 0
  const active = Boolean(state.running && text && expiresAt > state.elapsed)

  if (runNotice.textContent !== (active ? text : '')) {
    runNotice.textContent = active ? text : ''
  }
  runNotice.classList.toggle('notice-active', active)
}

export function updateHud() {
  const wave = getWaveNumber(state.elapsed, state.waveDuration)
  const combo = getComboSnapshot()
  hud.wave.textContent = wave
  hud.time.textContent = formatTime(state.elapsed)
  hud.hp.textContent = `${Math.max(0, Math.round(player.hp))} / ${player.maxHp}`
  hud.level.textContent = player.level
  hud.xp.textContent = `${player.xp} / ${player.nextXp}`
  if (hud.kills) hud.kills.textContent = Math.max(0, Math.floor(Number(state.kills) || 0))
  if (hud.combo) {
    hud.combo.textContent = formatComboText(combo)
    hud.combo.classList.toggle('combo-active', combo.active)
    hud.combo.classList.toggle('combo-boost', combo.multiplier > 1)
  }
  if (hud.metaBonus) hud.metaBonus.textContent = state.metaBonusText
  updateLoadout()
  updateRunNotice()
}
