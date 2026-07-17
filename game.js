(() => {
  // src/config/constants.js
  var zoomLevels = [1, 2, 4];
  var WORLD_WIDTH = 2400;
  var WORLD_HEIGHT = 1600;
  var MAX_WEAPON_SLOTS = 6;
  var MAX_PASSIVE_SLOTS = 6;
  var STAGE_DURATION = 10 * 60;
  var STAGE_WAVE_COUNT = 20;
  var MAX_ENEMIES = 160;
  var MAX_ENEMY_PROJECTILES = 120;
  var MAX_XP_ORBS = 300;
  var EVOLUTION_START_WAVE = 10;
  var RELIC_SPAWN_INTERVAL = 75;
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
    kills: document.getElementById("kills"),
    metaBonus: document.getElementById("meta-bonus")
  };
  var loadout = {
    panel: document.getElementById("loadout"),
    weapons: document.getElementById("weapon-loadout"),
    passives: document.getElementById("passive-loadout"),
    weaponCount: document.getElementById("weapon-slot-count"),
    passiveCount: document.getElementById("passive-slot-count")
  };
  var runNotice = document.getElementById("run-notice");
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
    lifetime: document.getElementById("meta-lifetime"),
    list: document.getElementById("meta-list"),
    back: document.getElementById("meta-back"),
    reset: document.getElementById("meta-reset")
  };
  var controlsBack = document.getElementById("controls-back");
  var runSummary = {
    overlay: document.getElementById("run-summary"),
    result: document.getElementById("summary-result"),
    wave: document.getElementById("summary-wave"),
    time: document.getElementById("summary-time"),
    level: document.getElementById("summary-level"),
    kills: document.getElementById("summary-kills"),
    evolutions: document.getElementById("summary-evolutions"),
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
  var ashBatSprite = new Image();
  ashBatSprite.src = "sprites/ash_bat.png";
  var ironbackBeetleSprite = new Image();
  ironbackBeetleSprite.src = "sprites/ironback_beetle.png";
  var hexAcolyteSprite = new Image();
  hexAcolyteSprite.src = "sprites/hex_acolyte.png";
  var enemySpriteMap = Object.freeze({
    rat_small: enemySmallSprite,
    rat_big: enemyBigSprite,
    ash_bat: ashBatSprite,
    ironback_beetle: ironbackBeetleSprite,
    hex_acolyte: hexAcolyteSprite
  });
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
    activeWave: 0,
    nextBossWave: 5,
    pendingLevels: 0,
    pendingStatUps: 0,
    pendingRelicRarities: [],
    comboKills: 0,
    comboExpiresAt: 0,
    comboXpMultiplier: 1,
    kills: 0,
    bossesDefeated: 0,
    evolutionCount: 0,
    stageItemsCollected: 0,
    bonusShards: 0,
    runResult: null,
    noticeText: "",
    noticeExpiresAt: 0,
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
    mightMultiplier: 1,
    cooldownMultiplier: 1,
    recovery: 0,
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
    upgrades: {},
    evolutions: {}
  };
  var entities = {
    bullets: [],
    enemies: [],
    enemyProjectiles: [],
    orbs: [],
    mines: [],
    trails: [],
    vortexes: [],
    relics: [],
    healthPacks: [],
    stageItems: [],
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
  function shuffledCopy(items, random = Math.random) {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
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

  // src/data/evolutions.js
  var evolutionDefs = [
    {
      id: "inferno_salvo",
      weaponId: "bullets",
      passiveId: "might",
      name: "Inferno Salvo",
      desc: "+50% firebolt damage and +25% fire rate.",
      apply: () => {
        player.damage *= 1.5;
        player.fireRate *= 1.25;
      }
    },
    {
      id: "glacial_crown",
      weaponId: "frost",
      passiveId: "projectile_speed",
      name: "Glacial Crown",
      desc: "+60% frost damage, +2 shards, and +3 pierce.",
      apply: () => {
        player.frostDamage *= 1.6;
        player.frostShots += 2;
        player.frostPierce += 3;
      }
    },
    {
      id: "blade_tempest",
      weaponId: "blades",
      passiveId: "area",
      name: "Blade Tempest",
      desc: "A larger, faster orbit with two additional empowered blades.",
      apply: () => {
        player.bladeDamage *= 1.6;
        player.bladeCount += 2;
        player.bladeSpeed += 0.6;
        player.bladeSize += 6;
        player.bladeRadius += 18;
      }
    },
    {
      id: "star_aegis",
      weaponId: "nova",
      passiveId: "vitality",
      name: "Star Aegis",
      desc: "+60% nova damage, +25 radius, and 20% faster casting.",
      apply: () => {
        player.novaDamage *= 1.6;
        player.novaRadius += 25;
        player.novaCooldown *= 0.8;
      }
    },
    {
      id: "tempest_lattice",
      weaponId: "chain",
      passiveId: "cooldown",
      name: "Tempest Lattice",
      desc: "+60% damage, +3 chains, +60 range, and 20% faster casting.",
      apply: () => {
        player.chainDamage *= 1.6;
        player.chainCount += 3;
        player.chainRange += 60;
        player.chainCooldown *= 0.8;
      }
    },
    {
      id: "singularity",
      weaponId: "vortex",
      passiveId: "magnet",
      name: "Singularity",
      desc: "A wider, longer gravity well with stronger damage and pull.",
      apply: () => {
        player.vortexDps *= 1.8;
        player.vortexRadius += 40;
        player.vortexDuration += 1.2;
        player.vortexPull *= 1.35;
        player.vortexCooldown *= 0.8;
      }
    }
  ];

  // src/data/upgrades.js
  var relicStatMultipliers = {
    bronze: RELIC_BRONZE_STAT_MULT,
    silver: RELIC_SILVER_STAT_MULT,
    gold: RELIC_GOLD_STAT_MULT
  };
  function getRelicStatMultiplier(rarity = "bronze") {
    return relicStatMultipliers[rarity] || relicStatMultipliers.bronze;
  }
  function formatPercent(value) {
    return Number.isInteger(value) ? value : +value.toFixed(1);
  }
  var upgradeDefs = [
    {
      id: "pulse",
      kind: "weapon",
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
      kind: "weapon",
      max: 4,
      name: "Orbiting Blades",
      desc: (lvl) => lvl === 0 ? "Unlocks orbiting blades" : lvl === 1 ? "+1 blade" : lvl === 2 ? "+1 blade, +6 damage" : "+0.4 orbit speed",
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
        }
      }
    },
    {
      id: "frost",
      kind: "weapon",
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
      kind: "weapon",
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
      kind: "weapon",
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
      kind: "weapon",
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
      kind: "weapon",
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
      kind: "weapon",
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
      kind: "weapon",
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
      kind: "weapon",
      max: 4,
      name: "Solar Orbs",
      desc: (lvl) => lvl === 0 ? "Unlocks solar orbs" : lvl === 1 ? "+1 orb" : lvl === 2 ? "+2 damage" : "+0.4 orbit speed",
      canShow: () => true,
      apply: (lvl) => {
        if (lvl === 1) player.orbUnlocked = true;
        if (lvl === 2) player.orbCount += 1;
        if (lvl === 3) player.orbDamage += 2;
        if (lvl === 4) player.orbSpeed += 0.4;
      }
    },
    {
      id: "bullets",
      kind: "weapon",
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
      kind: "passive",
      max: 3,
      name: "Magnet Field",
      desc: (lvl) => lvl === 0 ? "Unlocks orb magnetism" : "+25% pickup radius",
      canShow: () => true,
      apply: (lvl) => {
        if (lvl >= 1) player.pickupRadius = Math.round(player.pickupRadius * 1.25);
      }
    },
    {
      id: "might",
      kind: "passive",
      max: 5,
      name: "Ember Sigil",
      desc: () => "Next rank: +10% weapon damage",
      canShow: () => true,
      apply: () => {
        player.mightMultiplier = +(player.mightMultiplier * 1.1).toFixed(4);
      }
    },
    {
      id: "cooldown",
      kind: "passive",
      max: 5,
      name: "Chronicle",
      desc: () => "Next rank: -8% weapon cooldowns",
      canShow: () => true,
      apply: () => {
        player.cooldownMultiplier = +(player.cooldownMultiplier * 0.92).toFixed(4);
      }
    },
    {
      id: "vitality",
      kind: "passive",
      max: 5,
      name: "Iron Ward",
      desc: () => "Next rank: +20% max HP and heal the increase",
      canShow: () => true,
      apply: () => {
        const previousMaxHp = player.maxHp;
        player.maxHp = Math.round(player.maxHp * 1.2);
        player.hp = Math.min(player.maxHp, player.hp + player.maxHp - previousMaxHp);
      }
    },
    {
      id: "projectile_speed",
      kind: "passive",
      max: 5,
      name: "Kinetic Rune",
      desc: () => "Next rank: +12% projectile speed",
      canShow: () => true,
      apply: () => {
        player.bulletSpeed = Math.round(player.bulletSpeed * 1.12);
        player.frostSpeed = Math.round(player.frostSpeed * 1.12);
        player.starfallSpeed = Math.round(player.starfallSpeed * 1.12);
      }
    },
    {
      id: "area",
      kind: "passive",
      max: 5,
      name: "Astral Lens",
      desc: () => "Next rank: +10% effect area",
      canShow: () => true,
      apply: () => {
        player.pulseRadius *= 1.1;
        player.novaRadius *= 1.1;
        player.bladeRadius *= 1.1;
        player.bladeSize *= 1.1;
        player.mineRadius *= 1.1;
        player.trailRadius *= 1.1;
        player.vortexRadius *= 1.1;
        player.orbRadius *= 1.1;
      }
    },
    {
      id: "move_speed",
      kind: "passive",
      max: 5,
      name: "Windstep Boots",
      desc: () => "Next rank: +8% move speed",
      canShow: () => true,
      apply: () => {
        player.speed = Math.round(player.speed * 1.08);
      }
    },
    {
      id: "recovery",
      kind: "passive",
      max: 5,
      name: "Mending Charm",
      desc: () => "Next rank: +0.35 HP recovery per second",
      canShow: () => true,
      apply: () => {
        player.recovery += 0.35;
      }
    }
  ];
  var statUpgrades = [
    {
      name: "Heavy Rounds",
      desc: (rarity = "bronze") => {
        const percent = formatPercent(25 * getRelicStatMultiplier(rarity));
        return `+${percent}% all weapon damage`;
      },
      apply: (rarity = "bronze") => {
        const mult = getRelicStatMultiplier(rarity);
        player.mightMultiplier = +(player.mightMultiplier * (1 + 0.25 * mult)).toFixed(4);
      }
    },
    {
      name: "Overclock",
      desc: (rarity = "bronze") => {
        const percent = formatPercent(20 * getRelicStatMultiplier(rarity));
        return `+${percent}% attack speed`;
      },
      apply: (rarity = "bronze") => {
        const mult = getRelicStatMultiplier(rarity);
        player.cooldownMultiplier = +(player.cooldownMultiplier / (1 + 0.2 * mult)).toFixed(4);
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
        return `+${percent}% projectile speed`;
      },
      apply: (rarity = "bronze") => {
        const mult = getRelicStatMultiplier(rarity);
        const speedMultiplier = 1 + 0.2 * mult;
        player.bulletSpeed = Math.round(player.bulletSpeed * speedMultiplier);
        player.frostSpeed = Math.round(player.frostSpeed * speedMultiplier);
        player.starfallSpeed = Math.round(player.starfallSpeed * speedMultiplier);
      }
    }
  ];

  // src/data/waves.js
  function enemyMix(entries) {
    return Object.freeze(entries.map((entry) => Object.freeze({ ...entry })));
  }
  var RAT_ONLY = enemyMix([{ id: "rat", weight: 1 }]);
  var BAT_INTRO = enemyMix([
    { id: "rat", weight: 0.78 },
    { id: "ash_bat", weight: 0.22 }
  ]);
  var BEETLE_INTRO = enemyMix([
    { id: "rat", weight: 0.64 },
    { id: "ash_bat", weight: 0.22 },
    { id: "ironback_beetle", weight: 0.14 }
  ]);
  var ACOLYTE_INTRO = enemyMix([
    { id: "rat", weight: 0.58 },
    { id: "ash_bat", weight: 0.2 },
    { id: "ironback_beetle", weight: 0.14 },
    { id: "hex_acolyte", weight: 0.08 }
  ]);
  var MID_STAGE = enemyMix([
    { id: "rat", weight: 0.52 },
    { id: "ash_bat", weight: 0.2 },
    { id: "ironback_beetle", weight: 0.16 },
    { id: "hex_acolyte", weight: 0.12 }
  ]);
  var LATE_STAGE = enemyMix([
    { id: "rat", weight: 0.5 },
    { id: "ash_bat", weight: 0.19 },
    { id: "ironback_beetle", weight: 0.17 },
    { id: "hex_acolyte", weight: 0.14 }
  ]);
  var FINAL_STAGE = enemyMix([
    { id: "rat", weight: 0.5 },
    { id: "ash_bat", weight: 0.18 },
    { id: "ironback_beetle", weight: 0.16 },
    { id: "hex_acolyte", weight: 0.16 }
  ]);
  var BAT_SURGE = enemyMix([
    { id: "rat", weight: 0.4 },
    { id: "ash_bat", weight: 0.6 }
  ]);
  var BEETLE_SURGE = enemyMix([
    { id: "rat", weight: 0.45 },
    { id: "ash_bat", weight: 0.1 },
    { id: "ironback_beetle", weight: 0.45 }
  ]);
  var ACOLYTE_SURGE = enemyMix([
    { id: "rat", weight: 0.42 },
    { id: "ash_bat", weight: 0.12 },
    { id: "ironback_beetle", weight: 0.16 },
    { id: "hex_acolyte", weight: 0.3 }
  ]);
  var waveDefs = [
    { minAlive: 12, spawnInterval: 0.95, tier2Chance: 0.05, enemyMix: RAT_ONLY },
    {
      minAlive: 18,
      spawnInterval: 0.82,
      tier2Chance: 0.08,
      enemyMix: BAT_INTRO,
      event: {
        count: 6,
        speedMultiplier: 1.35,
        hpMultiplier: 0.8,
        enemyMix: BAT_SURGE
      }
    },
    { minAlive: 24, spawnInterval: 0.72, tier2Chance: 0.12, enemyMix: BAT_INTRO },
    {
      minAlive: 30,
      spawnInterval: 0.62,
      tier2Chance: 0.15,
      enemyMix: BAT_INTRO,
      event: { count: 10, speedMultiplier: 1.2, enemyMix: BAT_SURGE }
    },
    { minAlive: 34, spawnInterval: 0.58, tier2Chance: 0.18, enemyMix: BEETLE_INTRO },
    { minAlive: 38, spawnInterval: 0.52, tier2Chance: 0.2, enemyMix: BEETLE_INTRO },
    {
      minAlive: 44,
      spawnInterval: 0.48,
      tier2Chance: 0.22,
      enemyMix: BEETLE_INTRO,
      event: {
        count: 12,
        speedMultiplier: 1.4,
        hpMultiplier: 0.82,
        enemyMix: BAT_SURGE
      }
    },
    { minAlive: 50, spawnInterval: 0.44, tier2Chance: 0.24, enemyMix: ACOLYTE_INTRO },
    { minAlive: 56, spawnInterval: 0.4, tier2Chance: 0.26, enemyMix: ACOLYTE_INTRO },
    {
      minAlive: 62,
      spawnInterval: 0.36,
      tier2Chance: 0.28,
      enemyMix: ACOLYTE_INTRO,
      event: {
        count: 14,
        hpMultiplier: 1.15,
        speedMultiplier: 0.9,
        enemyMix: BEETLE_SURGE
      }
    },
    {
      minAlive: 85,
      spawnInterval: 0.24,
      tier2Chance: 0.05,
      hpMultiplier: 0.65,
      speedMultiplier: 1.12,
      enemyMix: MID_STAGE,
      event: {
        count: 26,
        hpMultiplier: 0.55,
        speedMultiplier: 1.25,
        enemyMix: BAT_SURGE
      }
    },
    { minAlive: 70, spawnInterval: 0.32, tier2Chance: 0.3, enemyMix: MID_STAGE },
    { minAlive: 76, spawnInterval: 0.3, tier2Chance: 0.32, enemyMix: MID_STAGE },
    {
      minAlive: 82,
      spawnInterval: 0.28,
      tier2Chance: 0.34,
      enemyMix: MID_STAGE,
      event: { count: 16, speedMultiplier: 1.35, enemyMix: ACOLYTE_SURGE }
    },
    { minAlive: 90, spawnInterval: 0.26, tier2Chance: 0.36, enemyMix: MID_STAGE },
    { minAlive: 96, spawnInterval: 0.24, tier2Chance: 0.38, enemyMix: LATE_STAGE },
    {
      minAlive: 105,
      spawnInterval: 0.22,
      tier2Chance: 0.4,
      enemyMix: LATE_STAGE,
      event: {
        count: 20,
        hpMultiplier: 1.2,
        speedMultiplier: 0.92,
        enemyMix: BEETLE_SURGE
      }
    },
    { minAlive: 115, spawnInterval: 0.21, tier2Chance: 0.42, enemyMix: LATE_STAGE },
    { minAlive: 125, spawnInterval: 0.2, tier2Chance: 0.44, enemyMix: FINAL_STAGE },
    {
      minAlive: 140,
      spawnInterval: 0.18,
      tier2Chance: 0.46,
      enemyMix: FINAL_STAGE,
      event: {
        count: 24,
        speedMultiplier: 1.3,
        hpMultiplier: 1.1,
        enemyMix: ACOLYTE_SURGE
      }
    }
  ];
  function getWaveNumber(elapsed, waveDuration) {
    const wave = Math.floor(Math.max(0, elapsed) / waveDuration) + 1;
    return Math.min(STAGE_WAVE_COUNT, Math.max(1, wave));
  }
  function getWaveConfig(wave) {
    return waveDefs[Math.min(waveDefs.length, Math.max(1, wave)) - 1];
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

  // src/data/enemyArchetypes.js
  var enemyArchetypes = Object.freeze({
    rat: Object.freeze({
      id: "rat",
      spriteKey: "rat_small",
      hpMultiplier: 1,
      speedMultiplier: 1,
      damageMultiplier: 1,
      radiusDelta: 0,
      xpBonus: 0,
      behavior: "seek"
    }),
    ash_bat: Object.freeze({
      id: "ash_bat",
      spriteKey: "ash_bat",
      hpMultiplier: 0.68,
      speedMultiplier: 1.34,
      damageMultiplier: 0.8,
      radiusDelta: -2,
      xpBonus: 1,
      behavior: "swoop"
    }),
    ironback_beetle: Object.freeze({
      id: "ironback_beetle",
      spriteKey: "ironback_beetle",
      hpMultiplier: 2.15,
      speedMultiplier: 0.65,
      damageMultiplier: 1.25,
      radiusDelta: 3,
      xpBonus: 4,
      behavior: "charge"
    }),
    hex_acolyte: Object.freeze({
      id: "hex_acolyte",
      spriteKey: "hex_acolyte",
      hpMultiplier: 0.9,
      speedMultiplier: 0.78,
      damageMultiplier: 0.9,
      radiusDelta: 0,
      xpBonus: 3,
      behavior: "kite"
    })
  });
  function getEnemyArchetype(id) {
    return enemyArchetypes[id] || enemyArchetypes.rat;
  }
  function chooseEnemyArchetype(enemyMix2) {
    if (!Array.isArray(enemyMix2) || enemyMix2.length === 0) {
      return enemyArchetypes.rat;
    }
    const weightedArchetypes = enemyMix2.map((entry) => ({
      archetype: enemyArchetypes[entry?.id],
      weight: Number(entry?.weight)
    })).filter((entry) => entry.archetype && Number.isFinite(entry.weight) && entry.weight > 0);
    const totalWeight = weightedArchetypes.reduce((total, entry) => total + entry.weight, 0);
    if (totalWeight <= 0) return enemyArchetypes.rat;
    let roll = Math.random() * totalWeight;
    for (const entry of weightedArchetypes) {
      roll -= entry.weight;
      if (roll < 0) return entry.archetype;
    }
    return weightedArchetypes[weightedArchetypes.length - 1].archetype;
  }

  // src/data/stageItems.js
  var stageItemDefs = [
    {
      upgradeId: "might",
      name: "Ember Sigil",
      x: 300,
      y: 260,
      color: "#e7683f",
      glyph: "\u2726"
    },
    {
      upgradeId: "cooldown",
      name: "Chronicle",
      x: 2100,
      y: 260,
      color: "#7cb7e8",
      glyph: "\u2301"
    },
    {
      upgradeId: "vitality",
      name: "Iron Ward",
      x: 300,
      y: 1340,
      color: "#78c993",
      glyph: "\u25C6"
    },
    {
      upgradeId: "area",
      name: "Astral Lens",
      x: 2100,
      y: 1340,
      color: "#bd8cf4",
      glyph: "\u25C9"
    }
  ];

  // src/systems/world/spawning.js
  var eliteAffixes = ["fast", "tank", "volatile", "leech"];
  function randomEliteAffix() {
    return eliteAffixes[Math.floor(Math.random() * eliteAffixes.length)];
  }
  function randomAbilityCooldown(behavior) {
    if (behavior === "swoop") return 0.8 + Math.random() * 0.8;
    if (behavior === "charge") return 1.5 + Math.random() * 1.2;
    if (behavior === "kite") return 1 + Math.random() * 1.1;
    return 0;
  }
  function getEdgeSpawnPoint(margin) {
    const edge = Math.floor(Math.random() * 4);
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
    return {
      x: Math.max(0, Math.min(WORLD_WIDTH, x)),
      y: Math.max(0, Math.min(WORLD_HEIGHT, y))
    };
  }
  function rollRelicRarity() {
    const total = RELIC_GOLD_CHANCE + RELIC_SILVER_CHANCE + RELIC_BRONZE_CHANCE;
    const roll = Math.random() * total;
    if (roll < RELIC_GOLD_CHANCE) return "gold";
    if (roll < RELIC_GOLD_CHANCE + RELIC_SILVER_CHANCE) return "silver";
    return "bronze";
  }
  function addOrb(x, y, value) {
    if (entities.orbs.length >= MAX_XP_ORBS) {
      const overflowOrb = entities.orbs.find((orb) => orb.isOverflow) || entities.orbs[0];
      overflowOrb.value += value;
      overflowOrb.isOverflow = true;
      overflowOrb.r = Math.min(10, 7 + Math.log10(Math.max(1, overflowOrb.value)));
      return;
    }
    entities.orbs.push({
      x,
      y,
      baseY: y,
      bob: 0,
      r: 6,
      value,
      drift: Math.random() * Math.PI * 2,
      isOverflow: false
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
      rarity: rollRelicRarity(),
      source: "world",
      canEvolve: false
    });
  }
  function addRelicAt(x, y, rarity = null, source = "world", canEvolve = false) {
    entities.relics.push({
      x: Math.max(40, Math.min(WORLD_WIDTH - 40, x)),
      y: Math.max(40, Math.min(WORLD_HEIGHT - 40, y)),
      r: 10,
      wobble: Math.random() * Math.PI * 2,
      rarity: rarity || rollRelicRarity(),
      source,
      canEvolve
    });
  }
  function spawnStageItems() {
    entities.stageItems.length = 0;
    for (const definition of stageItemDefs) {
      entities.stageItems.push({
        ...definition,
        r: 14,
        wobble: Math.random() * Math.PI * 2
      });
    }
  }
  function createEnemy(x, y, options = {}) {
    const wave = Math.floor(state.elapsed / state.waveDuration) + 1;
    const archetype = options.forcedArchetype ? getEnemyArchetype(options.forcedArchetype) : chooseEnemyArchetype(options.enemyMix);
    const tierChance = options.tier2Chance ?? Math.min(0.15 + wave * 0.01, 0.4);
    const tier = options.forcedTier || (Math.random() < tierChance ? 2 : 1);
    const eliteChance = Math.min(ELITE_MAX_CHANCE, ELITE_BASE_CHANCE + wave * ELITE_WAVE_BONUS);
    const isElite = options.forcedElite === void 0 ? Boolean(options.forcedAffix) || Math.random() < eliteChance : Boolean(options.forcedElite);
    const affix = isElite ? options.forcedAffix || randomEliteAffix() : null;
    const baseHp = tier === 2 ? 70 : 40;
    const baseSpeed = tier === 2 ? 70 : 90;
    let hp = Math.round(
      (baseHp + wave * 8) * archetype.hpMultiplier * (options.hpMultiplier ?? 1)
    );
    let speed = (baseSpeed + wave * 4) * archetype.speedMultiplier * (options.speedMultiplier ?? 1);
    let r = (tier === 2 ? 16 : 12) + archetype.radiusDelta;
    const damage = (tier === 2 ? 18 : 12) * archetype.damageMultiplier * (options.damageMultiplier ?? 1);
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
    const enemy = {
      x: Math.max(0, Math.min(WORLD_WIDTH, x)),
      y: Math.max(0, Math.min(WORLD_HEIGHT, y)),
      r,
      hp,
      maxHp: hp,
      speed,
      damage,
      tier,
      archetype: archetype.id,
      spriteKey: archetype.id === "rat" && tier === 2 ? "rat_big" : archetype.spriteKey,
      behavior: archetype.behavior,
      xpValue: (tier === 2 ? 12 : 8) + archetype.xpBonus,
      isElite,
      affix,
      elitePulse: Math.random() * Math.PI * 2,
      behaviorAge: 0,
      behaviorPhase: "seek",
      phaseTimer: 0,
      abilityCooldown: randomAbilityCooldown(archetype.behavior),
      chargeX: 0,
      chargeY: 0,
      chargeHit: false,
      strafeDirection: Math.random() < 0.5 ? -1 : 1,
      vx: 0,
      vy: 0,
      knockX: 0,
      knockY: 0,
      shockTimer: 0,
      bladeHitTimer: 0,
      orbHitTimer: 0,
      eventSpawn: Boolean(options.eventSpawn)
    };
    entities.enemies.push(enemy);
    return enemy;
  }
  function spawnEnemy(options = {}) {
    const position = getEdgeSpawnPoint(120);
    return createEnemy(position.x, position.y, options);
  }
  function spawnEnemyAt(x, y, options = {}) {
    return createEnemy(Number(x) || 0, Number(y) || 0, options);
  }
  function spawnEnemyPack(count, options = {}) {
    for (let i = 0; i < count; i += 1) spawnEnemy(options);
  }
  function spawnMiniBoss(wave) {
    const { x, y } = getEdgeSpawnPoint(140);
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
      archetype: "rat",
      spriteKey: "rat_big",
      behavior: "seek",
      isElite: false,
      affix: null,
      elitePulse: 0,
      behaviorAge: 0,
      behaviorPhase: "seek",
      phaseTimer: 0,
      abilityCooldown: 0,
      chargeX: 0,
      chargeY: 0,
      chargeHit: false,
      strafeDirection: 1,
      isBoss: true,
      bossWave: wave,
      chestCanEvolve: wave >= EVOLUTION_START_WAVE,
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

  // src/core/testApi.js
  var ENEMY_TYPE_KEYS = [
    "rat_small",
    "rat_big",
    "ash_bat",
    "ironback_beetle",
    "hex_acolyte"
  ];
  function getEnemyType(enemy) {
    return enemy.spriteKey || (enemy.tier === 2 ? "rat_big" : "rat_small");
  }
  function getEnemyTypeCounts() {
    const counts = Object.fromEntries(ENEMY_TYPE_KEYS.map((key) => [key, 0]));
    for (const enemy of entities.enemies) {
      const type = getEnemyType(enemy);
      counts[type] = (counts[type] || 0) + 1;
    }
    return counts;
  }
  function getEnemyBehaviorSample() {
    return entities.enemies.filter((enemy) => !getEnemyType(enemy).startsWith("rat_")).slice(0, 3).map((enemy) => ({
      type: getEnemyType(enemy),
      phase: enemy.behaviorPhase || "seek",
      timer: +(enemy.phaseTimer || 0).toFixed(2),
      cooldown: +(enemy.abilityCooldown || 0).toFixed(2),
      charge: [
        +(enemy.chargeX || 0).toFixed(2),
        +(enemy.chargeY || 0).toFixed(2)
      ]
    }));
  }
  function snapshot() {
    return {
      screen: state.screen,
      running: state.running,
      paused: state.paused,
      elapsed: +state.elapsed.toFixed(2),
      wave: getWaveNumber(state.elapsed, state.waveDuration),
      result: state.runResult,
      kills: state.kills,
      bossesDefeated: state.bossesDefeated,
      bonusShards: state.bonusShards,
      evolutions: { ...player.evolutions },
      evolutionCount: state.evolutionCount,
      player: {
        x: +player.x.toFixed(1),
        y: +player.y.toFixed(1),
        hp: +player.hp.toFixed(1),
        maxHp: player.maxHp,
        level: player.level,
        upgrades: { ...player.upgrades }
      },
      entities: {
        enemies: entities.enemies.length,
        enemyTypes: getEnemyTypeCounts(),
        enemyProjectiles: (entities.enemyProjectiles || []).length,
        enemyBehaviorSample: getEnemyBehaviorSample(),
        bosses: entities.enemies.filter((enemy) => enemy.isBoss).length,
        orbs: entities.orbs.length,
        relics: entities.relics.length,
        bossCaches: entities.relics.filter((relic) => relic.source === "boss").length,
        evolutionCaches: entities.relics.filter(
          (relic) => relic.source === "boss" && relic.canEvolve
        ).length,
        stageItems: entities.stageItems.length,
        bullets: entities.bullets.length
      }
    };
  }
  function grantUpgrade(id, levels = 1) {
    const option = upgradeDefs.find((entry) => entry.id === id);
    if (!option) throw new Error(`Unknown upgrade: ${id}`);
    const count = Math.max(0, Math.floor(levels));
    for (let i = 0; i < count; i += 1) applyUpgrade(option);
    return getUpgradeLevel(id);
  }
  function readyEvolution(recipeId = "inferno_salvo") {
    const recipe = evolutionDefs.find((entry) => entry.id === recipeId);
    if (!recipe) throw new Error(`Unknown evolution: ${recipeId}`);
    const weapon = upgradeDefs.find((entry) => entry.id === recipe.weaponId);
    while (getUpgradeLevel(recipe.weaponId) < weapon.max) grantUpgrade(recipe.weaponId);
    if (getUpgradeLevel(recipe.passiveId) <= 0) grantUpgrade(recipe.passiveId);
    return recipe.id;
  }
  function installTestApi({ startRun: startRun2 }) {
    const params = new URLSearchParams(window.location.search);
    if (params.get("test") !== "1") return;
    const api = Object.freeze({
      start: startRun2,
      snapshot,
      grantUpgrade,
      readyEvolution,
      dropBossChest({ rarity = "silver", canEvolve = true } = {}) {
        addRelicAt(player.x, player.y, rarity, "boss", canEvolve);
      },
      spawnBoss(wave = 10) {
        spawnMiniBoss(Math.max(1, Math.floor(wave)));
      },
      spawnEnemyType(type, { x = player.x + 180, y = player.y, elite = false, affix = null } = {}) {
        return spawnEnemyAt(Number(x), Number(y), {
          forcedArchetype: type,
          forcedElite: Boolean(elite),
          forcedAffix: affix
        });
      },
      defeatBosses() {
        for (const enemy of entities.enemies) {
          if (enemy.isBoss) enemy.hp = 0;
        }
      },
      clearEnemies() {
        entities.enemies.length = 0;
        entities.enemyProjectiles.length = 0;
      },
      teleport(x, y) {
        player.x = Number(x);
        player.y = Number(y);
      },
      teleportToStageItem(upgradeId) {
        const item = entities.stageItems.find((entry) => entry.upgradeId === upgradeId);
        if (!item) return false;
        player.x = item.x;
        player.y = item.y;
        return true;
      },
      setElapsed(seconds) {
        state.elapsed = Math.max(0, Math.min(STAGE_DURATION, Number(seconds) || 0));
      },
      setHp(hp) {
        player.hp = Math.min(player.maxHp, Number(hp) || 0);
      }
    });
    window.__arcaneTest = api;
    window.render_game_to_text = () => JSON.stringify(snapshot());
    document.documentElement.dataset.testApi = "ready";
    const panel = document.createElement("aside");
    panel.id = "test-tools";
    panel.setAttribute("aria-label", "Test controls");
    const actions = [
      ["test-start", "Start", () => startRun2()],
      ["test-level-up", "Grant Level", () => gainXp(player.nextXp)],
      ["test-ready-inferno", "Ready Inferno", () => readyEvolution("inferno_salvo")],
      ["test-drop-chest", "Drop Evo Cache", () => api.dropBossChest()],
      ["test-stage-might", "Collect Ember", () => api.teleportToStageItem("might")],
      ["test-spawn-boss", "Spawn Evo Boss", () => api.spawnBoss(10)],
      [
        "test-enemy-roster",
        "Spawn Enemy Roster",
        () => {
          entities.enemies.length = 0;
          entities.enemyProjectiles.length = 0;
          entities.bullets.length = 0;
          player.maxHp = Math.max(player.maxHp, 1e4);
          player.hp = player.maxHp;
          player.damage = 0;
          state.elapsed = 0;
          state.waveDuration = STAGE_DURATION;
          state.activeWave = getWaveNumber(state.elapsed, state.waveDuration);
          timers.spawn = 9999;
          api.spawnEnemyType("ash_bat", {
            x: player.x + 150,
            y: player.y - 90
          });
          api.spawnEnemyType("ironback_beetle", {
            x: player.x + 190,
            y: player.y
          });
          api.spawnEnemyType("hex_acolyte", {
            x: player.x + 150,
            y: player.y + 90
          });
        }
      ],
      [
        "test-kill-evo-boss",
        "Kill Evo Boss",
        () => {
          api.spawnBoss(10);
          api.defeatBosses();
        }
      ],
      ["test-defeat-bosses", "Defeat Bosses", () => api.defeatBosses()],
      [
        "test-horde",
        "Jump to Horde",
        () => {
          player.maxHp = 1e4;
          player.hp = player.maxHp;
          api.setElapsed(10 * state.waveDuration);
        }
      ],
      ["test-victory", "Jump to Victory", () => api.setElapsed(STAGE_DURATION - 0.02)]
    ];
    for (const [testId, label, action] of actions) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.testid = testId;
      button.textContent = label;
      button.addEventListener("click", action);
      panel.appendChild(button);
    }
    const output = document.createElement("pre");
    output.dataset.testid = "test-snapshot";
    panel.appendChild(output);
    const renderSnapshot = () => {
      output.textContent = JSON.stringify(snapshot());
    };
    renderSnapshot();
    window.setInterval(renderSnapshot, 100);
    document.body.appendChild(panel);
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
    player.level = 1;
    player.nextXp = 20;
    player.speed = 180;
    player.isMoving = false;
    player.damage = 18;
    player.fireRate = 1.2;
    player.bulletSpeed = 420;
    player.xpGainMultiplier = 1;
    player.mightMultiplier = 1;
    player.cooldownMultiplier = 1;
    player.recovery = 0;
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
    player.evolutions = {};
    entities.bullets.length = 0;
    entities.enemies.length = 0;
    entities.enemyProjectiles.length = 0;
    entities.orbs.length = 0;
    entities.mines.length = 0;
    entities.trails.length = 0;
    entities.vortexes.length = 0;
    entities.relics.length = 0;
    entities.healthPacks.length = 0;
    entities.stageItems.length = 0;
    entities.pulses.length = 0;
    entities.particles.length = 0;
    entities.chainArcs.length = 0;
    orbitCache.blades.length = 0;
    orbitCache.solars.length = 0;
    state.elapsed = 0;
    state.waveDuration = 30;
    state.activeWave = 0;
    state.paused = false;
    state.nextBossWave = BOSS_WAVE_INTERVAL;
    state.pendingLevels = 0;
    state.pendingStatUps = 0;
    state.pendingRelicRarities.length = 0;
    state.comboKills = 0;
    state.comboExpiresAt = 0;
    state.comboXpMultiplier = 1;
    state.kills = 0;
    state.bossesDefeated = 0;
    state.evolutionCount = 0;
    state.stageItemsCollected = 0;
    state.bonusShards = 0;
    state.runResult = null;
    state.noticeText = "";
    state.noticeExpiresAt = 0;
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
    timers.relic = Math.min(45, RELIC_SPAWN_INTERVAL);
  }

  // src/systems/ui/hud.js
  var lastLoadoutSignature = "";
  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }
  function formatComboText(combo) {
    if (!combo.active) return "-";
    return `K${combo.kills} x${combo.multiplier.toFixed(2)} ${combo.remaining.toFixed(1)}s`;
  }
  function getUpgradeLevel2(option) {
    const level = Number(player.upgrades?.[option.id]);
    return Number.isFinite(level) ? Math.max(0, Math.floor(level)) : 0;
  }
  function buildLoadoutItems() {
    const activeEvolutions = evolutionDefs.filter((recipe) => player.evolutions?.[recipe.id]);
    const evolutionsByWeapon = new Map(
      activeEvolutions.map((recipe) => [recipe.weaponId, recipe])
    );
    const matchedEvolutionIds = /* @__PURE__ */ new Set();
    const weapons = [];
    const passives = [];
    for (const option of upgradeDefs) {
      const level = getUpgradeLevel2(option);
      if (level <= 0) continue;
      if (option.kind === "passive") {
        passives.push({ name: option.name || option.id, level, evolved: false });
        continue;
      }
      const evolution = evolutionsByWeapon.get(option.id);
      if (evolution) {
        matchedEvolutionIds.add(evolution.id);
        weapons.push({
          name: `\u2605 ${evolution.name}`,
          level: "EVO",
          evolved: true
        });
      } else {
        weapons.push({ name: option.name || option.id, level, evolved: false });
      }
    }
    for (const evolution of activeEvolutions) {
      if (matchedEvolutionIds.has(evolution.id)) continue;
      weapons.push({
        name: `\u2605 ${evolution.name}`,
        level: "EVO",
        evolved: true
      });
    }
    return { weapons, passives };
  }
  function replaceLoadoutList(element, items) {
    if (!element) return;
    if (items.length === 0) {
      const empty = document.createElement("div");
      empty.className = "loadout-empty";
      empty.textContent = "Empty";
      element.replaceChildren(empty);
      return;
    }
    const rows = items.map((item) => {
      const row = document.createElement("div");
      row.className = `loadout-item${item.evolved ? " evolved" : ""}`;
      const name = document.createElement("span");
      name.className = "loadout-name";
      name.textContent = item.name;
      name.title = item.name;
      const level = document.createElement("span");
      level.className = "loadout-level";
      level.textContent = item.evolved ? item.level : `Lv ${item.level}`;
      row.appendChild(name);
      row.appendChild(level);
      return row;
    });
    element.replaceChildren(...rows);
  }
  function updateLoadout() {
    if (!loadout.panel) return;
    loadout.panel.classList.toggle("hidden", !state.running);
    const items = buildLoadoutItems();
    const signature = JSON.stringify(items);
    if (signature === lastLoadoutSignature) return;
    lastLoadoutSignature = signature;
    replaceLoadoutList(loadout.weapons, items.weapons);
    replaceLoadoutList(loadout.passives, items.passives);
    if (loadout.weaponCount) {
      loadout.weaponCount.textContent = `${items.weapons.length} / ${MAX_WEAPON_SLOTS}`;
    }
    if (loadout.passiveCount) {
      loadout.passiveCount.textContent = `${items.passives.length} / ${MAX_PASSIVE_SLOTS}`;
    }
  }
  function updateRunNotice() {
    if (!runNotice) return;
    const text = typeof state.noticeText === "string" ? state.noticeText.trim() : "";
    const expiresAt = Number(state.noticeExpiresAt) || 0;
    const active = Boolean(state.running && text && expiresAt > state.elapsed);
    if (runNotice.textContent !== (active ? text : "")) {
      runNotice.textContent = active ? text : "";
    }
    runNotice.classList.toggle("notice-active", active);
  }
  function updateHud() {
    const wave = getWaveNumber(state.elapsed, state.waveDuration);
    const combo = getComboSnapshot();
    hud.wave.textContent = wave;
    hud.time.textContent = formatTime(state.elapsed);
    hud.hp.textContent = `${Math.max(0, Math.round(player.hp))} / ${player.maxHp}`;
    hud.level.textContent = player.level;
    hud.xp.textContent = `${player.xp} / ${player.nextXp}`;
    if (hud.kills) hud.kills.textContent = Math.max(0, Math.floor(Number(state.kills) || 0));
    if (hud.combo) {
      hud.combo.textContent = formatComboText(combo);
      hud.combo.classList.toggle("combo-active", combo.active);
      hud.combo.classList.toggle("combo-boost", combo.multiplier > 1);
    }
    if (hud.metaBonus) hud.metaBonus.textContent = state.metaBonusText;
    updateLoadout();
    updateRunNotice();
  }

  // src/systems/progression/relicMenu.js
  var showLevelUpHandler2 = () => {
  };
  var rarityLabel = {
    bronze: "Bronze Relic",
    silver: "Silver Relic",
    gold: "Golden Relic"
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
    return shuffledCopy(statUpgrades).slice(0, 3);
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

  // src/systems/progression/build.js
  function getOwnedUpgradeCount(kind) {
    return upgradeDefs.filter(
      (option) => option.kind === kind && (player.upgrades[option.id] || 0) > 0
    ).length;
  }
  function canOfferUpgradeBySlots(option) {
    if ((player.upgrades[option.id] || 0) > 0) return true;
    if (option.kind === "passive") {
      return getOwnedUpgradeCount("passive") < MAX_PASSIVE_SLOTS;
    }
    return getOwnedUpgradeCount("weapon") < MAX_WEAPON_SLOTS;
  }
  function isWeaponEvolved(weaponId) {
    return evolutionDefs.some(
      (recipe) => recipe.weaponId === weaponId && player.evolutions[recipe.id]
    );
  }
  function getEligibleEvolutions() {
    return evolutionDefs.filter((recipe) => {
      if (player.evolutions[recipe.id]) return false;
      const weapon = upgradeDefs.find((option) => option.id === recipe.weaponId);
      if (!weapon) return false;
      const weaponLevel = player.upgrades[recipe.weaponId] || 0;
      const passiveLevel = player.upgrades[recipe.passiveId] || 0;
      return weaponLevel >= weapon.max && passiveLevel > 0;
    });
  }
  function resetEvolvedWeaponTimer(weaponId) {
    const timerKey = {
      bullets: "shoot",
      frost: "frost",
      nova: "nova",
      chain: "chain",
      vortex: "vortex"
    }[weaponId];
    if (timerKey) timers[timerKey] = 0;
  }
  function activateEvolution(recipe) {
    if (!recipe || player.evolutions[recipe.id]) return false;
    player.evolutions[recipe.id] = true;
    recipe.apply();
    resetEvolvedWeaponTimer(recipe.weaponId);
    state.evolutionCount += 1;
    return true;
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
      (option) => canApplyUpgrade(option) && canOfferUpgradeBySlots(option) && !(option.kind === "weapon" && isWeaponEvolved(option.id)) && option.canShow()
    );
    if (available.length === 0) {
      const excessLevels = Math.max(1, state.pendingLevels);
      state.pendingLevels = 0;
      state.noticeText = `Build maxed \u2014 ${excessLevels} excess level${excessLevels === 1 ? "" : "s"} restored health`;
      state.noticeExpiresAt = state.elapsed + 2.5;
      player.hp = Math.min(player.maxHp, player.hp + 10 * excessLevels);
      if (state.pendingStatUps > 0) {
        openStatUpgradeFromQueueHandler();
      } else {
        levelup.classList.add("hidden");
        state.paused = false;
      }
      return;
    }
    const shuffled = shuffledCopy(available);
    const options = shuffled.slice(0, 3);
    for (const option of options) {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      const level = getUpgradeLevel(option.id);
      const name = document.createElement("strong");
      name.textContent = option.name;
      const description = document.createElement("span");
      description.textContent = option.desc(level);
      const meta = document.createElement("span");
      meta.className = "choice-meta";
      meta.textContent = `${option.kind === "passive" ? "Passive" : "Weapon"} \u2022 ${level}/${option.max}`;
      const recipe = evolutionDefs.find(
        (entry) => option.kind === "passive" ? entry.passiveId === option.id : entry.weaponId === option.id
      );
      if (recipe) {
        const partnerId = option.kind === "passive" ? recipe.weaponId : recipe.passiveId;
        const partner = upgradeDefs.find((entry) => entry.id === partnerId);
        meta.textContent += ` \u2022 Pairs with ${partner?.name || partnerId}`;
      }
      btn.append(name, description, meta);
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
  var SAVE_VERSION = 2;
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
      victories: 0,
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
    next.victories = Math.max(0, toInt(raw.victories, 0));
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
    player.mightMultiplier *= mult.damage;
    player.cooldownMultiplier /= mult.fireRate;
    player.xpGainMultiplier = mult.xpGain;
    return mult;
  }
  function computeShardReward(elapsedSeconds, wave, victory = false, bonusShards = 0) {
    const safeElapsed = Math.max(0, elapsedSeconds);
    const safeWave = Math.max(1, wave);
    const earned = Math.floor(safeElapsed / 25) + Math.max(0, safeWave - 1) * 2;
    return Math.max(3, earned + (victory ? 20 : 0) + Math.max(0, bonusShards));
  }
  function awardRunShards(saveData2, elapsedSeconds, wave, victory = false, bonusShards = 0) {
    const earned = computeShardReward(elapsedSeconds, wave, victory, bonusShards);
    saveData2.shards += earned;
    saveData2.lifetime.runs += 1;
    saveData2.lifetime.totalTime += Math.max(0, Math.floor(elapsedSeconds));
    saveData2.lifetime.bestWave = Math.max(saveData2.lifetime.bestWave, Math.max(1, wave));
    if (victory) saveData2.lifetime.victories += 1;
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

  // src/systems/combat/scaling.js
  function scaledDamage(baseDamage) {
    return baseDamage * Math.max(0, player.mightMultiplier || 1);
  }
  function scaledCooldown(baseCooldown) {
    return Math.max(0.04, baseCooldown * Math.max(0.05, player.cooldownMultiplier || 1));
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
    const baseAngle = Math.atan2(dy, dx);
    const evolved = Boolean(player.evolutions.inferno_salvo);
    const shotCount = evolved ? 3 : 1;
    const spread = evolved ? 0.13 : 0;
    for (let i = 0; i < shotCount; i += 1) {
      const angle = baseAngle + (i - (shotCount - 1) / 2) * spread;
      entities.bullets.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(angle) * player.bulletSpeed,
        vy: Math.sin(angle) * player.bulletSpeed,
        r: evolved ? 5 : 4,
        damage: scaledDamage(player.damage),
        life: evolved ? 1.7 : 1.5,
        type: evolved ? "inferno" : "fire",
        pierce: evolved ? 2 : 1,
        hitTargets: []
      });
    }
    timers.shoot = scaledCooldown(1 / player.fireRate);
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
    const evolved = Boolean(player.evolutions.glacial_crown);
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
        damage: scaledDamage(player.frostDamage),
        life: 1.4,
        type: evolved ? "glacial" : "frost",
        pierce: player.frostPierce,
        hitTargets: []
      });
    }
    timers.frost = scaledCooldown(1 / player.frostFireRate);
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
        damage: scaledDamage(player.starfallDamage),
        life: player.starfallLife,
        type: "starfall",
        pierce: 1,
        hitTargets: []
      });
    }
    timers.starfall = scaledCooldown(player.starfallCooldown);
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
        color: bullet.type === "frost" || bullet.type === "glacial" ? "ice" : bullet.type === "starfall" ? "spark" : "fire"
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
        if (bullet.hitTargets?.includes(enemy)) continue;
        const dx = enemy.x - bullet.x;
        const dy = enemy.y - bullet.y;
        if (Math.hypot(dx, dy) < enemy.r + bullet.r) {
          enemy.hp -= bullet.damage;
          if (bullet.type === "frost" || bullet.type === "glacial") {
            enemy.shockTimer = Math.max(
              enemy.shockTimer,
              bullet.type === "glacial" ? 2.2 : 1.1
            );
          }
          if (bullet.hitTargets) bullet.hitTargets.push(enemy);
          bullet.pierce = Math.max(0, (bullet.pierce || 1) - 1);
          hit = bullet.pierce <= 0;
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
        enemy.hp -= scaledDamage(player.pulseDamage);
        enemy.shockTimer = 1.2;
        const falloff = 1 - dist / player.pulseRadius;
        const knock = player.pulseKnockback * Math.max(0.2, falloff);
        enemy.knockX += dx / dist * knock;
        enemy.knockY += dy / dist * knock;
      }
    }
  }
  function novaShockwave() {
    const evolved = Boolean(player.evolutions.star_aegis);
    entities.pulses.push({
      x: player.x,
      y: player.y,
      r: 0,
      max: player.novaRadius,
      life: 0.35,
      maxLife: 0.35,
      type: evolved ? "aegis" : "nova"
    });
    let hitCount = 0;
    for (const enemy of entities.enemies) {
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist <= player.novaRadius) {
        enemy.hp -= scaledDamage(player.novaDamage);
        hitCount += 1;
        enemy.shockTimer = 0.6;
        const falloff = 1 - dist / player.novaRadius;
        const knock = player.novaKnockback * Math.max(0.2, falloff);
        enemy.knockX += dx / dist * knock;
        enemy.knockY += dy / dist * knock;
      }
    }
    if (evolved && hitCount > 0) {
      const healing = Math.min(5, 1 + hitCount * 0.35);
      player.hp = Math.min(player.maxHp, player.hp + healing);
    }
  }
  function chainLightning() {
    if (entities.enemies.length === 0) return;
    const evolved = Boolean(player.evolutions.tempest_lattice);
    const hit = [];
    let current = nearestEnemy();
    if (!current) return;
    entities.chainArcs.push({
      x1: player.x,
      y1: player.y,
      x2: current.x,
      y2: current.y,
      life: 0.2,
      type: evolved ? "tempest" : "chain"
    });
    for (let i = 0; i < player.chainCount + 1; i += 1) {
      if (!current) break;
      current.hp -= scaledDamage(player.chainDamage);
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
          life: 0.2,
          type: evolved ? "tempest" : "chain"
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
      damage: scaledDamage(player.mineDamage),
      armTimer: player.mineArmTime,
      life: player.mineLifetime,
      maxLife: player.mineLifetime
    });
    timers.mines = scaledCooldown(player.mineCooldown);
  }
  function castGravityWell(dt) {
    timers.vortex -= dt;
    if (timers.vortex > 0) return;
    const target = nearestEnemy();
    if (!target) return;
    const evolved = Boolean(player.evolutions.singularity);
    entities.vortexes.push({
      x: target.x,
      y: target.y,
      r: player.vortexRadius,
      life: player.vortexDuration,
      maxLife: player.vortexDuration,
      dps: scaledDamage(player.vortexDps),
      pull: player.vortexPull,
      type: evolved ? "singularity" : "vortex"
    });
    entities.pulses.push({
      x: target.x,
      y: target.y,
      r: 0,
      max: Math.max(26, player.vortexRadius * 0.35),
      life: 0.24,
      maxLife: 0.24,
      type: evolved ? "singularity" : "vortex"
    });
    timers.vortex = scaledCooldown(player.vortexCooldown);
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

  // src/systems/world/enemyProjectiles.js
  function spawnEnemyProjectile(projectile) {
    if (entities.enemyProjectiles.length >= MAX_ENEMY_PROJECTILES) return false;
    const x = Number(projectile.x);
    const y = Number(projectile.y);
    const vx = Number(projectile.vx);
    const vy = Number(projectile.vy);
    if (![x, y, vx, vy].every(Number.isFinite)) return false;
    entities.enemyProjectiles.push({
      x,
      y,
      vx,
      vy,
      r: Number.isFinite(projectile.r) ? Math.max(1, projectile.r) : 5,
      damage: Number.isFinite(projectile.damage) ? Math.max(0, projectile.damage) : 0,
      life: Number.isFinite(projectile.life) ? Math.max(0.05, projectile.life) : 3,
      type: projectile.type || "enemy",
      color: projectile.color || "#b86cff"
    });
    return true;
  }
  function updateEnemyProjectiles(dt) {
    const step = Number.isFinite(dt) ? Math.max(0, dt) : 0;
    if (entities.enemyProjectiles.length > MAX_ENEMY_PROJECTILES) {
      entities.enemyProjectiles.splice(
        0,
        entities.enemyProjectiles.length - MAX_ENEMY_PROJECTILES
      );
    }
    for (let i = entities.enemyProjectiles.length - 1; i >= 0; i -= 1) {
      const projectile = entities.enemyProjectiles[i];
      projectile.life = Number.isFinite(projectile.life) ? projectile.life - step : 0;
      projectile.x += projectile.vx * step;
      projectile.y += projectile.vy * step;
      const radius = Number.isFinite(projectile.r) ? Math.max(1, projectile.r) : 1;
      const outOfBounds = projectile.x < -radius || projectile.x > WORLD_WIDTH + radius || projectile.y < -radius || projectile.y > WORLD_HEIGHT + radius;
      const invalid = !Number.isFinite(projectile.x) || !Number.isFinite(projectile.y) || !Number.isFinite(projectile.vx) || !Number.isFinite(projectile.vy);
      if (projectile.life <= 0 || outOfBounds || invalid) {
        entities.enemyProjectiles.splice(i, 1);
        continue;
      }
      const dx = player.x - projectile.x;
      const dy = player.y - projectile.y;
      if (Math.hypot(dx, dy) <= player.r + radius) {
        player.hp -= Number.isFinite(projectile.damage) ? Math.max(0, projectile.damage) : 0;
        entities.enemyProjectiles.splice(i, 1);
      }
    }
  }

  // src/systems/world/enemies.js
  var enemyQuadtree = createQuadtree({
    x: 0,
    y: 0,
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT
  });
  var nearbyEnemies = [];
  var BAT_WINDUP_TIME = 0.25;
  var BAT_SWOOP_TIME = 0.45;
  var BEETLE_WINDUP_TIME = 0.65;
  var BEETLE_CHARGE_TIME = 0.65;
  var HEX_MIN_RANGE = 170;
  var HEX_MAX_RANGE = 250;
  function finiteOr(value, fallback = 0) {
    return Number.isFinite(value) ? value : fallback;
  }
  function setLockedDirection(enemy, dx, dy, dist) {
    if (dist > 1e-3) {
      enemy.chargeX = dx / dist;
      enemy.chargeY = dy / dist;
      return;
    }
    const velocityLength = Math.hypot(enemy.vx, enemy.vy);
    enemy.chargeX = velocityLength > 1e-3 ? enemy.vx / velocityLength : 1;
    enemy.chargeY = velocityLength > 1e-3 ? enemy.vy / velocityLength : 0;
  }
  function sanitizeEnemyState(enemy) {
    enemy.vx = finiteOr(enemy.vx);
    enemy.vy = finiteOr(enemy.vy);
    enemy.knockX = finiteOr(enemy.knockX);
    enemy.knockY = finiteOr(enemy.knockY);
    enemy.shockTimer = Math.max(0, finiteOr(enemy.shockTimer));
    enemy.bladeHitTimer = finiteOr(enemy.bladeHitTimer);
    enemy.orbHitTimer = finiteOr(enemy.orbHitTimer);
    enemy.elitePulse = finiteOr(enemy.elitePulse);
    enemy.bossPulse = finiteOr(enemy.bossPulse);
    enemy.behaviorAge = Math.max(0, finiteOr(enemy.behaviorAge));
    enemy.behaviorPhase = typeof enemy.behaviorPhase === "string" ? enemy.behaviorPhase : "seek";
    enemy.phaseTimer = Math.max(0, finiteOr(enemy.phaseTimer));
    enemy.abilityCooldown = Math.max(0, finiteOr(enemy.abilityCooldown));
    enemy.chargeX = finiteOr(enemy.chargeX);
    enemy.chargeY = finiteOr(enemy.chargeY);
    enemy.chargeHit = Boolean(enemy.chargeHit);
    enemy.strafeDirection = enemy.strafeDirection === -1 ? -1 : 1;
  }
  function beginLockedAttack(enemy, phase, duration, dx, dy, dist) {
    setLockedDirection(enemy, dx, dy, dist);
    enemy.behaviorPhase = phase;
    enemy.phaseTimer = duration;
    enemy.chargeHit = false;
  }
  function ashBatMovement(enemy, dx, dy, dist, speed, slow, sepVX, sepVY, dt) {
    enemy.behaviorAge += dt;
    if (!["seek", "windup", "swoop"].includes(enemy.behaviorPhase)) {
      enemy.behaviorPhase = "seek";
    }
    if (enemy.behaviorPhase === "seek") {
      enemy.abilityCooldown -= dt;
      if (enemy.abilityCooldown <= 0) {
        beginLockedAttack(enemy, "windup", BAT_WINDUP_TIME, dx, dy, dist);
      }
    } else {
      enemy.phaseTimer -= dt;
      if (enemy.phaseTimer <= 0) {
        if (enemy.behaviorPhase === "windup") {
          enemy.behaviorPhase = "swoop";
          enemy.phaseTimer = BAT_SWOOP_TIME;
        } else {
          enemy.behaviorPhase = "seek";
          enemy.phaseTimer = 0;
          enemy.abilityCooldown = 1.35 + Math.random() * 0.65;
        }
      }
    }
    if (enemy.behaviorPhase === "swoop") {
      return {
        direct: true,
        vx: enemy.chargeX * speed * 2.5 * slow,
        vy: enemy.chargeY * speed * 2.5 * slow
      };
    }
    if (enemy.behaviorPhase === "windup") {
      return {
        steer: 10,
        vx: -enemy.chargeX * speed * 0.18 * slow + sepVX * 0.3,
        vy: -enemy.chargeY * speed * 0.18 * slow + sepVY * 0.3
      };
    }
    const towardX = dx / dist;
    const towardY = dy / dist;
    const weave = Math.sin(enemy.behaviorAge * 7.5) * speed * 0.55 * slow;
    return {
      steer: 7,
      vx: towardX * speed * slow - towardY * weave + sepVX,
      vy: towardY * speed * slow + towardX * weave + sepVY
    };
  }
  function emitBeetleWindup(enemy) {
    if (entities.particles.length >= 600) return;
    for (let p = 0; p < 2; p += 1) {
      const angle = Math.random() * Math.PI * 2;
      entities.particles.push({
        x: enemy.x + Math.cos(angle) * enemy.r,
        y: enemy.y + Math.sin(angle) * enemy.r,
        vx: Math.cos(angle) * 28,
        vy: Math.sin(angle) * 28,
        r: 2 + Math.random() * 1.5,
        life: 0.35,
        color: "spark"
      });
    }
  }
  function ironbackMovement(enemy, dx, dy, dist, speed, slow, sepVX, sepVY, dt) {
    enemy.behaviorAge += dt;
    enemy.telegraphTimer = finiteOr(enemy.telegraphTimer);
    if (!["seek", "windup", "charge"].includes(enemy.behaviorPhase)) {
      enemy.behaviorPhase = "seek";
    }
    if (enemy.behaviorPhase === "seek") {
      enemy.abilityCooldown -= dt;
      if (enemy.abilityCooldown <= 0) {
        beginLockedAttack(enemy, "windup", BEETLE_WINDUP_TIME, dx, dy, dist);
        enemy.telegraphTimer = 0;
      }
    } else {
      enemy.phaseTimer -= dt;
      if (enemy.behaviorPhase === "windup") {
        enemy.telegraphTimer -= dt;
        if (enemy.telegraphTimer <= 0) {
          emitBeetleWindup(enemy);
          enemy.telegraphTimer = 0.12;
        }
      }
      if (enemy.phaseTimer <= 0) {
        if (enemy.behaviorPhase === "windup") {
          enemy.behaviorPhase = "charge";
          enemy.phaseTimer = BEETLE_CHARGE_TIME;
          enemy.chargeHit = false;
        } else {
          enemy.behaviorPhase = "seek";
          enemy.phaseTimer = 0;
          enemy.abilityCooldown = 2.15 + Math.random() * 0.7;
        }
      }
    }
    if (enemy.behaviorPhase === "charge") {
      return {
        direct: true,
        vx: enemy.chargeX * speed * 3.6 * slow,
        vy: enemy.chargeY * speed * 3.6 * slow
      };
    }
    if (enemy.behaviorPhase === "windup") {
      return {
        steer: 12,
        vx: sepVX * 0.2,
        vy: sepVY * 0.2
      };
    }
    return {
      steer: 5,
      vx: dx / dist * speed * 0.58 * slow + sepVX,
      vy: dy / dist * speed * 0.58 * slow + sepVY
    };
  }
  function fireHexBolt(enemy, dx, dy, dist) {
    const projectileSpeed = 210;
    const spawned = spawnEnemyProjectile({
      x: enemy.x,
      y: enemy.y,
      vx: dx / dist * projectileSpeed,
      vy: dy / dist * projectileSpeed,
      r: 5,
      damage: Math.max(5, finiteOr(enemy.projectileDamage, enemy.damage * 0.55)),
      life: 3.2,
      type: "hex_bolt",
      color: "#b86cff"
    });
    enemy.abilityCooldown = spawned ? 1.85 + Math.random() * 0.3 : 0.25;
  }
  function hexAcolyteMovement(enemy, dx, dy, dist, speed, slow, sepVX, sepVY, dt) {
    enemy.behaviorAge += dt;
    enemy.behaviorPhase = "kite";
    enemy.strafeTimer = finiteOr(enemy.strafeTimer, 1.4) - dt;
    if (enemy.strafeTimer <= 0) {
      enemy.strafeDirection *= -1;
      enemy.strafeTimer = 1.35 + Math.random() * 1.1;
    }
    enemy.abilityCooldown -= dt;
    if (enemy.abilityCooldown <= 0 && dist <= 480) {
      fireHexBolt(enemy, dx, dy, dist);
    }
    const towardX = dx / dist;
    const towardY = dy / dist;
    let radial = (dist - 210) / 40 * speed * 0.38;
    if (dist < HEX_MIN_RANGE) radial = -speed * 0.92;
    else if (dist > HEX_MAX_RANGE) radial = speed * 0.82;
    const strafe = speed * 0.62 * enemy.strafeDirection;
    return {
      steer: 6,
      vx: (towardX * radial - towardY * strafe) * slow + sepVX,
      vy: (towardY * radial + towardX * strafe) * slow + sepVY
    };
  }
  function movementForEnemy(enemy, dx, dy, dist, sepX, sepY, slow, dt) {
    const speed = Math.max(0, finiteOr(enemy.speed));
    const sepVX = sepX * ENEMY_SEP_FORCE;
    const sepVY = sepY * ENEMY_SEP_FORCE;
    if (enemy.archetype === "ash_bat") {
      return ashBatMovement(enemy, dx, dy, dist, speed, slow, sepVX, sepVY, dt);
    }
    if (enemy.archetype === "ironback_beetle") {
      return ironbackMovement(enemy, dx, dy, dist, speed, slow, sepVX, sepVY, dt);
    }
    if (enemy.archetype === "hex_acolyte") {
      return hexAcolyteMovement(enemy, dx, dy, dist, speed, slow, sepVX, sepVY, dt);
    }
    return {
      steer: 6,
      vx: dx / dist * speed * slow + sepVX,
      vy: dy / dist * speed * slow + sepVY
    };
  }
  function applyContactDamage(enemy, dist, dt) {
    if (dist >= enemy.r + player.r) return;
    const isChargingBeetle = enemy.archetype === "ironback_beetle" && enemy.behaviorPhase === "charge";
    if (isChargingBeetle) {
      if (enemy.chargeHit) return;
      const burstDamage = Math.max(
        0,
        finiteOr(enemy.chargeDamage, finiteOr(enemy.damage) * 1.6)
      );
      player.hp -= burstDamage;
      enemy.chargeHit = true;
      if (enemy.affix === "leech") {
        const maxHp = finiteOr(enemy.maxHp, finiteOr(enemy.hp));
        enemy.hp = Math.min(
          maxHp,
          enemy.hp + burstDamage * ELITE_LEECH_HEAL_FACTOR
        );
      }
      return;
    }
    const contactDamage = Math.max(0, finiteOr(enemy.damage)) * dt;
    player.hp -= contactDamage;
    if (enemy.affix === "leech") {
      const maxHp = finiteOr(enemy.maxHp, finiteOr(enemy.hp));
      enemy.hp = Math.min(
        maxHp,
        enemy.hp + contactDamage * ELITE_LEECH_HEAL_FACTOR
      );
    }
  }
  function updateEnemies(dt) {
    const step = Number.isFinite(dt) ? Math.max(0, dt) : 0;
    enemyQuadtree.clear();
    for (const enemy of entities.enemies) {
      enemyQuadtree.insert(enemy);
    }
    for (let i = entities.enemies.length - 1; i >= 0; i -= 1) {
      const enemy = entities.enemies[i];
      sanitizeEnemyState(enemy);
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
      if (enemy.shockTimer > 0) enemy.shockTimer = Math.max(0, enemy.shockTimer - step);
      if (enemy.bladeHitTimer > 0) enemy.bladeHitTimer -= step;
      if (enemy.orbHitTimer > 0) enemy.orbHitTimer -= step;
      if (enemy.isElite) enemy.elitePulse += step * 6;
      if (enemy.isBoss) enemy.bossPulse += step * 4;
      const slow = enemy.shockTimer > 0 ? 0.55 : 1;
      const movement = movementForEnemy(enemy, dx, dy, dist, sepX, sepY, slow, step);
      if (movement.direct) {
        enemy.vx = movement.vx;
        enemy.vy = movement.vy;
      } else {
        const steer = finiteOr(movement.steer, 6);
        enemy.vx += (movement.vx - enemy.vx) * steer * step;
        enemy.vy += (movement.vy - enemy.vy) * steer * step;
      }
      const kx = enemy.knockX;
      const ky = enemy.knockY;
      enemy.knockX *= 0.85;
      enemy.knockY *= 0.85;
      enemy.x += (enemy.vx + kx) * step;
      enemy.y += (enemy.vy + ky) * step;
      if (enemy.bladeHitTimer <= 0) {
        for (const blade of orbitCache.blades) {
          const bx = blade.x - enemy.x;
          const by = blade.y - enemy.y;
          if (Math.hypot(bx, by) < enemy.r + player.bladeSize * 0.5) {
            enemy.hp -= scaledDamage(player.bladeDamage);
            enemy.bladeHitTimer = scaledCooldown(player.bladeHitCooldown);
            break;
          }
        }
      }
      if (enemy.orbHitTimer <= 0) {
        for (const orb of orbitCache.solars) {
          const ox = orb.x - enemy.x;
          const oy = orb.y - enemy.y;
          if (Math.hypot(ox, oy) < enemy.r + 8) {
            enemy.hp -= scaledDamage(player.orbDamage);
            enemy.orbHitTimer = scaledCooldown(player.orbHitCooldown);
            break;
          }
        }
      }
      applyContactDamage(enemy, Math.hypot(player.x - enemy.x, player.y - enemy.y), step);
      if (enemy.hp <= 0) {
        entities.enemies.splice(i, 1);
        registerComboKill();
        state.kills += 1;
        const orbValue = enemy.isBoss ? BOSS_XP_REWARD : finiteOr(enemy.xpValue, enemy.tier === 2 ? 12 : 8) + (enemy.isElite ? ELITE_XP_BONUS : 0);
        addOrb(enemy.x, enemy.y, orbValue);
        if (enemy.isBoss) {
          state.bossesDefeated += 1;
          const rarity = enemy.bossWave >= 20 ? "gold" : enemy.bossWave >= 10 ? "silver" : null;
          addRelicAt(
            enemy.x,
            enemy.y,
            rarity,
            "boss",
            Boolean(enemy.chestCanEvolve)
          );
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

  // src/systems/progression/chestRewards.js
  var chestRewardCounts = {
    bronze: 1,
    silver: 3,
    gold: 5
  };
  function takeRandom(items) {
    return shuffledCopy(items)[0] || null;
  }
  function getChestUpgradeCandidates() {
    return upgradeDefs.filter((option) => {
      if ((player.upgrades[option.id] || 0) <= 0) return false;
      if (option.kind === "weapon" && isWeaponEvolved(option.id)) return false;
      return canApplyUpgrade(option);
    });
  }
  function finishRewardFlow() {
    if (state.pendingLevels > 0) {
      showLevelUp();
    } else if (state.pendingStatUps > 0) {
      openStatUpgradeFromQueue();
    } else {
      levelup.classList.add("hidden");
      state.paused = false;
    }
  }
  function showChestRewards(chest, rewards) {
    state.paused = true;
    levelup.classList.remove("hidden");
    levelup.querySelector(".title").textContent = `${chest.rarity || "bronze"} Boss Cache`;
    choicesEl.innerHTML = "";
    const button = document.createElement("button");
    button.className = "choice-btn chest-reward-btn";
    const heading = document.createElement("strong");
    heading.textContent = rewards.some((reward) => reward.type === "evolution") ? "Evolution Unleashed" : "Cache Opened";
    button.appendChild(heading);
    for (const reward of rewards) {
      const line = document.createElement("span");
      line.className = reward.type === "evolution" ? "evolution-reward" : "";
      line.textContent = `${reward.type === "evolution" ? "\u2605 " : ""}${reward.name} \u2014 ${reward.desc}`;
      button.appendChild(line);
    }
    const prompt = document.createElement("span");
    prompt.className = "claim-prompt";
    prompt.textContent = "Continue";
    button.appendChild(prompt);
    button.addEventListener("click", finishRewardFlow, { once: true });
    choicesEl.appendChild(button);
  }
  function openBossChest(chest) {
    const rarity = chest.rarity || "bronze";
    let remainingRewards = chestRewardCounts[rarity] || chestRewardCounts.bronze;
    const rewards = [];
    if (chest.canEvolve) {
      const recipe = takeRandom(getEligibleEvolutions());
      if (recipe && activateEvolution(recipe)) {
        rewards.push({
          type: "evolution",
          name: recipe.name,
          desc: recipe.desc
        });
        remainingRewards -= 1;
      }
    }
    while (remainingRewards > 0) {
      const option = takeRandom(getChestUpgradeCandidates());
      if (!option) break;
      const before = player.upgrades[option.id] || 0;
      applyUpgrade(option);
      const after = player.upgrades[option.id] || before;
      rewards.push({
        type: option.kind || "weapon",
        name: option.name,
        desc: `Level ${before} \u2192 ${after}`
      });
      remainingRewards -= 1;
    }
    if (remainingRewards > 0) {
      state.bonusShards += remainingRewards;
      rewards.push({
        type: "currency",
        name: "Arcane Dust",
        desc: `+${remainingRewards} end-run shard${remainingRewards === 1 ? "" : "s"}`
      });
      remainingRewards = 0;
    }
    if (rewards.length === 0) return false;
    showChestRewards({ ...chest, rarity }, rewards);
    return true;
  }

  // src/systems/world/pickups.js
  function updateRelicSpawner(dt) {
    timers.relic -= dt;
    if (timers.relic <= 0 && entities.relics.length < 2) {
      addRelic();
      timers.relic = RELIC_SPAWN_INTERVAL;
    }
  }
  function updateRelicCollisions(dt) {
    for (let i = entities.relics.length - 1; i >= 0; i -= 1) {
      const relic = entities.relics[i];
      relic.wobble += dt * 4;
      const dist = distance(player.x, player.y, relic.x, relic.y);
      if (dist < player.r + relic.r) {
        entities.relics.splice(i, 1);
        if (relic.source === "boss" && openBossChest(relic)) return;
        state.pendingStatUps += 1;
        state.pendingRelicRarities.push(relic.rarity || "bronze");
        if (!state.paused) {
          openStatUpgradeFromQueue();
          return;
        }
      }
    }
  }
  function updateStageItemCollisions(dt) {
    for (let i = entities.stageItems.length - 1; i >= 0; i -= 1) {
      const item = entities.stageItems[i];
      item.wobble += dt * 3;
      const dist = distance(player.x, player.y, item.x, item.y);
      if (dist >= player.r + item.r) continue;
      entities.stageItems.splice(i, 1);
      const option = upgradeDefs.find((entry) => entry.id === item.upgradeId);
      const currentLevel = option ? getUpgradeLevel(option.id) : 0;
      if (option && currentLevel < option.max) {
        applyUpgrade(option);
        const nextLevel = getUpgradeLevel(option.id);
        state.noticeText = `Stage relic: ${item.name} level ${nextLevel}`;
      } else {
        gainXp(25);
        state.noticeText = `${item.name} converted to 25 XP`;
      }
      state.stageItemsCollected += 1;
      state.noticeExpiresAt = state.elapsed + 3;
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
      const interval = Math.max(0.06, scaledCooldown(player.trailSpawnInterval));
      while (timers.trail <= 0) {
        const maxPatches = Math.max(1, Math.round(player.trailMaxPatches));
        while (entities.trails.length >= maxPatches) {
          entities.trails.splice(0, 1);
        }
        entities.trails.push({
          x: player.x,
          y: player.y,
          r: player.trailRadius,
          dps: scaledDamage(player.trailDps),
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
      ctx.fillStyle = orb.isOverflow ? "#c64b5f" : "#1f6f8b";
      ctx.beginPath();
      ctx.arc(orb.x - cam.x, orb.y - cam.y, orb.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  function drawPulseRings(cam) {
    for (const pulse of entities.pulses) {
      const alpha = 0.35 + 0.35 * Math.sin(pulse.r / pulse.max * Math.PI * 4);
      const color = pulse.type === "nova" ? `rgba(190, 120, 255, ${alpha})` : pulse.type === "aegis" ? `rgba(120, 240, 210, ${alpha})` : pulse.type === "volatile" ? `rgba(255, 120, 70, ${alpha})` : pulse.type === "mine" ? `rgba(255, 175, 90, ${alpha})` : pulse.type === "vortex" ? `rgba(145, 175, 255, ${alpha})` : pulse.type === "singularity" ? `rgba(225, 150, 255, ${alpha})` : `rgba(80, 170, 255, ${alpha})`;
      ctx.strokeStyle = color;
      ctx.lineWidth = pulse.type === "volatile" ? 5 : pulse.type === "nova" || pulse.type === "aegis" ? 3 : pulse.type === "mine" ? 4 : 4;
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
      const evolved = vortex.type === "singularity";
      ctx.strokeStyle = evolved ? `rgba(220, 135, 255, ${(0.36 + life * 0.4).toFixed(3)})` : `rgba(130, 170, 255, ${(0.3 + life * 0.35).toFixed(3)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(vortex.x - cam.x, vortex.y - cam.y, vortex.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = evolved ? `rgba(245, 195, 255, ${(0.3 + life * 0.4).toFixed(3)})` : `rgba(170, 205, 255, ${(0.25 + life * 0.35).toFixed(3)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(vortex.x - cam.x, vortex.y - cam.y, vortex.r * (0.35 + 0.2 * Math.sin(swirl)), 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  function drawChainArcLines(cam) {
    for (const arc of entities.chainArcs) {
      const alpha = Math.min(1, arc.life / 0.2);
      ctx.strokeStyle = arc.type === "tempest" ? `rgba(255, 226, 120, ${alpha})` : `rgba(120, 200, 255, ${alpha})`;
      ctx.lineWidth = arc.type === "tempest" ? 3 : 2;
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
    const shocked = entities.enemies.filter((enemy) => enemy.shockTimer > 0).slice(0, 64);
    if (shocked.length <= 1) return;
    const pulse = 0.35 + 0.35 * Math.sin(state.elapsed * 8);
    ctx.strokeStyle = `rgba(80, 170, 255, ${pulse})`;
    ctx.lineWidth = 2;
    const linkCount = Math.min(48, shocked.length - 1);
    for (let i = 0; i < linkCount; i += 1) {
      const source = shocked[i];
      let nearest = null;
      let nearestDistance = 180;
      for (let j = i + 1; j < shocked.length; j += 1) {
        const target = shocked[j];
        const distance2 = Math.hypot(target.x - source.x, target.y - source.y);
        if (distance2 < nearestDistance) {
          nearest = target;
          nearestDistance = distance2;
        }
      }
      if (!nearest) continue;
      ctx.beginPath();
      ctx.moveTo(source.x - cam.x, source.y - cam.y);
      ctx.lineTo(nearest.x - cam.x, nearest.y - cam.y);
      ctx.stroke();
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
      ctx.fillStyle = bullet.type === "frost" ? "#7cc7ff" : bullet.type === "glacial" ? "#d8f3ff" : bullet.type === "inferno" ? "#ffcf63" : bullet.type === "starfall" ? "#ffd677" : "#ff7b3a";
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
  function drawStageItems(cam) {
    for (const item of entities.stageItems) {
      const pulse = 0.7 + 0.3 * Math.sin(item.wobble);
      const x = item.x - cam.x;
      const y = item.y - cam.y;
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.fillStyle = "rgba(17, 17, 22, 0.78)";
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, item.r + 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = `${item.color}99`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, item.r + 12 + pulse * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = item.color;
      ctx.font = "bold 17px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.glyph, x, y + 1);
      ctx.restore();
    }
  }
  function drawEnemyProjectiles(cam) {
    for (const projectile of entities.enemyProjectiles || []) {
      const x = projectile.x - cam.x;
      const y = projectile.y - cam.y;
      const radius = Math.max(3, projectile.r || 5);
      const velocityX = projectile.vx || 0;
      const velocityY = projectile.vy || 0;
      const angle = Math.atan2(velocityY, velocityX);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = "rgba(91, 70, 158, 0.42)";
      ctx.fillRect(-radius * 3.5, -1, radius * 2.7, 2);
      ctx.fillStyle = "#3f2631";
      ctx.beginPath();
      ctx.moveTo(radius + 2, 0);
      ctx.lineTo(0, radius + 1);
      ctx.lineTo(-radius - 2, 0);
      ctx.lineTo(0, -radius - 1);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = projectile.color || "#8067c7";
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(0, radius - 1);
      ctx.lineTo(-radius, 0);
      ctx.lineTo(0, -radius + 1);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#b7dcff";
      ctx.fillRect(-1, -1, 3, 3);
      ctx.restore();
    }
  }
  function drawRelics(cam) {
    for (const relic of entities.relics) {
      const pulse = 0.6 + 0.4 * Math.sin(relic.wobble);
      const rarityColor = relic.source === "boss" ? "rgba(255, 240, 155, 0.98)" : relic.rarity === "gold" ? "rgba(255, 221, 120, 0.95)" : relic.rarity === "silver" ? "rgba(200, 220, 255, 0.92)" : "rgba(198, 145, 92, 0.9)";
      const fallbackFill = relic.rarity === "gold" ? `rgba(255, 221, 120, ${pulse})` : relic.rarity === "silver" ? `rgba(200, 220, 255, ${pulse})` : `rgba(198, 145, 92, ${pulse})`;
      const glowRadius = relic.source === "boss" ? relic.r + 11 : relic.rarity === "gold" ? relic.r + 8 : relic.rarity === "silver" ? relic.r + 6 : relic.r + 4;
      ctx.strokeStyle = rarityColor;
      ctx.lineWidth = relic.source === "boss" || relic.rarity === "gold" ? 3 : 2;
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
  function getChargeDirection(enemy) {
    const objectDirection = enemy.chargeDirection || enemy.chargeDir;
    let x = objectDirection?.x ?? enemy.chargeDirX ?? enemy.chargeDx ?? enemy.chargeX ?? enemy.vx ?? 0;
    let y = objectDirection?.y ?? enemy.chargeDirY ?? enemy.chargeDy ?? enemy.chargeY ?? enemy.vy ?? 0;
    let length = Math.hypot(x, y);
    if (length < 1e-3) {
      x = player.x - enemy.x;
      y = player.y - enemy.y;
      length = Math.hypot(x, y);
    }
    if (length < 1e-3) return { x: 1, y: 0 };
    return { x: x / length, y: y / length };
  }
  function drawEnemyBehaviorTelegraph(enemy, cam) {
    if (enemy.spriteKey !== "ash_bat" && enemy.spriteKey !== "ironback_beetle") {
      return;
    }
    const phase = String(enemy.behaviorPhase || "").toLowerCase();
    const isWindup = phase.includes("windup");
    const isCharge = phase.includes("charge") || phase.includes("swoop");
    if (!isWindup && !isCharge) return;
    const direction = getChargeDirection(enemy);
    const perpendicular = { x: -direction.y, y: direction.x };
    const x = enemy.x - cam.x;
    const y = enemy.y - cam.y;
    const isBeetle = enemy.spriteKey === "ironback_beetle";
    const distance2 = isBeetle ? 104 : 82;
    const start = enemy.r + 5;
    const endX = x + direction.x * distance2;
    const endY = y + direction.y * distance2;
    const color = isBeetle ? isWindup ? "rgba(232, 165, 108, 0.9)" : "rgba(255, 112, 109, 0.82)" : isWindup ? "rgba(128, 103, 199, 0.9)" : "rgba(183, 220, 255, 0.82)";
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = isWindup ? 2 : 4;
    ctx.setLineDash(isWindup ? [6, 5] : []);
    ctx.beginPath();
    ctx.moveTo(x + direction.x * start, y + direction.y * start);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.setLineDash([]);
    const arrowSize = isBeetle ? 9 : 7;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - direction.x * arrowSize + perpendicular.x * arrowSize * 0.65,
      endY - direction.y * arrowSize + perpendicular.y * arrowSize * 0.65
    );
    ctx.lineTo(
      endX - direction.x * arrowSize - perpendicular.x * arrowSize * 0.65,
      endY - direction.y * arrowSize - perpendicular.y * arrowSize * 0.65
    );
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, enemy.r + (isWindup ? 6 : 3), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  function drawEnemies(cam) {
    for (const enemy of entities.enemies) {
      const fallbackSprite = enemy.tier === 2 ? enemyBigSprite : enemySmallSprite;
      const sprite = enemySpriteMap[enemy.spriteKey] || fallbackSprite;
      drawEnemyBehaviorTelegraph(enemy, cam);
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
      ctx.fillStyle = relic.source === "boss" ? "rgba(255, 202, 76, 0.98)" : "rgba(80, 170, 255, 0.9)";
      ctx.beginPath();
      ctx.arc(rx, ry, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const item of entities.stageItems) {
      const ix = mapX + item.x * scaleX;
      const iy = mapY + item.y * scaleY;
      ctx.fillStyle = item.color || "rgba(170, 120, 240, 0.95)";
      ctx.fillRect(ix - 2.4, iy - 2.4, 4.8, 4.8);
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
    if (metaPanel.lifetime) {
      const lifetime = saveData.lifetime;
      metaPanel.lifetime.textContent = `Runs ${lifetime.runs} \u2022 Clears ${lifetime.victories} \u2022 Best Wave ${lifetime.bestWave}`;
    }
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
  function updatePlayerRecovery(dt) {
    if (player.recovery <= 0 || player.hp <= 0 || player.hp >= player.maxHp) return;
    player.hp = Math.min(player.maxHp, player.hp + player.recovery * dt);
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
        timers.pulse = scaledCooldown(player.pulseCooldown);
      }
    }
    if (player.novaUnlocked) {
      timers.nova -= dt;
      if (timers.nova <= 0) {
        novaShockwave();
        timers.nova = scaledCooldown(player.novaCooldown);
      }
    }
    if (player.chainUnlocked) {
      timers.chain -= dt;
      if (timers.chain <= 0) {
        chainLightning();
        timers.chain = scaledCooldown(player.chainCooldown);
      }
    }
  }
  function updateEnemySpawner(dt) {
    timers.spawn -= dt;
    const wave = getWaveNumber(state.elapsed, state.waveDuration);
    const waveConfig = getWaveConfig(wave);
    if (state.activeWave !== wave) {
      state.activeWave = wave;
      timers.spawn = 0;
      state.noticeText = `Wave ${wave} / ${STAGE_WAVE_COUNT}${waveConfig.event ? " \u2014 surge incoming" : ""}`;
      state.noticeExpiresAt = state.elapsed + 2.8;
      if (waveConfig.event) {
        const availableSlots = Math.max(0, MAX_ENEMIES - entities.enemies.length);
        const count = Math.min(availableSlots, waveConfig.event.count);
        spawnEnemyPack(count, {
          tier2Chance: waveConfig.tier2Chance,
          enemyMix: waveConfig.event.enemyMix || waveConfig.enemyMix,
          hpMultiplier: waveConfig.event.hpMultiplier || waveConfig.hpMultiplier || 1,
          speedMultiplier: waveConfig.event.speedMultiplier || waveConfig.speedMultiplier || 1,
          eventSpawn: true
        });
      }
    }
    while (wave >= state.nextBossWave) {
      spawnMiniBoss(state.nextBossWave);
      state.noticeText = `Wave ${state.nextBossWave} guardian inbound \u2014 defeat it for a cache`;
      state.noticeExpiresAt = state.elapsed + 3.4;
      state.nextBossWave += BOSS_WAVE_INTERVAL;
    }
    if (timers.spawn <= 0 && entities.enemies.length < MAX_ENEMIES) {
      const deficit = Math.max(0, waveConfig.minAlive - entities.enemies.length);
      const spawnCount = deficit > 0 ? Math.min(3, 1 + Math.floor(deficit / 18)) : 1;
      const availableSlots = MAX_ENEMIES - entities.enemies.length;
      for (let i = 0; i < Math.min(spawnCount, availableSlots); i += 1) {
        spawnEnemy({
          tier2Chance: waveConfig.tier2Chance,
          enemyMix: waveConfig.enemyMix,
          hpMultiplier: waveConfig.hpMultiplier || 1,
          speedMultiplier: waveConfig.speedMultiplier || 1
        });
      }
      timers.spawn = waveConfig.spawnInterval;
    }
  }
  function showRunSummary(result = "defeat") {
    const wave = getWaveNumber(state.elapsed, state.waveDuration);
    const elapsedSeconds = Math.max(0, state.elapsed);
    const victory = result === "victory";
    const earnedShards = awardRunShards(
      saveData,
      elapsedSeconds,
      wave,
      victory,
      state.bonusShards
    );
    saveData = saveProgress(saveData);
    state.runResult = result;
    if (runSummary.result) {
      runSummary.result.textContent = victory ? "Stage Cleared" : "Defeated";
      runSummary.result.classList.toggle("summary-victory", victory);
    }
    if (runSummary.wave) runSummary.wave.textContent = `${wave}`;
    if (runSummary.time) runSummary.time.textContent = formatTime(elapsedSeconds);
    if (runSummary.level) runSummary.level.textContent = `${player.level}`;
    if (runSummary.kills) runSummary.kills.textContent = `${state.kills}`;
    if (runSummary.evolutions) {
      runSummary.evolutions.textContent = `${state.evolutionCount}`;
    }
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
    showRunSummary("defeat");
  }
  function checkStageComplete() {
    if (state.elapsed < STAGE_DURATION) return false;
    state.elapsed = STAGE_DURATION;
    entities.enemies.length = 0;
    entities.enemyProjectiles.length = 0;
    showRunSummary("victory");
    return true;
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
    if (checkStageComplete()) return;
    updatePlayerMovement(dt);
    updatePlayerRecovery(dt);
    updateRelicSpawner(dt);
    updateOrbitCaches(dt);
    updateWeaponFiring(dt);
    updateEnemySpawner(dt);
    updateEnemies(dt);
    updateEnemyProjectiles(dt);
    updateBullets(dt);
    updateMines(dt);
    updateTrails(dt);
    updateVortexes(dt);
    updateParticles(dt);
    updateRelicCollisions(dt);
    updateStageItemCollisions(dt);
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
    drawEnemyProjectiles(cam);
    drawParticles(cam);
    drawStageItems(cam);
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
    spawnStageItems();
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
  installTestApi({ startRun });
  configureLoop({ update, draw, updateHud });
  requestAnimationFrame(loop);
})();
