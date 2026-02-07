import { player } from '../state/gameState.js'
import {
  RELIC_BRONZE_STAT_MULT,
  RELIC_GOLD_STAT_MULT,
  RELIC_SILVER_STAT_MULT,
} from '../config/constants.js'

const relicStatMultipliers = {
  bronze: RELIC_BRONZE_STAT_MULT,
  silver: RELIC_SILVER_STAT_MULT,
  gold: RELIC_GOLD_STAT_MULT,
}

function getRelicStatMultiplier(rarity = 'bronze') {
  return relicStatMultipliers[rarity] || relicStatMultipliers.bronze
}

function formatPercent(value) {
  return Number.isInteger(value) ? value : +value.toFixed(1)
}

export const upgradeDefs = [
  {
    id: 'pulse',
    max: 3,
    name: 'Lightning Pulse',
    desc: lvl =>
      lvl === 0
        ? 'Unlocks lightning pulse'
        : lvl === 1
          ? '-15% cooldown'
          : '+30 radius, +8 damage',
    canShow: () => true,
    apply: lvl => {
      if (lvl === 1) player.pulseUnlocked = true
      if (lvl === 2)
        player.pulseCooldown = +(player.pulseCooldown * 0.85).toFixed(2)
      if (lvl === 3) {
        player.pulseRadius += 30
        player.pulseDamage += 8
      }
    },
  },
  {
    id: 'blades',
    max: 4,
    name: 'Orbiting Blades',
    desc: lvl =>
      lvl === 0
        ? 'Unlocks orbiting blades'
        : lvl === 1
          ? '+1 blade'
          : lvl === 2
            ? '+1 blade, +6 damage'
            : '+0.4 orbit speed',
    canShow: () => true,
    apply: lvl => {
      if (lvl === 1) {
        player.bladesUnlocked = true
        player.bladeCount = 2
      } else if (lvl === 2) {
        player.bladeCount += 1
      } else if (lvl === 3) {
        player.bladeCount += 1
        player.bladeDamage += 6
      } else if (lvl === 4) {
        player.bladeSpeed += 0.4
      }
    },
  },
  {
    id: 'frost',
    max: 5,
    name: 'Frost Shards',
    desc: lvl =>
      lvl === 0
        ? 'Unlocks frost shards'
        : lvl === 1
          ? '+1 shard per burst'
          : lvl === 2
            ? '+2 damage'
            : lvl === 3
              ? '+1 pierce'
              : '+0.3 fire rate',
    canShow: () => true,
    apply: lvl => {
      if (lvl === 1) player.frostUnlocked = true
      if (lvl === 2) player.frostShots += 1
      if (lvl === 3) player.frostDamage += 2
      if (lvl === 4) player.frostPierce += 1
      if (lvl === 5) player.frostFireRate = +(player.frostFireRate + 0.3).toFixed(2)
    },
  },
  {
    id: 'nova',
    max: 4,
    name: 'Arcane Nova',
    desc: lvl =>
      lvl === 0
        ? 'Unlocks arcane nova'
        : lvl === 1
          ? '-15% cooldown'
          : lvl === 2
            ? '+15 radius'
            : '+6 damage',
    canShow: () => true,
    apply: lvl => {
      if (lvl === 1) player.novaUnlocked = true
      if (lvl === 2)
        player.novaCooldown = +(player.novaCooldown * 0.85).toFixed(2)
      if (lvl === 3) player.novaRadius += 15
      if (lvl === 4) player.novaDamage += 6
    },
  },
  {
    id: 'chain',
    max: 4,
    name: 'Chain Lightning',
    desc: lvl =>
      lvl === 0
        ? 'Unlocks chain lightning'
        : lvl === 1
          ? '+1 chain'
          : lvl === 2
            ? '+4 damage'
            : '+25 range',
    canShow: () => true,
    apply: lvl => {
      if (lvl === 1) player.chainUnlocked = true
      if (lvl === 2) player.chainCount += 1
      if (lvl === 3) player.chainDamage += 4
      if (lvl === 4) player.chainRange += 25
    },
  },
  {
    id: 'solar',
    max: 4,
    name: 'Solar Orbs',
    desc: lvl =>
      lvl === 0
        ? 'Unlocks solar orbs'
        : lvl === 1
          ? '+1 orb'
          : lvl === 2
            ? '+2 damage'
            : '+0.4 orbit speed',
    canShow: () => true,
    apply: lvl => {
      if (lvl === 1) player.orbUnlocked = true
      if (lvl === 2) player.orbCount += 1
      if (lvl === 3) player.orbDamage += 2
      if (lvl === 4) player.orbSpeed += 0.4
    },
  },
  {
    id: 'bullets',
    max: 5,
    name: 'Firebolts',
    desc: lvl =>
      lvl === 0
        ? 'Unlocks firebolts (starter)'
        : lvl === 1
          ? '+6 damage'
          : lvl === 2
            ? '+0.4 fire rate'
            : lvl === 3
              ? '+8 damage'
              : '+80 bullet speed',
    canShow: () => true,
    apply: lvl => {
      if (lvl === 1) return
      if (lvl === 2) player.damage += 6
      if (lvl === 3) player.fireRate = +(player.fireRate + 0.4).toFixed(2)
      if (lvl === 4) player.damage += 8
      if (lvl === 5) player.bulletSpeed += 80
    },
  },
  {
    id: 'magnet',
    max: 3,
    name: 'Magnet Field',
    desc: lvl => (lvl === 0 ? 'Unlocks orb magnetism' : '+25% pickup radius'),
    canShow: () => true,
    apply: lvl => {
      if (lvl >= 1) player.pickupRadius = Math.round(player.pickupRadius * 1.25)
    },
  },
]

export const statUpgrades = [
  {
    name: 'Heavy Rounds',
    desc: (rarity = 'bronze') => {
      const percent = formatPercent(25 * getRelicStatMultiplier(rarity))
      return `+${percent}% bullet damage`
    },
    apply: (rarity = 'bronze') => {
      const mult = getRelicStatMultiplier(rarity)
      player.damage = Math.round(player.damage * (1 + 0.25 * mult))
    },
  },
  {
    name: 'Overclock',
    desc: (rarity = 'bronze') => {
      const percent = formatPercent(20 * getRelicStatMultiplier(rarity))
      return `+${percent}% fire rate`
    },
    apply: (rarity = 'bronze') => {
      const mult = getRelicStatMultiplier(rarity)
      player.fireRate = +(player.fireRate * (1 + 0.2 * mult)).toFixed(2)
    },
  },
  {
    name: 'Sprint Boots',
    desc: (rarity = 'bronze') => {
      const percent = formatPercent(15 * getRelicStatMultiplier(rarity))
      return `+${percent}% move speed`
    },
    apply: (rarity = 'bronze') => {
      const mult = getRelicStatMultiplier(rarity)
      player.speed = Math.round(player.speed * (1 + 0.15 * mult))
    },
  },
  {
    name: 'Iron Heart',
    desc: (rarity = 'bronze') => {
      const bonus = Math.round(30 * getRelicStatMultiplier(rarity))
      return `+${bonus} max HP`
    },
    apply: (rarity = 'bronze') => {
      const bonus = Math.round(30 * getRelicStatMultiplier(rarity))
      player.maxHp += bonus
      player.hp = Math.min(player.hp + bonus, player.maxHp)
    },
  },
  {
    name: 'Railcast',
    desc: (rarity = 'bronze') => {
      const percent = formatPercent(20 * getRelicStatMultiplier(rarity))
      return `+${percent}% bullet speed`
    },
    apply: (rarity = 'bronze') => {
      const mult = getRelicStatMultiplier(rarity)
      player.bulletSpeed = Math.round(player.bulletSpeed * (1 + 0.2 * mult))
    },
  },
]
