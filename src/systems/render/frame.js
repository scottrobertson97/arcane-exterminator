import { ctx } from '../../core/dom.js'
import { zoomState } from '../../state/gameState.js'

export function beginFrame() {
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.imageSmoothingEnabled = false
  ctx.save()
  ctx.scale(zoomState.zoom, zoomState.zoom)
}

export function endWorldTransform() {
  ctx.restore()
}
