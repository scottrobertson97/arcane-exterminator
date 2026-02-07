import { ctx } from '../../core/dom.js'
import { zoomState } from '../../state/gameState.js'

export function drawWorldBackground() {
  ctx.fillStyle = '#efe7d6'
  ctx.fillRect(0, 0, zoomState.viewWidth, zoomState.viewHeight)
}

export function drawWorldGrid(cam) {
  ctx.strokeStyle = 'rgba(0,0,0,0.06)'
  ctx.lineWidth = 1
  const grid = 48
  const startX = Math.floor(cam.x / grid) * grid
  const startY = Math.floor(cam.y / grid) * grid

  for (let x = startX; x <= cam.x + zoomState.viewWidth; x += grid) {
    ctx.beginPath()
    ctx.moveTo(x - cam.x, 0)
    ctx.lineTo(x - cam.x, zoomState.viewHeight)
    ctx.stroke()
  }

  for (let y = startY; y <= cam.y + zoomState.viewHeight; y += grid) {
    ctx.beginPath()
    ctx.moveTo(0, y - cam.y)
    ctx.lineTo(zoomState.viewWidth, y - cam.y)
    ctx.stroke()
  }
}
