export const enemyArchetypes = Object.freeze({
  rat: Object.freeze({
    id: 'rat',
    spriteKey: 'rat_small',
    hpMultiplier: 1,
    speedMultiplier: 1,
    damageMultiplier: 1,
    radiusDelta: 0,
    xpBonus: 0,
    behavior: 'seek',
  }),
  ash_bat: Object.freeze({
    id: 'ash_bat',
    spriteKey: 'ash_bat',
    hpMultiplier: 0.68,
    speedMultiplier: 1.34,
    damageMultiplier: 0.8,
    radiusDelta: -2,
    xpBonus: 1,
    behavior: 'swoop',
  }),
  ironback_beetle: Object.freeze({
    id: 'ironback_beetle',
    spriteKey: 'ironback_beetle',
    hpMultiplier: 2.15,
    speedMultiplier: 0.65,
    damageMultiplier: 1.25,
    radiusDelta: 3,
    xpBonus: 4,
    behavior: 'charge',
  }),
  hex_acolyte: Object.freeze({
    id: 'hex_acolyte',
    spriteKey: 'hex_acolyte',
    hpMultiplier: 0.9,
    speedMultiplier: 0.78,
    damageMultiplier: 0.9,
    radiusDelta: 0,
    xpBonus: 3,
    behavior: 'kite',
  }),
})

export function getEnemyArchetype(id) {
  return enemyArchetypes[id] || enemyArchetypes.rat
}

export function chooseEnemyArchetype(enemyMix) {
  if (!Array.isArray(enemyMix) || enemyMix.length === 0) {
    return enemyArchetypes.rat
  }

  const weightedArchetypes = enemyMix
    .map(entry => ({
      archetype: enemyArchetypes[entry?.id],
      weight: Number(entry?.weight),
    }))
    .filter(entry => entry.archetype && Number.isFinite(entry.weight) && entry.weight > 0)

  const totalWeight = weightedArchetypes.reduce((total, entry) => total + entry.weight, 0)
  if (totalWeight <= 0) return enemyArchetypes.rat

  let roll = Math.random() * totalWeight
  for (const entry of weightedArchetypes) {
    roll -= entry.weight
    if (roll < 0) return entry.archetype
  }

  return weightedArchetypes[weightedArchetypes.length - 1].archetype
}
