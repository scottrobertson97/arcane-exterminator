import {
  BOSS_WAVE_INTERVAL,
  MAX_ENEMIES,
  STAGE_DURATION,
  STAGE_WAVE_COUNT,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from './config/constants.js'
import {
  controlsBack,
  ctx,
  levelup,
  menuButtons,
  menuOverlay,
  menuPanels,
  metaPanel,
  runSummary as runSummaryUi,
  zoomControls,
} from './core/dom.js'
import { music } from './core/assets.js'
import { camera, resizeCanvas, setZoomIndex } from './core/camera.js'
import { configureLoop, loop } from './core/loop.js'
import { clamp } from './core/utils.js'
import { installTestApi } from './core/testApi.js'
import { getWaveConfig, getWaveNumber } from './data/waves.js'
import {
  input,
  entities,
  player,
  state,
  SCREEN_STATES,
  timers,
  zoomState,
} from './state/gameState.js'
import { resetGame } from './state/reset.js'
import { formatTime, updateHud } from './systems/ui/hud.js'
import { setShowLevelUpHandler as setXpShowLevelUpHandler } from './systems/progression/xp.js'
import {
  openStatUpgradeFromQueue,
  setShowLevelUpHandler as setRelicShowLevelUpHandler,
} from './systems/progression/relicMenu.js'
import {
  setOpenStatUpgradeFromQueueHandler,
  showLevelUp,
} from './systems/progression/upgradesMenu.js'
import {
  META_RANK_CAP,
  applyMetaBonuses,
  awardRunShards,
  buildMetaBonusText,
  canPurchaseMetaRank,
  describeMetaNode,
  getMetaRank,
  getNextMetaCost,
  loadSave,
  metaNodes,
  purchaseMetaRank,
  resetSaveProgress,
  saveProgress,
} from './systems/progression/metaProgression.js'
import {
  fireFrostShards,
  fireStarfall,
  shoot,
  updateBullets,
} from './systems/combat/projectiles.js'
import {
  castGravityWell,
  chainLightning,
  deployArcMines,
  novaShockwave,
  pulseShockwave,
} from './systems/combat/abilities.js'
import { updateOrbitCaches } from './systems/combat/orbitals.js'
import { scaledCooldown } from './systems/combat/scaling.js'
import {
  spawnEnemy,
  spawnEnemyPack,
  spawnMiniBoss,
  spawnStageItems,
} from './systems/world/spawning.js'
import { updateEnemies } from './systems/world/enemies.js'
import {
  updateHealthPackCollisions,
  updateRelicCollisions,
  updateRelicSpawner,
  updateStageItemCollisions,
  updateXpOrbs,
} from './systems/world/pickups.js'
import {
  updateChainArcs,
  updateMines,
  updateParticles,
  updatePulseEffects,
  updateTrails,
  updateVortexes,
} from './systems/world/effects.js'
import { bindInputHandlers } from './systems/input/controls.js'
import { beginFrame, endWorldTransform } from './systems/render/frame.js'
import { drawWorldBackground, drawWorldGrid } from './systems/render/world.js'
import {
  drawChainArcLines,
  drawParticles,
  drawPulseRings,
  drawShockLinks,
  drawTrailPatches,
  drawVortexRings,
  drawXpOrbs,
} from './systems/render/effects.js'
import {
  drawBladeOrbits,
  drawBullets,
  drawEnemies,
  drawHealthPacks,
  drawMines,
  drawPlayer,
  drawPlayerHpRing,
  drawRelics,
  drawSolarOrbits,
  drawStageItems,
} from './systems/render/entities.js'
import { drawMinimap } from './systems/render/minimap.js'

setXpShowLevelUpHandler(showLevelUp)
setRelicShowLevelUpHandler(showLevelUp)
setOpenStatUpgradeFromQueueHandler(openStatUpgradeFromQueue)

let saveData = loadSave()

function refreshMetaBonusText() {
  state.metaBonusText = buildMetaBonusText(saveData.metaRanks)
}

function setMenuPanel(panel) {
  if (!menuPanels.title || !menuPanels.meta || !menuPanels.controls) return

  menuPanels.title.classList.toggle('hidden', panel !== SCREEN_STATES.TITLE)
  menuPanels.meta.classList.toggle('hidden', panel !== SCREEN_STATES.META)
  menuPanels.controls.classList.toggle('hidden', panel !== SCREEN_STATES.CONTROLS)
}

function setScreen(screen) {
  const prevScreen = state.screen
  if (prevScreen === SCREEN_STATES.RUNNING && screen !== SCREEN_STATES.RUNNING) {
    state.menuCamX = player.x
    state.menuCamY = player.y
  }

  state.screen = screen
  state.running = screen === SCREEN_STATES.RUNNING

  if (!state.running) {
    state.paused = false
    input.mouseActive = false
    levelup.classList.add('hidden')
  }

  const showMenuOverlay =
    screen === SCREEN_STATES.TITLE ||
    screen === SCREEN_STATES.META ||
    screen === SCREEN_STATES.CONTROLS

  if (menuOverlay) {
    menuOverlay.classList.toggle('hidden', !showMenuOverlay)
  }

  if (runSummaryUi.overlay) {
    runSummaryUi.overlay.classList.toggle('hidden', screen !== SCREEN_STATES.RUN_SUMMARY)
  }

  setMenuPanel(showMenuOverlay ? screen : null)
}

function renderMetaPanel() {
  if (!metaPanel.list || !metaPanel.shards) return

  metaPanel.shards.textContent = `${saveData.shards}`
  if (metaPanel.lifetime) {
    const lifetime = saveData.lifetime
    metaPanel.lifetime.textContent = `Runs ${lifetime.runs} • Clears ${lifetime.victories} • Best Wave ${lifetime.bestWave}`
  }
  metaPanel.list.innerHTML = ''

  for (const node of metaNodes) {
    const rank = getMetaRank(saveData, node.id)
    const nextCost = getNextMetaCost(node, rank)
    const row = document.createElement('div')
    row.className = 'meta-row'
    if (rank >= META_RANK_CAP) row.classList.add('maxed')

    const body = document.createElement('div')
    body.className = 'meta-row-main'

    const name = document.createElement('div')
    name.className = 'meta-name'
    name.textContent = node.label

    const rankEl = document.createElement('div')
    rankEl.className = 'meta-rank'
    rankEl.textContent = `Rank ${rank}/${META_RANK_CAP}`

    const desc = document.createElement('div')
    desc.className = 'meta-desc'
    desc.textContent =
      rank >= META_RANK_CAP ? 'Max rank reached' : describeMetaNode(node, rank)

    const cost = document.createElement('div')
    cost.className = 'meta-cost'
    cost.textContent =
      rank >= META_RANK_CAP ? 'Cost: MAX' : `Cost: ${nextCost} shards`

    const buyBtn = document.createElement('button')
    buyBtn.className = 'meta-buy'
    buyBtn.textContent = rank >= META_RANK_CAP ? 'MAX' : `Buy (${nextCost})`
    buyBtn.disabled =
      rank >= META_RANK_CAP || !canPurchaseMetaRank(saveData, node.id)

    buyBtn.addEventListener('click', () => {
      if (!purchaseMetaRank(saveData, node.id)) return
      saveData = saveProgress(saveData)
      refreshMetaBonusText()
      renderMetaPanel()
    })

    body.appendChild(name)
    body.appendChild(rankEl)
    body.appendChild(desc)
    body.appendChild(cost)
    row.appendChild(body)
    row.appendChild(buyBtn)

    metaPanel.list.appendChild(row)
  }
}

function openTitleScreen() {
  setScreen(SCREEN_STATES.TITLE)
}

function openMetaScreen() {
  renderMetaPanel()
  setScreen(SCREEN_STATES.META)
}

function openControlsScreen() {
  setScreen(SCREEN_STATES.CONTROLS)
}

function updateTime(dt) {
  state.elapsed += dt
}

function updatePlayerMovement(dt) {
  const startX = player.x
  const startY = player.y
  let moveX = (input.right ? 1 : 0) - (input.left ? 1 : 0)
  let moveY = (input.down ? 1 : 0) - (input.up ? 1 : 0)

  if (input.mouseActive) {
    const mx = input.mouseX - player.x
    const my = input.mouseY - player.y
    const dist = Math.hypot(mx, my)
    if (dist > 6) {
      moveX = mx / dist
      moveY = my / dist
    } else {
      moveX = 0
      moveY = 0
    }
  }

  const mag = Math.hypot(moveX, moveY)
  if (mag > 0) {
    const nx = moveX / mag
    const ny = moveY / mag
    player.x += nx * player.speed * dt
    player.y += ny * player.speed * dt
  }

  player.x = clamp(player.x, player.r, WORLD_WIDTH - player.r)
  player.y = clamp(player.y, player.r, WORLD_HEIGHT - player.r)
  player.isMoving = Math.hypot(player.x - startX, player.y - startY) > 0.5
}

function updatePlayerRecovery(dt) {
  if (player.recovery <= 0 || player.hp <= 0 || player.hp >= player.maxHp) return
  player.hp = Math.min(player.maxHp, player.hp + player.recovery * dt)
}

function updateWeaponFiring(dt) {
  shoot(dt)
  if (player.frostUnlocked) fireFrostShards(dt)
  if (player.starfallUnlocked) fireStarfall(dt)
  if (player.mineUnlocked) deployArcMines(dt)
  if (player.vortexUnlocked) castGravityWell(dt)

  if (player.pulseUnlocked) {
    timers.pulse -= dt
    if (timers.pulse <= 0) {
      pulseShockwave()
      timers.pulse = scaledCooldown(player.pulseCooldown)
    }
  }

  if (player.novaUnlocked) {
    timers.nova -= dt
    if (timers.nova <= 0) {
      novaShockwave()
      timers.nova = scaledCooldown(player.novaCooldown)
    }
  }

  if (player.chainUnlocked) {
    timers.chain -= dt
    if (timers.chain <= 0) {
      chainLightning()
      timers.chain = scaledCooldown(player.chainCooldown)
    }
  }
}

function updateEnemySpawner(dt) {
  timers.spawn -= dt
  const wave = getWaveNumber(state.elapsed, state.waveDuration)
  const waveConfig = getWaveConfig(wave)

  if (state.activeWave !== wave) {
    state.activeWave = wave
    timers.spawn = 0
    state.noticeText = `Wave ${wave} / ${STAGE_WAVE_COUNT}${waveConfig.event ? ' — surge incoming' : ''}`
    state.noticeExpiresAt = state.elapsed + 2.8

    if (waveConfig.event) {
      const availableSlots = Math.max(0, MAX_ENEMIES - entities.enemies.length)
      const count = Math.min(availableSlots, waveConfig.event.count)
      spawnEnemyPack(count, {
        tier2Chance: waveConfig.tier2Chance,
        hpMultiplier: waveConfig.event.hpMultiplier || waveConfig.hpMultiplier || 1,
        speedMultiplier:
          waveConfig.event.speedMultiplier || waveConfig.speedMultiplier || 1,
        eventSpawn: true,
      })
    }
  }

  while (wave >= state.nextBossWave) {
    spawnMiniBoss(state.nextBossWave)
    state.noticeText = `Wave ${state.nextBossWave} guardian inbound — defeat it for a cache`
    state.noticeExpiresAt = state.elapsed + 3.4
    state.nextBossWave += BOSS_WAVE_INTERVAL
  }

  if (timers.spawn <= 0 && entities.enemies.length < MAX_ENEMIES) {
    const deficit = Math.max(0, waveConfig.minAlive - entities.enemies.length)
    const spawnCount = deficit > 0 ? Math.min(3, 1 + Math.floor(deficit / 18)) : 1
    const availableSlots = MAX_ENEMIES - entities.enemies.length
    for (let i = 0; i < Math.min(spawnCount, availableSlots); i += 1) {
      spawnEnemy({
        tier2Chance: waveConfig.tier2Chance,
        hpMultiplier: waveConfig.hpMultiplier || 1,
        speedMultiplier: waveConfig.speedMultiplier || 1,
      })
    }
    timers.spawn = waveConfig.spawnInterval
  }
}

function showRunSummary(result = 'defeat') {
  const wave = getWaveNumber(state.elapsed, state.waveDuration)
  const elapsedSeconds = Math.max(0, state.elapsed)
  const victory = result === 'victory'
  const earnedShards = awardRunShards(
    saveData,
    elapsedSeconds,
    wave,
    victory,
    state.bonusShards,
  )
  saveData = saveProgress(saveData)

  state.runResult = result
  if (runSummaryUi.result) {
    runSummaryUi.result.textContent = victory ? 'Stage Cleared' : 'Defeated'
    runSummaryUi.result.classList.toggle('summary-victory', victory)
  }
  if (runSummaryUi.wave) runSummaryUi.wave.textContent = `${wave}`
  if (runSummaryUi.time) runSummaryUi.time.textContent = formatTime(elapsedSeconds)
  if (runSummaryUi.level) runSummaryUi.level.textContent = `${player.level}`
  if (runSummaryUi.kills) runSummaryUi.kills.textContent = `${state.kills}`
  if (runSummaryUi.evolutions) {
    runSummaryUi.evolutions.textContent = `${state.evolutionCount}`
  }
  if (runSummaryUi.shards) runSummaryUi.shards.textContent = `${earnedShards}`
  if (runSummaryUi.total) runSummaryUi.total.textContent = `${saveData.shards}`

  state.paused = false
  input.mouseActive = false
  levelup.classList.add('hidden')
  setScreen(SCREEN_STATES.RUN_SUMMARY)

  music.pause()
  music.currentTime = 0
}

function checkGameOver() {
  if (player.hp > 0) return
  showRunSummary('defeat')
}

function checkStageComplete() {
  if (state.elapsed < STAGE_DURATION) return false
  state.elapsed = STAGE_DURATION
  entities.enemies.length = 0
  showRunSummary('victory')
  return true
}

function updateMenuCameraDrift(dt) {
  const halfW = zoomState.viewWidth / 2
  const halfH = zoomState.viewHeight / 2
  const minX = halfW
  const maxX = Math.max(minX, WORLD_WIDTH - halfW)
  const minY = halfH
  const maxY = Math.max(minY, WORLD_HEIGHT - halfH)

  state.menuCamX += state.menuCamVX * dt
  state.menuCamY += state.menuCamVY * dt

  if (state.menuCamX <= minX || state.menuCamX >= maxX) {
    state.menuCamX = clamp(state.menuCamX, minX, maxX)
    state.menuCamVX *= -1
  }

  if (state.menuCamY <= minY || state.menuCamY >= maxY) {
    state.menuCamY = clamp(state.menuCamY, minY, maxY)
    state.menuCamVY *= -1
  }
}

function update(dt) {
  if (state.screen !== SCREEN_STATES.RUNNING) {
    updateMenuCameraDrift(dt)
    return
  }

  if (state.paused) return

  updateTime(dt)
  if (checkStageComplete()) return
  updatePlayerMovement(dt)
  updatePlayerRecovery(dt)
  updateRelicSpawner(dt)
  updateOrbitCaches(dt)
  updateWeaponFiring(dt)
  updateEnemySpawner(dt)
  updateEnemies(dt)
  updateBullets(dt)
  updateMines(dt)
  updateTrails(dt)
  updateVortexes(dt)
  updateParticles(dt)
  updateRelicCollisions(dt)
  updateStageItemCollisions(dt)
  updateHealthPackCollisions(dt)
  updateXpOrbs(dt)
  updatePulseEffects(dt)
  updateChainArcs(dt)
  checkGameOver()
}

function draw() {
  beginFrame()
  const cam = camera()
  drawWorldBackground()
  drawWorldGrid(cam)
  drawXpOrbs(cam)
  drawTrailPatches(cam)
  drawVortexRings(cam)
  drawPulseRings(cam)
  drawChainArcLines(cam)
  drawBladeOrbits(cam)
  drawSolarOrbits(cam)
  drawMines(cam)
  drawBullets(cam)
  drawParticles(cam)
  drawStageItems(cam)
  drawRelics(cam)
  drawHealthPacks(cam)
  drawShockLinks(cam)
  drawEnemies(cam)
  drawPlayer(cam)
  drawPlayerHpRing(cam)
  endWorldTransform()
  drawMinimap()

  if (state.screen !== SCREEN_STATES.RUNNING) {
    ctx.fillStyle = 'rgba(11, 12, 15, 0.45)'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }
}

function startRun() {
  resetGame()
  applyMetaBonuses(saveData.metaRanks)
  spawnStageItems()
  state.paused = false
  setScreen(SCREEN_STATES.RUNNING)
  music.currentTime = 0
  music.play().catch(() => {})
}

function onEscapePressed() {
  if (
    state.screen === SCREEN_STATES.META ||
    state.screen === SCREEN_STATES.CONTROLS ||
    state.screen === SCREEN_STATES.RUN_SUMMARY
  ) {
    openTitleScreen()
  }
}

function resetMetaSave() {
  const confirmed = window.confirm(
    'Reset all shards and permanent upgrades? This cannot be undone.',
  )
  if (!confirmed) return

  saveData = resetSaveProgress()
  refreshMetaBonusText()
  renderMetaPanel()
}

bindInputHandlers()

if (menuButtons.play) menuButtons.play.addEventListener('click', startRun)
if (menuButtons.meta) menuButtons.meta.addEventListener('click', openMetaScreen)
if (menuButtons.controls)
  menuButtons.controls.addEventListener('click', openControlsScreen)
if (metaPanel.back) metaPanel.back.addEventListener('click', openTitleScreen)
if (metaPanel.reset) metaPanel.reset.addEventListener('click', resetMetaSave)
if (controlsBack) controlsBack.addEventListener('click', openTitleScreen)
if (runSummaryUi.play) runSummaryUi.play.addEventListener('click', startRun)
if (runSummaryUi.meta) runSummaryUi.meta.addEventListener('click', openMetaScreen)
if (zoomControls.out) {
  zoomControls.out.addEventListener('click', () => setZoomIndex(zoomState.index - 1))
}
if (zoomControls.in) {
  zoomControls.in.addEventListener('click', () => setZoomIndex(zoomState.index + 1))
}

window.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return
  onEscapePressed()
})

window.addEventListener('resize', resizeCanvas)
resizeCanvas()
refreshMetaBonusText()
renderMetaPanel()
openTitleScreen()
installTestApi({ startRun })

configureLoop({ update, draw, updateHud })
requestAnimationFrame(loop)
