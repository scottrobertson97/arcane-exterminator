import { levelup, choicesEl } from '../../core/dom.js'
import { state } from '../../state/gameState.js'
import { statUpgrades } from '../../data/upgrades.js'

let showLevelUpHandler = () => {}
const rarityLabel = {
  bronze: 'Bronze Relic',
  silver: 'Silver Relic',
  gold: 'Golden Relic',
}
const qualityRank = {
  'Heavy Rounds': 5,
  Overclock: 4,
  'Sprint Boots': 3,
  'Iron Heart': 5,
  Railcast: 2,
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
  const shuffled = statUpgrades.slice().sort(() => Math.random() - 0.5)
  if (rarity === 'bronze') return shuffled.slice(0, 3)

  const pool = rarity === 'gold' ? shuffled.slice(0, 5) : shuffled.slice(0, 4)
  return pool
    .sort((a, b) => (qualityRank[b.name] || 1) - (qualityRank[a.name] || 1))
    .slice(0, 3)
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
