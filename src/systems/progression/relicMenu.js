import { levelup, choicesEl } from '../../core/dom.js'
import { shuffledCopy } from '../../core/utils.js'
import { state } from '../../state/gameState.js'
import { statUpgrades } from '../../data/upgrades.js'

let showLevelUpHandler = () => {}
const rarityLabel = {
  bronze: 'Bronze Relic',
  silver: 'Silver Relic',
  gold: 'Golden Relic',
}

export function setShowLevelUpHandler(fn) {
  showLevelUpHandler = fn
}

export function openStatUpgradeFromQueue() {
  if (state.pendingStatUps <= 0) return
  state.pendingStatUps -= 1
  const rarity = state.pendingRelicRarities.shift() || 'bronze'
  showStatUpgrades(rarity)
}

function buildOptionsByRarity(rarity) {
  return shuffledCopy(statUpgrades).slice(0, 3)
}

export function showStatUpgrades(rarity = 'bronze') {
  state.paused = true
  levelup.classList.remove('hidden')
  levelup.querySelector('.title').textContent = rarityLabel[rarity] || 'Relic Found'
  choicesEl.innerHTML = ''

  const options = buildOptionsByRarity(rarity)

  for (const option of options) {
    const description =
      typeof option.desc === 'function' ? option.desc(rarity) : option.desc
    const btn = document.createElement('button')
    btn.className = 'choice-btn'
    btn.innerHTML = `${option.name}<span>${description}</span>`
    btn.addEventListener('click', () => {
      option.apply(rarity)
      if (state.pendingStatUps > 0) {
        openStatUpgradeFromQueue()
      } else if (state.pendingLevels > 0) {
        showLevelUpHandler()
      } else {
        levelup.classList.add('hidden')
        state.paused = false
      }
    })
    choicesEl.appendChild(btn)
  }
}
