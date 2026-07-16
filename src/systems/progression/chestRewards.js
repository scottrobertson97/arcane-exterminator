import { choicesEl, levelup } from '../../core/dom.js'
import { shuffledCopy } from '../../core/utils.js'
import { upgradeDefs } from '../../data/upgrades.js'
import { player, state } from '../../state/gameState.js'
import { activateEvolution, getEligibleEvolutions, isWeaponEvolved } from './build.js'
import { openStatUpgradeFromQueue } from './relicMenu.js'
import { showLevelUp } from './upgradesMenu.js'
import { applyUpgrade, canApplyUpgrade } from './xp.js'

const chestRewardCounts = {
  bronze: 1,
  silver: 3,
  gold: 5,
}

function takeRandom(items) {
  return shuffledCopy(items)[0] || null
}

function getChestUpgradeCandidates() {
  return upgradeDefs.filter(option => {
    if ((player.upgrades[option.id] || 0) <= 0) return false
    if (option.kind === 'weapon' && isWeaponEvolved(option.id)) return false
    return canApplyUpgrade(option)
  })
}

function finishRewardFlow() {
  if (state.pendingLevels > 0) {
    showLevelUp()
  } else if (state.pendingStatUps > 0) {
    openStatUpgradeFromQueue()
  } else {
    levelup.classList.add('hidden')
    state.paused = false
  }
}

function showChestRewards(chest, rewards) {
  state.paused = true
  levelup.classList.remove('hidden')
  levelup.querySelector('.title').textContent = `${chest.rarity || 'bronze'} Boss Cache`
  choicesEl.innerHTML = ''

  const button = document.createElement('button')
  button.className = 'choice-btn chest-reward-btn'

  const heading = document.createElement('strong')
  heading.textContent = rewards.some(reward => reward.type === 'evolution')
    ? 'Evolution Unleashed'
    : 'Cache Opened'
  button.appendChild(heading)

  for (const reward of rewards) {
    const line = document.createElement('span')
    line.className = reward.type === 'evolution' ? 'evolution-reward' : ''
    line.textContent = `${reward.type === 'evolution' ? '★ ' : ''}${reward.name} — ${reward.desc}`
    button.appendChild(line)
  }

  const prompt = document.createElement('span')
  prompt.className = 'claim-prompt'
  prompt.textContent = 'Continue'
  button.appendChild(prompt)
  button.addEventListener('click', finishRewardFlow, { once: true })
  choicesEl.appendChild(button)
}

export function openBossChest(chest) {
  const rarity = chest.rarity || 'bronze'
  let remainingRewards = chestRewardCounts[rarity] || chestRewardCounts.bronze
  const rewards = []

  if (chest.canEvolve) {
    const recipe = takeRandom(getEligibleEvolutions())
    if (recipe && activateEvolution(recipe)) {
      rewards.push({
        type: 'evolution',
        name: recipe.name,
        desc: recipe.desc,
      })
      remainingRewards -= 1
    }
  }

  while (remainingRewards > 0) {
    const option = takeRandom(getChestUpgradeCandidates())
    if (!option) break
    const before = player.upgrades[option.id] || 0
    applyUpgrade(option)
    const after = player.upgrades[option.id] || before
    rewards.push({
      type: option.kind || 'weapon',
      name: option.name,
      desc: `Level ${before} → ${after}`,
    })
    remainingRewards -= 1
  }

  if (remainingRewards > 0) {
    state.bonusShards += remainingRewards
    rewards.push({
      type: 'currency',
      name: 'Arcane Dust',
      desc: `+${remainingRewards} end-run shard${remainingRewards === 1 ? '' : 's'}`,
    })
    remainingRewards = 0
  }

  if (rewards.length === 0) return false
  showChestRewards({ ...chest, rarity }, rewards)
  return true
}
