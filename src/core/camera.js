import { zoomLevels, WORLD_WIDTH, WORLD_HEIGHT } from '../config/constants.js'
import { canvas, zoomControls } from './dom.js'
import { player, zoomState } from '../state/gameState.js'
import { clamp } from './utils.js'

export function applyZoom() {
  zoomState.zoom = zoomLevels[zoomState.index]
  zoomState.viewWidth = canvas.width / zoomState.zoom
  zoomState.viewHeight = canvas.height / zoomState.zoom
  if (zoomControls.label) zoomControls.label.textContent = `${zoomState.zoom}X`
  if (zoomControls.out) zoomControls.out.disabled = zoomState.index === 0
  if (zoomControls.in)
    zoomControls.in.disabled = zoomState.index === zoomLevels.length - 1
}

export function setZoomIndex(nextIndex) {
  zoomState.index = clamp(nextIndex, 0, zoomLevels.length - 1)
  applyZoom()
}

export function resizeCanvas() {
  const width = Math.max(320, Math.floor(window.innerWidth))
  const height = Math.max(240, Math.floor(window.innerHeight))
  canvas.width = width
  canvas.height = height
  applyZoom()
}

export function camera() {
  const x = clamp(player.x - zoomState.viewWidth / 2, 0, WORLD_WIDTH - zoomState.viewWidth)
  const y = clamp(player.y - zoomState.viewHeight / 2, 0, WORLD_HEIGHT - zoomState.viewHeight)
  return { x, y, viewWidth: zoomState.viewWidth, viewHeight: zoomState.viewHeight }
}
