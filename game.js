(() => {
  // src/config/constants.js
  var zoomLevels = [1, 2, 4];
  var WORLD_WIDTH = 2400;
  var WORLD_HEIGHT = 1600;
  var ENEMY_SEP_RADIUS = 42;
  var ENEMY_SEP_FORCE = 120;
  var ELITE_BASE_CHANCE = 0.05;
  var ELITE_WAVE_BONUS = 4e-3;
  var ELITE_MAX_CHANCE = 0.2;
  var ELITE_FAST_SPEED_MULT = 1.45;
  var ELITE_TANK_HP_MULT = 1.7;
  var ELITE_LEECH_HEAL_FACTOR = 0.35;
  var ELITE_VOLATILE_RADIUS = 76;
  var ELITE_VOLATILE_DAMAGE = 20;
  var ELITE_XP_BONUS = 6;
  var BOSS_WAVE_INTERVAL = 5;
  var BOSS_HP_BASE = 260;
  var BOSS_HP_WAVE_SCALE = 28;
  var BOSS_SPEED_BASE = 58;
  var BOSS_SPEED_WAVE_SCALE = 2;
  var BOSS_RADIUS = 24;
  var BOSS_DAMAGE = 28;
  var BOSS_XP_REWARD = 28;
  var COMBO_TIMEOUT = 4;
  var COMBO_KILLS_PER_STEP = 2;
  var COMBO_XP_BONUS_PER_STEP = 0.1;
  var COMBO_XP_MAX_BONUS = 0.6;
  var RELIC_BRONZE_CHANCE = 0.6;
  var RELIC_SILVER_CHANCE = 0.3;
  var RELIC_GOLD_CHANCE = 0.1;
  var RELIC_BRONZE_STAT_MULT = 1;
  var RELIC_SILVER_STAT_MULT = 1.25;
  var RELIC_GOLD_STAT_MULT = 1.5;

  // src/core/dom.js
  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");
  var hud = {
    wave: document.getElementById("wave"),
    time: document.getElementById("time"),
    hp: document.getElementById("hp"),
    level: document.getElementById("level"),
    xp: document.getElementById("xp"),
    combo: document.getElementById("combo"),
    metaBonus: document.getElementById("meta-bonus")
  };
  var levelup = document.getElementById("levelup");
  var choicesEl = document.getElementById("choices");
  var menuOverlay = document.getElementById("menu-overlay");
  var menuPanels = {
    title: document.getElementById("menu-title-panel"),
    meta: document.getElementById("menu-meta-panel"),
    controls: document.getElementById("menu-controls-panel")
  };
  var menuButtons = {
    play: document.getElementById("menu-play"),
    meta: document.getElementById("menu-meta"),
    controls: document.getElementById("menu-controls")
  };
  var metaPanel = {
    shards: document.getElementById("meta-shards"),
    list: document.getElementById("meta-list"),
    back: document.getElementById("meta-back"),
    reset: document.getElementById("meta-reset")
  };
  var controlsBack = document.getElementById("controls-back");
  var runSummary = {
    overlay: document.getElementById("run-summary"),
    wave: document.getElementById("summary-wave"),
    time: document.getElementById("summary-time"),
    shards: document.getElementById("summary-shards"),
    total: document.getElementById("summary-total"),
    play: document.getElementById("summary-play"),
    meta: document.getElementById("summary-meta")
  };
  var zoomControls = {
    out: document.getElementById("zoom-out"),
    in: document.getElementById("zoom-in"),
    label: document.getElementById("zoom-label")
  };

  // src/core/assets.js
  var playerSprite = new Image();
  playerSprite.src = "sprites/wizard.png";
  var enemySmallSprite = new Image();
  enemySmallSprite.src = "sprites/rat_gray.png";
  var enemyBigSprite = new Image();
  enemyBigSprite.src = "sprites/rat_brown.png";
  var bladeSprite = new Image();
  bladeSprite.src = "sprites/knife.png";
  var relicSprite = new Image();
  relicSprite.src = "sprites/chest.png";
  var healthSprite = new Image();
  healthSprite.src = "sprites/health.png";
  var music = new Audio("Glinting Gold.wav");
  music.loop = true;
  music.volume = 0.5;

  // src/state/gameState.js
  var SCREEN_STATES = Object.freeze({
    TITLE: "title",
    META: "meta",
    CONTROLS: "controls",
    RUNNING: "running",
    RUN_SUMMARY: "runSummary"
  });
  var zoomState = {
    index: 1,
    zoom: zoomLevels[1],
    viewWidth: canvas.width / zoomLevels[1],
    viewHeight: canvas.height / zoomLevels[1]
  };
  var state = {
    screen: SCREEN_STATES.TITLE,
    running: false,
    paused: false,
    lastTime: 0,
    elapsed: 0,
    waveDuration: 30,
    nextBossWave: 5,
    pendingLevels: 0,
    pendingStatUps: 0,
    pendingRelicRarities: [],
    comboKills: 0,
    comboExpiresAt: 0,
    comboXpMultiplier: 1,
    menuCamX: WORLD_WIDTH / 2,
    menuCamY: WORLD_HEIGHT / 2,
    menuCamVX: 34,
    menuCamVY: 24,
    metaBonusText: "Perm: HP +0% SPD +0% DMG +0% ROF +0% XP +0%"
  };
  var input = {
    up: false,
    down: false,
    left: false,
    right: false,
    mouseActive: false,
    mouseX: 0,
    mouseY: 0
  };
  var player = {
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2,
    r: 12,
    speed: 180,
    isMoving: false,
    maxHp: 100,
    hp: 100,
    damage: 18,
    fireRate: 1.2,
    bulletSpeed: 420,
    xpGainMultiplier: 1,
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
    starfallCooldown: 3.4,
    starfallCount: 8,
    starfallDamage: 10,
    starfallSpeed: 280,
    starfallLife: 0.9,
    starfallUnlocked: false,
    mineCooldown: 5.5,
    mineDamage: 22,
    mineRadius: 54,
    mineArmTime: 0.35,
    mineMaxActive: 2,
    mineLifetime: 8,
    mineUnlocked: false,
    trailSpawnInterval: 0.3,
    trailPatchLife: 1.2,
    trailRadius: 20,
    trailDps: 14,
    trailMaxPatches: 24,
    trailUnlocked: false,
    vortexCooldown: 7,
    vortexDuration: 2.2,
    vortexRadius: 120,
    vortexPull: 260,
    vortexDps: 9,
    vortexUnlocked: false,
    orbCount: 1,
    orbRadius: 60,
    orbSpeed: 1.2,
    orbDamage: 8,
    orbHitCooldown: 0.6,
    orbAngle: 0,
    orbUnlocked: false,
    upgrades: {}
  };
  var entities = {
    bullets: [],
    enemies: [],
    orbs: [],
    mines: [],
    trails: [],
    vortexes: [],
    relics: [],
    healthPacks: [],
    pulses: [],
    particles: [],
    chainArcs: []
  };
  var orbitCache = {
    blades: [],
    solars: []
  };
  var timers = {
    shoot: 0,
    starfall: 0,
    spawn: 0,
    mines: 0,
    trail: 0,
    vortex: 0,
    pulse: 0,
    nova: 0,
    frost: 0,
    chain: 0,
    relic: 0
  };

  // src/core/utils.js
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  function distance(ax, ay, bx, by) {
    return Math.hypot(ax - bx, ay - by);
  }

  // src/core/camera.js
  function applyZoom() {
    zoomState.zoom = zoomLevels[zoomState.index];
    zoomState.viewWidth = canvas.width / zoomState.zoom;
    zoomState.viewHeight = canvas.height / zoomState.zoom;
    if (zoomControls.label) zoomControls.label.textContent = `${zoomState.zoom}X`;
    if (zoomControls.out) zoomControls.out.disabled = zoomState.index === 0;
    if (zoomControls.in)
      zoomControls.in.disabled = zoomState.index === zoomLevels.length - 1;
  }
  function setZoomIndex(nextIndex) {
    zoomState.index = clamp(nextIndex, 0, zoomLevels.length - 1);
    applyZoom();
  }
  function resizeCanvas() {
    const width = Math.max(320, Math.floor(window.innerWidth));
    const height = Math.max(240, Math.floor(window.innerHeight));
    canvas.width = width;
    canvas.height = height;
    applyZoom();
  }
  function camera() {
    const focusX = state.screen === SCREEN_STATES.RUNNING ? player.x : state.menuCamX;
    const focusY = state.screen === SCREEN_STATES.RUNNING ? player.y : state.menuCamY;
    const x = clamp(focusX - zoomState.viewWidth / 2, 0, WORLD_WIDTH - zoomState.viewWidth);
    const y = clamp(focusY - zoomState.viewHeight / 2, 0, WORLD_HEIGHT - zoomState.viewHeight);
    return { x, y, viewWidth: zoomState.viewWidth, viewHeight: zoomState.viewHeight };
  }

  // src/core/loop.js
  var updateFn = () => {
  };
  var drawFn = () => {
  };
  var updateHudFn = () => {
  };
  function configureLoop({ update: update2, draw: draw2, updateHud: updateHud2 }) {
    updateFn = update2;
    drawFn = draw2;
    updateHudFn = updateHud2;
  }
  function loop(timestamp) {
    if (!state.lastTime) state.lastTime = timestamp;
    const dt = Math.min(0.05, (timestamp - state.lastTime) / 1e3);
    state.lastTime = timestamp;
    updateFn(dt);
    drawFn();
    updateHudFn();
    requestAnimationFrame(loop);
  }

  // src/state/reset.js
  function resetGame() {
    zoomState.index = 1;
    applyZoom();
    player.x = WORLD_WIDTH / 2;
    player.y = WORLD_HEIGHT / 2;
    player.maxHp = 100;
    player.hp = player.maxHp;
    player.xp = 0;
    player.level = 0;
    player.nextXp = 20;
    player.speed = 180;
    player.isMoving = false;
    player.damage = 18;
    player.fireRate = 1.2;
    player.bulletSpeed = 420;
    player.xpGainMultiplier = 1;
    player.pickupRadius = 30;
    player.pulseCooldown = 4.5;
    player.pulseRadius = 120;
    player.pulseDamage = 28;
    player.pulseKnockback = 320;
    player.pulseUnlocked = false;
    player.novaCooldown = 2.6;
    player.novaRadius = 70;
    player.novaDamage = 14;
    player.novaKnockback = 220;
    player.novaUnlocked = false;
    player.bladesUnlocked = false;
    player.bladeCount = 2;
    player.bladeRadius = 34;
    player.bladeSpeed = 2.4;
    player.bladeDamage = 14;
    player.bladeHitCooldown = 0.35;
    player.bladeSize = 22;
    player.bladeAngle = 0;
    player.frostFireRate = 0.9;
    player.frostDamage = 10;
    player.frostSpeed = 360;
    player.frostPierce = 2;
    player.frostShots = 2;
    player.frostUnlocked = false;
    player.chainCooldown = 1.6;
    player.chainDamage = 12;
    player.chainRange = 120;
    player.chainCount = 2;
    player.chainUnlocked = false;
    player.starfallCooldown = 3.4;
    player.starfallCount = 8;
    player.starfallDamage = 10;
    player.starfallSpeed = 280;
    player.starfallLife = 0.9;
    player.starfallUnlocked = false;
    player.mineCooldown = 5.5;
    player.mineDamage = 22;
    player.mineRadius = 54;
    player.mineArmTime = 0.35;
    player.mineMaxActive = 2;
    player.mineLifetime = 8;
    player.mineUnlocked = false;
    player.trailSpawnInterval = 0.3;
    player.trailPatchLife = 1.2;
    player.trailRadius = 20;
    player.trailDps = 14;
    player.trailMaxPatches = 24;
    player.trailUnlocked = false;
    player.vortexCooldown = 7;
    player.vortexDuration = 2.2;
    player.vortexRadius = 120;
    player.vortexPull = 260;
    player.vortexDps = 9;
    player.vortexUnlocked = false;
    player.orbCount = 1;
    player.orbRadius = 60;
    player.orbSpeed = 1.2;
    player.orbDamage = 8;
    player.orbHitCooldown = 0.6;
    player.orbAngle = 0;
    player.orbUnlocked = false;
    player.upgrades = { bullets: 1 };
    entities.bullets.length = 0;
    entities.enemies.length = 0;
    entities.orbs.length = 0;
    entities.mines.length = 0;
    entities.trails.length = 0;
    entities.vortexes.length = 0;
    entities.relics.length = 0;
    entities.healthPacks.length = 0;
    entities.pulses.length = 0;
    entities.particles.length = 0;
    entities.chainArcs.length = 0;
    orbitCache.blades.length = 0;
    orbitCache.solars.length = 0;
    state.elapsed = 0;
    state.paused = false;
    state.nextBossWave = BOSS_WAVE_INTERVAL;
    state.pendingLevels = 0;
    state.pendingStatUps = 0;
    state.pendingRelicRarities.length = 0;
    state.comboKills = 0;
    state.comboExpiresAt = 0;
    state.comboXpMultiplier = 1;
    timers.shoot = 0;
    timers.starfall = 0;
    timers.spawn = 0;
    timers.mines = 0;
    timers.trail = 0;
    timers.vortex = 0;
    timers.pulse = 0;
    timers.nova = 0;
    timers.frost = 0;
    timers.chain = 0;
    timers.relic = 6;
  }

  // src/systems/progression/xp.js
  var showLevelUpHandler = () => {
  };
  function setShowLevelUpHandler(fn) {
    showLevelUpHandler = fn;
  }
  function resetComboState() {
    state.comboKills = 0;
    state.comboExpiresAt = 0;
    state.comboXpMultiplier = 1;
  }
  function syncComboState() {
    if (state.comboKills === 0) {
      state.comboXpMultiplier = 1;
      return;
    }
    if (state.elapsed >= state.comboExpiresAt) {
      resetComboState();
    }
  }
  function updateComboMultiplier() {
    const bonusSteps = Math.floor(state.comboKills / COMBO_KILLS_PER_STEP);
    const bonus = Math.min(COMBO_XP_MAX_BONUS, bonusSteps * COMBO_XP_BONUS_PER_STEP);
    state.comboXpMultiplier = +(1 + bonus).toFixed(2);
  }
  function registerComboKill() {
    syncComboState();
    state.comboKills += 1;
    state.comboExpiresAt = state.elapsed + COMBO_TIMEOUT;
    updateComboMultiplier();
  }
  function getComboSnapshot() {
    syncComboState();
    const remaining = Math.max(0, state.comboExpiresAt - state.elapsed);
    return {
      active: remaining > 0 && state.comboKills > 0,
      kills: state.comboKills,
      multiplier: state.comboXpMultiplier,
      remaining
    };
  }
  function getXpMultiplier() {
    syncComboState();
    return (player.xpGainMultiplier || 1) * state.comboXpMultiplier;
  }
  function gainXp(baseAmount) {
    const effectiveXp = Math.max(1, Math.round(baseAmount * getXpMultiplier()));
    player.xp += effectiveXp;
    while (player.xp >= player.nextXp) {
      player.xp -= player.nextXp;
      player.level += 1;
      player.nextXp = Math.round(20 + player.level * 10);
      state.pendingLevels += 1;
    }
    if (state.pendingLevels > 0 && !state.paused) {
      showLevelUpHandler();
    }
    return effectiveXp;
  }
  function getUpgradeLevel(id) {
    return player.upgrades[id] || 0;
  }
  function canApplyUpgrade(option) {
    return option.repeatable || getUpgradeLevel(option.id) < option.max;
  }
  function applyUpgrade(option) {
    const current = getUpgradeLevel(option.id);
    if (!canApplyUpgrade(option)) return;
    const next = current + 1;
    option.apply(next);
    player.upgrades[option.id] = next;
  }

  // src/systems/ui/hud.js
  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }
  function formatComboText(combo) {
    if (!combo.active) return "-";
    return `K${combo.kills} x${combo.multiplier.toFixed(2)} ${combo.remaining.toFixed(1)}s`;
  }
  function updateHud() {
    const wave = Math.floor(state.elapsed / state.waveDuration) + 1;
    const combo = getComboSnapshot();
    hud.wave.textContent = wave;
    hud.time.textContent = formatTime(state.elapsed);
    hud.hp.textContent = `${Math.max(0, Math.round(player.hp))} / ${player.maxHp}`;
    hud.level.textContent = player.level;
    hud.xp.textContent = `${player.xp} / ${player.nextXp}`;
    if (hud.combo) {
      hud.combo.textContent = formatComboText(combo);
      hud.combo.classList.toggle("combo-active", combo.active);
      hud.combo.classList.toggle("combo-boost", combo.multiplier > 1);
    }
    if (hud.metaBonus) hud.metaBonus.textContent = state.metaBonusText;
  }

  // src/data/upgrades.js
  var relicStatMultipliers = {
    bronze: RELIC_BRONZE_STAT_MULT,
    silver: RELIC_SILVER_STAT_MULT,
    gold: RELIC_GOLD_STAT_MULT
  };
  var ORBITAL_PROJECTILE_SOFT_CAP = 32;
  function getRelicStatMultiplier(rarity = "bronze") {
    return relicStatMultipliers[rarity] || relicStatMultipliers.bronze;
  }
  function formatPercent(value) {
    return Number.isInteger(value) ? value : +value.toFixed(1);
  }
  var upgradeDefs = [
    {
      id: "pulse",
      max: 3,
      name: "Lightning Pulse",
      desc: (lvl) => lvl === 0 ? "Unlocks lightning pulse" : lvl === 1 ? "-15% cooldown" : "+30 radius, +8 damage",
      canShow: () => true,
      apply: (lvl) => {
        if (lvl === 1) player.pulseUnlocked = true;
        if (lvl === 2)
          player.pulseCooldown = +(player.pulseCooldown * 0.85).toFixed(2);
        if (lvl === 3) {
          player.pulseRadius += 30;
          player.pulseDamage += 8;
        }
      }
    },
    {
      id: "blades",
      max: 4,
      repeatable: true,
      name: "Orbiting Blades",
      desc: (lvl) => lvl === 0 ? "Unlocks orbiting blades" : lvl === 1 ? "+1 blade" : lvl === 2 ? "+1 blade, +6 damage" : lvl === 3 ? "+0.4 orbit speed" : player.bladeCount < ORBITAL_PROJECTILE_SOFT_CAP ? "+1 blade" : "+3 blade damage",
      canShow: () => true,
      apply: (lvl) => {
        if (lvl === 1) {
          player.bladesUnlocked = true;
          player.bladeCount = 2;
        } else if (lvl === 2) {
          player.bladeCount += 1;
        } else if (lvl === 3) {
          player.bladeCount += 1;
          player.bladeDamage += 6;
        } else if (lvl === 4) {
          player.bladeSpeed += 0.4;
        } else if (player.bladeCount < ORBITAL_PROJECTILE_SOFT_CAP) {
          player.bladeCount += 1;
        } else {
          player.bladeDamage += 3;
        }
      }
    },
    {
      id: "frost",
      max: 5,
      name: "Frost Shards",
      desc: (lvl) => lvl === 0 ? "Unlocks frost shards" : lvl === 1 ? "+1 shard per burst" : lvl === 2 ? "+2 damage" : lvl === 3 ? "+1 pierce" : "+0.3 fire rate",
      canShow: () => true,
      apply: (lvl) => {
        if (lvl === 1) player.frostUnlocked = true;
        if (lvl === 2) player.frostShots += 1;
        if (lvl === 3) player.frostDamage += 2;
        if (lvl === 4) player.frostPierce += 1;
        if (lvl === 5) player.frostFireRate = +(player.frostFireRate + 0.3).toFixed(2);
      }
    },
    {
      id: "nova",
      max: 4,
      name: "Arcane Nova",
      desc: (lvl) => lvl === 0 ? "Unlocks arcane nova" : lvl === 1 ? "-15% cooldown" : lvl === 2 ? "+15 radius" : "+6 damage",
      canShow: () => true,
      apply: (lvl) => {
        if (lvl === 1) player.novaUnlocked = true;
        if (lvl === 2)
          player.novaCooldown = +(player.novaCooldown * 0.85).toFixed(2);
        if (lvl === 3) player.novaRadius += 15;
        if (lvl === 4) player.novaDamage += 6;
      }
    },
    {
      id: "chain",
      max: 4,
      name: "Chain Lightning",
      desc: (lvl) => lvl === 0 ? "Unlocks chain lightning" : lvl === 1 ? "+1 chain" : lvl === 2 ? "+4 damage" : "+25 range",
      canShow: () => true,
      apply: (lvl) => {
        if (lvl === 1) player.chainUnlocked = true;
        if (lvl === 2) player.chainCount += 1;
        if (lvl === 3) player.chainDamage += 4;
        if (lvl === 4) player.chainRange += 25;
      }
    },
    {
      id: "starfall",
      max: 4,
      name: "Starfall Barrage",
      desc: (lvl) => lvl === 0 ? "Unlocks starfall barrage" : lvl === 1 ? "+2 projectiles per burst" : lvl === 2 ? "+4 damage" : "-20% cooldown",
      canShow: () => true,
      apply: (lvl) => {
        if (lvl === 1) player.starfallUnlocked = true;
        if (lvl === 2) player.starfallCount += 2;
        if (lvl === 3) player.starfallDamage += 4;
        if (lvl === 4) {
          player.starfallCooldown = +(player.starfallCooldown * 0.8).toFixed(2);
        }
      }
    },
    {
      id: "mines",
      max: 5,
      name: "Arc Mines",
      desc: (lvl) => lvl === 0 ? "Unlocks arc mines" : lvl === 1 ? "-20% cooldown" : lvl === 2 ? "+14 explosion damage" : lvl === 3 ? "+18 blast radius" : "+1 max active mine",
      canShow: () => true,
      apply: (lvl) => {
        if (lvl === 1) player.mineUnlocked = true;
        if (lvl === 2) player.mineCooldown = +(player.mineCooldown * 0.8).toFixed(2);
        if (lvl === 3) player.mineDamage += 14;
        if (lvl === 4) player.mineRadius += 18;
        if (lvl === 5) player.mineMaxActive += 1;
      }
    },
    {
      id: "trail",
      max: 5,
      name: "Molten Trail",
      desc: (lvl) => lvl === 0 ? "Unlocks molten trail" : lvl === 1 ? "-25% patch spawn interval" : lvl === 2 ? "+6 DPS" : lvl === 3 ? "+0.6s patch life" : "+8 patch radius",
      canShow: () => true,
      apply: (lvl) => {
        if (lvl === 1) player.trailUnlocked = true;
        if (lvl === 2) {
          player.trailSpawnInterval = +(player.trailSpawnInterval * 0.75).toFixed(3);
        }
        if (lvl === 3) player.trailDps += 6;
        if (lvl === 4) player.trailPatchLife = +(player.trailPatchLife + 0.6).toFixed(2);
        if (lvl === 5) player.trailRadius += 8;
      }
    },
    {
      id: "vortex",
      max: 5,
      name: "Gravity Well",
      desc: (lvl) => lvl === 0 ? "Unlocks gravity well" : lvl === 1 ? "+0.8s duration" : lvl === 2 ? "-18% cooldown" : lvl === 3 ? "+35 radius" : "+6 DPS",
      canShow: () => true,
      apply: (lvl) => {
        if (lvl === 1) player.vortexUnlocked = true;
        if (lvl === 2) player.vortexDuration = +(player.vortexDuration + 0.8).toFixed(2);
        if (lvl === 3) player.vortexCooldown = +(player.vortexCooldown * 0.82).toFixed(2);
        if (lvl === 4) player.vortexRadius += 35;
        if (lvl === 5) player.vortexDps += 6;
      }
    },
    {
      id: "solar",
      max: 4,
      repeatable: true,
      name: "Solar Orbs",
      desc: (lvl) => lvl === 0 ? "Unlocks solar orbs" : lvl === 1 ? "+1 orb" : lvl === 2 ? "+2 damage" : lvl === 3 ? "+0.4 orbit speed" : player.orbCount < ORBITAL_PROJECTILE_SOFT_CAP ? "+1 orb" : "+2 orb damage",
      canShow: () => true,
      apply: (lvl) => {
        if (lvl === 1) player.orbUnlocked = true;
        if (lvl === 2) player.orbCount += 1;
        if (lvl === 3) player.orbDamage += 2;
        if (lvl === 4) player.orbSpeed += 0.4;
        if (lvl > 4 && player.orbCount < ORBITAL_PROJECTILE_SOFT_CAP) {
          player.orbCount += 1;
        } else if (lvl > 4) {
          player.orbDamage += 2;
        }
      }
    },
    {
      id: "bullets",
      max: 5,
      name: "Firebolts",
      desc: (lvl) => lvl === 0 ? "Unlocks firebolts (starter)" : lvl === 1 ? "+6 damage" : lvl === 2 ? "+0.4 fire rate" : lvl === 3 ? "+8 damage" : "+80 bullet speed",
      canShow: () => true,
      apply: (lvl) => {
        if (lvl === 1) return;
        if (lvl === 2) player.damage += 6;
        if (lvl === 3) player.fireRate = +(player.fireRate + 0.4).toFixed(2);
        if (lvl === 4) player.damage += 8;
        if (lvl === 5) player.bulletSpeed += 80;
      }
    },
    {
      id: "magnet",
      max: 3,
      name: "Magnet Field",
      desc: (lvl) => lvl === 0 ? "Unlocks orb magnetism" : "+25% pickup radius",
      canShow: () => true,
      apply: (lvl) => {
        if (lvl >= 1) player.pickupRadius = Math.round(player.pickupRadius * 1.25);
      }
    }
  ];
  var statUpgrades = [
    {
      name: "Heavy Rounds",
      desc: (rarity = "bronze") => {
        const percent = formatPercent(25 * getRelicStatMultiplier(rarity));
        return `+${percent}% bullet damage`;
      },
      apply: (rarity = "bronze") => {
        const mult = getRelicStatMultiplier(rarity);
        player.damage = Math.round(player.damage * (1 + 0.25 * mult));
      }
    },
    {
      name: "Overclock",
      desc: (rarity = "bronze") => {
        const percent = formatPercent(20 * getRelicStatMultiplier(rarity));
        return `+${percent}% fire rate`;
      },
      apply: (rarity = "bronze") => {
        const mult = getRelicStatMultiplier(rarity);
        player.fireRate = +(player.fireRate * (1 + 0.2 * mult)).toFixed(2);
      }
    },
    {
      name: "Sprint Boots",
      desc: (rarity = "bronze") => {
        const percent = formatPercent(15 * getRelicStatMultiplier(rarity));
        return `+${percent}% move speed`;
      },
      apply: (rarity = "bronze") => {
        const mult = getRelicStatMultiplier(rarity);
        player.speed = Math.round(player.speed * (1 + 0.15 * mult));
      }
    },
    {
      name: "Iron Heart",
      desc: (rarity = "bronze") => {
        const bonus = Math.round(30 * getRelicStatMultiplier(rarity));
        return `+${bonus} max HP`;
      },
      apply: (rarity = "bronze") => {
        const bonus = Math.round(30 * getRelicStatMultiplier(rarity));
        player.maxHp += bonus;
        player.hp = Math.min(player.hp + bonus, player.maxHp);
      }
    },
    {
      name: "Railcast",
      desc: (rarity = "bronze") => {
        const percent = formatPercent(20 * getRelicStatMultiplier(rarity));
        return `+${percent}% bullet speed`;
      },
      apply: (rarity = "bronze") => {
        const mult = getRelicStatMultiplier(rarity);
        player.bulletSpeed = Math.round(player.bulletSpeed * (1 + 0.2 * mult));
      }
    }
  ];

  // src/systems/progression/relicMenu.js
  var showLevelUpHandler2 = () => {
  };
  var rarityLabel = {
    bronze: "Bronze Relic",
    silver: "Silver Relic",
    gold: "Golden Relic"
  };
  var qualityRank = {
    "Heavy Rounds": 5,
    Overclock: 4,
    "Sprint Boots": 3,
    "Iron Heart": 5,
    Railcast: 2
  };
  function setShowLevelUpHandler2(fn) {
    showLevelUpHandler2 = fn;
  }
  function openStatUpgradeFromQueue() {
    if (state.pendingStatUps <= 0) return;
    state.pendingStatUps -= 1;
    const rarity = state.pendingRelicRarities.shift() || "bronze";
    showStatUpgrades(rarity);
  }
  function buildOptionsByRarity(rarity) {
    const shuffled = statUpgrades.slice().sort(() => Math.random() - 0.5);
    if (rarity === "bronze") return shuffled.slice(0, 3);
    const pool = rarity === "gold" ? shuffled.slice(0, 5) : shuffled.slice(0, 4);
    return pool.sort((a, b) => (qualityRank[b.name] || 1) - (qualityRank[a.name] || 1)).slice(0, 3);
  }
  function showStatUpgrades(rarity = "bronze") {
    state.paused = true;
    levelup.classList.remove("hidden");
    levelup.querySelector(".title").textContent = rarityLabel[rarity] || "Relic Found";
    choicesEl.innerHTML = "";
    const options = buildOptionsByRarity(rarity);
    for (const option of options) {
      const description = typeof option.desc === "function" ? option.desc(rarity) : option.desc;
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.innerHTML = `${option.name}<span>${description}</span>`;
      btn.addEventListener("click", () => {
        option.apply(rarity);
        if (state.pendingStatUps > 0) {
          openStatUpgradeFromQueue();
        } else if (state.pendingLevels > 0) {
          showLevelUpHandler2();
        } else {
          levelup.classList.add("hidden");
          state.paused = false;
        }
      });
      choicesEl.appendChild(btn);
    }
  }

  // src/systems/progression/upgradesMenu.js
  var openStatUpgradeFromQueueHandler = () => {
  };
  function setOpenStatUpgradeFromQueueHandler(fn) {
    openStatUpgradeFromQueueHandler = fn;
  }
  function showLevelUp() {
    state.paused = true;
    levelup.classList.remove("hidden");
    levelup.querySelector(".title").textContent = "Level Up";
    choicesEl.innerHTML = "";
    const available = upgradeDefs.filter(
      (option) => canApplyUpgrade(option) && option.canShow()
    );
    if (available.length === 0) {
      if (state.pendingStatUps > 0) {
        openStatUpgradeFromQueueHandler();
      } else {
        levelup.classList.add("hidden");
        state.paused = false;
      }
      return;
    }
    const shuffled = available.sort(() => Math.random() - 0.5);
    const options = shuffled.slice(0, 3);
    for (const option of options) {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      const level = getUpgradeLevel(option.id);
      btn.innerHTML = `${option.name}<span>${option.desc(level)}</span>`;
      btn.addEventListener("click", () => {
        applyUpgrade(option);
        state.pendingLevels -= 1;
        if (state.pendingLevels > 0) {
          showLevelUp();
        } else if (state.pendingStatUps > 0) {
          openStatUpgradeFromQueueHandler();
        } else {
          levelup.classList.add("hidden");
          state.paused = false;
        }
      });
      choicesEl.appendChild(btn);
    }
  }

  // src/systems/progression/metaProgression.js
  var SAVE_VERSION = 1;
  var SAVE_KEY = "waveSurvivors.save.v1";
  var META_RANK_CAP = 5;
  var META_COST_GROWTH = 1.6;
  var metaNodes = [
    {
      id: "max_hp",
      label: "Vitality",
      baseCost: 3,
      perRank: 0.06,
      shortLabel: "HP",
      key: "maxHp"
    },
    {
      id: "move_speed",
      label: "Mobility",
      baseCost: 3,
      perRank: 0.03,
      shortLabel: "SPD",
      key: "moveSpeed"
    },
    {
      id: "damage",
      label: "Power",
      baseCost: 4,
      perRank: 0.05,
      shortLabel: "DMG",
      key: "damage"
    },
    {
      id: "fire_rate",
      label: "Tempo",
      baseCost: 4,
      perRank: 0.04,
      shortLabel: "ROF",
      key: "fireRate"
    },
    {
      id: "xp_gain",
      label: "Wisdom",
      baseCost: 3,
      perRank: 0.06,
      shortLabel: "XP",
      key: "xpGain"
    }
  ];
  function createDefaultMetaRanks() {
    return {
      max_hp: 0,
      move_speed: 0,
      damage: 0,
      fire_rate: 0,
      xp_gain: 0
    };
  }
  function createDefaultLifetime() {
    return {
      runs: 0,
      totalTime: 0,
      bestWave: 0,
      totalShardsEarned: 0
    };
  }
  function createDefaultSave() {
    return {
      version: SAVE_VERSION,
      shards: 0,
      metaRanks: createDefaultMetaRanks(),
      lifetime: createDefaultLifetime()
    };
  }
  function toInt(value, fallback = 0) {
    return Number.isFinite(value) ? Math.floor(value) : fallback;
  }
  function clampInt(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  function sanitizeMetaRanks(raw) {
    const next = createDefaultMetaRanks();
    if (!raw || typeof raw !== "object") return next;
    for (const node of metaNodes) {
      const rank = toInt(raw[node.id], 0);
      next[node.id] = clampInt(rank, 0, META_RANK_CAP);
    }
    return next;
  }
  function sanitizeLifetime(raw) {
    const next = createDefaultLifetime();
    if (!raw || typeof raw !== "object") return next;
    next.runs = Math.max(0, toInt(raw.runs, 0));
    next.totalTime = Math.max(0, toInt(raw.totalTime, 0));
    next.bestWave = Math.max(0, toInt(raw.bestWave, 0));
    next.totalShardsEarned = Math.max(0, toInt(raw.totalShardsEarned, 0));
    return next;
  }
  function toCanonicalSave(raw) {
    const defaults = createDefaultSave();
    if (!raw || typeof raw !== "object") return defaults;
    const shards = Math.max(0, toInt(raw.shards, defaults.shards));
    const metaRanks = sanitizeMetaRanks(raw.metaRanks);
    const lifetime = sanitizeLifetime(raw.lifetime);
    return {
      version: SAVE_VERSION,
      shards,
      metaRanks,
      lifetime
    };
  }
  function readStorage() {
    try {
      return localStorage.getItem(SAVE_KEY);
    } catch {
      return null;
    }
  }
  function saveProgress(saveData2) {
    const canonical = toCanonicalSave(saveData2);
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(canonical));
    } catch {
    }
    return canonical;
  }
  function loadSave() {
    const raw = readStorage();
    if (!raw) return createDefaultSave();
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const defaults = createDefaultSave();
      saveProgress(defaults);
      return defaults;
    }
    const canonical = toCanonicalSave(parsed);
    const parsedVersion = toInt(parsed?.version, -1);
    const needsRewrite = parsedVersion !== SAVE_VERSION || raw !== JSON.stringify(canonical);
    if (needsRewrite) {
      saveProgress(canonical);
    }
    return canonical;
  }
  function resetSaveProgress() {
    return saveProgress(createDefaultSave());
  }
  function getMetaRank(saveData2, nodeId) {
    const rank = toInt(saveData2?.metaRanks?.[nodeId], 0);
    return clampInt(rank, 0, META_RANK_CAP);
  }
  function getNextMetaCost(node, currentRank) {
    if (currentRank >= META_RANK_CAP) return 0;
    return Math.ceil(node.baseCost * Math.pow(META_COST_GROWTH, currentRank));
  }
  function canPurchaseMetaRank(saveData2, nodeId) {
    const node = metaNodes.find((entry) => entry.id === nodeId);
    if (!node) return false;
    const rank = getMetaRank(saveData2, nodeId);
    if (rank >= META_RANK_CAP) return false;
    const cost = getNextMetaCost(node, rank);
    return (saveData2?.shards || 0) >= cost;
  }
  function purchaseMetaRank(saveData2, nodeId) {
    const node = metaNodes.find((entry) => entry.id === nodeId);
    if (!node) return false;
    const currentRank = getMetaRank(saveData2, nodeId);
    if (currentRank >= META_RANK_CAP) return false;
    const cost = getNextMetaCost(node, currentRank);
    if ((saveData2?.shards || 0) < cost) return false;
    saveData2.shards -= cost;
    saveData2.metaRanks[nodeId] = currentRank + 1;
    return true;
  }
  function calcNodeMultiplier(node, rank) {
    return Math.pow(1 + node.perRank, rank);
  }
  function getMetaMultipliers(metaRanks) {
    const ranks = sanitizeMetaRanks(metaRanks);
    return {
      maxHp: calcNodeMultiplier(metaNodes[0], ranks.max_hp),
      moveSpeed: calcNodeMultiplier(metaNodes[1], ranks.move_speed),
      damage: calcNodeMultiplier(metaNodes[2], ranks.damage),
      fireRate: calcNodeMultiplier(metaNodes[3], ranks.fire_rate),
      xpGain: calcNodeMultiplier(metaNodes[4], ranks.xp_gain)
    };
  }
  function formatPercent2(multiplier) {
    const pct = (multiplier - 1) * 100;
    const rounded = Math.round(pct * 10) / 10;
    return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
  }
  function buildMetaBonusText(metaRanks) {
    const mult = getMetaMultipliers(metaRanks);
    return `Perm: HP +${formatPercent2(mult.maxHp)}% SPD +${formatPercent2(mult.moveSpeed)}% DMG +${formatPercent2(mult.damage)}% ROF +${formatPercent2(mult.fireRate)}% XP +${formatPercent2(mult.xpGain)}%`;
  }
  function describeMetaNode(node, rank) {
    const nextRank = Math.min(META_RANK_CAP, rank + 1);
    const bonus = (Math.pow(1 + node.perRank, nextRank) - 1) * 100;
    const rounded = Math.round(bonus * 10) / 10;
    const value = Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
    return `Rank ${nextRank}/${META_RANK_CAP}: ${node.shortLabel} +${value}%`;
  }
  function applyMetaBonuses(metaRanks) {
    const mult = getMetaMultipliers(metaRanks);
    player.maxHp = Math.max(1, Math.round(player.maxHp * mult.maxHp));
    player.hp = player.maxHp;
    player.speed = Math.max(1, Math.round(player.speed * mult.moveSpeed));
    player.damage = Math.max(1, Math.round(player.damage * mult.damage));
    player.fireRate = +(player.fireRate * mult.fireRate).toFixed(2);
    player.xpGainMultiplier = mult.xpGain;
    return mult;
  }
  function computeShardReward(elapsedSeconds, wave) {
    const safeElapsed = Math.max(0, elapsedSeconds);
    const safeWave = Math.max(1, wave);
    const earned = Math.floor(safeElapsed / 25) + Math.max(0, safeWave - 1) * 2;
    return Math.max(3, earned);
  }
  function awardRunShards(saveData2, elapsedSeconds, wave) {
    const earned = computeShardReward(elapsedSeconds, wave);
    saveData2.shards += earned;
    saveData2.lifetime.runs += 1;
    saveData2.lifetime.totalTime += Math.max(0, Math.floor(elapsedSeconds));
    saveData2.lifetime.bestWave = Math.max(saveData2.lifetime.bestWave, Math.max(1, wave));
    saveData2.lifetime.totalShardsEarned += earned;
    return earned;
  }

  // src/systems/combat/targeting.js
  function nearestEnemy() {
    let best = null;
    let bestDist = Infinity;
    for (const enemy of entities.enemies) {
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const dist = Math.hypot(dx, dy);
      if (dist < bestDist) {
        bestDist = dist;
        best = enemy;
      }
    }
    return best;
  }

  // src/systems/world/quadtree.js
  function circleIntersectsBounds(x, y, radius, bounds) {
    const closestX = Math.max(bounds.x, Math.min(x, bounds.x + bounds.width));
    const closestY = Math.max(bounds.y, Math.min(y, bounds.y + bounds.height));
    const dx = x - closestX;
    const dy = y - closestY;
    return dx * dx + dy * dy <= radius * radius;
  }
  function containsPoint(bounds, point) {
    return point.x >= bounds.x && point.x <= bounds.x + bounds.width && point.y >= bounds.y && point.y <= bounds.y + bounds.height;
  }
  function createNode(bounds, depth, capacity, maxDepth) {
    return {
      bounds,
      depth,
      capacity,
      maxDepth,
      points: [],
      children: null
    };
  }
  function subdivide(node) {
    const { x, y, width, height } = node.bounds;
    const halfW = width / 2;
    const halfH = height / 2;
    const depth = node.depth + 1;
    node.children = [
      createNode({ x, y, width: halfW, height: halfH }, depth, node.capacity, node.maxDepth),
      createNode(
        { x: x + halfW, y, width: halfW, height: halfH },
        depth,
        node.capacity,
        node.maxDepth
      ),
      createNode(
        { x, y: y + halfH, width: halfW, height: halfH },
        depth,
        node.capacity,
        node.maxDepth
      ),
      createNode(
        { x: x + halfW, y: y + halfH, width: halfW, height: halfH },
        depth,
        node.capacity,
        node.maxDepth
      )
    ];
  }
  function childForPoint(node, point) {
    if (!node.children) return null;
    const midX = node.bounds.x + node.bounds.width / 2;
    const midY = node.bounds.y + node.bounds.height / 2;
    const right = point.x >= midX;
    const bottom = point.y >= midY;
    const index = (bottom ? 2 : 0) + (right ? 1 : 0);
    return node.children[index];
  }
  function insertIntoNode(node, point) {
    if (!containsPoint(node.bounds, point)) return false;
    if (node.children) {
      return insertIntoNode(childForPoint(node, point), point);
    }
    if (node.points.length < node.capacity || node.depth >= node.maxDepth) {
      node.points.push(point);
      return true;
    }
    subdivide(node);
    const existingPoints = node.points;
    node.points = [];
    for (const existing of existingPoints) {
      insertIntoNode(childForPoint(node, existing), existing);
    }
    return insertIntoNode(childForPoint(node, point), point);
  }
  function queryNode(node, x, y, radius, results) {
    if (!circleIntersectsBounds(x, y, radius, node.bounds)) return;
    if (node.children) {
      for (const child of node.children) {
        queryNode(child, x, y, radius, results);
      }
      return;
    }
    const radiusSq = radius * radius;
    for (const point of node.points) {
      const dx = point.x - x;
      const dy = point.y - y;
      if (dx * dx + dy * dy <= radiusSq) {
        results.push(point);
      }
    }
  }
  function createQuadtree(bounds, capacity = 8, maxDepth = 8) {
    let root = createNode(bounds, 0, capacity, maxDepth);
    return {
      clear() {
        root = createNode(bounds, 0, capacity, maxDepth);
      },
      insert(point) {
        return insertIntoNode(root, point);
      },
      queryCircle(x, y, radius, results) {
        queryNode(root, x, y, radius, results);
        return results;
      }
    };
  }

  // src/systems/combat/projectiles.js
  var enemyHitQuadtree = createQuadtree({
    x: 0,
    y: 0,
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT
  });
  var bulletHitCandidates = [];
  function shoot(dt) {
    timers.shoot -= dt;
    if (timers.shoot > 0) return;
    const target = nearestEnemy();
    if (!target) return;
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const dist = Math.hypot(dx, dy) || 1;
    const vx = dx / dist * player.bulletSpeed;
    const vy = dy / dist * player.bulletSpeed;
    entities.bullets.push({
      x: player.x,
      y: player.y,
      vx,
      vy,
      r: 4,
      damage: player.damage,
      life: 1.5,
      type: "fire"
    });
    timers.shoot = 1 / player.fireRate;
  }
  function fireFrostShards(dt) {
    timers.frost -= dt;
    if (timers.frost > 0) return;
    const target = nearestEnemy();
    if (!target) return;
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const baseAngle = Math.atan2(dy, dx);
    const spread = 0.18;
    const count = Math.max(1, player.frostShots);
    const start = -((count - 1) * spread) / 2;
    for (let i = 0; i < count; i += 1) {
      const angle = baseAngle + start + i * spread;
      entities.bullets.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(angle) * player.frostSpeed,
        vy: Math.sin(angle) * player.frostSpeed,
        r: 4,
        damage: player.frostDamage,
        life: 1.4,
        type: "frost",
        pierce: player.frostPierce
      });
    }
    timers.frost = 1 / player.frostFireRate;
  }
  function fireStarfall(dt) {
    timers.starfall -= dt;
    if (timers.starfall > 0) return;
    const count = Math.max(1, Math.round(player.starfallCount));
    const step = Math.PI * 2 / count;
    const baseAngle = Math.random() * Math.PI * 2;
    for (let i = 0; i < count; i += 1) {
      const angle = baseAngle + step * i;
      entities.bullets.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(angle) * player.starfallSpeed,
        vy: Math.sin(angle) * player.starfallSpeed,
        r: 4,
        damage: player.starfallDamage,
        life: player.starfallLife,
        type: "starfall"
      });
    }
    timers.starfall = player.starfallCooldown;
  }
  function updateBullets(dt) {
    enemyHitQuadtree.clear();
    let maxEnemyRadius = 0;
    for (const enemy of entities.enemies) {
      if (enemy.hp <= 0) continue;
      enemyHitQuadtree.insert(enemy);
      maxEnemyRadius = Math.max(maxEnemyRadius, enemy.r);
    }
    for (let i = entities.bullets.length - 1; i >= 0; i -= 1) {
      const bullet = entities.bullets[i];
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;
      bullet.life -= dt;
      entities.particles.push({
        x: bullet.x,
        y: bullet.y,
        vx: (Math.random() - 0.5) * 40,
        vy: (Math.random() - 0.5) * 40,
        r: 3 + Math.random() * 2,
        life: 0.35,
        color: bullet.type === "frost" ? "ice" : bullet.type === "starfall" ? "spark" : "fire"
      });
      let hit = false;
      bulletHitCandidates.length = 0;
      enemyHitQuadtree.queryCircle(
        bullet.x,
        bullet.y,
        bullet.r + maxEnemyRadius,
        bulletHitCandidates
      );
      for (const enemy of bulletHitCandidates) {
        if (enemy.hp <= 0) continue;
        const dx = enemy.x - bullet.x;
        const dy = enemy.y - bullet.y;
        if (Math.hypot(dx, dy) < enemy.r + bullet.r) {
          enemy.hp -= bullet.damage;
          hit = true;
          if (bullet.type === "frost") {
            bullet.pierce -= 1;
            if (bullet.pierce > 0) hit = false;
          }
          break;
        }
      }
      if (hit || bullet.life <= 0 || bullet.x < -30 || bullet.x > WORLD_WIDTH + 30 || bullet.y < -30 || bullet.y > WORLD_HEIGHT + 30) {
        entities.bullets.splice(i, 1);
      }
    }
  }

  // src/systems/combat/abilities.js
  function pulseShockwave() {
    entities.pulses.push({
      x: player.x,
      y: player.y,
      r: 0,
      max: player.pulseRadius,
      life: 0.45,
      maxLife: 0.45,
      type: "pulse"
    });
    for (const enemy of entities.enemies) {
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist <= player.pulseRadius) {
        enemy.hp -= player.pulseDamage;
        enemy.shockTimer = 1.2;
        const falloff = 1 - dist / player.pulseRadius;
        const knock = player.pulseKnockback * Math.max(0.2, falloff);
        enemy.knockX += dx / dist * knock;
        enemy.knockY += dy / dist * knock;
      }
    }
  }
  function novaShockwave() {
    entities.pulses.push({
      x: player.x,
      y: player.y,
      r: 0,
      max: player.novaRadius,
      life: 0.35,
      maxLife: 0.35,
      type: "nova"
    });
    for (const enemy of entities.enemies) {
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist <= player.novaRadius) {
        enemy.hp -= player.novaDamage;
        enemy.shockTimer = 0.6;
        const falloff = 1 - dist / player.novaRadius;
        const knock = player.novaKnockback * Math.max(0.2, falloff);
        enemy.knockX += dx / dist * knock;
        enemy.knockY += dy / dist * knock;
      }
    }
  }
  function chainLightning() {
    if (entities.enemies.length === 0) return;
    const hit = [];
    let current = nearestEnemy();
    if (!current) return;
    entities.chainArcs.push({
      x1: player.x,
      y1: player.y,
      x2: current.x,
      y2: current.y,
      life: 0.2
    });
    for (let i = 0; i < player.chainCount + 1; i += 1) {
      if (!current) break;
      current.hp -= player.chainDamage;
      current.shockTimer = Math.max(current.shockTimer, 0.8);
      hit.push(current);
      const next = entities.enemies.filter((enemy) => !hit.includes(enemy)).map((enemy) => ({
        enemy,
        dist: Math.hypot(enemy.x - current.x, enemy.y - current.y)
      })).filter((entry) => entry.dist <= player.chainRange).sort((a, b) => a.dist - b.dist)[0];
      if (next) {
        entities.chainArcs.push({
          x1: current.x,
          y1: current.y,
          x2: next.enemy.x,
          y2: next.enemy.y,
          life: 0.2
        });
      }
      current = next ? next.enemy : null;
    }
  }
  function deployArcMines(dt) {
    timers.mines -= dt;
    if (timers.mines > 0) return;
    const target = nearestEnemy();
    if (!target) return;
    const angle = Math.atan2(target.y - player.y, target.x - player.x);
    const dropDistance = 72 + Math.random() * 24;
    const x = clamp(player.x + Math.cos(angle) * dropDistance, 20, WORLD_WIDTH - 20);
    const y = clamp(player.y + Math.sin(angle) * dropDistance, 20, WORLD_HEIGHT - 20);
    const maxActive = Math.max(1, Math.round(player.mineMaxActive));
    while (entities.mines.length >= maxActive) {
      entities.mines.splice(0, 1);
    }
    entities.mines.push({
      x,
      y,
      r: 11,
      radius: player.mineRadius,
      triggerRadius: Math.max(20, player.mineRadius * 0.45),
      damage: player.mineDamage,
      armTimer: player.mineArmTime,
      life: player.mineLifetime,
      maxLife: player.mineLifetime
    });
    timers.mines = player.mineCooldown;
  }
  function castGravityWell(dt) {
    timers.vortex -= dt;
    if (timers.vortex > 0) return;
    const target = nearestEnemy();
    if (!target) return;
    entities.vortexes.push({
      x: target.x,
      y: target.y,
      r: player.vortexRadius,
      life: player.vortexDuration,
      maxLife: player.vortexDuration,
      dps: player.vortexDps,
      pull: player.vortexPull
    });
    entities.pulses.push({
      x: target.x,
      y: target.y,
      r: 0,
      max: Math.max(26, player.vortexRadius * 0.35),
      life: 0.24,
      maxLife: 0.24,
      type: "vortex"
    });
    timers.vortex = player.vortexCooldown;
  }

  // src/systems/combat/orbitals.js
  function updateOrbitCaches(dt) {
    player.bladeAngle += player.bladeSpeed * dt;
    orbitCache.blades.length = 0;
    if (player.bladesUnlocked && player.bladeCount > 0) {
      const step = Math.PI * 2 / player.bladeCount;
      for (let i = 0; i < player.bladeCount; i += 1) {
        const angle = player.bladeAngle + step * i;
        orbitCache.blades.push({
          x: player.x + Math.cos(angle) * player.bladeRadius,
          y: player.y + Math.sin(angle) * player.bladeRadius
        });
      }
    }
    player.orbAngle += player.orbSpeed * dt;
    orbitCache.solars.length = 0;
    if (player.orbUnlocked && player.orbCount > 0) {
      const step = Math.PI * 2 / player.orbCount;
      for (let i = 0; i < player.orbCount; i += 1) {
        const angle = player.orbAngle + step * i;
        orbitCache.solars.push({
          x: player.x + Math.cos(angle) * player.orbRadius,
          y: player.y + Math.sin(angle) * player.orbRadius
        });
      }
    }
  }

  // src/systems/world/spawning.js
  var eliteAffixes = ["fast", "tank", "volatile", "leech"];
  function randomEliteAffix() {
    return eliteAffixes[Math.floor(Math.random() * eliteAffixes.length)];
  }
  function rollRelicRarity() {
    const total = RELIC_GOLD_CHANCE + RELIC_SILVER_CHANCE + RELIC_BRONZE_CHANCE;
    const roll = Math.random() * total;
    if (roll < RELIC_GOLD_CHANCE) return "gold";
    if (roll < RELIC_GOLD_CHANCE + RELIC_SILVER_CHANCE) return "silver";
    return "bronze";
  }
  function addOrb(x, y, value) {
    entities.orbs.push({
      x,
      y,
      baseY: y,
      bob: 0,
      r: 6,
      value,
      drift: Math.random() * Math.PI * 2
    });
  }
  function addRelic() {
    const cam = camera();
    const margin = 60;
    const x = Math.max(
      margin,
      Math.min(WORLD_WIDTH - margin, cam.x + Math.random() * cam.viewWidth)
    );
    const y = Math.max(
      margin,
      Math.min(WORLD_HEIGHT - margin, cam.y + Math.random() * cam.viewHeight)
    );
    entities.relics.push({
      x,
      y,
      r: 10,
      wobble: Math.random() * Math.PI * 2,
      rarity: rollRelicRarity()
    });
  }
  function addRelicAt(x, y, rarity = null) {
    entities.relics.push({
      x: Math.max(40, Math.min(WORLD_WIDTH - 40, x)),
      y: Math.max(40, Math.min(WORLD_HEIGHT - 40, y)),
      r: 10,
      wobble: Math.random() * Math.PI * 2,
      rarity: rarity || rollRelicRarity()
    });
  }
  function spawnEnemy() {
    const wave = Math.floor(state.elapsed / state.waveDuration) + 1;
    const edge = Math.floor(Math.random() * 4);
    const margin = 120;
    const cam = camera();
    let x = 0;
    let y = 0;
    if (edge === 0) {
      x = cam.x - margin;
      y = cam.y + Math.random() * cam.viewHeight;
    } else if (edge === 1) {
      x = cam.x + cam.viewWidth + margin;
      y = cam.y + Math.random() * cam.viewHeight;
    } else if (edge === 2) {
      x = cam.x + Math.random() * cam.viewWidth;
      y = cam.y - margin;
    } else {
      x = cam.x + Math.random() * cam.viewWidth;
      y = cam.y + cam.viewHeight + margin;
    }
    x = Math.max(0, Math.min(WORLD_WIDTH, x));
    y = Math.max(0, Math.min(WORLD_HEIGHT, y));
    const tier = Math.random() < Math.min(0.15 + wave * 0.01, 0.4) ? 2 : 1;
    const eliteChance = Math.min(ELITE_MAX_CHANCE, ELITE_BASE_CHANCE + wave * ELITE_WAVE_BONUS);
    const isElite = Math.random() < eliteChance;
    const affix = isElite ? randomEliteAffix() : null;
    const baseHp = tier === 2 ? 70 : 40;
    const baseSpeed = tier === 2 ? 70 : 90;
    let hp = Math.round(baseHp + wave * 8);
    let speed = baseSpeed + wave * 4;
    let r = tier === 2 ? 16 : 12;
    const damage = tier === 2 ? 18 : 12;
    if (affix === "fast") {
      speed *= ELITE_FAST_SPEED_MULT;
    } else if (affix === "tank") {
      hp = Math.round(hp * ELITE_TANK_HP_MULT);
      speed *= 0.88;
      r += 2;
    } else if (affix === "leech") {
      hp = Math.round(hp * 1.15);
    } else if (affix === "volatile") {
      speed *= 1.08;
    }
    entities.enemies.push({
      x,
      y,
      r,
      hp,
      maxHp: hp,
      speed,
      damage,
      tier,
      isElite,
      affix,
      elitePulse: Math.random() * Math.PI * 2,
      vx: 0,
      vy: 0,
      knockX: 0,
      knockY: 0,
      shockTimer: 0,
      bladeHitTimer: 0,
      orbHitTimer: 0
    });
  }
  function spawnMiniBoss(wave) {
    const edge = Math.floor(Math.random() * 4);
    const margin = 140;
    const cam = camera();
    let x = 0;
    let y = 0;
    if (edge === 0) {
      x = cam.x - margin;
      y = cam.y + Math.random() * cam.viewHeight;
    } else if (edge === 1) {
      x = cam.x + cam.viewWidth + margin;
      y = cam.y + Math.random() * cam.viewHeight;
    } else if (edge === 2) {
      x = cam.x + Math.random() * cam.viewWidth;
      y = cam.y - margin;
    } else {
      x = cam.x + Math.random() * cam.viewWidth;
      y = cam.y + cam.viewHeight + margin;
    }
    x = Math.max(0, Math.min(WORLD_WIDTH, x));
    y = Math.max(0, Math.min(WORLD_HEIGHT, y));
    const hp = Math.round(BOSS_HP_BASE + wave * BOSS_HP_WAVE_SCALE);
    const speed = BOSS_SPEED_BASE + wave * BOSS_SPEED_WAVE_SCALE;
    entities.enemies.push({
      x,
      y,
      r: BOSS_RADIUS,
      hp,
      maxHp: hp,
      speed,
      damage: BOSS_DAMAGE,
      tier: 2,
      isElite: false,
      affix: null,
      elitePulse: 0,
      isBoss: true,
      bossWave: wave,
      bossPulse: Math.random() * Math.PI * 2,
      vx: 0,
      vy: 0,
      knockX: 0,
      knockY: 0,
      shockTimer: 0,
      bladeHitTimer: 0,
      orbHitTimer: 0
    });
  }

  // src/systems/world/enemies.js
  var enemyQuadtree = createQuadtree({
    x: 0,
    y: 0,
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT
  });
  var nearbyEnemies = [];
  function updateEnemies(dt) {
    enemyQuadtree.clear();
    for (const enemy of entities.enemies) {
      enemyQuadtree.insert(enemy);
    }
    for (let i = entities.enemies.length - 1; i >= 0; i -= 1) {
      const enemy = entities.enemies[i];
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const dist = Math.hypot(dx, dy) || 1;
      let sepX = 0;
      let sepY = 0;
      nearbyEnemies.length = 0;
      enemyQuadtree.queryCircle(enemy.x, enemy.y, ENEMY_SEP_RADIUS, nearbyEnemies);
      for (const other of nearbyEnemies) {
        if (other === enemy) continue;
        if (other.hp <= 0) continue;
        const ox = enemy.x - other.x;
        const oy = enemy.y - other.y;
        const od = Math.hypot(ox, oy);
        if (od > 0 && od < ENEMY_SEP_RADIUS) {
          const push = (ENEMY_SEP_RADIUS - od) / ENEMY_SEP_RADIUS;
          sepX += ox / od * push;
          sepY += oy / od * push;
        }
      }
      if (enemy.shockTimer > 0) enemy.shockTimer -= dt;
      if (enemy.bladeHitTimer > 0) enemy.bladeHitTimer -= dt;
      if (enemy.orbHitTimer > 0) enemy.orbHitTimer -= dt;
      if (enemy.isElite) enemy.elitePulse += dt * 6;
      if (enemy.isBoss) enemy.bossPulse += dt * 4;
      const slow = enemy.shockTimer > 0 ? 0.55 : 1;
      const seekVX = dx / dist * enemy.speed * slow;
      const seekVY = dy / dist * enemy.speed * slow;
      const sepVX = sepX * ENEMY_SEP_FORCE;
      const sepVY = sepY * ENEMY_SEP_FORCE;
      const desiredVX = seekVX + sepVX;
      const desiredVY = seekVY + sepVY;
      const steer = 6;
      enemy.vx += (desiredVX - enemy.vx) * steer * dt;
      enemy.vy += (desiredVY - enemy.vy) * steer * dt;
      const kx = enemy.knockX;
      const ky = enemy.knockY;
      enemy.knockX *= 0.85;
      enemy.knockY *= 0.85;
      enemy.x += (enemy.vx + kx) * dt;
      enemy.y += (enemy.vy + ky) * dt;
      if (enemy.bladeHitTimer <= 0) {
        for (const blade of orbitCache.blades) {
          const bx = blade.x - enemy.x;
          const by = blade.y - enemy.y;
          if (Math.hypot(bx, by) < enemy.r + player.bladeSize * 0.5) {
            enemy.hp -= player.bladeDamage;
            enemy.bladeHitTimer = player.bladeHitCooldown;
            break;
          }
        }
      }
      if (enemy.orbHitTimer <= 0) {
        for (const orb of orbitCache.solars) {
          const ox = orb.x - enemy.x;
          const oy = orb.y - enemy.y;
          if (Math.hypot(ox, oy) < enemy.r + 8) {
            enemy.hp -= player.orbDamage;
            enemy.orbHitTimer = player.orbHitCooldown;
            break;
          }
        }
      }
      if (dist < enemy.r + player.r) {
        player.hp -= enemy.damage * dt;
        if (enemy.affix === "leech") {
          enemy.hp = Math.min(
            enemy.maxHp,
            enemy.hp + enemy.damage * ELITE_LEECH_HEAL_FACTOR * dt
          );
        }
      }
      if (enemy.hp <= 0) {
        entities.enemies.splice(i, 1);
        registerComboKill();
        const orbValue = enemy.isBoss ? BOSS_XP_REWARD : (enemy.tier === 2 ? 12 : 8) + (enemy.isElite ? ELITE_XP_BONUS : 0);
        addOrb(enemy.x, enemy.y, orbValue);
        if (enemy.isBoss) {
          addRelicAt(enemy.x, enemy.y);
        }
        if (enemy.affix === "volatile") {
          entities.pulses.push({
            x: enemy.x,
            y: enemy.y,
            r: 0,
            max: ELITE_VOLATILE_RADIUS,
            life: 0.28,
            maxLife: 0.28,
            type: "volatile"
          });
          const pdx = player.x - enemy.x;
          const pdy = player.y - enemy.y;
          const playerDist = Math.hypot(pdx, pdy);
          if (playerDist < ELITE_VOLATILE_RADIUS + player.r) {
            player.hp -= ELITE_VOLATILE_DAMAGE;
          }
          for (let p = 0; p < 10; p += 1) {
            entities.particles.push({
              x: enemy.x,
              y: enemy.y,
              vx: (Math.random() - 0.5) * 180,
              vy: (Math.random() - 0.5) * 180,
              r: 2 + Math.random() * 3,
              life: 0.35,
              color: "fire"
            });
          }
        }
        if (Math.random() < 0.1) {
          entities.healthPacks.push({
            x: enemy.x,
            y: enemy.y,
            r: 10,
            wobble: Math.random() * Math.PI * 2
          });
        }
        for (let p = 0; p < 10; p += 1) {
          entities.particles.push({
            x: enemy.x,
            y: enemy.y,
            vx: (Math.random() - 0.5) * 120,
            vy: (Math.random() - 0.5) * 120,
            r: 3 + Math.random() * 3,
            life: 0.55,
            color: "blood"
          });
        }
      }
    }
  }

  // src/systems/world/pickups.js
  function updateRelicSpawner(dt) {
    timers.relic -= dt;
    if (timers.relic <= 0 && entities.relics.length < 2) {
      addRelic();
      timers.relic = 18;
    }
  }
  function updateRelicCollisions(dt) {
    for (let i = entities.relics.length - 1; i >= 0; i -= 1) {
      const relic = entities.relics[i];
      relic.wobble += dt * 4;
      const dist = distance(player.x, player.y, relic.x, relic.y);
      if (dist < player.r + relic.r) {
        entities.relics.splice(i, 1);
        state.pendingStatUps += 1;
        state.pendingRelicRarities.push(relic.rarity || "bronze");
        if (!state.paused) openStatUpgradeFromQueue();
      }
    }
  }
  function updateHealthPackCollisions(dt) {
    for (let i = entities.healthPacks.length - 1; i >= 0; i -= 1) {
      const pack = entities.healthPacks[i];
      pack.wobble += dt * 5;
      const dist = distance(player.x, player.y, pack.x, pack.y);
      if (dist < player.r + pack.r) {
        entities.healthPacks.splice(i, 1);
        player.hp = Math.min(player.maxHp, player.hp + 25);
      }
    }
  }
  function updateXpOrbs(dt) {
    for (let i = entities.orbs.length - 1; i >= 0; i -= 1) {
      const orb = entities.orbs[i];
      orb.drift += dt * 2;
      orb.bob = Math.sin(orb.drift) * 10;
      orb.y = orb.baseY + orb.bob;
      const dx = player.x - orb.x;
      const dy = player.y - orb.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < player.pickupRadius + orb.r) {
        gainXp(orb.value);
        entities.orbs.splice(i, 1);
      } else if (getUpgradeLevel("magnet") > 0 && dist < player.pickupRadius * 3) {
        const pull = (1 - dist / (player.pickupRadius * 3)) * 160;
        orb.x += dx / dist * pull * dt;
        orb.baseY += dy / dist * pull * dt;
        orb.y = orb.baseY + orb.bob;
      }
    }
  }

  // src/systems/world/effects.js
  function updateParticles(dt) {
    for (let i = entities.particles.length - 1; i >= 0; i -= 1) {
      const p = entities.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.r *= 0.96;
      if (p.life <= 0 || p.r < 0.4) entities.particles.splice(i, 1);
    }
  }
  function updatePulseEffects(dt) {
    for (let i = entities.pulses.length - 1; i >= 0; i -= 1) {
      const pulse = entities.pulses[i];
      pulse.life -= dt;
      const t = 1 - pulse.life / pulse.maxLife;
      pulse.r = pulse.max * Math.min(1, t);
      if (pulse.life <= 0) entities.pulses.splice(i, 1);
    }
  }
  function updateChainArcs(dt) {
    for (let i = entities.chainArcs.length - 1; i >= 0; i -= 1) {
      const arc = entities.chainArcs[i];
      arc.life -= dt;
      if (arc.life <= 0) entities.chainArcs.splice(i, 1);
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
      type: "mine"
    });
    for (const enemy of entities.enemies) {
      const dx = enemy.x - mine.x;
      const dy = enemy.y - mine.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist > mine.radius + enemy.r) continue;
      enemy.hp -= mine.damage;
      const falloff = 1 - Math.min(1, dist / mine.radius);
      const knock = 180 * (0.3 + falloff * 0.7);
      enemy.knockX += dx / dist * knock;
      enemy.knockY += dy / dist * knock;
      enemy.shockTimer = Math.max(enemy.shockTimer, 0.35);
    }
    for (let p = 0; p < 10; p += 1) {
      entities.particles.push({
        x: mine.x,
        y: mine.y,
        vx: (Math.random() - 0.5) * 170,
        vy: (Math.random() - 0.5) * 170,
        r: 2 + Math.random() * 2.6,
        life: 0.35,
        color: "fire"
      });
    }
  }
  function updateMines(dt) {
    for (let i = entities.mines.length - 1; i >= 0; i -= 1) {
      const mine = entities.mines[i];
      mine.life -= dt;
      if (mine.armTimer > 0) mine.armTimer -= dt;
      let triggered = false;
      if (mine.armTimer <= 0) {
        for (const enemy of entities.enemies) {
          const dx = enemy.x - mine.x;
          const dy = enemy.y - mine.y;
          if (Math.hypot(dx, dy) <= mine.triggerRadius + enemy.r) {
            triggered = true;
            break;
          }
        }
      }
      if (triggered) {
        detonateMine(mine);
        entities.mines.splice(i, 1);
        continue;
      }
      if (mine.life <= 0) entities.mines.splice(i, 1);
    }
  }
  function updateTrails(dt) {
    if (player.trailUnlocked && player.isMoving) {
      timers.trail -= dt;
      const interval = Math.max(0.06, player.trailSpawnInterval);
      while (timers.trail <= 0) {
        const maxPatches = Math.max(1, Math.round(player.trailMaxPatches));
        while (entities.trails.length >= maxPatches) {
          entities.trails.splice(0, 1);
        }
        entities.trails.push({
          x: player.x,
          y: player.y,
          r: player.trailRadius,
          dps: player.trailDps,
          life: player.trailPatchLife,
          maxLife: player.trailPatchLife
        });
        timers.trail += interval;
      }
    }
    for (let i = entities.trails.length - 1; i >= 0; i -= 1) {
      const patch = entities.trails[i];
      patch.life -= dt;
      for (const enemy of entities.enemies) {
        const dx = enemy.x - patch.x;
        const dy = enemy.y - patch.y;
        if (Math.hypot(dx, dy) <= patch.r + enemy.r) {
          enemy.hp -= patch.dps * dt;
        }
      }
      if (patch.life <= 0) entities.trails.splice(i, 1);
    }
  }
  function updateVortexes(dt) {
    for (let i = entities.vortexes.length - 1; i >= 0; i -= 1) {
      const vortex = entities.vortexes[i];
      vortex.life -= dt;
      for (const enemy of entities.enemies) {
        const dx = vortex.x - enemy.x;
        const dy = vortex.y - enemy.y;
        const dist = Math.hypot(dx, dy);
        if (dist > vortex.r + enemy.r) continue;
        enemy.hp -= vortex.dps * dt;
        enemy.shockTimer = Math.max(enemy.shockTimer, 0.22);
        const safeDist = Math.max(8, dist);
        const pullFactor = 0.35 + (1 - Math.min(1, safeDist / vortex.r)) * 0.65;
        const pull = vortex.pull * pullFactor;
        enemy.knockX += dx / safeDist * pull;
        enemy.knockY += dy / safeDist * pull;
      }
      if (vortex.life <= 0) entities.vortexes.splice(i, 1);
    }
  }

  // src/systems/input/controls.js
  function setKeyState(key, isDown) {
    if (key === "ArrowUp" || key === "w") input.up = isDown;
    if (key === "ArrowDown" || key === "s") input.down = isDown;
    if (key === "ArrowLeft" || key === "a") input.left = isDown;
    if (key === "ArrowRight" || key === "d") input.right = isDown;
  }
  function updateMouseTarget(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cam = camera();
    input.mouseX = cam.x + (event.clientX - rect.left) * scaleX / zoomState.zoom;
    input.mouseY = cam.y + (event.clientY - rect.top) * scaleY / zoomState.zoom;
  }
  function bindInputHandlers() {
    window.addEventListener("keydown", (event) => {
      setKeyState(event.key, true);
    });
    window.addEventListener("keyup", (event) => {
      setKeyState(event.key, false);
    });
    canvas.addEventListener("mousedown", (event) => {
      if (!state.running) return;
      input.mouseActive = true;
      updateMouseTarget(event);
    });
    window.addEventListener("mouseup", () => {
      input.mouseActive = false;
    });
    window.addEventListener("mousemove", (event) => {
      if (!input.mouseActive) return;
      updateMouseTarget(event);
    });
    canvas.addEventListener("pointerdown", (event) => {
      if (!state.running) return;
      input.mouseActive = true;
      updateMouseTarget(event);
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!input.mouseActive) return;
      updateMouseTarget(event);
    });
    canvas.addEventListener("pointerup", (event) => {
      input.mouseActive = false;
      canvas.releasePointerCapture(event.pointerId);
    });
    canvas.addEventListener("pointercancel", (event) => {
      input.mouseActive = false;
      canvas.releasePointerCapture(event.pointerId);
    });
  }

  // src/systems/render/frame.js
  function beginFrame() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.imageSmoothingEnabled = false;
    ctx.save();
    ctx.scale(zoomState.zoom, zoomState.zoom);
  }
  function endWorldTransform() {
    ctx.restore();
  }

  // src/systems/render/world.js
  function drawWorldBackground() {
    ctx.fillStyle = "#efe7d6";
    ctx.fillRect(0, 0, zoomState.viewWidth, zoomState.viewHeight);
  }
  function drawWorldGrid(cam) {
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.lineWidth = 1;
    const grid = 48;
    const startX = Math.floor(cam.x / grid) * grid;
    const startY = Math.floor(cam.y / grid) * grid;
    for (let x = startX; x <= cam.x + zoomState.viewWidth; x += grid) {
      ctx.beginPath();
      ctx.moveTo(x - cam.x, 0);
      ctx.lineTo(x - cam.x, zoomState.viewHeight);
      ctx.stroke();
    }
    for (let y = startY; y <= cam.y + zoomState.viewHeight; y += grid) {
      ctx.beginPath();
      ctx.moveTo(0, y - cam.y);
      ctx.lineTo(zoomState.viewWidth, y - cam.y);
      ctx.stroke();
    }
  }

  // src/systems/render/effects.js
  function drawXpOrbs(cam) {
    for (const orb of entities.orbs) {
      const height = (orb.bob + 10) / 20;
      const shadowScale = 0.8 + (1 - height) * 0.6;
      const shadowAlpha = 0.5 * height + 0.12;
      ctx.fillStyle = `rgba(40, 40, 40, ${shadowAlpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.ellipse(
        orb.x - cam.x,
        orb.baseY - cam.y + orb.r + 10,
        orb.r * 1.1 * shadowScale,
        orb.r * 0.55 * shadowScale,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.fillStyle = "#1f6f8b";
      ctx.beginPath();
      ctx.arc(orb.x - cam.x, orb.y - cam.y, orb.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  function drawPulseRings(cam) {
    for (const pulse of entities.pulses) {
      const alpha = 0.35 + 0.35 * Math.sin(pulse.r / pulse.max * Math.PI * 4);
      const color = pulse.type === "nova" ? `rgba(190, 120, 255, ${alpha})` : pulse.type === "volatile" ? `rgba(255, 120, 70, ${alpha})` : pulse.type === "mine" ? `rgba(255, 175, 90, ${alpha})` : pulse.type === "vortex" ? `rgba(145, 175, 255, ${alpha})` : `rgba(80, 170, 255, ${alpha})`;
      ctx.strokeStyle = color;
      ctx.lineWidth = pulse.type === "volatile" ? 5 : pulse.type === "nova" ? 3 : pulse.type === "mine" ? 4 : 4;
      ctx.beginPath();
      ctx.arc(pulse.x - cam.x, pulse.y - cam.y, pulse.r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  function drawTrailPatches(cam) {
    for (const patch of entities.trails) {
      const life = Math.max(0, patch.life / patch.maxLife);
      const glow = 0.3 + (1 - life) * 0.2;
      ctx.fillStyle = `rgba(190, 70, 30, ${(0.25 + life * 0.28).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(patch.x - cam.x, patch.y - cam.y, patch.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 168, 90, ${(0.2 + glow).toFixed(3)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(patch.x - cam.x, patch.y - cam.y, patch.r * 0.72, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  function drawVortexRings(cam) {
    for (const vortex of entities.vortexes) {
      const life = Math.max(0, vortex.life / vortex.maxLife);
      const swirl = (1 - life) * Math.PI * 2;
      ctx.strokeStyle = `rgba(130, 170, 255, ${(0.3 + life * 0.35).toFixed(3)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(vortex.x - cam.x, vortex.y - cam.y, vortex.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(170, 205, 255, ${(0.25 + life * 0.35).toFixed(3)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(vortex.x - cam.x, vortex.y - cam.y, vortex.r * (0.35 + 0.2 * Math.sin(swirl)), 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  function drawChainArcLines(cam) {
    for (const arc of entities.chainArcs) {
      const alpha = Math.min(1, arc.life / 0.2);
      ctx.strokeStyle = `rgba(120, 200, 255, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(arc.x1 - cam.x, arc.y1 - cam.y);
      ctx.lineTo(arc.x2 - cam.x, arc.y2 - cam.y);
      ctx.stroke();
    }
  }
  function drawParticles(cam) {
    for (const p of entities.particles) {
      const maxLife = p.color === "blood" ? 0.55 : 0.35;
      const alpha = Math.max(0, Math.min(1, p.life / maxLife));
      if (p.color === "blood") {
        ctx.fillStyle = `rgba(180, 30, 30, ${alpha})`;
      } else if (p.color === "spark") {
        ctx.fillStyle = `rgba(255, 220, 120, ${alpha})`;
      } else if (p.color === "ice") {
        ctx.fillStyle = `rgba(120, 200, 255, ${alpha})`;
      } else {
        ctx.fillStyle = `rgba(255, 180, 90, ${alpha})`;
      }
      ctx.beginPath();
      ctx.arc(p.x - cam.x, p.y - cam.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  function drawShockLinks(cam) {
    const shocked = entities.enemies.filter((enemy) => enemy.shockTimer > 0);
    if (shocked.length <= 1) return;
    const pulse = 0.35 + 0.35 * Math.sin(state.elapsed * 8);
    ctx.strokeStyle = `rgba(80, 170, 255, ${pulse})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < shocked.length; i += 1) {
      for (let j = i + 1; j < shocked.length; j += 1) {
        ctx.beginPath();
        ctx.moveTo(shocked[i].x - cam.x, shocked[i].y - cam.y);
        ctx.lineTo(shocked[j].x - cam.x, shocked[j].y - cam.y);
        ctx.stroke();
      }
    }
  }

  // src/systems/render/entities.js
  function drawBladeOrbits(cam) {
    for (const blade of orbitCache.blades) {
      const size = player.bladeSize;
      if (bladeSprite.complete && bladeSprite.naturalWidth > 0) {
        const angle = Math.atan2(blade.y - player.y, blade.x - player.x);
        ctx.save();
        ctx.translate(blade.x - cam.x, blade.y - cam.y);
        ctx.rotate(angle + Math.PI / 2);
        ctx.drawImage(bladeSprite, -size / 2, -size / 2, size, size);
        ctx.restore();
      } else {
        ctx.fillStyle = "#d94f2b";
        ctx.beginPath();
        ctx.arc(blade.x - cam.x, blade.y - cam.y, size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  function drawSolarOrbits(cam) {
    for (const orb of orbitCache.solars) {
      ctx.fillStyle = "rgba(255, 210, 120, 0.95)";
      ctx.beginPath();
      ctx.arc(orb.x - cam.x, orb.y - cam.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 240, 200, 0.7)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(orb.x - cam.x, orb.y - cam.y, 9, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  function drawBullets(cam) {
    for (const bullet of entities.bullets) {
      ctx.fillStyle = bullet.type === "frost" ? "#7cc7ff" : bullet.type === "starfall" ? "#ffd677" : "#ff7b3a";
      ctx.beginPath();
      ctx.arc(bullet.x - cam.x, bullet.y - cam.y, bullet.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  function drawMines(cam) {
    for (const mine of entities.mines) {
      const armed = mine.armTimer <= 0;
      const alpha = armed ? 0.95 : 0.45;
      const pulse = 0.65 + 0.35 * Math.sin(mine.life / mine.maxLife * Math.PI * 8);
      ctx.fillStyle = `rgba(200, 90, 40, ${alpha})`;
      ctx.beginPath();
      ctx.arc(mine.x - cam.x, mine.y - cam.y, mine.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = armed ? `rgba(255, 180, 90, ${pulse})` : "rgba(255, 180, 90, 0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(mine.x - cam.x, mine.y - cam.y, mine.triggerRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  function drawRelics(cam) {
    for (const relic of entities.relics) {
      const pulse = 0.6 + 0.4 * Math.sin(relic.wobble);
      const rarityColor = relic.rarity === "gold" ? "rgba(255, 221, 120, 0.95)" : relic.rarity === "silver" ? "rgba(200, 220, 255, 0.92)" : "rgba(198, 145, 92, 0.9)";
      const fallbackFill = relic.rarity === "gold" ? `rgba(255, 221, 120, ${pulse})` : relic.rarity === "silver" ? `rgba(200, 220, 255, ${pulse})` : `rgba(198, 145, 92, ${pulse})`;
      const glowRadius = relic.rarity === "gold" ? relic.r + 8 : relic.rarity === "silver" ? relic.r + 6 : relic.r + 4;
      ctx.strokeStyle = rarityColor;
      ctx.lineWidth = relic.rarity === "gold" ? 3 : 2;
      ctx.beginPath();
      ctx.arc(relic.x - cam.x, relic.y - cam.y, glowRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(40, 40, 40, 0.25)";
      ctx.beginPath();
      ctx.ellipse(
        relic.x - cam.x,
        relic.y - cam.y + relic.r + 2,
        relic.r * 1.05,
        relic.r * 0.45,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      if (relicSprite.complete && relicSprite.naturalWidth > 0) {
        const size = relic.r * 2;
        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.drawImage(
          relicSprite,
          relic.x - cam.x - size / 2,
          relic.y - cam.y - size / 2,
          size,
          size
        );
        ctx.restore();
      } else {
        ctx.fillStyle = fallbackFill;
        ctx.beginPath();
        ctx.moveTo(relic.x - cam.x, relic.y - cam.y - relic.r);
        ctx.lineTo(relic.x - cam.x + relic.r, relic.y - cam.y);
        ctx.lineTo(relic.x - cam.x, relic.y - cam.y + relic.r);
        ctx.lineTo(relic.x - cam.x - relic.r, relic.y - cam.y);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
  function drawHealthPacks(cam) {
    for (const pack of entities.healthPacks) {
      const pulse = 0.6 + 0.4 * Math.sin(pack.wobble);
      if (healthSprite.complete && healthSprite.naturalWidth > 0) {
        const size = pack.r * 2;
        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.drawImage(
          healthSprite,
          pack.x - cam.x - size / 2,
          pack.y - cam.y - size / 2,
          size,
          size
        );
        ctx.restore();
      } else {
        ctx.fillStyle = `rgba(200, 40, 40, ${pulse})`;
        ctx.beginPath();
        ctx.arc(pack.x - cam.x, pack.y - cam.y, pack.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  function drawEnemies(cam) {
    for (const enemy of entities.enemies) {
      const sprite = enemy.tier === 2 ? enemyBigSprite : enemySmallSprite;
      if (enemy.isBoss) {
        const pulse = 0.45 + 0.35 * Math.sin(enemy.bossPulse || 0);
        ctx.strokeStyle = `rgba(255, 220, 120, ${pulse})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(enemy.x - cam.x, enemy.y - cam.y, enemy.r + 11, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (enemy.isElite) {
        const pulse = 0.35 + 0.25 * Math.sin(enemy.elitePulse || 0);
        const affixColor = enemy.affix === "fast" ? `rgba(255, 209, 102, ${pulse})` : enemy.affix === "tank" ? `rgba(114, 214, 134, ${pulse})` : enemy.affix === "volatile" ? `rgba(255, 129, 92, ${pulse})` : `rgba(188, 132, 255, ${pulse})`;
        ctx.strokeStyle = affixColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(enemy.x - cam.x, enemy.y - cam.y, enemy.r + 8, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(40, 40, 40, 0.28)";
      ctx.beginPath();
      ctx.ellipse(
        enemy.x - cam.x,
        enemy.y - cam.y + enemy.r + 2,
        enemy.r * 1.05,
        enemy.r * 0.45,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      if (enemy.shockTimer > 0) {
        const pulse = 0.4 + 0.4 * Math.sin(enemy.shockTimer * 8 % (Math.PI * 2));
        ctx.fillStyle = `rgba(80, 170, 255, ${pulse})`;
        ctx.beginPath();
        ctx.arc(enemy.x - cam.x, enemy.y - cam.y, enemy.r + 6, 0, Math.PI * 2);
        ctx.fill();
      }
      if (sprite.complete && sprite.naturalWidth > 0) {
        const size = enemy.r * 2;
        ctx.drawImage(
          sprite,
          enemy.x - cam.x - size / 2,
          enemy.y - cam.y - size / 2,
          size,
          size
        );
        if (enemy.isBoss) {
          ctx.strokeStyle = "rgba(255, 236, 170, 0.9)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(enemy.x - cam.x - 8, enemy.y - cam.y - enemy.r - 8);
          ctx.lineTo(enemy.x - cam.x, enemy.y - cam.y - enemy.r - 16);
          ctx.lineTo(enemy.x - cam.x + 8, enemy.y - cam.y - enemy.r - 8);
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = enemy.tier === 2 ? "#5a1f1f" : "#1f1f1f";
        ctx.beginPath();
        ctx.arc(enemy.x - cam.x, enemy.y - cam.y, enemy.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(enemy.x - enemy.r - cam.x, enemy.y - enemy.r - cam.y);
        ctx.lineTo(enemy.x + enemy.r - cam.x, enemy.y + enemy.r - cam.y);
        ctx.stroke();
      }
    }
  }
  function drawPlayer(cam) {
    if (playerSprite.complete && playerSprite.naturalWidth > 0) {
      const size = player.r * 2;
      ctx.fillStyle = "rgba(40, 40, 40, 0.32)";
      ctx.beginPath();
      ctx.ellipse(
        player.x - cam.x,
        player.y - cam.y + player.r + 2,
        player.r * 1.1,
        player.r * 0.5,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.drawImage(
        playerSprite,
        player.x - cam.x - size / 2,
        player.y - cam.y - size / 2,
        size,
        size
      );
    } else {
      ctx.fillStyle = "rgba(40, 40, 40, 0.32)";
      ctx.beginPath();
      ctx.ellipse(
        player.x - cam.x,
        player.y - cam.y + player.r + 2,
        player.r * 1.1,
        player.r * 0.5,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.fillStyle = "#0b0c0f";
      ctx.beginPath();
      ctx.arc(player.x - cam.x, player.y - cam.y, player.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  function drawPlayerHpRing(cam) {
    ctx.strokeStyle = "#d94f2b";
    ctx.lineWidth = 3;
    const hpRatio = Math.max(0, player.hp / player.maxHp);
    ctx.beginPath();
    ctx.arc(
      player.x - cam.x,
      player.y - cam.y,
      player.r + 6,
      -Math.PI / 2,
      -Math.PI / 2 + Math.PI * 2 * hpRatio
    );
    ctx.stroke();
  }

  // src/systems/render/minimap.js
  function drawMinimap() {
    const mapPadding = 16;
    const mapWidth = 180;
    const mapHeight = Math.round(WORLD_HEIGHT / WORLD_WIDTH * mapWidth);
    const mapX = ctx.canvas.width - mapWidth - mapPadding;
    const mapY = mapPadding;
    const scaleX = mapWidth / WORLD_WIDTH;
    const scaleY = mapHeight / WORLD_HEIGHT;
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "rgba(15, 15, 20, 0.6)";
    ctx.fillRect(mapX - 4, mapY - 4, mapWidth + 8, mapHeight + 8);
    ctx.fillStyle = "rgba(240, 230, 210, 0.85)";
    ctx.fillRect(mapX, mapY, mapWidth, mapHeight);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(mapX, mapY, mapWidth, mapHeight);
    ctx.fillStyle = "rgba(80, 170, 255, 0.9)";
    for (const relic of entities.relics) {
      const rx = mapX + relic.x * scaleX;
      const ry = mapY + relic.y * scaleY;
      ctx.beginPath();
      ctx.arc(rx, ry, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(217, 79, 43, 0.95)";
    ctx.beginPath();
    ctx.arc(
      mapX + player.x * scaleX,
      mapY + player.y * scaleY,
      3.2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }

  // src/main.js
  setShowLevelUpHandler(showLevelUp);
  setShowLevelUpHandler2(showLevelUp);
  setOpenStatUpgradeFromQueueHandler(openStatUpgradeFromQueue);
  var saveData = loadSave();
  function refreshMetaBonusText() {
    state.metaBonusText = buildMetaBonusText(saveData.metaRanks);
  }
  function setMenuPanel(panel) {
    if (!menuPanels.title || !menuPanels.meta || !menuPanels.controls) return;
    menuPanels.title.classList.toggle("hidden", panel !== SCREEN_STATES.TITLE);
    menuPanels.meta.classList.toggle("hidden", panel !== SCREEN_STATES.META);
    menuPanels.controls.classList.toggle("hidden", panel !== SCREEN_STATES.CONTROLS);
  }
  function setScreen(screen) {
    const prevScreen = state.screen;
    if (prevScreen === SCREEN_STATES.RUNNING && screen !== SCREEN_STATES.RUNNING) {
      state.menuCamX = player.x;
      state.menuCamY = player.y;
    }
    state.screen = screen;
    state.running = screen === SCREEN_STATES.RUNNING;
    if (!state.running) {
      state.paused = false;
      input.mouseActive = false;
      levelup.classList.add("hidden");
    }
    const showMenuOverlay = screen === SCREEN_STATES.TITLE || screen === SCREEN_STATES.META || screen === SCREEN_STATES.CONTROLS;
    if (menuOverlay) {
      menuOverlay.classList.toggle("hidden", !showMenuOverlay);
    }
    if (runSummary.overlay) {
      runSummary.overlay.classList.toggle("hidden", screen !== SCREEN_STATES.RUN_SUMMARY);
    }
    setMenuPanel(showMenuOverlay ? screen : null);
  }
  function renderMetaPanel() {
    if (!metaPanel.list || !metaPanel.shards) return;
    metaPanel.shards.textContent = `${saveData.shards}`;
    metaPanel.list.innerHTML = "";
    for (const node of metaNodes) {
      const rank = getMetaRank(saveData, node.id);
      const nextCost = getNextMetaCost(node, rank);
      const row = document.createElement("div");
      row.className = "meta-row";
      if (rank >= META_RANK_CAP) row.classList.add("maxed");
      const body = document.createElement("div");
      body.className = "meta-row-main";
      const name = document.createElement("div");
      name.className = "meta-name";
      name.textContent = node.label;
      const rankEl = document.createElement("div");
      rankEl.className = "meta-rank";
      rankEl.textContent = `Rank ${rank}/${META_RANK_CAP}`;
      const desc = document.createElement("div");
      desc.className = "meta-desc";
      desc.textContent = rank >= META_RANK_CAP ? "Max rank reached" : describeMetaNode(node, rank);
      const cost = document.createElement("div");
      cost.className = "meta-cost";
      cost.textContent = rank >= META_RANK_CAP ? "Cost: MAX" : `Cost: ${nextCost} shards`;
      const buyBtn = document.createElement("button");
      buyBtn.className = "meta-buy";
      buyBtn.textContent = rank >= META_RANK_CAP ? "MAX" : `Buy (${nextCost})`;
      buyBtn.disabled = rank >= META_RANK_CAP || !canPurchaseMetaRank(saveData, node.id);
      buyBtn.addEventListener("click", () => {
        if (!purchaseMetaRank(saveData, node.id)) return;
        saveData = saveProgress(saveData);
        refreshMetaBonusText();
        renderMetaPanel();
      });
      body.appendChild(name);
      body.appendChild(rankEl);
      body.appendChild(desc);
      body.appendChild(cost);
      row.appendChild(body);
      row.appendChild(buyBtn);
      metaPanel.list.appendChild(row);
    }
  }
  function openTitleScreen() {
    setScreen(SCREEN_STATES.TITLE);
  }
  function openMetaScreen() {
    renderMetaPanel();
    setScreen(SCREEN_STATES.META);
  }
  function openControlsScreen() {
    setScreen(SCREEN_STATES.CONTROLS);
  }
  function updateTime(dt) {
    state.elapsed += dt;
  }
  function updatePlayerMovement(dt) {
    const startX = player.x;
    const startY = player.y;
    let moveX = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    let moveY = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    if (input.mouseActive) {
      const mx = input.mouseX - player.x;
      const my = input.mouseY - player.y;
      const dist = Math.hypot(mx, my);
      if (dist > 6) {
        moveX = mx / dist;
        moveY = my / dist;
      } else {
        moveX = 0;
        moveY = 0;
      }
    }
    const mag = Math.hypot(moveX, moveY);
    if (mag > 0) {
      const nx = moveX / mag;
      const ny = moveY / mag;
      player.x += nx * player.speed * dt;
      player.y += ny * player.speed * dt;
    }
    player.x = clamp(player.x, player.r, WORLD_WIDTH - player.r);
    player.y = clamp(player.y, player.r, WORLD_HEIGHT - player.r);
    player.isMoving = Math.hypot(player.x - startX, player.y - startY) > 0.5;
  }
  function updateWeaponFiring(dt) {
    shoot(dt);
    if (player.frostUnlocked) fireFrostShards(dt);
    if (player.starfallUnlocked) fireStarfall(dt);
    if (player.mineUnlocked) deployArcMines(dt);
    if (player.vortexUnlocked) castGravityWell(dt);
    if (player.pulseUnlocked) {
      timers.pulse -= dt;
      if (timers.pulse <= 0) {
        pulseShockwave();
        timers.pulse = player.pulseCooldown;
      }
    }
    if (player.novaUnlocked) {
      timers.nova -= dt;
      if (timers.nova <= 0) {
        novaShockwave();
        timers.nova = player.novaCooldown;
      }
    }
    if (player.chainUnlocked) {
      timers.chain -= dt;
      if (timers.chain <= 0) {
        chainLightning();
        timers.chain = player.chainCooldown;
      }
    }
  }
  function updateEnemySpawner(dt) {
    timers.spawn -= dt;
    const wave = Math.floor(state.elapsed / state.waveDuration) + 1;
    const spawnInterval = Math.max(0.18, 1.2 - wave * 0.06);
    while (wave >= state.nextBossWave) {
      spawnMiniBoss(state.nextBossWave);
      state.nextBossWave += BOSS_WAVE_INTERVAL;
    }
    if (timers.spawn <= 0) {
      spawnEnemy();
      timers.spawn = spawnInterval;
    }
  }
  function showRunSummary() {
    const wave = Math.floor(state.elapsed / state.waveDuration) + 1;
    const elapsedSeconds = Math.max(0, state.elapsed);
    const earnedShards = awardRunShards(saveData, elapsedSeconds, wave);
    saveData = saveProgress(saveData);
    if (runSummary.wave) runSummary.wave.textContent = `${wave}`;
    if (runSummary.time) runSummary.time.textContent = formatTime(elapsedSeconds);
    if (runSummary.shards) runSummary.shards.textContent = `${earnedShards}`;
    if (runSummary.total) runSummary.total.textContent = `${saveData.shards}`;
    state.paused = false;
    input.mouseActive = false;
    levelup.classList.add("hidden");
    setScreen(SCREEN_STATES.RUN_SUMMARY);
    music.pause();
    music.currentTime = 0;
  }
  function checkGameOver() {
    if (player.hp > 0) return;
    showRunSummary();
  }
  function updateMenuCameraDrift(dt) {
    const halfW = zoomState.viewWidth / 2;
    const halfH = zoomState.viewHeight / 2;
    const minX = halfW;
    const maxX = Math.max(minX, WORLD_WIDTH - halfW);
    const minY = halfH;
    const maxY = Math.max(minY, WORLD_HEIGHT - halfH);
    state.menuCamX += state.menuCamVX * dt;
    state.menuCamY += state.menuCamVY * dt;
    if (state.menuCamX <= minX || state.menuCamX >= maxX) {
      state.menuCamX = clamp(state.menuCamX, minX, maxX);
      state.menuCamVX *= -1;
    }
    if (state.menuCamY <= minY || state.menuCamY >= maxY) {
      state.menuCamY = clamp(state.menuCamY, minY, maxY);
      state.menuCamVY *= -1;
    }
  }
  function update(dt) {
    if (state.screen !== SCREEN_STATES.RUNNING) {
      updateMenuCameraDrift(dt);
      return;
    }
    if (state.paused) return;
    updateTime(dt);
    updatePlayerMovement(dt);
    updateRelicSpawner(dt);
    updateOrbitCaches(dt);
    updateWeaponFiring(dt);
    updateEnemySpawner(dt);
    updateEnemies(dt);
    updateBullets(dt);
    updateMines(dt);
    updateTrails(dt);
    updateVortexes(dt);
    updateParticles(dt);
    updateRelicCollisions(dt);
    updateHealthPackCollisions(dt);
    updateXpOrbs(dt);
    updatePulseEffects(dt);
    updateChainArcs(dt);
    checkGameOver();
  }
  function draw() {
    beginFrame();
    const cam = camera();
    drawWorldBackground();
    drawWorldGrid(cam);
    drawXpOrbs(cam);
    drawTrailPatches(cam);
    drawVortexRings(cam);
    drawPulseRings(cam);
    drawChainArcLines(cam);
    drawBladeOrbits(cam);
    drawSolarOrbits(cam);
    drawMines(cam);
    drawBullets(cam);
    drawParticles(cam);
    drawRelics(cam);
    drawHealthPacks(cam);
    drawShockLinks(cam);
    drawEnemies(cam);
    drawPlayer(cam);
    drawPlayerHpRing(cam);
    endWorldTransform();
    drawMinimap();
    if (state.screen !== SCREEN_STATES.RUNNING) {
      ctx.fillStyle = "rgba(11, 12, 15, 0.45)";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }
  function startRun() {
    resetGame();
    applyMetaBonuses(saveData.metaRanks);
    state.paused = false;
    setScreen(SCREEN_STATES.RUNNING);
    music.currentTime = 0;
    music.play().catch(() => {
    });
  }
  function onEscapePressed() {
    if (state.screen === SCREEN_STATES.META || state.screen === SCREEN_STATES.CONTROLS || state.screen === SCREEN_STATES.RUN_SUMMARY) {
      openTitleScreen();
    }
  }
  function resetMetaSave() {
    const confirmed = window.confirm(
      "Reset all shards and permanent upgrades? This cannot be undone."
    );
    if (!confirmed) return;
    saveData = resetSaveProgress();
    refreshMetaBonusText();
    renderMetaPanel();
  }
  bindInputHandlers();
  if (menuButtons.play) menuButtons.play.addEventListener("click", startRun);
  if (menuButtons.meta) menuButtons.meta.addEventListener("click", openMetaScreen);
  if (menuButtons.controls)
    menuButtons.controls.addEventListener("click", openControlsScreen);
  if (metaPanel.back) metaPanel.back.addEventListener("click", openTitleScreen);
  if (metaPanel.reset) metaPanel.reset.addEventListener("click", resetMetaSave);
  if (controlsBack) controlsBack.addEventListener("click", openTitleScreen);
  if (runSummary.play) runSummary.play.addEventListener("click", startRun);
  if (runSummary.meta) runSummary.meta.addEventListener("click", openMetaScreen);
  if (zoomControls.out) {
    zoomControls.out.addEventListener("click", () => setZoomIndex(zoomState.index - 1));
  }
  if (zoomControls.in) {
    zoomControls.in.addEventListener("click", () => setZoomIndex(zoomState.index + 1));
  }
  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    onEscapePressed();
  });
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  refreshMetaBonusText();
  renderMetaPanel();
  openTitleScreen();
  configureLoop({ update, draw, updateHud });
  requestAnimationFrame(loop);
})();
