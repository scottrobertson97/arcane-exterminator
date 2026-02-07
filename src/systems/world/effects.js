import { entities, player, timers } from '../../state/gameState.js'

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

function detonateMine(mine) {
  entities.pulses.push({
    x: mine.x,
    y: mine.y,
    r: 0,
    max: mine.radius,
    life: 0.28,
    maxLife: 0.28,
    type: 'mine',
  })

  for (const enemy of entities.enemies) {
    const dx = enemy.x - mine.x
    const dy = enemy.y - mine.y
    const dist = Math.hypot(dx, dy) || 1
    if (dist > mine.radius + enemy.r) continue
    enemy.hp -= mine.damage
    const falloff = 1 - Math.min(1, dist / mine.radius)
    const knock = 180 * (0.3 + falloff * 0.7)
    enemy.knockX += (dx / dist) * knock
    enemy.knockY += (dy / dist) * knock
    enemy.shockTimer = Math.max(enemy.shockTimer, 0.35)
  }

  for (let p = 0; p < 10; p += 1) {
    entities.particles.push({
      x: mine.x,
      y: mine.y,
      vx: (Math.random() - 0.5) * 170,
      vy: (Math.random() - 0.5) * 170,
      r: 2 + Math.random() * 2.6,
      life: 0.35,
      color: 'fire',
    })
  }
}

export function updateMines(dt) {
  for (let i = entities.mines.length - 1; i >= 0; i -= 1) {
    const mine = entities.mines[i]
    mine.life -= dt
    if (mine.armTimer > 0) mine.armTimer -= dt

    let triggered = false
    if (mine.armTimer <= 0) {
      for (const enemy of entities.enemies) {
        const dx = enemy.x - mine.x
        const dy = enemy.y - mine.y
        if (Math.hypot(dx, dy) <= mine.triggerRadius + enemy.r) {
          triggered = true
          break
        }
      }
    }

    if (triggered) {
      detonateMine(mine)
      entities.mines.splice(i, 1)
      continue
    }

    if (mine.life <= 0) entities.mines.splice(i, 1)
  }
}

export function updateTrails(dt) {
  if (player.trailUnlocked && player.isMoving) {
    timers.trail -= dt
    const interval = Math.max(0.06, player.trailSpawnInterval)
    while (timers.trail <= 0) {
      const maxPatches = Math.max(1, Math.round(player.trailMaxPatches))
      while (entities.trails.length >= maxPatches) {
        entities.trails.splice(0, 1)
      }

      entities.trails.push({
        x: player.x,
        y: player.y,
        r: player.trailRadius,
        dps: player.trailDps,
        life: player.trailPatchLife,
        maxLife: player.trailPatchLife,
      })
      timers.trail += interval
    }
  }

  for (let i = entities.trails.length - 1; i >= 0; i -= 1) {
    const patch = entities.trails[i]
    patch.life -= dt

    for (const enemy of entities.enemies) {
      const dx = enemy.x - patch.x
      const dy = enemy.y - patch.y
      if (Math.hypot(dx, dy) <= patch.r + enemy.r) {
        enemy.hp -= patch.dps * dt
      }
    }

    if (patch.life <= 0) entities.trails.splice(i, 1)
  }
}

export function updateVortexes(dt) {
  for (let i = entities.vortexes.length - 1; i >= 0; i -= 1) {
    const vortex = entities.vortexes[i]
    vortex.life -= dt

    for (const enemy of entities.enemies) {
      const dx = vortex.x - enemy.x
      const dy = vortex.y - enemy.y
      const dist = Math.hypot(dx, dy)
      if (dist > vortex.r + enemy.r) continue

      enemy.hp -= vortex.dps * dt
      enemy.shockTimer = Math.max(enemy.shockTimer, 0.22)

      const safeDist = Math.max(8, dist)
      const pullFactor = 0.35 + (1 - Math.min(1, safeDist / vortex.r)) * 0.65
      const pull = vortex.pull * pullFactor
      enemy.knockX += (dx / safeDist) * pull
      enemy.knockY += (dy / safeDist) * pull
    }

    if (vortex.life <= 0) entities.vortexes.splice(i, 1)
  }
}
