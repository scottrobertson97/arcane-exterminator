import { player } from '../state/gameState.js'

export const evolutionDefs = [
  {
    id: 'inferno_salvo',
    weaponId: 'bullets',
    passiveId: 'might',
    name: 'Inferno Salvo',
    desc: '+50% firebolt damage and +25% fire rate.',
    apply: () => {
      player.damage *= 1.5
      player.fireRate *= 1.25
    },
  },
  {
    id: 'glacial_crown',
    weaponId: 'frost',
    passiveId: 'projectile_speed',
    name: 'Glacial Crown',
    desc: '+60% frost damage, +2 shards, and +3 pierce.',
    apply: () => {
      player.frostDamage *= 1.6
      player.frostShots += 2
      player.frostPierce += 3
    },
  },
  {
    id: 'blade_tempest',
    weaponId: 'blades',
    passiveId: 'area',
    name: 'Blade Tempest',
    desc: 'A larger, faster orbit with two additional empowered blades.',
    apply: () => {
      player.bladeDamage *= 1.6
      player.bladeCount += 2
      player.bladeSpeed += 0.6
      player.bladeSize += 6
      player.bladeRadius += 18
    },
  },
  {
    id: 'star_aegis',
    weaponId: 'nova',
    passiveId: 'vitality',
    name: 'Star Aegis',
    desc: '+60% nova damage, +25 radius, and 20% faster casting.',
    apply: () => {
      player.novaDamage *= 1.6
      player.novaRadius += 25
      player.novaCooldown *= 0.8
    },
  },
  {
    id: 'tempest_lattice',
    weaponId: 'chain',
    passiveId: 'cooldown',
    name: 'Tempest Lattice',
    desc: '+60% damage, +3 chains, +60 range, and 20% faster casting.',
    apply: () => {
      player.chainDamage *= 1.6
      player.chainCount += 3
      player.chainRange += 60
      player.chainCooldown *= 0.8
    },
  },
  {
    id: 'singularity',
    weaponId: 'vortex',
    passiveId: 'magnet',
    name: 'Singularity',
    desc: 'A wider, longer gravity well with stronger damage and pull.',
    apply: () => {
      player.vortexDps *= 1.8
      player.vortexRadius += 40
      player.vortexDuration += 1.2
      player.vortexPull *= 1.35
      player.vortexCooldown *= 0.8
    },
  },
]
