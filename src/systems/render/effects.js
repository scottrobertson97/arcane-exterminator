import { ctx } from '../../core/dom.js'
import { entities, state } from '../../state/gameState.js'

export function drawXpOrbs(cam) {
  for (const orb of entities.orbs) {
    const height = (orb.bob + 10) / 20
    const shadowScale = 0.8 + (1 - height) * 0.6
    const shadowAlpha = 0.5 * height + 0.12
    ctx.fillStyle = `rgba(40, 40, 40, ${shadowAlpha.toFixed(3)})`
    ctx.beginPath()
    ctx.ellipse(
      orb.x - cam.x,
      orb.baseY - cam.y + orb.r + 10,
      orb.r * 1.1 * shadowScale,
      orb.r * 0.55 * shadowScale,
      0,
      0,
      Math.PI * 2,
    )
    ctx.fill()

    ctx.fillStyle = '#1f6f8b'
    ctx.beginPath()
    ctx.arc(orb.x - cam.x, orb.y - cam.y, orb.r, 0, Math.PI * 2)
    ctx.fill()
  }
}

export function drawPulseRings(cam) {
  for (const pulse of entities.pulses) {
    const alpha = 0.35 + 0.35 * Math.sin((pulse.r / pulse.max) * Math.PI * 4)
    const color =
      pulse.type === 'nova'
        ? `rgba(190, 120, 255, ${alpha})`
        : `rgba(80, 170, 255, ${alpha})`
    ctx.strokeStyle = color
    ctx.lineWidth = pulse.type === 'nova' ? 3 : 4
    ctx.beginPath()
    ctx.arc(pulse.x - cam.x, pulse.y - cam.y, pulse.r, 0, Math.PI * 2)
    ctx.stroke()
  }
}

export function drawChainArcLines(cam) {
  for (const arc of entities.chainArcs) {
    const alpha = Math.min(1, arc.life / 0.2)
    ctx.strokeStyle = `rgba(120, 200, 255, ${alpha})`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(arc.x1 - cam.x, arc.y1 - cam.y)
    ctx.lineTo(arc.x2 - cam.x, arc.y2 - cam.y)
    ctx.stroke()
  }
}

export function drawParticles(cam) {
  for (const p of entities.particles) {
    const maxLife = p.color === 'blood' ? 0.55 : 0.35
    const alpha = Math.max(0, Math.min(1, p.life / maxLife))
    if (p.color === 'blood') {
      ctx.fillStyle = `rgba(180, 30, 30, ${alpha})`
    } else if (p.color === 'ice') {
      ctx.fillStyle = `rgba(120, 200, 255, ${alpha})`
    } else {
      ctx.fillStyle = `rgba(255, 180, 90, ${alpha})`
    }
    ctx.beginPath()
    ctx.arc(p.x - cam.x, p.y - cam.y, p.r, 0, Math.PI * 2)
    ctx.fill()
  }
}

export function drawShockLinks(cam) {
  const shocked = entities.enemies.filter(enemy => enemy.shockTimer > 0)
  if (shocked.length <= 1) return

  const pulse = 0.35 + 0.35 * Math.sin(state.elapsed * 8)
  ctx.strokeStyle = `rgba(80, 170, 255, ${pulse})`
  ctx.lineWidth = 2

  for (let i = 0; i < shocked.length; i += 1) {
    for (let j = i + 1; j < shocked.length; j += 1) {
      ctx.beginPath()
      ctx.moveTo(shocked[i].x - cam.x, shocked[i].y - cam.y)
      ctx.lineTo(shocked[j].x - cam.x, shocked[j].y - cam.y)
      ctx.stroke()
    }
  }
}
