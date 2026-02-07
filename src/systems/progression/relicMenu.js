import { levelup, choicesEl } from '../../core/dom.js'
import { state } from '../../state/gameState.js'
import { statUpgrades } from '../../data/upgrades.js'

let showLevelUpHandler = () => {}

export function setShowLevelUpHandler(fn) {
  showLevelUpHandler = fn
}

export function openStatUpgradeFromQueue() {
  if (state.pendingStatUps <= 0) return
  state.pendingStatUps -= 1
  showStatUpgrades()
}

export function showStatUpgrades() {
  state.paused = true
  levelup.classList.remove('hidden')
  levelup.querySelector('.title').textContent = 'Relic Found'
  choicesEl.innerHTML = ''

  const shuffled = statUpgrades.slice().sort(() => Math.random() - 0.5)
  const options = shuffled.slice(0, 3)

  for (const option of options) {
    const btn = document.createElement('button')
    btn.className = 'choice-btn'
    btn.innerHTML = `${option.name}<span>${option.desc}</span>`
    btn.addEventListener('click', () => {
      option.apply()
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
