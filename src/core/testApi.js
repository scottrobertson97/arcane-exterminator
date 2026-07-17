import { STAGE_DURATION } from '../config/constants.js'
import { evolutionDefs } from '../data/evolutions.js'
import { upgradeDefs } from '../data/upgrades.js'
import { getWaveNumber } from '../data/waves.js'
import { entities, player, state, timers } from '../state/gameState.js'
import { applyUpgrade, gainXp, getUpgradeLevel } from '../systems/progression/xp.js'
import {
  addRelicAt,
  spawnEnemyAt,
  spawnMiniBoss,
} from '../systems/world/spawning.js'

const ENEMY_TYPE_KEYS = [
  'rat_small',
  'rat_big',
  'ash_bat',
  'ironback_beetle',
  'hex_acolyte',
]

function getEnemyType(enemy) {
  return enemy.spriteKey || (enemy.tier === 2 ? 'rat_big' : 'rat_small')
}

function getEnemyTypeCounts() {
  const counts = Object.fromEntries(ENEMY_TYPE_KEYS.map(key => [key, 0]))
  for (const enemy of entities.enemies) {
    const type = getEnemyType(enemy)
    counts[type] = (counts[type] || 0) + 1
  }
  return counts
}

function getEnemyBehaviorSample() {
  return entities.enemies
    .filter(enemy => !getEnemyType(enemy).startsWith('rat_'))
    .slice(0, 3)
    .map(enemy => ({
      type: getEnemyType(enemy),
      phase: enemy.behaviorPhase || 'seek',
      timer: +(enemy.phaseTimer || 0).toFixed(2),
      cooldown: +(enemy.abilityCooldown || 0).toFixed(2),
      charge: [
        +(enemy.chargeX || 0).toFixed(2),
        +(enemy.chargeY || 0).toFixed(2),
      ],
    }))
}

function snapshot() {
  return {
    screen: state.screen,
    running: state.running,
    paused: state.paused,
    elapsed: +state.elapsed.toFixed(2),
    wave: getWaveNumber(state.elapsed, state.waveDuration),
    result: state.runResult,
    kills: state.kills,
    bossesDefeated: state.bossesDefeated,
    bonusShards: state.bonusShards,
    evolutions: { ...player.evolutions },
    evolutionCount: state.evolutionCount,
    player: {
      x: +player.x.toFixed(1),
      y: +player.y.toFixed(1),
      hp: +player.hp.toFixed(1),
      maxHp: player.maxHp,
      level: player.level,
      upgrades: { ...player.upgrades },
    },
    entities: {
      enemies: entities.enemies.length,
      enemyTypes: getEnemyTypeCounts(),
      enemyProjectiles: (entities.enemyProjectiles || []).length,
      enemyBehaviorSample: getEnemyBehaviorSample(),
      bosses: entities.enemies.filter(enemy => enemy.isBoss).length,
      orbs: entities.orbs.length,
      relics: entities.relics.length,
      bossCaches: entities.relics.filter(relic => relic.source === 'boss').length,
      evolutionCaches: entities.relics.filter(
        relic => relic.source === 'boss' && relic.canEvolve,
      ).length,
      stageItems: entities.stageItems.length,
      bullets: entities.bullets.length,
    },
  }
}

function grantUpgrade(id, levels = 1) {
  const option = upgradeDefs.find(entry => entry.id === id)
  if (!option) throw new Error(`Unknown upgrade: ${id}`)
  const count = Math.max(0, Math.floor(levels))
  for (let i = 0; i < count; i += 1) applyUpgrade(option)
  return getUpgradeLevel(id)
}

function readyEvolution(recipeId = 'inferno_salvo') {
  const recipe = evolutionDefs.find(entry => entry.id === recipeId)
  if (!recipe) throw new Error(`Unknown evolution: ${recipeId}`)
  const weapon = upgradeDefs.find(entry => entry.id === recipe.weaponId)
  while (getUpgradeLevel(recipe.weaponId) < weapon.max) grantUpgrade(recipe.weaponId)
  if (getUpgradeLevel(recipe.passiveId) <= 0) grantUpgrade(recipe.passiveId)
  return recipe.id
}

export function installTestApi({ startRun }) {
  const params = new URLSearchParams(window.location.search)
  if (params.get('test') !== '1') return

  const api = Object.freeze({
    start: startRun,
    snapshot,
    grantUpgrade,
    readyEvolution,
    dropBossChest({ rarity = 'silver', canEvolve = true } = {}) {
      addRelicAt(player.x, player.y, rarity, 'boss', canEvolve)
    },
    spawnBoss(wave = 10) {
      spawnMiniBoss(Math.max(1, Math.floor(wave)))
    },
    spawnEnemyType(
      type,
      { x = player.x + 180, y = player.y, elite = false, affix = null } = {},
    ) {
      return spawnEnemyAt(Number(x), Number(y), {
        forcedArchetype: type,
        forcedElite: Boolean(elite),
        forcedAffix: affix,
      })
    },
    defeatBosses() {
      for (const enemy of entities.enemies) {
        if (enemy.isBoss) enemy.hp = 0
      }
    },
    clearEnemies() {
      entities.enemies.length = 0
      entities.enemyProjectiles.length = 0
    },
    teleport(x, y) {
      player.x = Number(x)
      player.y = Number(y)
    },
    teleportToStageItem(upgradeId) {
      const item = entities.stageItems.find(entry => entry.upgradeId === upgradeId)
      if (!item) return false
      player.x = item.x
      player.y = item.y
      return true
    },
    setElapsed(seconds) {
      state.elapsed = Math.max(0, Math.min(STAGE_DURATION, Number(seconds) || 0))
    },
    setHp(hp) {
      player.hp = Math.min(player.maxHp, Number(hp) || 0)
    },
  })
  window.__arcaneTest = api
  window.render_game_to_text = () => JSON.stringify(snapshot())

  document.documentElement.dataset.testApi = 'ready'
  const panel = document.createElement('aside')
  panel.id = 'test-tools'
  panel.setAttribute('aria-label', 'Test controls')

  const actions = [
    ['test-start', 'Start', () => startRun()],
    ['test-level-up', 'Grant Level', () => gainXp(player.nextXp)],
    ['test-ready-inferno', 'Ready Inferno', () => readyEvolution('inferno_salvo')],
    ['test-drop-chest', 'Drop Evo Cache', () => api.dropBossChest()],
    ['test-stage-might', 'Collect Ember', () => api.teleportToStageItem('might')],
    ['test-spawn-boss', 'Spawn Evo Boss', () => api.spawnBoss(10)],
    [
      'test-enemy-roster',
      'Spawn Enemy Roster',
      () => {
        entities.enemies.length = 0
        entities.enemyProjectiles.length = 0
        entities.bullets.length = 0
        player.maxHp = Math.max(player.maxHp, 10000)
        player.hp = player.maxHp
        player.damage = 0
        state.elapsed = 0
        state.waveDuration = STAGE_DURATION
        state.activeWave = getWaveNumber(state.elapsed, state.waveDuration)
        timers.spawn = 9999
        api.spawnEnemyType('ash_bat', {
          x: player.x + 150,
          y: player.y - 90,
        })
        api.spawnEnemyType('ironback_beetle', {
          x: player.x + 190,
          y: player.y,
        })
        api.spawnEnemyType('hex_acolyte', {
          x: player.x + 150,
          y: player.y + 90,
        })
      },
    ],
    [
      'test-kill-evo-boss',
      'Kill Evo Boss',
      () => {
        api.spawnBoss(10)
        api.defeatBosses()
      },
    ],
    ['test-defeat-bosses', 'Defeat Bosses', () => api.defeatBosses()],
    [
      'test-horde',
      'Jump to Horde',
      () => {
        player.maxHp = 10000
        player.hp = player.maxHp
        api.setElapsed(10 * state.waveDuration)
      },
    ],
    ['test-victory', 'Jump to Victory', () => api.setElapsed(STAGE_DURATION - 0.02)],
  ]
  for (const [testId, label, action] of actions) {
    const button = document.createElement('button')
    button.type = 'button'
    button.dataset.testid = testId
    button.textContent = label
    button.addEventListener('click', action)
    panel.appendChild(button)
  }

  const output = document.createElement('pre')
  output.dataset.testid = 'test-snapshot'
  panel.appendChild(output)
  const renderSnapshot = () => {
    output.textContent = JSON.stringify(snapshot())
  }
  renderSnapshot()
  window.setInterval(renderSnapshot, 100)
  document.body.appendChild(panel)
}
