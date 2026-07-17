import { ctx } from '../../core/dom.js'
import {
  bladeSprite,
  enemyBigSprite,
  enemySmallSprite,
  enemySpriteMap,
  healthSprite,
  playerSprite,
  relicSprite,
} from '../../core/assets.js'
import { entities, orbitCache, player } from '../../state/gameState.js'

export function drawBladeOrbits(cam) {
  for (const blade of orbitCache.blades) {
    const size = player.bladeSize
    if (bladeSprite.complete && bladeSprite.naturalWidth > 0) {
      const angle = Math.atan2(blade.y - player.y, blade.x - player.x)
      ctx.save()
      ctx.translate(blade.x - cam.x, blade.y - cam.y)
      ctx.rotate(angle + Math.PI / 2)
      ctx.drawImage(bladeSprite, -size / 2, -size / 2, size, size)
      ctx.restore()
    } else {
      ctx.fillStyle = '#d94f2b'
      ctx.beginPath()
      ctx.arc(blade.x - cam.x, blade.y - cam.y, size / 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

export function drawSolarOrbits(cam) {
  for (const orb of orbitCache.solars) {
    ctx.fillStyle = 'rgba(255, 210, 120, 0.95)'
    ctx.beginPath()
    ctx.arc(orb.x - cam.x, orb.y - cam.y, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 240, 200, 0.7)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(orb.x - cam.x, orb.y - cam.y, 9, 0, Math.PI * 2)
    ctx.stroke()
  }
}

export function drawBullets(cam) {
  for (const bullet of entities.bullets) {
    ctx.fillStyle =
      bullet.type === 'frost'
        ? '#7cc7ff'
        : bullet.type === 'glacial'
          ? '#d8f3ff'
          : bullet.type === 'inferno'
            ? '#ffcf63'
        : bullet.type === 'starfall'
          ? '#ffd677'
          : '#ff7b3a'
    ctx.beginPath()
    ctx.arc(bullet.x - cam.x, bullet.y - cam.y, bullet.r, 0, Math.PI * 2)
    ctx.fill()
  }
}

export function drawMines(cam) {
  for (const mine of entities.mines) {
    const armed = mine.armTimer <= 0
    const alpha = armed ? 0.95 : 0.45
    const pulse = 0.65 + 0.35 * Math.sin((mine.life / mine.maxLife) * Math.PI * 8)

    ctx.fillStyle = `rgba(200, 90, 40, ${alpha})`
    ctx.beginPath()
    ctx.arc(mine.x - cam.x, mine.y - cam.y, mine.r, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = armed
      ? `rgba(255, 180, 90, ${pulse})`
      : 'rgba(255, 180, 90, 0.35)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(mine.x - cam.x, mine.y - cam.y, mine.triggerRadius, 0, Math.PI * 2)
    ctx.stroke()
  }
}

export function drawStageItems(cam) {
  for (const item of entities.stageItems) {
    const pulse = 0.7 + 0.3 * Math.sin(item.wobble)
    const x = item.x - cam.x
    const y = item.y - cam.y

    ctx.save()
    ctx.globalAlpha = pulse
    ctx.fillStyle = 'rgba(17, 17, 22, 0.78)'
    ctx.strokeStyle = item.color
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(x, y, item.r + 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.strokeStyle = `${item.color}99`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y, item.r + 12 + pulse * 2, 0, Math.PI * 2)
    ctx.stroke()

    ctx.fillStyle = item.color
    ctx.font = 'bold 17px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(item.glyph, x, y + 1)
    ctx.restore()
  }
}

export function drawEnemyProjectiles(cam) {
  for (const projectile of entities.enemyProjectiles || []) {
    const x = projectile.x - cam.x
    const y = projectile.y - cam.y
    const radius = Math.max(3, projectile.r || 5)
    const velocityX = projectile.vx || 0
    const velocityY = projectile.vy || 0
    const angle = Math.atan2(velocityY, velocityX)

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)

    ctx.fillStyle = 'rgba(91, 70, 158, 0.42)'
    ctx.fillRect(-radius * 3.5, -1, radius * 2.7, 2)

    ctx.fillStyle = '#3f2631'
    ctx.beginPath()
    ctx.moveTo(radius + 2, 0)
    ctx.lineTo(0, radius + 1)
    ctx.lineTo(-radius - 2, 0)
    ctx.lineTo(0, -radius - 1)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = projectile.color || '#8067c7'
    ctx.beginPath()
    ctx.moveTo(radius, 0)
    ctx.lineTo(0, radius - 1)
    ctx.lineTo(-radius, 0)
    ctx.lineTo(0, -radius + 1)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = '#b7dcff'
    ctx.fillRect(-1, -1, 3, 3)
    ctx.restore()
  }
}

export function drawRelics(cam) {
  for (const relic of entities.relics) {
    const pulse = 0.6 + 0.4 * Math.sin(relic.wobble)
    const rarityColor =
      relic.source === 'boss'
        ? 'rgba(255, 240, 155, 0.98)'
        : relic.rarity === 'gold'
        ? 'rgba(255, 221, 120, 0.95)'
        : relic.rarity === 'silver'
          ? 'rgba(200, 220, 255, 0.92)'
          : 'rgba(198, 145, 92, 0.9)'
    const fallbackFill =
      relic.rarity === 'gold'
        ? `rgba(255, 221, 120, ${pulse})`
        : relic.rarity === 'silver'
          ? `rgba(200, 220, 255, ${pulse})`
          : `rgba(198, 145, 92, ${pulse})`
    const glowRadius =
      relic.source === 'boss'
        ? relic.r + 11
        : relic.rarity === 'gold'
        ? relic.r + 8
        : relic.rarity === 'silver'
          ? relic.r + 6
          : relic.r + 4

    ctx.strokeStyle = rarityColor
    ctx.lineWidth = relic.source === 'boss' || relic.rarity === 'gold' ? 3 : 2
    ctx.beginPath()
    ctx.arc(relic.x - cam.x, relic.y - cam.y, glowRadius, 0, Math.PI * 2)
    ctx.stroke()

    ctx.fillStyle = 'rgba(40, 40, 40, 0.25)'
    ctx.beginPath()
    ctx.ellipse(
      relic.x - cam.x,
      relic.y - cam.y + relic.r + 2,
      relic.r * 1.05,
      relic.r * 0.45,
      0,
      0,
      Math.PI * 2,
    )
    ctx.fill()

    if (relicSprite.complete && relicSprite.naturalWidth > 0) {
      const size = relic.r * 2
      ctx.save()
      ctx.globalAlpha = pulse
      ctx.drawImage(
        relicSprite,
        relic.x - cam.x - size / 2,
        relic.y - cam.y - size / 2,
        size,
        size,
      )
      ctx.restore()
    } else {
      ctx.fillStyle = fallbackFill
      ctx.beginPath()
      ctx.moveTo(relic.x - cam.x, relic.y - cam.y - relic.r)
      ctx.lineTo(relic.x - cam.x + relic.r, relic.y - cam.y)
      ctx.lineTo(relic.x - cam.x, relic.y - cam.y + relic.r)
      ctx.lineTo(relic.x - cam.x - relic.r, relic.y - cam.y)
      ctx.closePath()
      ctx.fill()
    }
  }
}

export function drawHealthPacks(cam) {
  for (const pack of entities.healthPacks) {
    const pulse = 0.6 + 0.4 * Math.sin(pack.wobble)
    if (healthSprite.complete && healthSprite.naturalWidth > 0) {
      const size = pack.r * 2
      ctx.save()
      ctx.globalAlpha = pulse
      ctx.drawImage(
        healthSprite,
        pack.x - cam.x - size / 2,
        pack.y - cam.y - size / 2,
        size,
        size,
      )
      ctx.restore()
    } else {
      ctx.fillStyle = `rgba(200, 40, 40, ${pulse})`
      ctx.beginPath()
      ctx.arc(pack.x - cam.x, pack.y - cam.y, pack.r, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function getChargeDirection(enemy) {
  const objectDirection = enemy.chargeDirection || enemy.chargeDir
  let x =
    objectDirection?.x ??
    enemy.chargeDirX ??
    enemy.chargeDx ??
    enemy.chargeX ??
    enemy.vx ??
    0
  let y =
    objectDirection?.y ??
    enemy.chargeDirY ??
    enemy.chargeDy ??
    enemy.chargeY ??
    enemy.vy ??
    0
  let length = Math.hypot(x, y)
  if (length < 0.001) {
    x = player.x - enemy.x
    y = player.y - enemy.y
    length = Math.hypot(x, y)
  }
  if (length < 0.001) return { x: 1, y: 0 }
  return { x: x / length, y: y / length }
}

function drawEnemyBehaviorTelegraph(enemy, cam) {
  if (
    enemy.spriteKey !== 'ash_bat' &&
    enemy.spriteKey !== 'ironback_beetle'
  ) {
    return
  }

  const phase = String(enemy.behaviorPhase || '').toLowerCase()
  const isWindup = phase.includes('windup')
  const isCharge = phase.includes('charge') || phase.includes('swoop')
  if (!isWindup && !isCharge) return

  const direction = getChargeDirection(enemy)
  const perpendicular = { x: -direction.y, y: direction.x }
  const x = enemy.x - cam.x
  const y = enemy.y - cam.y
  const isBeetle = enemy.spriteKey === 'ironback_beetle'
  const distance = isBeetle ? 104 : 82
  const start = enemy.r + 5
  const endX = x + direction.x * distance
  const endY = y + direction.y * distance
  const color = isBeetle
    ? isWindup
      ? 'rgba(232, 165, 108, 0.9)'
      : 'rgba(255, 112, 109, 0.82)'
    : isWindup
      ? 'rgba(128, 103, 199, 0.9)'
      : 'rgba(183, 220, 255, 0.82)'

  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = isWindup ? 2 : 4
  ctx.setLineDash(isWindup ? [6, 5] : [])
  ctx.beginPath()
  ctx.moveTo(x + direction.x * start, y + direction.y * start)
  ctx.lineTo(endX, endY)
  ctx.stroke()
  ctx.setLineDash([])

  const arrowSize = isBeetle ? 9 : 7
  ctx.beginPath()
  ctx.moveTo(endX, endY)
  ctx.lineTo(
    endX - direction.x * arrowSize + perpendicular.x * arrowSize * 0.65,
    endY - direction.y * arrowSize + perpendicular.y * arrowSize * 0.65,
  )
  ctx.lineTo(
    endX - direction.x * arrowSize - perpendicular.x * arrowSize * 0.65,
    endY - direction.y * arrowSize - perpendicular.y * arrowSize * 0.65,
  )
  ctx.closePath()
  ctx.fill()

  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(x, y, enemy.r + (isWindup ? 6 : 3), 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

export function drawEnemies(cam) {
  for (const enemy of entities.enemies) {
    const fallbackSprite = enemy.tier === 2 ? enemyBigSprite : enemySmallSprite
    const sprite = enemySpriteMap[enemy.spriteKey] || fallbackSprite
    drawEnemyBehaviorTelegraph(enemy, cam)
    if (enemy.isBoss) {
      const pulse = 0.45 + 0.35 * Math.sin(enemy.bossPulse || 0)
      ctx.strokeStyle = `rgba(255, 220, 120, ${pulse})`
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(enemy.x - cam.x, enemy.y - cam.y, enemy.r + 11, 0, Math.PI * 2)
      ctx.stroke()
    }

    if (enemy.isElite) {
      const pulse = 0.35 + 0.25 * Math.sin(enemy.elitePulse || 0)
      const affixColor =
        enemy.affix === 'fast'
          ? `rgba(255, 209, 102, ${pulse})`
          : enemy.affix === 'tank'
            ? `rgba(114, 214, 134, ${pulse})`
            : enemy.affix === 'volatile'
              ? `rgba(255, 129, 92, ${pulse})`
              : `rgba(188, 132, 255, ${pulse})`
      ctx.strokeStyle = affixColor
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(enemy.x - cam.x, enemy.y - cam.y, enemy.r + 8, 0, Math.PI * 2)
      ctx.stroke()
    }

    ctx.fillStyle = 'rgba(40, 40, 40, 0.28)'
    ctx.beginPath()
    ctx.ellipse(
      enemy.x - cam.x,
      enemy.y - cam.y + enemy.r + 2,
      enemy.r * 1.05,
      enemy.r * 0.45,
      0,
      0,
      Math.PI * 2,
    )
    ctx.fill()

    if (enemy.shockTimer > 0) {
      const pulse = 0.4 + 0.4 * Math.sin((enemy.shockTimer * 8) % (Math.PI * 2))
      ctx.fillStyle = `rgba(80, 170, 255, ${pulse})`
      ctx.beginPath()
      ctx.arc(enemy.x - cam.x, enemy.y - cam.y, enemy.r + 6, 0, Math.PI * 2)
      ctx.fill()
    }

    if (sprite.complete && sprite.naturalWidth > 0) {
      const size = enemy.r * 2
      ctx.drawImage(
        sprite,
        enemy.x - cam.x - size / 2,
        enemy.y - cam.y - size / 2,
        size,
        size,
      )
      if (enemy.isBoss) {
        ctx.strokeStyle = 'rgba(255, 236, 170, 0.9)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(enemy.x - cam.x - 8, enemy.y - cam.y - enemy.r - 8)
        ctx.lineTo(enemy.x - cam.x, enemy.y - cam.y - enemy.r - 16)
        ctx.lineTo(enemy.x - cam.x + 8, enemy.y - cam.y - enemy.r - 8)
        ctx.stroke()
      }
    } else {
      ctx.fillStyle = enemy.tier === 2 ? '#5a1f1f' : '#1f1f1f'
      ctx.beginPath()
      ctx.arc(enemy.x - cam.x, enemy.y - cam.y, enemy.r, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = 'rgba(255,255,255,0.4)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(enemy.x - enemy.r - cam.x, enemy.y - enemy.r - cam.y)
      ctx.lineTo(enemy.x + enemy.r - cam.x, enemy.y + enemy.r - cam.y)
      ctx.stroke()
    }
  }
}

export function drawPlayer(cam) {
  if (playerSprite.complete && playerSprite.naturalWidth > 0) {
    const size = player.r * 2
    ctx.fillStyle = 'rgba(40, 40, 40, 0.32)'
    ctx.beginPath()
    ctx.ellipse(
      player.x - cam.x,
      player.y - cam.y + player.r + 2,
      player.r * 1.1,
      player.r * 0.5,
      0,
      0,
      Math.PI * 2,
    )
    ctx.fill()
    ctx.drawImage(
      playerSprite,
      player.x - cam.x - size / 2,
      player.y - cam.y - size / 2,
      size,
      size,
    )
  } else {
    ctx.fillStyle = 'rgba(40, 40, 40, 0.32)'
    ctx.beginPath()
    ctx.ellipse(
      player.x - cam.x,
      player.y - cam.y + player.r + 2,
      player.r * 1.1,
      player.r * 0.5,
      0,
      0,
      Math.PI * 2,
    )
    ctx.fill()
    ctx.fillStyle = '#0b0c0f'
    ctx.beginPath()
    ctx.arc(player.x - cam.x, player.y - cam.y, player.r, 0, Math.PI * 2)
    ctx.fill()
  }
}

export function drawPlayerHpRing(cam) {
  ctx.strokeStyle = '#d94f2b'
  ctx.lineWidth = 3
  const hpRatio = Math.max(0, player.hp / player.maxHp)
  ctx.beginPath()
  ctx.arc(
    player.x - cam.x,
    player.y - cam.y,
    player.r + 6,
    -Math.PI / 2,
    -Math.PI / 2 + Math.PI * 2 * hpRatio,
  )
  ctx.stroke()
}
