// DOM and canvas handles
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const hud = {
  wave: document.getElementById('wave'),
  time: document.getElementById('time'),
  hp: document.getElementById('hp'),
  level: document.getElementById('level'),
  xp: document.getElementById('xp'),
}

const instructions = document.getElementById('instructions')
const startBtn = document.getElementById('start')
const levelup = document.getElementById('levelup')
const choicesEl = document.getElementById('choices')
const zoomControls = {
  out: document.getElementById('zoom-out'),
  in: document.getElementById('zoom-in'),
  label: document.getElementById('zoom-label'),
}

// Constants and world config
const zoomLevels = [1, 2, 4]
let zoomIndex = 1
let zoom = zoomLevels[zoomIndex]
let VIEW_WIDTH = canvas.width / zoom
let VIEW_HEIGHT = canvas.height / zoom
const WORLD_WIDTH = 2400
const WORLD_HEIGHT = 1600

// Mutable runtime state
const state = {
  running: false,
  paused: false,
  lastTime: 0,
  elapsed: 0,
  waveDuration: 30,
  pendingLevels: 0,
  pendingStatUps: 0,
}

const input = {
  up: false,
  down: false,
  left: false,
  right: false,
  mouseActive: false,
  mouseX: 0,
  mouseY: 0,
}

const player = {
  x: WORLD_WIDTH / 2,
  y: WORLD_HEIGHT / 2,
  r: 12,
  speed: 180,
  maxHp: 100,
  hp: 100,
  damage: 18,
  fireRate: 1.2,
  bulletSpeed: 420,
  xp: 0,
  level: 1,
  nextXp: 20,
  pickupRadius: 30,
  pulseCooldown: 4.5,
  pulseRadius: 120,
  pulseDamage: 28,
  pulseKnockback: 320,
  pulseUnlocked: false,
  novaCooldown: 2.6,
  novaRadius: 70,
  novaDamage: 14,
  novaKnockback: 220,
  novaUnlocked: false,
  bladeCount: 2,
  bladeRadius: 34,
  bladeSpeed: 2.4,
  bladeDamage: 14,
  bladeHitCooldown: 0.35,
  bladeSize: 22,
  bladeAngle: 0,
  bladesUnlocked: false,
  frostFireRate: 0.9,
  frostDamage: 10,
  frostSpeed: 360,
  frostPierce: 2,
  frostShots: 2,
  frostUnlocked: false,
  chainCooldown: 1.6,
  chainDamage: 12,
  chainRange: 120,
  chainCount: 2,
  chainUnlocked: false,
  orbCount: 1,
  orbRadius: 60,
  orbSpeed: 1.2,
  orbDamage: 8,
  orbHitCooldown: 0.6,
  orbAngle: 0,
  orbUnlocked: false,
  upgrades: {},
}

const entities = {
  bullets: [],
  enemies: [],
  orbs: [],
  relics: [],
  healthPacks: [],
  pulses: [],
  particles: [],
  chainArcs: [],
}

const orbitCache = {
  blades: [],
  solars: [],
}

const bullets = entities.bullets
const enemies = entities.enemies
const orbs = entities.orbs
const relics = entities.relics
const healthPacks = entities.healthPacks
const pulses = entities.pulses
const particles = entities.particles
const chainArcs = entities.chainArcs
const bladePositions = orbitCache.blades
const solarPositions = orbitCache.solars
const ENEMY_SEP_RADIUS = 42
const ENEMY_SEP_FORCE = 120
const playerSprite = new Image()
playerSprite.src = 'sprites/wizard.png'
const enemySmallSprite = new Image()
enemySmallSprite.src = 'sprites/rat_gray.png'
const enemyBigSprite = new Image()
enemyBigSprite.src = 'sprites/rat_brown.png'
const bladeSprite = new Image()
bladeSprite.src = 'sprites/knife.png'
const relicSprite = new Image()
relicSprite.src = 'sprites/chest.png'
const healthSprite = new Image()
healthSprite.src = 'sprites/health.png'
const music = new Audio('Glinting Gold.wav')
music.loop = true
music.volume = 0.5

function resizeCanvas() {
  const width = Math.max(320, Math.floor(window.innerWidth))
  const height = Math.max(240, Math.floor(window.innerHeight))
  canvas.width = width
  canvas.height = height
  applyZoom()
}

function applyZoom() {
  zoom = zoomLevels[zoomIndex]
  VIEW_WIDTH = canvas.width / zoom
  VIEW_HEIGHT = canvas.height / zoom
  if (zoomControls.label) zoomControls.label.textContent = `${zoom}X`
  if (zoomControls.out) zoomControls.out.disabled = zoomIndex === 0
  if (zoomControls.in)
    zoomControls.in.disabled = zoomIndex === zoomLevels.length - 1
}

function setZoomIndex(nextIndex) {
  zoomIndex = Math.max(0, Math.min(zoomLevels.length - 1, nextIndex))
  applyZoom()
}

// Data definitions
const upgradeDefs = [
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
const statUpgrades = [
  {
    name: 'Heavy Rounds',
    desc: '+25% bullet damage',
    apply: () => {
      player.damage = Math.round(player.damage * 1.25)
    },
  },
  {
    name: 'Overclock',
    desc: '+20% fire rate',
    apply: () => {
      player.fireRate = +(player.fireRate * 1.2).toFixed(2)
    },
  },
  {
    name: 'Sprint Boots',
    desc: '+15% move speed',
    apply: () => {
      player.speed = Math.round(player.speed * 1.15)
    },
  },
  {
    name: 'Iron Heart',
    desc: '+30 max HP',
    apply: () => {
      player.maxHp += 30
      player.hp = Math.min(player.hp + 30, player.maxHp)
    },
  },
  {
    name: 'Railcast',
    desc: '+20% bullet speed',
    apply: () => {
      player.bulletSpeed = Math.round(player.bulletSpeed * 1.2)
    },
  },
]

const timers = {
  shoot: 0,
  spawn: 0,
  pulse: 0,
  nova: 0,
  frost: 0,
  chain: 0,
  relic: 0,
}

// Utility helpers
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function distance(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by)
}

function resetGame() {
  zoomIndex = 1
  applyZoom()

  player.x = WORLD_WIDTH / 2
  player.y = WORLD_HEIGHT / 2
  player.hp = player.maxHp
  player.xp = 0
  player.level = 0
  player.nextXp = 20
  player.speed = 180
  player.damage = 18
  player.fireRate = 1.2
  player.bulletSpeed = 420
  player.pickupRadius = 30
  player.pulseCooldown = 4.5
  player.pulseRadius = 120
  player.pulseDamage = 28
  player.pulseKnockback = 320
  player.pulseUnlocked = false
  player.novaCooldown = 2.6
  player.novaRadius = 70
  player.novaDamage = 14
  player.novaKnockback = 220
  player.novaUnlocked = false
  player.bladesUnlocked = false
  player.bladeCount = 2
  player.bladeRadius = 34
  player.bladeSpeed = 2.4
  player.bladeDamage = 14
  player.bladeHitCooldown = 0.35
  player.bladeSize = 22
  player.bladeAngle = 0
  player.frostFireRate = 0.9
  player.frostDamage = 10
  player.frostSpeed = 360
  player.frostPierce = 2
  player.frostShots = 2
  player.frostUnlocked = false
  player.chainCooldown = 1.6
  player.chainDamage = 12
  player.chainRange = 120
  player.chainCount = 2
  player.chainUnlocked = false
  player.orbCount = 1
  player.orbRadius = 60
  player.orbSpeed = 1.2
  player.orbDamage = 8
  player.orbHitCooldown = 0.6
  player.orbAngle = 0
  player.orbUnlocked = false
  player.upgrades = { bullets: 1 }

  bullets.length = 0
  enemies.length = 0
  orbs.length = 0
  relics.length = 0
  healthPacks.length = 0
  pulses.length = 0
  particles.length = 0
  solarPositions.length = 0
  chainArcs.length = 0

  state.elapsed = 0
  state.pendingLevels = 0
  state.pendingStatUps = 0
  timers.shoot = 0
  timers.spawn = 0
  timers.pulse = 0
  timers.nova = 0
  timers.frost = 0
  timers.chain = 0
  timers.relic = 6
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function updateHud() {
  const wave = Math.floor(state.elapsed / state.waveDuration) + 1
  hud.wave.textContent = wave
  hud.time.textContent = formatTime(state.elapsed)
  hud.hp.textContent = `${Math.max(0, Math.round(player.hp))} / ${player.maxHp}`
  hud.level.textContent = player.level
  hud.xp.textContent = `${player.xp} / ${player.nextXp}`
}

function addOrb(x, y, value) {
  orbs.push({
    x,
    y,
    baseY: y,
    bob: 0,
    r: 6,
    value,
    drift: Math.random() * Math.PI * 2,
  })
}

function addRelic() {
  const cam = camera()
  const margin = 60
  const x = Math.max(
    margin,
    Math.min(WORLD_WIDTH - margin, cam.x + Math.random() * VIEW_WIDTH),
  )
  const y = Math.max(
    margin,
    Math.min(WORLD_HEIGHT - margin, cam.y + Math.random() * VIEW_HEIGHT),
  )
  relics.push({ x, y, r: 10, wobble: Math.random() * Math.PI * 2 })
}

function camera() {
  const x = Math.max(
    0,
    Math.min(WORLD_WIDTH - VIEW_WIDTH, player.x - VIEW_WIDTH / 2),
  )
  const y = Math.max(
    0,
    Math.min(WORLD_HEIGHT - VIEW_HEIGHT, player.y - VIEW_HEIGHT / 2),
  )
  return { x, y }
}

function spawnEnemy() {
  const wave = Math.floor(state.elapsed / state.waveDuration) + 1
  const edge = Math.floor(Math.random() * 4)
  const margin = 120
  const cam = camera()
  let x = 0
  let y = 0

  if (edge === 0) {
    x = cam.x - margin
    y = cam.y + Math.random() * VIEW_HEIGHT
  } else if (edge === 1) {
    x = cam.x + VIEW_WIDTH + margin
    y = cam.y + Math.random() * VIEW_HEIGHT
  } else if (edge === 2) {
    x = cam.x + Math.random() * VIEW_WIDTH
    y = cam.y - margin
  } else {
    x = cam.x + Math.random() * VIEW_WIDTH
    y = cam.y + VIEW_HEIGHT + margin
  }

  x = Math.max(0, Math.min(WORLD_WIDTH, x))
  y = Math.max(0, Math.min(WORLD_HEIGHT, y))

  const tier = Math.random() < Math.min(0.15 + wave * 0.01, 0.4) ? 2 : 1
  const baseHp = tier === 2 ? 70 : 40
  const baseSpeed = tier === 2 ? 70 : 90
    const enemy = {
      x,
      y,
      r: tier === 2 ? 16 : 12,
      hp: Math.round(baseHp + wave * 8),
      maxHp: Math.round(baseHp + wave * 8),
    speed: baseSpeed + wave * 4,
    damage: tier === 2 ? 18 : 12,
    tier,
    vx: 0,
    vy: 0,
    knockX: 0,
      knockY: 0,
      shockTimer: 0,
      bladeHitTimer: 0,
      orbHitTimer: 0,
    }
  enemies.push(enemy)
}

function nearestEnemy() {
  let best = null
  let bestDist = Infinity
  for (const enemy of enemies) {
    const dx = enemy.x - player.x
    const dy = enemy.y - player.y
    const dist = Math.hypot(dx, dy)
    if (dist < bestDist) {
      bestDist = dist
      best = enemy
    }
  }
  return best
}

function shoot(dt) {
  timers.shoot -= dt
  if (timers.shoot > 0) return
  const target = nearestEnemy()
  if (!target) return

  const dx = target.x - player.x
  const dy = target.y - player.y
  const dist = Math.hypot(dx, dy) || 1
  const vx = (dx / dist) * player.bulletSpeed
  const vy = (dy / dist) * player.bulletSpeed

  bullets.push({
    x: player.x,
    y: player.y,
    vx,
    vy,
    r: 4,
    damage: player.damage,
    life: 1.5,
    type: 'fire',
  })

  timers.shoot = 1 / player.fireRate
}

function fireFrostShards(dt) {
  timers.frost -= dt
  if (timers.frost > 0) return
  const target = nearestEnemy()
  if (!target) return

  const dx = target.x - player.x
  const dy = target.y - player.y
  const baseAngle = Math.atan2(dy, dx)
  const spread = 0.18
  const count = Math.max(1, player.frostShots)
  const start = -((count - 1) * spread) / 2

  for (let i = 0; i < count; i += 1) {
    const angle = baseAngle + start + i * spread
    bullets.push({
      x: player.x,
      y: player.y,
      vx: Math.cos(angle) * player.frostSpeed,
      vy: Math.sin(angle) * player.frostSpeed,
      r: 4,
      damage: player.frostDamage,
      life: 1.4,
      type: 'frost',
      pierce: player.frostPierce,
    })
  }

  timers.frost = 1 / player.frostFireRate
}

function pulseShockwave() {
  pulses.push({
    x: player.x,
    y: player.y,
    r: 0,
    max: player.pulseRadius,
    life: 0.45,
    maxLife: 0.45,
    type: 'pulse',
  })
  for (const enemy of enemies) {
    const dx = enemy.x - player.x
    const dy = enemy.y - player.y
    const dist = Math.hypot(dx, dy) || 1
    if (dist <= player.pulseRadius) {
      enemy.hp -= player.pulseDamage
      enemy.shockTimer = 1.2
      const falloff = 1 - dist / player.pulseRadius
      const knock = player.pulseKnockback * Math.max(0.2, falloff)
      enemy.knockX += (dx / dist) * knock
      enemy.knockY += (dy / dist) * knock
    }
  }
}

function novaShockwave() {
  pulses.push({
    x: player.x,
    y: player.y,
    r: 0,
    max: player.novaRadius,
    life: 0.35,
    maxLife: 0.35,
    type: 'nova',
  })
  for (const enemy of enemies) {
    const dx = enemy.x - player.x
    const dy = enemy.y - player.y
    const dist = Math.hypot(dx, dy) || 1
    if (dist <= player.novaRadius) {
      enemy.hp -= player.novaDamage
      enemy.shockTimer = 0.6
      const falloff = 1 - dist / player.novaRadius
      const knock = player.novaKnockback * Math.max(0.2, falloff)
      enemy.knockX += (dx / dist) * knock
      enemy.knockY += (dy / dist) * knock
    }
  }
}

function chainLightning() {
  if (enemies.length === 0) return
  const hit = []
  let current = nearestEnemy()
  if (!current) return
  chainArcs.push({
    x1: player.x,
    y1: player.y,
    x2: current.x,
    y2: current.y,
    life: 0.2,
  })
  for (let i = 0; i < player.chainCount + 1; i += 1) {
    if (!current) break
    current.hp -= player.chainDamage
    current.shockTimer = Math.max(current.shockTimer, 0.8)
    hit.push(current)
    const next = enemies
      .filter(enemy => !hit.includes(enemy))
      .map(enemy => ({
        enemy,
        dist: Math.hypot(enemy.x - current.x, enemy.y - current.y),
      }))
      .filter(entry => entry.dist <= player.chainRange)
      .sort((a, b) => a.dist - b.dist)[0]
    if (next) {
      chainArcs.push({
        x1: current.x,
        y1: current.y,
        x2: next.enemy.x,
        y2: next.enemy.y,
        life: 0.2,
      })
    }
    current = next ? next.enemy : null
  }
}

function gainXp(amount) {
  player.xp += amount
  while (player.xp >= player.nextXp) {
    player.xp -= player.nextXp
    player.level += 1
    player.nextXp = Math.round(20 + player.level * 10)
    state.pendingLevels += 1
  }

  if (state.pendingLevels > 0 && !state.paused) {
    showLevelUp()
  }
}

function getUpgradeLevel(id) {
  return player.upgrades[id] || 0
}

function applyUpgrade(option) {
  const current = getUpgradeLevel(option.id)
  if (current >= option.max) return
  const next = current + 1
  option.apply(next)
  player.upgrades[option.id] = next
}

function openStatUpgradeFromQueue() {
  if (state.pendingStatUps <= 0) return
  state.pendingStatUps -= 1
  showStatUpgrades()
}

function showStatUpgrades() {
  state.paused = true
  levelup.classList.remove('hidden')
  levelup.querySelector('.title').textContent = 'Relic Found'
  choicesEl.innerHTML = ''

  const shuffled = statUpgrades.slice().sort(() => Math.random() - 0.5)
  const options = shuffled.slice(0, 3)

  for (const option of options) {
    const btn = document.createElement('button')
    btn.className = 'choice-btn'
    btn.innerHTML = `${option.name}<span>${option.desc}</span>`
    btn.addEventListener('click', () => {
      option.apply()
      if (state.pendingStatUps > 0) {
        openStatUpgradeFromQueue()
      } else if (state.pendingLevels > 0) {
        showLevelUp()
      } else {
        levelup.classList.add('hidden')
        state.paused = false
      }
    })
    choicesEl.appendChild(btn)
  }
}

function showLevelUp() {
  state.paused = true
  levelup.classList.remove('hidden')
  levelup.querySelector('.title').textContent = 'Level Up'
  choicesEl.innerHTML = ''

  const available = upgradeDefs.filter(
    option => getUpgradeLevel(option.id) < option.max && option.canShow(),
  )
  if (available.length === 0) {
    if (state.pendingStatUps > 0) {
      openStatUpgradeFromQueue()
    } else {
      levelup.classList.add('hidden')
      state.paused = false
    }
    return
  }

  const shuffled = available.sort(() => Math.random() - 0.5)
  const options = shuffled.slice(0, 3)

  for (const option of options) {
    const btn = document.createElement('button')
    btn.className = 'choice-btn'
    const level = getUpgradeLevel(option.id)
    btn.innerHTML = `${option.name}<span>${option.desc(level)}</span>`
    btn.addEventListener('click', () => {
      applyUpgrade(option)
      state.pendingLevels -= 1
      if (state.pendingLevels > 0) {
        showLevelUp()
      } else if (state.pendingStatUps > 0) {
        openStatUpgradeFromQueue()
      } else {
        levelup.classList.add('hidden')
        state.paused = false
      }
    })
    choicesEl.appendChild(btn)
  }
}

// Update systems
function updateTime(dt) {
  state.elapsed += dt
}

function updatePlayerMovement(dt) {
  let moveX = (input.right ? 1 : 0) - (input.left ? 1 : 0)
  let moveY = (input.down ? 1 : 0) - (input.up ? 1 : 0)

  if (input.mouseActive) {
    const mx = input.mouseX - player.x
    const my = input.mouseY - player.y
    const dist = Math.hypot(mx, my)
    if (dist > 6) {
      moveX = mx / dist
      moveY = my / dist
    } else {
      moveX = 0
      moveY = 0
    }
  }

  const mag = Math.hypot(moveX, moveY)
  if (mag > 0) {
    const nx = moveX / mag
    const ny = moveY / mag
    player.x += nx * player.speed * dt
    player.y += ny * player.speed * dt
  }

  player.x = clamp(player.x, player.r, WORLD_WIDTH - player.r)
  player.y = clamp(player.y, player.r, WORLD_HEIGHT - player.r)
}

function updateRelicSpawner(dt) {
  timers.relic -= dt
  if (timers.relic <= 0 && relics.length < 2) {
    addRelic()
    timers.relic = 18
  }
}

function updateOrbitCaches(dt) {
  player.bladeAngle += player.bladeSpeed * dt
  bladePositions.length = 0
  if (player.bladesUnlocked && player.bladeCount > 0) {
    const step = (Math.PI * 2) / player.bladeCount
    for (let i = 0; i < player.bladeCount; i += 1) {
      const angle = player.bladeAngle + step * i
      bladePositions.push({
        x: player.x + Math.cos(angle) * player.bladeRadius,
        y: player.y + Math.sin(angle) * player.bladeRadius,
      })
    }
  }

  player.orbAngle += player.orbSpeed * dt
  solarPositions.length = 0
  if (player.orbUnlocked && player.orbCount > 0) {
    const step = (Math.PI * 2) / player.orbCount
    for (let i = 0; i < player.orbCount; i += 1) {
      const angle = player.orbAngle + step * i
      solarPositions.push({
        x: player.x + Math.cos(angle) * player.orbRadius,
        y: player.y + Math.sin(angle) * player.orbRadius,
      })
    }
  }
}

function updateWeaponFiring(dt) {
  shoot(dt)
  if (player.frostUnlocked) fireFrostShards(dt)

  if (player.pulseUnlocked) {
    timers.pulse -= dt
    if (timers.pulse <= 0) {
      pulseShockwave()
      timers.pulse = player.pulseCooldown
    }
  }

  if (player.novaUnlocked) {
    timers.nova -= dt
    if (timers.nova <= 0) {
      novaShockwave()
      timers.nova = player.novaCooldown
    }
  }

  if (player.chainUnlocked) {
    timers.chain -= dt
    if (timers.chain <= 0) {
      chainLightning()
      timers.chain = player.chainCooldown
    }
  }
}

function updateEnemySpawner(dt) {
  timers.spawn -= dt
  const wave = Math.floor(state.elapsed / state.waveDuration) + 1
  const spawnInterval = Math.max(0.18, 1.2 - wave * 0.06)
  if (timers.spawn <= 0) {
    spawnEnemy()
    timers.spawn = spawnInterval
  }
}

function updateEnemies(dt) {
  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    const enemy = enemies[i]
    const dx = player.x - enemy.x
    const dy = player.y - enemy.y
    const dist = Math.hypot(dx, dy) || 1

    let sepX = 0
    let sepY = 0
    for (const other of enemies) {
      if (other === enemy) continue
      const ox = enemy.x - other.x
      const oy = enemy.y - other.y
      const od = Math.hypot(ox, oy)
      if (od > 0 && od < ENEMY_SEP_RADIUS) {
        const push = (ENEMY_SEP_RADIUS - od) / ENEMY_SEP_RADIUS
        sepX += (ox / od) * push
        sepY += (oy / od) * push
      }
    }

    if (enemy.shockTimer > 0) enemy.shockTimer -= dt
    if (enemy.bladeHitTimer > 0) enemy.bladeHitTimer -= dt
    if (enemy.orbHitTimer > 0) enemy.orbHitTimer -= dt
    const slow = enemy.shockTimer > 0 ? 0.55 : 1
    const seekVX = (dx / dist) * enemy.speed * slow
    const seekVY = (dy / dist) * enemy.speed * slow
    const sepVX = sepX * ENEMY_SEP_FORCE
    const sepVY = sepY * ENEMY_SEP_FORCE
    const desiredVX = seekVX + sepVX
    const desiredVY = seekVY + sepVY

    const steer = 6
    enemy.vx += (desiredVX - enemy.vx) * steer * dt
    enemy.vy += (desiredVY - enemy.vy) * steer * dt

    const kx = enemy.knockX
    const ky = enemy.knockY
    enemy.knockX *= 0.85
    enemy.knockY *= 0.85
    enemy.x += (enemy.vx + kx) * dt
    enemy.y += (enemy.vy + ky) * dt

    if (enemy.bladeHitTimer <= 0) {
      for (const blade of bladePositions) {
        const bx = blade.x - enemy.x
        const by = blade.y - enemy.y
        if (Math.hypot(bx, by) < enemy.r + player.bladeSize * 0.5) {
          enemy.hp -= player.bladeDamage
          enemy.bladeHitTimer = player.bladeHitCooldown
          break
        }
      }
    }

    if (enemy.orbHitTimer <= 0) {
      for (const orb of solarPositions) {
        const ox = orb.x - enemy.x
        const oy = orb.y - enemy.y
        if (Math.hypot(ox, oy) < enemy.r + 8) {
          enemy.hp -= player.orbDamage
          enemy.orbHitTimer = player.orbHitCooldown
          break
        }
      }
    }

    if (dist < enemy.r + player.r) {
      player.hp -= enemy.damage * dt
    }

    if (enemy.hp <= 0) {
      enemies.splice(i, 1)
      addOrb(enemy.x, enemy.y, enemy.tier === 2 ? 12 : 8)
      if (Math.random() < 0.1) {
        healthPacks.push({
          x: enemy.x,
          y: enemy.y,
          r: 10,
          wobble: Math.random() * Math.PI * 2,
        })
      }
      for (let p = 0; p < 10; p += 1) {
        particles.push({
          x: enemy.x,
          y: enemy.y,
          vx: (Math.random() - 0.5) * 120,
          vy: (Math.random() - 0.5) * 120,
          r: 3 + Math.random() * 3,
          life: 0.55,
          color: 'blood',
        })
      }
    }
  }
}

function updateBullets(dt) {
  for (let i = bullets.length - 1; i >= 0; i -= 1) {
    const bullet = bullets[i]
    bullet.x += bullet.vx * dt
    bullet.y += bullet.vy * dt
    bullet.life -= dt

    particles.push({
      x: bullet.x,
      y: bullet.y,
      vx: (Math.random() - 0.5) * 40,
      vy: (Math.random() - 0.5) * 40,
      r: 3 + Math.random() * 2,
      life: 0.35,
      color: bullet.type === 'frost' ? 'ice' : 'fire',
    })

    let hit = false
    for (const enemy of enemies) {
      const dx = enemy.x - bullet.x
      const dy = enemy.y - bullet.y
      if (Math.hypot(dx, dy) < enemy.r + bullet.r) {
        enemy.hp -= bullet.damage
        hit = true
        if (bullet.type === 'frost') {
          bullet.pierce -= 1
          if (bullet.pierce > 0) hit = false
        }
        break
      }
    }

    if (
      hit ||
      bullet.life <= 0 ||
      bullet.x < -30 ||
      bullet.x > WORLD_WIDTH + 30 ||
      bullet.y < -30 ||
      bullet.y > WORLD_HEIGHT + 30
    ) {
      bullets.splice(i, 1)
    }
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const p = particles[i]
    p.life -= dt
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.r *= 0.96
    if (p.life <= 0 || p.r < 0.4) particles.splice(i, 1)
  }
}

function updateRelicCollisions(dt) {
  for (let i = relics.length - 1; i >= 0; i -= 1) {
    const relic = relics[i]
    relic.wobble += dt * 4
    const dist = distance(player.x, player.y, relic.x, relic.y)
    if (dist < player.r + relic.r) {
      relics.splice(i, 1)
      state.pendingStatUps += 1
      if (!state.paused) openStatUpgradeFromQueue()
    }
  }
}

function updateHealthPackCollisions(dt) {
  for (let i = healthPacks.length - 1; i >= 0; i -= 1) {
    const pack = healthPacks[i]
    pack.wobble += dt * 5
    const dist = distance(player.x, player.y, pack.x, pack.y)
    if (dist < player.r + pack.r) {
      healthPacks.splice(i, 1)
      player.hp = Math.min(player.maxHp, player.hp + 25)
    }
  }
}

function updateXpOrbs(dt) {
  for (let i = orbs.length - 1; i >= 0; i -= 1) {
    const orb = orbs[i]
    orb.drift += dt * 2
    orb.bob = Math.sin(orb.drift) * 10
    orb.y = orb.baseY + orb.bob

    const dx = player.x - orb.x
    const dy = player.y - orb.y
    const dist = Math.hypot(dx, dy) || 1
    if (dist < player.pickupRadius + orb.r) {
      gainXp(orb.value)
      orbs.splice(i, 1)
    } else if (getUpgradeLevel('magnet') > 0 && dist < player.pickupRadius * 3) {
      const pull = (1 - dist / (player.pickupRadius * 3)) * 160
      orb.x += (dx / dist) * pull * dt
      orb.baseY += (dy / dist) * pull * dt
      orb.y = orb.baseY + orb.bob
    }
  }
}

function updatePulseEffects(dt) {
  for (let i = pulses.length - 1; i >= 0; i -= 1) {
    const pulse = pulses[i]
    pulse.life -= dt
    const t = 1 - pulse.life / pulse.maxLife
    pulse.r = pulse.max * Math.min(1, t)
    if (pulse.life <= 0) pulses.splice(i, 1)
  }
}

function updateChainArcs(dt) {
  for (let i = chainArcs.length - 1; i >= 0; i -= 1) {
    const arc = chainArcs[i]
    arc.life -= dt
    if (arc.life <= 0) chainArcs.splice(i, 1)
  }
}

function checkGameOver() {
  if (player.hp <= 0) {
    state.running = false
    instructions.style.display = 'grid'
    instructions.querySelector('.title').textContent = 'Game Over'
    startBtn.textContent = 'Restart'
    music.pause()
    music.currentTime = 0
  }
}

function update(dt) {
  if (state.paused) return

  updateTime(dt)
  updatePlayerMovement(dt)
  updateRelicSpawner(dt)
  updateOrbitCaches(dt)
  updateWeaponFiring(dt)
  updateEnemySpawner(dt)
  updateEnemies(dt)
  updateBullets(dt)
  updateParticles(dt)
  updateRelicCollisions(dt)
  updateHealthPackCollisions(dt)
  updateXpOrbs(dt)
  updatePulseEffects(dt)
  updateChainArcs(dt)
  checkGameOver()
}

// Render systems
function beginFrame() {
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.imageSmoothingEnabled = false
  ctx.save()
  ctx.scale(zoom, zoom)
}

function drawWorldBackground() {
  ctx.fillStyle = '#efe7d6'
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT)
}

function drawWorldGrid(cam) {
  ctx.strokeStyle = 'rgba(0,0,0,0.06)'
  ctx.lineWidth = 1
  const grid = 48
  const startX = Math.floor(cam.x / grid) * grid
  const startY = Math.floor(cam.y / grid) * grid
  for (let x = startX; x <= cam.x + VIEW_WIDTH; x += grid) {
    ctx.beginPath()
    ctx.moveTo(x - cam.x, 0)
    ctx.lineTo(x - cam.x, VIEW_HEIGHT)
    ctx.stroke()
  }
  for (let y = startY; y <= cam.y + VIEW_HEIGHT; y += grid) {
    ctx.beginPath()
    ctx.moveTo(0, y - cam.y)
    ctx.lineTo(VIEW_WIDTH, y - cam.y)
    ctx.stroke()
  }
}

function drawXpOrbs(cam) {
  for (const orb of orbs) {
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

function drawPulseRings(cam) {
  for (const pulse of pulses) {
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

function drawChainArcLines(cam) {
  for (const arc of chainArcs) {
    const alpha = Math.min(1, arc.life / 0.2)
    ctx.strokeStyle = `rgba(120, 200, 255, ${alpha})`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(arc.x1 - cam.x, arc.y1 - cam.y)
    ctx.lineTo(arc.x2 - cam.x, arc.y2 - cam.y)
    ctx.stroke()
  }
}

function drawBladeOrbits(cam) {
  for (const blade of bladePositions) {
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

function drawSolarOrbits(cam) {
  for (const orb of solarPositions) {
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

function drawBullets(cam) {
  for (const bullet of bullets) {
    ctx.fillStyle = bullet.type === 'frost' ? '#7cc7ff' : '#ff7b3a'
    ctx.beginPath()
    ctx.arc(bullet.x - cam.x, bullet.y - cam.y, bullet.r, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawParticles(cam) {
  for (const p of particles) {
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

function drawRelics(cam) {
  for (const relic of relics) {
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

function drawHealthPacks(cam) {
  for (const pack of healthPacks) {
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

function drawShockLinks(cam) {
  const shocked = enemies.filter(enemy => enemy.shockTimer > 0)
  if (shocked.length > 1) {
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
}

function drawEnemies(cam) {
  for (const enemy of enemies) {
    const sprite = enemy.tier === 2 ? enemyBigSprite : enemySmallSprite
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

function drawPlayer(cam) {
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

function drawPlayerHpRing(cam) {
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

function endWorldTransform() {
  ctx.restore()
}

function drawMinimap() {
  const mapPadding = 16
  const mapWidth = 180
  const mapHeight = Math.round((WORLD_HEIGHT / WORLD_WIDTH) * mapWidth)
  const mapX = canvas.width - mapWidth - mapPadding
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
  for (const relic of relics) {
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

function draw() {
  beginFrame()
  const cam = camera()
  drawWorldBackground()
  drawWorldGrid(cam)
  drawXpOrbs(cam)
  drawPulseRings(cam)
  drawChainArcLines(cam)
  drawBladeOrbits(cam)
  drawSolarOrbits(cam)
  drawBullets(cam)
  drawParticles(cam)
  drawRelics(cam)
  drawHealthPacks(cam)
  drawShockLinks(cam)
  drawEnemies(cam)
  drawPlayer(cam)
  drawPlayerHpRing(cam)
  endWorldTransform()
  drawMinimap()
}

function loop(timestamp) {
  if (!state.running) {
    state.lastTime = timestamp
    draw()
    updateHud()
    requestAnimationFrame(loop)
    return
  }

  const dt = Math.min(0.05, (timestamp - state.lastTime) / 1000)
  state.lastTime = timestamp

  update(dt)
  draw()
  updateHud()

  requestAnimationFrame(loop)
}

function startGame() {
  instructions.style.display = 'none'
  instructions.querySelector('.title').textContent = 'Wave Survivors'
  startBtn.textContent = 'Start'
  levelup.classList.add('hidden')
  state.running = true
  state.paused = false
  resetGame()
  music.play().catch(() => {})
}

// Input wiring
function setKeyState(key, isDown) {
  if (key === 'ArrowUp' || key === 'w') input.up = isDown
  if (key === 'ArrowDown' || key === 's') input.down = isDown
  if (key === 'ArrowLeft' || key === 'a') input.left = isDown
  if (key === 'ArrowRight' || key === 'd') input.right = isDown
}

window.addEventListener('keydown', event => {
  setKeyState(event.key, true)
})

window.addEventListener('keyup', event => {
  setKeyState(event.key, false)
})

startBtn.addEventListener('click', startGame)
if (zoomControls.out)
  zoomControls.out.addEventListener('click', () => setZoomIndex(zoomIndex - 1))
if (zoomControls.in)
  zoomControls.in.addEventListener('click', () => setZoomIndex(zoomIndex + 1))

window.addEventListener('resize', resizeCanvas)
resizeCanvas()

function updateMouseTarget(event) {
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  const cam = camera()
  input.mouseX = cam.x + ((event.clientX - rect.left) * scaleX) / zoom
  input.mouseY = cam.y + ((event.clientY - rect.top) * scaleY) / zoom
}

canvas.addEventListener('mousedown', event => {
  if (!state.running) return
  input.mouseActive = true
  updateMouseTarget(event)
})

window.addEventListener('mouseup', () => {
  input.mouseActive = false
})

window.addEventListener('mousemove', event => {
  if (!input.mouseActive) return
  updateMouseTarget(event)
})

canvas.addEventListener('pointerdown', event => {
  if (!state.running) return
  input.mouseActive = true
  updateMouseTarget(event)
  canvas.setPointerCapture(event.pointerId)
})

canvas.addEventListener('pointermove', event => {
  if (!input.mouseActive) return
  updateMouseTarget(event)
})

canvas.addEventListener('pointerup', event => {
  input.mouseActive = false
  canvas.releasePointerCapture(event.pointerId)
})

canvas.addEventListener('pointercancel', event => {
  input.mouseActive = false
  canvas.releasePointerCapture(event.pointerId)
})

requestAnimationFrame(loop)
