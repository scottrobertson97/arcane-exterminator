import { ctx } from '../../core/dom.js'
import {
  bladeSprite,
  enemyBigSprite,
  enemySmallSprite,
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
    ctx.fillStyle = bullet.type === 'frost' ? '#7cc7ff' : '#ff7b3a'
    ctx.beginPath()
    ctx.arc(bullet.x - cam.x, bullet.y - cam.y, bullet.r, 0, Math.PI * 2)
    ctx.fill()
  }
}

export function drawRelics(cam) {
  for (const relic of entities.relics) {
    const pulse = 0.6 + 0.4 * Math.sin(relic.wobble)
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
      ctx.drawImage(
        relicSprite,
        relic.x - cam.x - size / 2,
        relic.y - cam.y - size / 2,
        size,
        size,
      )
    } else {
      ctx.fillStyle = `rgba(80, 170, 255, ${pulse})`
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

export function drawEnemies(cam) {
  for (const enemy of entities.enemies) {
    const sprite = enemy.tier === 2 ? enemyBigSprite : enemySmallSprite
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
