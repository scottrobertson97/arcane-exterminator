import { BOSS_WAVE_INTERVAL, WORLD_HEIGHT, WORLD_WIDTH } from './config/constants.js'
import { instructions, levelup, startBtn, zoomControls } from './core/dom.js'
import { music } from './core/assets.js'
import { camera, resizeCanvas, setZoomIndex } from './core/camera.js'
import { configureLoop, loop } from './core/loop.js'
import { clamp } from './core/utils.js'
import { input, player, state, timers, zoomState } from './state/gameState.js'
import { resetGame } from './state/reset.js'
import { updateHud } from './systems/ui/hud.js'
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
import { spawnEnemy, spawnMiniBoss } from './systems/world/spawning.js'
import { updateEnemies } from './systems/world/enemies.js'
import {
  updateHealthPackCollisions,
  updateRelicCollisions,
  updateRelicSpawner,
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
} from './systems/render/entities.js'
import { drawMinimap } from './systems/render/minimap.js'

setXpShowLevelUpHandler(showLevelUp)
setRelicShowLevelUpHandler(showLevelUp)
setOpenStatUpgradeFromQueueHandler(openStatUpgradeFromQueue)

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
      timers.pulse = player.pulseCooldown
    }
  }

  if (player.novaUnlocked) {
    timers.nova -= dt
    if (timers.nova <= 0) {
      novaShockwave()
      timers.nova = player.novaCooldown
    }
  }

  if (player.chainUnlocked) {
    timers.chain -= dt
    if (timers.chain <= 0) {
      chainLightning()
      timers.chain = player.chainCooldown
    }
  }
}

function updateEnemySpawner(dt) {
  timers.spawn -= dt
  const wave = Math.floor(state.elapsed / state.waveDuration) + 1
  const spawnInterval = Math.max(0.18, 1.2 - wave * 0.06)

  while (wave >= state.nextBossWave) {
    spawnMiniBoss(state.nextBossWave)
    state.nextBossWave += BOSS_WAVE_INTERVAL
  }

  if (timers.spawn <= 0) {
    spawnEnemy()
    timers.spawn = spawnInterval
  }
}

function checkGameOver() {
  if (player.hp > 0) return

  state.running = false
  instructions.style.display = 'grid'
  instructions.querySelector('.title').textContent = 'Game Over'
  startBtn.textContent = 'Restart'
  music.pause()
  music.currentTime = 0
}

function update(dt) {
  if (state.paused) return

  updateTime(dt)
  updatePlayerMovement(dt)
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
  drawRelics(cam)
  drawHealthPacks(cam)
  drawShockLinks(cam)
  drawEnemies(cam)
  drawPlayer(cam)
  drawPlayerHpRing(cam)
  endWorldTransform()
  drawMinimap()
}

function startGame() {
  instructions.style.display = 'none'
  instructions.querySelector('.title').textContent = 'Wave Survivors'
  startBtn.textContent = 'Start'
  levelup.classList.add('hidden')
  state.running = true
  state.paused = false
  resetGame()
  music.play().catch(() => {})
}

bindInputHandlers()

startBtn.addEventListener('click', startGame)
if (zoomControls.out) {
  zoomControls.out.addEventListener('click', () => setZoomIndex(zoomState.index - 1))
}
if (zoomControls.in) {
  zoomControls.in.addEventListener('click', () => setZoomIndex(zoomState.index + 1))
}

window.addEventListener('resize', resizeCanvas)
resizeCanvas()

configureLoop({ update, draw, updateHud })
requestAnimationFrame(loop)
