import { entities } from '../../state/gameState.js'

export function updateParticles(dt) {
  for (let i = entities.particles.length - 1; i >= 0; i -= 1) {
    const p = entities.particles[i]
    p.life -= dt
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.r *= 0.96
    if (p.life <= 0 || p.r < 0.4) entities.particles.splice(i, 1)
  }
}

export function updatePulseEffects(dt) {
  for (let i = entities.pulses.length - 1; i >= 0; i -= 1) {
    const pulse = entities.pulses[i]
    pulse.life -= dt
    const t = 1 - pulse.life / pulse.maxLife
    pulse.r = pulse.max * Math.min(1, t)
    if (pulse.life <= 0) entities.pulses.splice(i, 1)
  }
}

export function updateChainArcs(dt) {
  for (let i = entities.chainArcs.length - 1; i >= 0; i -= 1) {
    const arc = entities.chainArcs[i]
    arc.life -= dt
    if (arc.life <= 0) entities.chainArcs.splice(i, 1)
  }
}
