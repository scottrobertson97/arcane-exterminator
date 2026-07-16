export const canvas = document.getElementById('game')
export const ctx = canvas.getContext('2d')

export const hud = {
  wave: document.getElementById('wave'),
  time: document.getElementById('time'),
  hp: document.getElementById('hp'),
  level: document.getElementById('level'),
  xp: document.getElementById('xp'),
  combo: document.getElementById('combo'),
  kills: document.getElementById('kills'),
  metaBonus: document.getElementById('meta-bonus'),
}

export const loadout = {
  panel: document.getElementById('loadout'),
  weapons: document.getElementById('weapon-loadout'),
  passives: document.getElementById('passive-loadout'),
  weaponCount: document.getElementById('weapon-slot-count'),
  passiveCount: document.getElementById('passive-slot-count'),
}

export const runNotice = document.getElementById('run-notice')

export const levelup = document.getElementById('levelup')
export const choicesEl = document.getElementById('choices')

export const menuOverlay = document.getElementById('menu-overlay')
export const menuPanels = {
  title: document.getElementById('menu-title-panel'),
  meta: document.getElementById('menu-meta-panel'),
  controls: document.getElementById('menu-controls-panel'),
}
export const menuButtons = {
  play: document.getElementById('menu-play'),
  meta: document.getElementById('menu-meta'),
  controls: document.getElementById('menu-controls'),
}
export const metaPanel = {
  shards: document.getElementById('meta-shards'),
  lifetime: document.getElementById('meta-lifetime'),
  list: document.getElementById('meta-list'),
  back: document.getElementById('meta-back'),
  reset: document.getElementById('meta-reset'),
}
export const controlsBack = document.getElementById('controls-back')

export const runSummary = {
  overlay: document.getElementById('run-summary'),
  result: document.getElementById('summary-result'),
  wave: document.getElementById('summary-wave'),
  time: document.getElementById('summary-time'),
  level: document.getElementById('summary-level'),
  kills: document.getElementById('summary-kills'),
  evolutions: document.getElementById('summary-evolutions'),
  shards: document.getElementById('summary-shards'),
  total: document.getElementById('summary-total'),
  play: document.getElementById('summary-play'),
  meta: document.getElementById('summary-meta'),
}

export const zoomControls = {
  out: document.getElementById('zoom-out'),
  in: document.getElementById('zoom-in'),
  label: document.getElementById('zoom-label'),
}
