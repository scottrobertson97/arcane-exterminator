import { levelup, choicesEl } from '../../core/dom.js'
import { shuffledCopy } from '../../core/utils.js'
import { evolutionDefs } from '../../data/evolutions.js'
import { player, state } from '../../state/gameState.js'
import { upgradeDefs } from '../../data/upgrades.js'
import { canOfferUpgradeBySlots, isWeaponEvolved } from './build.js'
import { getUpgradeLevel, applyUpgrade, canApplyUpgrade } from './xp.js'

let openStatUpgradeFromQueueHandler = () => {}

export function setOpenStatUpgradeFromQueueHandler(fn) {
  openStatUpgradeFromQueueHandler = fn
}

export function showLevelUp() {
  state.paused = true
  levelup.classList.remove('hidden')
  levelup.querySelector('.title').textContent = 'Level Up'
  choicesEl.innerHTML = ''

  const available = upgradeDefs.filter(
    option =>
      canApplyUpgrade(option) &&
      canOfferUpgradeBySlots(option) &&
      !(option.kind === 'weapon' && isWeaponEvolved(option.id)) &&
      option.canShow(),
  )

  if (available.length === 0) {
    const excessLevels = Math.max(1, state.pendingLevels)
    state.pendingLevels = 0
    state.noticeText = `Build maxed — ${excessLevels} excess level${excessLevels === 1 ? '' : 's'} restored health`
    state.noticeExpiresAt = state.elapsed + 2.5
    player.hp = Math.min(player.maxHp, player.hp + 10 * excessLevels)
    if (state.pendingStatUps > 0) {
      openStatUpgradeFromQueueHandler()
    } else {
      levelup.classList.add('hidden')
      state.paused = false
    }
    return
  }

  const shuffled = shuffledCopy(available)
  const options = shuffled.slice(0, 3)

  for (const option of options) {
    const btn = document.createElement('button')
    btn.className = 'choice-btn'
    const level = getUpgradeLevel(option.id)
    const name = document.createElement('strong')
    name.textContent = option.name
    const description = document.createElement('span')
    description.textContent = option.desc(level)
    const meta = document.createElement('span')
    meta.className = 'choice-meta'
    meta.textContent = `${option.kind === 'passive' ? 'Passive' : 'Weapon'} • ${level}/${option.max}`
    const recipe = evolutionDefs.find(entry =>
      option.kind === 'passive'
        ? entry.passiveId === option.id
        : entry.weaponId === option.id,
    )
    if (recipe) {
      const partnerId =
        option.kind === 'passive' ? recipe.weaponId : recipe.passiveId
      const partner = upgradeDefs.find(entry => entry.id === partnerId)
      meta.textContent += ` • Pairs with ${partner?.name || partnerId}`
    }
    btn.append(name, description, meta)
    btn.addEventListener('click', () => {
      applyUpgrade(option)
      state.pendingLevels -= 1
      if (state.pendingLevels > 0) {
        showLevelUp()
      } else if (state.pendingStatUps > 0) {
        openStatUpgradeFromQueueHandler()
      } else {
        levelup.classList.add('hidden')
        state.paused = false
      }
    })
    choicesEl.appendChild(btn)
  }
}
