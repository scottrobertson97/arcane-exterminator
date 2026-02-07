import { WORLD_HEIGHT, WORLD_WIDTH } from '../../config/constants.js'
import { ctx } from '../../core/dom.js'
import { entities, player } from '../../state/gameState.js'

export function drawMinimap() {
  const mapPadding = 16
  const mapWidth = 180
  const mapHeight = Math.round((WORLD_HEIGHT / WORLD_WIDTH) * mapWidth)
  const mapX = ctx.canvas.width - mapWidth - mapPadding
  const mapY = mapPadding
  const scaleX = mapWidth / WORLD_WIDTH
  const scaleY = mapHeight / WORLD_HEIGHT

  ctx.save()
  ctx.globalAlpha = 0.9
  ctx.fillStyle = 'rgba(15, 15, 20, 0.6)'
  ctx.fillRect(mapX - 4, mapY - 4, mapWidth + 8, mapHeight + 8)
  ctx.fillStyle = 'rgba(240, 230, 210, 0.85)'
  ctx.fillRect(mapX, mapY, mapWidth, mapHeight)
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)'
  ctx.lineWidth = 1
  ctx.strokeRect(mapX, mapY, mapWidth, mapHeight)

  ctx.fillStyle = 'rgba(80, 170, 255, 0.9)'
  for (const relic of entities.relics) {
    const rx = mapX + relic.x * scaleX
    const ry = mapY + relic.y * scaleY
    ctx.beginPath()
    ctx.arc(rx, ry, 2.6, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = 'rgba(217, 79, 43, 0.95)'
  ctx.beginPath()
  ctx.arc(
    mapX + player.x * scaleX,
    mapY + player.y * scaleY,
    3.2,
    0,
    Math.PI * 2,
  )
  ctx.fill()
  ctx.restore()
}
