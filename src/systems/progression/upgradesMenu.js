import { levelup, choicesEl } from '../../core/dom.js'
import { state } from '../../state/gameState.js'
import { upgradeDefs } from '../../data/upgrades.js'
import { getUpgradeLevel, applyUpgrade } from './xp.js'

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
    option => getUpgradeLevel(option.id) < option.max && option.canShow(),
  )

  if (available.length === 0) {
    if (state.pendingStatUps > 0) {
      openStatUpgradeFromQueueHandler()
    } else {
      levelup.classList.add('hidden')
      state.paused = false
    }
    return
  }

  const shuffled = available.sort(() => Math.random() - 0.5)
  const options = shuffled.slice(0, 3)

  for (const option of options) {
    const btn = document.createElement('button')
    btn.className = 'choice-btn'
    const level = getUpgradeLevel(option.id)
    btn.innerHTML = `${option.name}<span>${option.desc(level)}</span>`
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
